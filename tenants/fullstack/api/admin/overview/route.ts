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
    return { label: `Read ${depth}% of ${page}`, detail: "Browsing the page" };
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

function buildAnalytics(heatmap: HeatmapRow[]) {
  const meaningfulEvents = heatmap.filter(isMeaningfulActivity);
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
    .map((session) => ({
      sessionId: session.id,
      path: session.path,
      device: session.device,
      eventCount: session.eventCount,
      clicks: session.clicks,
      maxScroll: session.maxScroll,
      timeSpentSeconds: Math.max(0, Math.round((session.last - session.first) / 1000)),
      lastSeen: new Date(session.last).toISOString(),
      startedAt: new Date(session.first).toISOString(),
      visitorId: session.visitorId,
      timeline: session.events
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(-30),
    }))
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

  return {
    totalSessions: sessionStats.length,
    totalVisitors: visitorGroups.length,
    deviceCounts,
    avgTimeSpentSeconds: sessionStats.length ? Math.round(totalTime / sessionStats.length) : 0,
    sessionStats: sessionStats.slice(0, 12),
    visitors: visitorGroups.slice(0, 20).map((visitor) => ({
      ...visitor,
      sessions: visitor.sessions.slice(0, 8),
    })),
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
  const [leadResult, visitorCount, sessionCount, eventCount, activeSessions] = await Promise.all([
    supabase.from("fullstack_leads").select("*").order("created_at", { ascending: false }).limit(80),
    supabase.from("fullstack_visitors").select("*", { count: "exact", head: true }),
    supabase.from("fullstack_sessions").select("*", { count: "exact", head: true }),
    supabase.from("fullstack_analytics_events").select("*", { count: "exact", head: true }),
    supabase.from("fullstack_sessions").select("visitor_id").gte("last_seen_at", activeSince),
  ]);
  throwIfSupabaseError(leadResult.error);
  throwIfSupabaseError(visitorCount.error);
  throwIfSupabaseError(sessionCount.error);
  throwIfSupabaseError(eventCount.error);
  throwIfSupabaseError(activeSessions.error);
  const leads = leadResult.data || [];
  const chatData = await listAdminChatData();
  const analytics = buildAnalytics(chatData.heatmap as HeatmapRow[]);
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
    ...chatData,
  });
}
