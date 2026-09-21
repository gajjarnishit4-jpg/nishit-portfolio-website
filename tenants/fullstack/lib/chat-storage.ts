import { ChatMessage, LeadProfile } from "@/tenants/fullstack/lib/business-context";
import { getSupabaseAdmin, throwIfSupabaseError } from "@/tenants/fullstack/lib/supabase";

export type StoredChatSession = {
  id: string;
  created_at: string;
  updated_at: string;
  source_page: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  company: string | null;
  niche: string | null;
  budget: string | null;
  timeline: string | null;
  project_type: string | null;
  lead_score: number | null;
  intent: string | null;
  status: string | null;
  human_joined: boolean | null;
  last_message: string | null;
};

export type StoredChatMessage = {
  id: number;
  session_id: string;
  created_at: string;
  role: "user" | "assistant" | "admin" | "system";
  content: string;
};

type AnalyticsEvent = {
  id: number;
  occurred_at: string;
  session_id: string | null;
  path: string | null;
  event_type: string;
  x: number | null;
  y: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  metadata: Record<string, unknown> | null;
};

const ANALYTICS_PAGE_SIZE = 1000;
const MAX_ANALYTICS_EVENTS = 10_000;

async function listAnalyticsEvents() {
  const supabase = getSupabaseAdmin();
  const select = "id, occurred_at, session_id, path, event_type, x, y, viewport_width, viewport_height, metadata";
  const createQuery = (count?: "exact") =>
    supabase
      .from("fullstack_analytics_events")
      .select(select, count ? { count } : undefined)
      .not("path", "like", "/admin%")
      .not("path", "like", "/api/admin%")
      .order("occurred_at", { ascending: false });

  // Supabase caps a single REST response at 1,000 rows. Fetch subsequent
  // pages so the visitor count and the cards in the dashboard stay aligned.
  const firstPage = await createQuery("exact").range(0, ANALYTICS_PAGE_SIZE - 1);
  throwIfSupabaseError(firstPage.error);

  const pageCount = Math.min(
    Math.ceil((firstPage.count || 0) / ANALYTICS_PAGE_SIZE),
    Math.ceil(MAX_ANALYTICS_EVENTS / ANALYTICS_PAGE_SIZE),
  );
  if (pageCount <= 1) return (firstPage.data || []) as AnalyticsEvent[];

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) => {
      const start = (index + 1) * ANALYTICS_PAGE_SIZE;
      return createQuery().range(start, start + ANALYTICS_PAGE_SIZE - 1);
    }),
  );
  for (const page of remainingPages) throwIfSupabaseError(page.error);

  return [
    ...(firstPage.data || []),
    ...remainingPages.flatMap((page) => page.data || []),
  ] as AnalyticsEvent[];
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeUuid(value?: string | null) {
  return value && uuidPattern.test(value) ? value : null;
}

