import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/tenants/fullstack/lib/admin-auth";
import { listAdminChatData } from "@/tenants/fullstack/lib/chat-storage";
import { getSupabaseAdmin, throwIfSupabaseError } from "@/tenants/fullstack/lib/supabase";

type HeatmapRow = {
  id: number;
  created_at: string;
  session_id: string | null;
  path: string | null;
  event_type: string;
  x: number | null;
  y: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  metadata: Record<string, unknown> | null;
};

type SessionLocationRow = {
  session_id: string;
  visitor_id: string;
  country: string | null;
  region: string | null;
  city: string | null;
  last_seen_at: string;
};

type MainEventKey = "whatsapp" | "call_now" | "book_call";

const mainEventLabels: Record<MainEventKey, string> = {
  whatsapp: "WhatsApp",
  call_now: "Call now",
  book_call: "Book a call",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code?: string | null) {
  const normalized = code?.trim().toUpperCase();
  if (!normalized || normalized === "XX") return "Unknown";
  try {
    return regionNames.of(normalized) || normalized;
  } catch {
    return normalized;
  }
}

function buildCountryStats(rows: SessionLocationRow[]) {
  const locatedRows = rows.filter((row) => {
    const code = row.country?.trim().toUpperCase();
    return Boolean(code && code !== "XX");
  });
  const groups = new Map<
    string,
    {
      code: string;
      name: string;
      sessions: number;
      visitors: Set<string>;
      locations: Set<string>;
      lastSeen: string;
    }
  >();

  for (const row of locatedRows) {
    const code = row.country!.trim().toUpperCase();
    const current = groups.get(code) || {
      code,
      name: countryName(code),
      sessions: 0,
      visitors: new Set<string>(),
      locations: new Set<string>(),
      lastSeen: row.last_seen_at,
    };
    current.sessions += 1;
    current.visitors.add(row.visitor_id);
    const location = [row.city, row.region].filter(Boolean).join(", ");
    if (location) current.locations.add(location);
    if (new Date(row.last_seen_at).getTime() > new Date(current.lastSeen).getTime()) {
      current.lastSeen = row.last_seen_at;
    }
    groups.set(code, current);
  }

  return {
    locatedSessions: locatedRows.length,
    countryStats: Array.from(groups.values())
      .map((group) => ({
        code: group.code,
        name: group.name,
        sessions: group.sessions,
        visitors: group.visitors.size,
        share: locatedRows.length ? Math.round((group.sessions / locatedRows.length) * 100) : 0,
        locations: Array.from(group.locations).slice(0, 4),
        lastSeen: group.lastSeen,
      }))
      .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name)),
  };
}

function formatDevice(width?: number | null) {
  if (!width) return "Unknown";
  if (width < 760) return "Mobile";
  if (width < 1100) return "Tablet";
  return "Desktop";
}

function readablePage(value?: string | null) {
  const raw = value || "/";
  let path = raw;
  try {
    const url = new URL(raw, "https://thefullstackguys.us");
    path = url.pathname || "/";
  } catch {
    path = raw.split("?")[0] || "/";
  }
  if (path === "/") return "Home page";
  return path
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[-_]/g, " "))
    .join(" · ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Home page";
}

function trafficSource(event: HeatmapRow) {
  const stored = event.metadata?.trafficSource;
  if (typeof stored === "string" && stored.trim()) return stored;
  try {
    const parameters = new URL(event.path || "/", "https://thefullstackguys.us").searchParams;
    if (parameters.has("oppref") || parameters.has("olref")) return "OpenAI Ads";
    return parameters.get("utm_source");
  } catch {
    return null;
  }
}

