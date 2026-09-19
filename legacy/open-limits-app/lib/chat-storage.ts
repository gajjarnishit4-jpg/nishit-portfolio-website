import { ChatMessage, LeadProfile } from "@/app/lib/open-limits-brain";
import { getSql } from "@/app/lib/neon";

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

export async function ensureChatTables() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS open_limits_chat_sessions (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      source_page TEXT,
      user_agent TEXT,
      visitor_name TEXT,
      visitor_email TEXT,
      visitor_phone TEXT,
      company TEXT,
      niche TEXT,
      budget TEXT,
      timeline TEXT,
      lead_score INTEGER,
      intent TEXT,
      status TEXT NOT NULL DEFAULT 'bot',
      human_joined BOOLEAN NOT NULL DEFAULT false,
      last_message TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS open_limits_chat_messages (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES open_limits_chat_sessions(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      role TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS open_limits_heatmap_events (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      session_id TEXT,
      path TEXT,
      event_type TEXT NOT NULL,
      x INTEGER,
      y INTEGER,
      viewport_width INTEGER,
      viewport_height INTEGER,
      metadata JSONB
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS open_limits_chat_messages_session_idx
      ON open_limits_chat_messages (session_id, created_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS open_limits_chat_sessions_updated_idx
      ON open_limits_chat_sessions (updated_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS open_limits_heatmap_events_created_idx
      ON open_limits_heatmap_events (created_at DESC)
  `;
}

export async function saveChatTurn({
  sessionId,
  userMessage,
  assistantMessage,
  lead,
  page,
  userAgent,
}: {
  sessionId: string;
  userMessage: string;
  assistantMessage: string;
  lead: LeadProfile;
  page?: string;
  userAgent?: string | null;
}) {
  await ensureChatTables();
  const sql = getSql();
  await sql`
    INSERT INTO open_limits_chat_sessions (
      id,
      source_page,
      user_agent,
      visitor_name,
      visitor_email,
      visitor_phone,
      company,
      niche,
      budget,
      timeline,
      lead_score,
      intent,
      last_message
    )
    VALUES (
      ${sessionId},
      ${page || null},
      ${userAgent || null},
      ${lead.name || null},
      ${lead.email || null},
      ${lead.phone || null},
      ${lead.company || null},
      ${lead.niche || null},
      ${lead.budget || null},
      ${lead.timeline || null},
      ${lead.score || null},
      ${lead.intent || null},
      ${userMessage.slice(0, 500)}
    )
    ON CONFLICT (id) DO UPDATE SET
      updated_at = now(),
      source_page = COALESCE(EXCLUDED.source_page, open_limits_chat_sessions.source_page),
      user_agent = COALESCE(EXCLUDED.user_agent, open_limits_chat_sessions.user_agent),
      visitor_name = COALESCE(EXCLUDED.visitor_name, open_limits_chat_sessions.visitor_name),
      visitor_email = COALESCE(EXCLUDED.visitor_email, open_limits_chat_sessions.visitor_email),
      visitor_phone = COALESCE(EXCLUDED.visitor_phone, open_limits_chat_sessions.visitor_phone),
      company = COALESCE(EXCLUDED.company, open_limits_chat_sessions.company),
      niche = COALESCE(EXCLUDED.niche, open_limits_chat_sessions.niche),
      budget = COALESCE(EXCLUDED.budget, open_limits_chat_sessions.budget),
      timeline = COALESCE(EXCLUDED.timeline, open_limits_chat_sessions.timeline),
      lead_score = GREATEST(COALESCE(open_limits_chat_sessions.lead_score, 0), COALESCE(EXCLUDED.lead_score, 0)),
      intent = CASE
        WHEN open_limits_chat_sessions.intent = 'high' OR EXCLUDED.intent = 'high' THEN 'high'
        WHEN open_limits_chat_sessions.intent = 'medium' OR EXCLUDED.intent = 'medium' THEN 'medium'
        ELSE COALESCE(EXCLUDED.intent, open_limits_chat_sessions.intent)
      END,
      last_message = EXCLUDED.last_message
  `;
  await sql`
    INSERT INTO open_limits_chat_messages (session_id, role, content)
    VALUES
      (${sessionId}, 'user', ${userMessage}),
      (${sessionId}, 'assistant', ${assistantMessage})
  `;
}

export async function getChatSession(sessionId: string) {
  await ensureChatTables();
  const sql = getSql();
  const sessions = await sql`
    SELECT *
    FROM open_limits_chat_sessions
    WHERE id = ${sessionId}
    LIMIT 1
  `;
  const messages = await sql`
    SELECT id, session_id, created_at, role, content
    FROM open_limits_chat_messages
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC, id ASC
  `;

  return {
    session: sessions[0] as StoredChatSession | undefined,
    messages: messages as StoredChatMessage[],
  };
}

export async function listAdminChatData() {
  await ensureChatTables();
  const sql = getSql();
  const sessions = (await sql`
    SELECT *
    FROM open_limits_chat_sessions
    ORDER BY updated_at DESC
    LIMIT 80
  `) as StoredChatSession[];
  const ids = sessions.map((session) => session.id);
  const messages = ids.length
    ? ((await sql`
        SELECT id, session_id, created_at, role, content
        FROM open_limits_chat_messages
        WHERE session_id = ANY(${ids})
        ORDER BY created_at ASC, id ASC
      `) as StoredChatMessage[])
    : [];
  const heatmap = await sql`
    SELECT id, created_at, session_id, path, event_type, x, y, viewport_width, viewport_height, metadata
    FROM open_limits_heatmap_events
    ORDER BY created_at DESC
    LIMIT 500
  `;

  return { sessions, messages, heatmap };
}

export async function addAdminMessage(sessionId: string, message: string) {
  await ensureChatTables();
  const sql = getSql();
  await sql`
    UPDATE open_limits_chat_sessions
    SET human_joined = true,
        status = 'human',
        updated_at = now(),
        last_message = ${message.slice(0, 500)}
    WHERE id = ${sessionId}
  `;
  await sql`
    INSERT INTO open_limits_chat_messages (session_id, role, content)
    VALUES (${sessionId}, 'admin', ${message})
  `;
}

export async function joinChatSession(sessionId: string) {
  await ensureChatTables();
  const sql = getSql();
  await sql`
    UPDATE open_limits_chat_sessions
    SET human_joined = true,
        status = 'human',
        updated_at = now()
    WHERE id = ${sessionId}
  `;
}

export async function saveHeatmapEvent({
  sessionId,
  path,
  eventType,
  x,
  y,
  viewportWidth,
  viewportHeight,
  metadata,
}: {
  sessionId?: string | null;
  path?: string | null;
  eventType: string;
  x?: number | null;
  y?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  metadata?: Record<string, unknown> | null;
}) {
  await ensureChatTables();
  const sql = getSql();
  await sql`
    INSERT INTO open_limits_heatmap_events (
      session_id,
      path,
      event_type,
      x,
      y,
      viewport_width,
      viewport_height,
      metadata
    )
    VALUES (
      ${sessionId || null},
      ${path || null},
      ${eventType},
      ${x ?? null},
      ${y ?? null},
      ${viewportWidth ?? null},
      ${viewportHeight ?? null},
      ${metadata ? JSON.stringify(metadata) : null}
    )
  `;
}

export function toClientMessages(messages: StoredChatMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    role: message.role === "user" ? "user" : message.role === "admin" ? "admin" : "assistant",
    content: message.content,
    createdAt: message.created_at,
  }));
}