export async function saveChatTurn({
  sessionId,
  userMessage,
  assistantMessage,
  lead,
  page,
  userAgent,
  provider,
  model,
}: {
  sessionId: string;
  userMessage: string;
  assistantMessage: string;
  lead: LeadProfile;
  page?: string;
  userAgent?: string | null;
  provider?: string;
  model?: string;
}) {
  const id = safeUuid(sessionId);
  if (!id) throw new Error("Invalid chat session identifier.");
  const supabase = getSupabaseAdmin();
  const [{ data: existing, error: existingError }, { data: analyticsSession }] = await Promise.all([
    supabase.from("fullstack_chat_sessions").select("*").eq("id", id).maybeSingle(),
    supabase.from("fullstack_sessions").select("visitor_id").eq("session_id", id).maybeSingle(),
  ]);
  throwIfSupabaseError(existingError);

  const current = (existing || {}) as Partial<StoredChatSession>;
  const score = Math.max(current.lead_score || 0, lead.score || 0) || null;
  const intent = current.intent === "high" || lead.intent === "high"
    ? "high"
    : lead.intent || current.intent || null;
  const { error: sessionError } = await supabase.from("fullstack_chat_sessions").upsert(
    {
      id,
      visitor_id: analyticsSession?.visitor_id || null,
      updated_at: new Date().toISOString(),
      source_page: page || current.source_page || null,
      user_agent: userAgent || null,
      visitor_name: lead.name || current.visitor_name || null,
      visitor_email: lead.email || current.visitor_email || null,
      visitor_phone: lead.phone || current.visitor_phone || null,
      company: lead.company || current.company || null,
      niche: lead.niche || current.niche || null,
      budget: lead.budget || current.budget || null,
      timeline: lead.timeline || current.timeline || null,
      project_type: lead.projectType || current.project_type || null,
      lead_score: score,
      intent,
      status: current.status || "bot",
      human_joined: current.human_joined || false,
      last_message: userMessage.slice(0, 500),
    },
    { onConflict: "id" },
  );
  throwIfSupabaseError(sessionError);

  const { error: messagesError } = await supabase.from("fullstack_chat_messages").insert([
    { session_id: id, role: "user", content: userMessage },
    {
      session_id: id,
      role: "assistant",
      content: assistantMessage,
      provider: provider || null,
      model: model || null,
    },
  ]);
  throwIfSupabaseError(messagesError);
}