function durationLabel(seconds: number) {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function isMeaningfulActivity(event: HeatmapRow) {
  return !["move", "engagement", "visibility", "web_vital"].includes(event.event_type);
}

function formatActivity(event: HeatmapRow) {
  const page = readablePage(event.path);
  const source = trafficSource(event);
  if (event.event_type === "pageview") {
    return {
      label: `Visited ${page}${source ? ` from ${source}` : ""}`,
      detail: `${formatDevice(event.viewport_width)} visitor`,
    };
  }
  if (event.event_type === "scroll") {
    const depth = Number(event.metadata?.depth ?? 0);
    const section = typeof event.metadata?.section === "string" ? event.metadata.section.trim() : "";
    return { label: `Read ${depth}% of ${page}`, detail: section ? `Reached: ${section}` : "Browsing the page" };
  }
  if (event.event_type === "click" || event.event_type === "outbound_click") {
    const label = String(event.metadata?.text || event.metadata?.tag || "page area");
    return {
      label: `${event.event_type === "outbound_click" ? "Opened an external link" : "Clicked"}: ${label}`,
      detail: `On ${page}`,
    };
  }
  if (event.event_type === "page_exit") {
    return {
      label: `Left ${page}`,
      detail: `Spent ${durationLabel(Math.round(Number(event.metadata?.durationMs || 0) / 1000))} on the site`,
    };
  }
  if (event.event_type === "form_start" || event.event_type === "form_submit") {
    return { label: event.event_type === "form_start" ? "Started a form" : "Submitted a form", detail: `On ${page}` };
  }
  if (event.event_type === "client_error") {
    return { label: "Browser error", detail: `While viewing ${page}` };
  }
  return { label: event.event_type, detail: page };
}

function getVisitorKey(event: HeatmapRow, sessionId: string) {
  const visitorId = event.metadata?.visitorId;
  return typeof visitorId === "string" && visitorId.trim() ? visitorId : sessionId;
}

function getMainEventKey(event: HeatmapRow): MainEventKey | null {
  const value = event.metadata?.mainEvent;
  if (value === "whatsapp" || value === "call_now" || value === "book_call") return value;
  const href = String(event.metadata?.href || "").toLowerCase();
  const text = String(event.metadata?.text || "").toLowerCase();
  if (href.includes("wa.me") || text.includes("whatsapp")) return "whatsapp";
  if (href.startsWith("tel:") || text.includes("call now")) return "call_now";
  if (/\b(book|request|schedule|meet)\b.*\b(call|partner)\b/.test(text)) return "book_call";
  return null;
}

function buildMainEvents(heatmap: HeatmapRow[], locations: SessionLocationRow[]) {
  const locationBySession = new Map(locations.map((item) => [item.session_id, item]));
  const counts: Record<MainEventKey, number> = { whatsapp: 0, call_now: 0, book_call: 0 };
  const recent = heatmap.flatMap((event) => {
    const key = getMainEventKey(event);
    if (!key) return [];
    counts[key] += 1;
    const sessionId = event.session_id || `event-${event.id}`;
    const location = locationBySession.get(sessionId);
    return [{
      id: event.id, key, label: mainEventLabels[key], created_at: event.created_at, sessionId,
      visitorId: getVisitorKey(event, sessionId), path: readablePage(event.path), device: formatDevice(event.viewport_width),
      location: location ? [location.city, location.region, countryName(location.country)].filter(Boolean).join(", ") || null : null,
    }];
  });
  return {
    total: recent.length,
    counts: (Object.keys(mainEventLabels) as MainEventKey[]).map((key) => ({ key, label: mainEventLabels[key], count: counts[key] })),
    recent: recent.slice(0, 100),
  };
}

function buildAnalytics(heatmap: HeatmapRow[], locations: SessionLocationRow[]) {
  const meaningfulEvents = heatmap.filter(isMeaningfulActivity);
  const locationBySession = new Map(locations.map((location) => [location.session_id, location]));
  const sessions = new Map<
    string,
    {
      id: string;
      visitorId: string;
      first: number;
      last: number;
      eventCount: number;
      clicks: number;
      maxScroll: number;
      device: string;
      path: string;
      events: Array<{
        id: number;
        created_at: string;
        label: string;
        detail: string;
      }>;
    }
  >();
  const pageCounts = new Map<string, number>();

  for (const event of meaningfulEvents) {
    const sessionId = event.session_id || `event-${event.id}`;
    const visitorId = getVisitorKey(event, sessionId);
    const timestamp = new Date(event.created_at).getTime();
    const current =
      sessions.get(sessionId) ||
      {
        id: sessionId,
        visitorId,
        first: timestamp,
        last: timestamp,
        eventCount: 0,
        clicks: 0,
        maxScroll: 0,
        device: formatDevice(event.viewport_width),
        path: readablePage(event.path),
        events: [],
      };

    const activity = formatActivity(event);
    current.first = Math.min(current.first, timestamp);
    current.last = Math.max(current.last, timestamp);
    current.eventCount += 1;
    current.path = readablePage(event.path) || current.path;
    current.events.push({
      id: event.id,
      created_at: event.created_at,
      ...activity,
    });
    if (event.viewport_width) current.device = formatDevice(event.viewport_width);
    if (event.event_type === "click") current.clicks += 1;
    if (event.event_type === "scroll") {
      current.maxScroll = Math.max(current.maxScroll, Number(event.metadata?.depth || 0));
    }
    sessions.set(sessionId, current);

    if (event.event_type === "pageview") {
      const path = readablePage(event.path);
      pageCounts.set(path, (pageCounts.get(path) || 0) + 1);
    }
  }

  const sessionStats = Array.from(sessions.values())
    .map((session) => {
      const sessionLocation = locationBySession.get(session.id);
      const timeline = session.events
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(-30);
      const timeSpentSeconds = Math.max(0, Math.round((session.last - session.first) / 1000));
      const actions = Array.from(
        new Set(
          timeline
            .filter((event) => event.label.startsWith("Clicked:") || event.label.startsWith("Opened an external link:"))
            .map((event) => event.label.replace(/^Clicked: |^Opened an external link: /, "")),
        ),
      );
      const arrival = timeline.find((event) => event.label.startsWith("Visited "))?.label || `Visited ${session.path}`;
      const summary = [
        arrival,
        session.maxScroll > 0 ? `read ${session.maxScroll}% of the page` : "",
        actions.length ? `clicked ${actions.join(", ")}` : "",
        timeSpentSeconds > 0 ? `spent ${durationLabel(timeSpentSeconds)} on the site` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        sessionId: session.id,
        path: session.path,
        device: session.device,
        eventCount: session.eventCount,
        clicks: session.clicks,
        maxScroll: session.maxScroll,
        timeSpentSeconds,
        lastSeen: new Date(session.last).toISOString(),
        startedAt: new Date(session.first).toISOString(),
        visitorId: session.visitorId,
        location: sessionLocation
          ? [sessionLocation.city, sessionLocation.region, countryName(sessionLocation.country)]
              .filter((part) => part && part !== "Unknown")
              .join(", ") || null
          : null,
        summary,
        timeline,
      };
    })
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  const totalTime = sessionStats.reduce((sum, session) => sum + session.timeSpentSeconds, 0);
  const deviceCounts = sessionStats.reduce<Record<string, number>>((counts, session) => {
    counts[session.device] = (counts[session.device] || 0) + 1;
    return counts;
  }, {});
  const visitorGroups = Array.from(
    sessionStats.reduce<
      Map<
        string,
        {
          visitorId: string;
          sessions: typeof sessionStats;
          sessionCount: number;
          eventCount: number;
          clicks: number;
          totalTimeSpentSeconds: number;
          lastSeen: string;
          devices: string[];
          paths: string[];
        }
      >
    >((groups, session) => {
      const current =
        groups.get(session.visitorId) ||
        {
          visitorId: session.visitorId,
          sessions: [],
          sessionCount: 0,
          eventCount: 0,
          clicks: 0,
          totalTimeSpentSeconds: 0,
          lastSeen: session.lastSeen,
          devices: [],
          paths: [],
        };
      current.sessions.push(session);
      current.sessionCount += 1;
      current.eventCount += session.eventCount;
      current.clicks += session.clicks;
      current.totalTimeSpentSeconds += session.timeSpentSeconds;
      current.lastSeen =
        new Date(session.lastSeen).getTime() > new Date(current.lastSeen).getTime()
          ? session.lastSeen
          : current.lastSeen;
      if (!current.devices.includes(session.device)) current.devices.push(session.device);
      if (!current.paths.includes(session.path)) current.paths.push(session.path);
      groups.set(session.visitorId, current);
      return groups;
    }, new Map()).values()
  ).sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  const countryAnalytics = buildCountryStats(locations);

  return {
    totalSessions: sessionStats.length,
    totalVisitors: visitorGroups.length,
    deviceCounts,
    avgTimeSpentSeconds: sessionStats.length ? Math.round(totalTime / sessionStats.length) : 0,
    sessionStats,
    visitors: visitorGroups.map((visitor) => ({
      ...visitor,
      sessions: visitor.sessions,
    })),
    ...countryAnalytics,
    topPages: Array.from(pageCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    recentActivity: meaningfulEvents.slice(0, 40).map((event) => ({
      id: event.id,
      created_at: event.created_at,
      ...formatActivity(event),
    })),
  };
}

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const activeSince = new Date(Date.now() - 90_000).toISOString();
  const [leadResult, visitorCount, sessionCount, eventCount, activeSessions, sessionLocations] = await Promise.all([
    supabase.from("fullstack_leads").select("*").order("created_at", { ascending: false }).limit(80),
    supabase.from("fullstack_visitors").select("*", { count: "exact", head: true }),
    supabase.from("fullstack_sessions").select("*", { count: "exact", head: true }),
    supabase.from("fullstack_analytics_events").select("*", { count: "exact", head: true }),
    supabase.from("fullstack_sessions").select("visitor_id").gte("last_seen_at", activeSince),
    supabase
      .from("fullstack_sessions")
      .select("session_id, visitor_id, country, region, city, last_seen_at")
      .order("last_seen_at", { ascending: false })
      .limit(5000),
  ]);
  throwIfSupabaseError(leadResult.error);
  throwIfSupabaseError(visitorCount.error);
  throwIfSupabaseError(sessionCount.error);
  throwIfSupabaseError(eventCount.error);
  throwIfSupabaseError(activeSessions.error);
  throwIfSupabaseError(sessionLocations.error);
  const leads = leadResult.data || [];
  const chatData = await listAdminChatData();
  const analytics = buildAnalytics(
    chatData.heatmap as HeatmapRow[],
    (sessionLocations.data || []) as SessionLocationRow[],
  );
  const mainEvents = buildMainEvents(chatData.heatmap as HeatmapRow[], (sessionLocations.data || []) as SessionLocationRow[]);
  analytics.totalVisitors = visitorCount.count || 0;
  analytics.totalSessions = sessionCount.count || 0;
  const liveVisitors = new Set((activeSessions.data || []).map((row) => row.visitor_id)).size;

  return NextResponse.json({
    admin,
    leads,
    analytics: {
      ...analytics,
      liveVisitors,
      totalEvents: eventCount.count || 0,
    },
    mainEvents,
    ...chatData,
  });
}