export async function getChatSession(sessionId: string) {
  const id = safeUuid(sessionId);
  if (!id) return { session: undefined, messages: [] };
  const supabase = getSupabaseAdmin();
  const [sessionResult, messagesResult] = await Promise.all([
    supabase.from("fullstack_chat_sessions").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("fullstack_chat_messages")
      .select("id, session_id, created_at, role, content")
      .eq("session_id", id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
  ]);
  throwIfSupabaseError(sessionResult.error);
  throwIfSupabaseError(messagesResult.error);
  return {
    session: sessionResult.data as StoredChatSession | undefined,
    messages: (messagesResult.data || []) as StoredChatMessage[],
  };
}

export async function listAdminChatData() {
  const supabase = getSupabaseAdmin();
  const [sessionsResult, eventsResult] = await Promise.all([
    supabase.from("fullstack_chat_sessions").select("*").order("updated_at", { ascending: false }).limit(80),
    listAnalyticsEvents(),
  ]);
  throwIfSupabaseError(sessionsResult.error);

  const sessions = (sessionsResult.data || []) as StoredChatSession[];
  const ids = sessions.map((session) => session.id);
  const messagesResult = ids.length
    ? await supabase
        .from("fullstack_chat_messages")
        .select("id, session_id, created_at, role, content")
        .in("session_id", ids)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
    : { data: [], error: null };
  throwIfSupabaseError(messagesResult.error);

  const heatmap = eventsResult.map((event) => ({
    id: event.id,
    created_at: event.occurred_at,
    session_id: event.session_id,
    path: event.path,
    event_type: event.event_type,
    x: event.x,
    y: event.y,
    viewport_width: event.viewport_width,
    viewport_height: event.viewport_height,
    metadata: event.metadata,
  }));
  return {
    sessions,
    messages: (messagesResult.data || []) as StoredChatMessage[],
    heatmap,
  };
}

export async function addAdminMessage(sessionId: string, message: string, adminEmail?: string) {
  const id = safeUuid(sessionId);
  if (!id) throw new Error("Invalid chat session identifier.");
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const [sessionResult, messageResult, auditResult] = await Promise.all([
    supabase
      .from("fullstack_chat_sessions")
      .update({ human_joined: true, status: "human", updated_at: now, last_message: message.slice(0, 500) })
      .eq("id", id),
    supabase.from("fullstack_chat_messages").insert({ session_id: id, role: "admin", content: message }),
    adminEmail
      ? supabase.from("fullstack_admin_actions").insert({
          admin_email: adminEmail,
          action: "chat_message_sent",
          chat_session_id: id,
        })
      : Promise.resolve({ error: null }),
  ]);
  throwIfSupabaseError(sessionResult.error);
  throwIfSupabaseError(messageResult.error);
  throwIfSupabaseError(auditResult.error);
}

export async function addVisitorMessage(sessionId: string, message: string) {
  const id = safeUuid(sessionId);
  if (!id) throw new Error("Invalid chat session identifier.");
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const [sessionResult, messageResult] = await Promise.all([
    supabase
      .from("fullstack_chat_sessions")
      .update({ updated_at: now, last_message: message.slice(0, 500) })
      .eq("id", id),
    supabase.from("fullstack_chat_messages").insert({
      session_id: id,
      role: "user",
      content: message,
    }),
  ]);
  throwIfSupabaseError(sessionResult.error);
  throwIfSupabaseError(messageResult.error);
}

export async function joinChatSession(
  sessionId: string,
  adminEmail?: string,
  adminName = "Nolan",
) {
  const id = safeUuid(sessionId);
  if (!id) throw new Error("Invalid chat session identifier.");
  const supabase = getSupabaseAdmin();
  const { data: current, error: lookupError } = await supabase
    .from("fullstack_chat_sessions")
    .select("human_joined")
    .eq("id", id)
    .maybeSingle();
  throwIfSupabaseError(lookupError);
  const operations = [
    supabase
      .from("fullstack_chat_sessions")
      .update({
        human_joined: true,
        status: "human",
        updated_at: new Date().toISOString(),
        last_message: `${adminName} has joined the chat.`,
      })
      .eq("id", id),
    adminEmail
      ? supabase.from("fullstack_admin_actions").insert({
          admin_email: adminEmail,
          action: "chat_joined",
          chat_session_id: id,
          metadata: { adminName },
        })
      : Promise.resolve({ error: null }),
  ];
  if (!current?.human_joined) {
    operations.push(
      supabase.from("fullstack_chat_messages").insert({
        session_id: id,
        role: "system",
        content: `${adminName} has joined the chat.`,
        metadata: { event: "human_joined", adminName },
      }),
    );
  }
  const [sessionResult, auditResult, notificationResult] = await Promise.all(operations);
  throwIfSupabaseError(sessionResult.error);
  throwIfSupabaseError(auditResult.error);
  throwIfSupabaseError(notificationResult?.error || null);
}

export async function saveHeatmapEvent({
  sessionId,
  visitorId,
  path,
  eventType,
  occurredAt,
  pageTitle,
  referrer,
  x,
  y,
  viewportWidth,
  viewportHeight,
  screenWidth,
  screenHeight,
  locale,
  timezone,
  userAgent,
  ipHash,
  country,
  region,
  city,
  metadata,
}: {
  sessionId?: string | null;
  visitorId?: string | null;
  path?: string | null;
  eventType: string;
  occurredAt?: string | null;
  pageTitle?: string | null;
  referrer?: string | null;
  x?: number | null;
  y?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  locale?: string | null;
  timezone?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const session = safeUuid(sessionId);
  const visitor = safeUuid(visitorId);
  if (!session || !visitor) throw new Error("Invalid analytics identifiers.");
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const scrollDepth = Math.max(0, Math.min(100, Number(metadata?.depth || 0)));
  const deviceType = !viewportWidth ? "unknown" : viewportWidth < 760 ? "mobile" : viewportWidth < 1100 ? "tablet" : "desktop";
  const url = path ? new URL(path, "https://thefullstackguys.us") : null;
  const utm = url
    ? {
        source: url.searchParams.get("utm_source"),
        medium: url.searchParams.get("utm_medium"),
        campaign: url.searchParams.get("utm_campaign"),
        term: url.searchParams.get("utm_term"),
        content: url.searchParams.get("utm_content"),
      }
    : {};

  const { data: existingVisitor, error: visitorLookupError } = await supabase
    .from("fullstack_visitors")
    .select("first_landing_page, first_referrer, initial_utm, sessions_count")
    .eq("visitor_id", visitor)
    .maybeSingle();
  throwIfSupabaseError(visitorLookupError);
  const visitorResult = await supabase.from("fullstack_visitors").upsert(
    {
      visitor_id: visitor,
      last_seen_at: now,
      first_landing_page: existingVisitor?.first_landing_page || path || "/",
      last_page: path || "/",
      first_referrer: existingVisitor?.first_referrer || referrer || null,
      initial_utm: existingVisitor?.initial_utm || utm,
      sessions_count: existingVisitor?.sessions_count || 0,
      user_agent: userAgent || null,
      locale: locale || null,
      timezone: timezone || null,
      device: { type: deviceType, screenWidth: screenWidth || null, screenHeight: screenHeight || null },
    },
    { onConflict: "visitor_id" },
  );
  throwIfSupabaseError(visitorResult.error);

  const { data: existingSession, error: sessionLookupError } = await supabase
    .from("fullstack_sessions")
    .select("event_count, click_count, max_scroll_depth, started_at, country, region, city")
    .eq("session_id", session)
    .maybeSingle();
  throwIfSupabaseError(sessionLookupError);
  const startedAt = existingSession?.started_at || now;
  const duration = Math.max(0, Date.now() - new Date(startedAt).getTime());
  const sessionResult = await supabase.from("fullstack_sessions").upsert(
    {
      session_id: session,
      visitor_id: visitor,
      started_at: startedAt,
      last_seen_at: now,
      landing_page: existingSession ? undefined : path || "/",
      current_page: path || "/",
      referrer: referrer || null,
      utm_source: "source" in utm ? utm.source : null,
      utm_medium: "medium" in utm ? utm.medium : null,
      utm_campaign: "campaign" in utm ? utm.campaign : null,
      utm_term: "term" in utm ? utm.term : null,
      utm_content: "content" in utm ? utm.content : null,
      user_agent: userAgent || null,
      locale: locale || null,
      timezone: timezone || null,
      device_type: deviceType,
      screen_width: screenWidth || null,
      screen_height: screenHeight || null,
      viewport_width: viewportWidth || null,
      viewport_height: viewportHeight || null,
      ip_hash: ipHash || null,
      country: country || existingSession?.country || null,
      region: region || existingSession?.region || null,
      city: city || existingSession?.city || null,
      event_count: (existingSession?.event_count || 0) + 1,
      click_count: (existingSession?.click_count || 0) + (eventType === "click" ? 1 : 0),
      max_scroll_depth: Math.max(existingSession?.max_scroll_depth || 0, scrollDepth),
      duration_ms: duration,
      metadata: { lastEvent: eventType },
    },
    { onConflict: "session_id" },
  );
  throwIfSupabaseError(sessionResult.error);

  if (!existingSession) {
    const visitorSessionCount = await supabase
      .from("fullstack_visitors")
      .update({ sessions_count: (existingVisitor?.sessions_count || 0) + 1 })
      .eq("visitor_id", visitor);
    throwIfSupabaseError(visitorSessionCount.error);
  }

  const eventResult = await supabase.from("fullstack_analytics_events").insert({
    occurred_at: occurredAt || now,
    session_id: session,
    visitor_id: visitor,
    event_type: eventType,
    path: path || null,
    page_title: pageTitle || null,
    referrer: referrer || null,
    x: x ?? null,
    y: y ?? null,
    scroll_depth: eventType === "scroll" ? scrollDepth : null,
    viewport_width: viewportWidth ?? null,
    viewport_height: viewportHeight ?? null,
    element: typeof metadata?.tag === "string" ? metadata.tag.slice(0, 120) : null,
    element_text: typeof metadata?.text === "string" ? metadata.text.slice(0, 240) : null,
    metadata: metadata || {},
  });
  throwIfSupabaseError(eventResult.error);
}

export function toClientMessages(messages: StoredChatMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    role:
      message.role === "user"
        ? "user"
        : message.role === "admin"
          ? "admin"
          : message.role === "system"
            ? "system"
            : "assistant",
    content: message.content,
    createdAt: message.created_at,
  }));
}
