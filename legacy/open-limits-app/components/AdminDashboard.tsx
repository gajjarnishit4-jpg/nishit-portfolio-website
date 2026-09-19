"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type LeadRow = {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  niche: string | null;
  budget: string | null;
  timeline: string | null;
  lead_score: number | null;
  intent: string | null;
  summary: string | null;
};

type ChatSession = {
  id: string;
  created_at: string;
  updated_at: string;
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

type ChatMessageRow = {
  id: number;
  session_id: string;
  created_at: string;
  role: "user" | "assistant" | "admin" | "system";
  content: string;
};

type Analytics = {
  totalSessions: number;
  totalVisitors: number;
  deviceCounts: Record<string, number>;
  avgTimeSpentSeconds: number;
  sessionStats: VisitorSessionStats[];
  visitors: VisitorGroup[];
  topPages: Array<{ path: string; count: number }>;
  recentActivity: Array<{
    id: number;
    created_at: string;
    label: string;
    detail: string;
  }>;
};

type VisitorSessionStats = {
  sessionId: string;
  visitorId: string;
  path: string;
  device: string;
  eventCount: number;
  clicks: number;
  maxScroll: number;
  timeSpentSeconds: number;
  lastSeen: string;
  startedAt: string;
  timeline: Array<{
    id: number;
    created_at: string;
    label: string;
    detail: string;
  }>;
};

type VisitorGroup = {
  visitorId: string;
  sessionCount: number;
  eventCount: number;
  clicks: number;
  totalTimeSpentSeconds: number;
  lastSeen: string;
  devices: string[];
  paths: string[];
  sessions: VisitorSessionStats[];
};

type Overview = {
  leads: LeadRow[];
  sessions: ChatSession[];
  messages: ChatMessageRow[];
  analytics: Analytics;
};

export type AdminView = "overview" | "leads" | "chats" | "visitors";

const adminTabs: Array<{ view: AdminView; label: string; href: string }> = [
  { view: "overview", label: "Overview", href: "/admin" },
  { view: "leads", label: "Leads", href: "/admin/leads" },
  { view: "chats", label: "Chats", href: "/admin/chats" },
  { view: "visitors", label: "Visitors", href: "/admin/visitors" },
];

const viewTitles: Record<AdminView, { eyebrow: string; title: string }> = {
  overview: { eyebrow: "Lead command center", title: "Overview" },
  leads: { eyebrow: "Lead pipeline", title: "Organized leads" },
  chats: { eyebrow: "Conversation review", title: "Chat inbox" },
  visitors: { eyebrow: "Visitor intelligence", title: "Sessions and activity" },
};

function timeAgo(value: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function duration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes < 60) return remaining ? `${minutes}m ${remaining}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function scoreLabel(score?: number | null) {
  if (!score) return "New";
  if (score >= 75) return "Hot";
  if (score >= 45) return "Warm";
  return "New";
}

function shortId(value: string) {
  return value.length > 10 ? value.slice(0, 10) : value;
}

export function AdminDashboard({ admin, view = "overview" }: { admin: string; view?: AdminView }) {
  const [data, setData] = useState<Overview | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (!response.ok) return;
    const nextData = (await response.json()) as Overview;
    setData(nextData);
    setSelectedId((current) => current || nextData.sessions?.[0]?.id || "");
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), 6000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [load]);

  const messagesBySession = useMemo(() => {
    const map = new Map<string, ChatMessageRow[]>();
    for (const message of data?.messages || []) {
      const group = map.get(message.session_id) || [];
      group.push(message);
      map.set(message.session_id, group);
    }
    return map;
  }, [data?.messages]);

  const selectedSession = data?.sessions?.find((session) => session.id === selectedId);
  const selectedMessages = selectedId ? messagesBySession.get(selectedId) || [] : [];
  const hotLeads =
    data?.leads?.filter((lead) => lead.intent === "high" || (lead.lead_score || 0) >= 75).length || 0;
  const deviceCounts = data?.analytics?.deviceCounts || {};
  const activeTitle = viewTitles[view];

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  async function handleJoin() {
    if (!selectedId) return;
    await fetch("/api/admin/chat-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selectedId, action: "join" }),
    });
    await load();
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || sending) return;
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") || "").trim();
    if (!message) return;
    setSending(true);
    await fetch("/api/admin/chat-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selectedId, action: "send", message }),
    });
    setSending(false);
    event.currentTarget.reset();
    await load();
  }

  const metrics = (
    <section className="admin-metrics">
      <div><span>Total leads</span><strong>{data?.leads?.length || 0}</strong></div>
      <div><span>Hot leads</span><strong>{hotLeads}</strong></div>
      <div><span>Visitors</span><strong>{data?.analytics?.totalVisitors || 0}</strong></div>
      <div><span>Sessions</span><strong>{data?.analytics?.totalSessions || 0}</strong></div>
      <div><span>Avg time</span><strong>{duration(data?.analytics?.avgTimeSpentSeconds || 0)}</strong></div>
    </section>
  );

  const leadsPanel = (
    <section className="admin-panel admin-leads" id="leads">
      <div className="admin-panel__head">
        <h2>Leads</h2>
        <span>{data?.leads?.length || 0} total</span>
      </div>
      <div className="admin-leads__list">
        {(data?.leads || []).map((lead) => (
          <article className="admin-lead-card" key={lead.id}>
            <div>
              <strong>{lead.name || "Unknown lead"}</strong>
              <b className={`admin-pill admin-pill--${scoreLabel(lead.lead_score).toLowerCase()}`}>
                {scoreLabel(lead.lead_score)}
              </b>
            </div>
            <p>{lead.summary || lead.niche || lead.company || "No project summary yet."}</p>
            <dl>
              <div><dt>Email</dt><dd>{lead.email || "Missing"}</dd></div>
              <div><dt>Phone</dt><dd>{lead.phone || "Missing"}</dd></div>
              <div><dt>Niche</dt><dd>{lead.niche || "Missing"}</dd></div>
              <div><dt>Budget</dt><dd>{lead.budget || "Missing"}</dd></div>
              <div><dt>Timeline</dt><dd>{lead.timeline || "Missing"}</dd></div>
              <div><dt>Added</dt><dd>{formatDate(lead.created_at)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );

  const chatsPanel = (
    <section className="admin-panel admin-chat-review" id="chats">
      <div className="admin-chat-list">
        <div className="admin-panel__head">
          <h2>Chats</h2>
          <span>{data?.sessions?.length || 0}</span>
        </div>
        {(data?.sessions || []).map((session) => (
          <button
            key={session.id}
            className={session.id === selectedId ? "admin-session admin-session--active" : "admin-session"}
            onClick={() => setSelectedId(session.id)}
          >
            <strong>{session.visitor_name || session.visitor_email || "Visitor"}</strong>
            <span>{session.last_message || "No message preview"}</span>
            <small>
              {session.intent || "new"} · {session.status || "bot"} · {timeAgo(session.updated_at)} ago
            </small>
          </button>
        ))}
      </div>

      <div className="admin-chat-window">
        <div className="admin-chat-window__head">
          <div>
            <h2>{selectedSession?.visitor_name || selectedSession?.visitor_email || "Select a chat"}</h2>
            <p>
              {selectedSession?.niche || "No niche"} · {selectedSession?.budget || "No budget"} ·{" "}
              {selectedSession?.timeline || "No timeline"}
            </p>
          </div>
          {selectedSession ? (
            <button onClick={handleJoin}>
              {selectedSession.human_joined ? "Joined" : "Join chat"}
            </button>
          ) : null}
        </div>

        <div className="admin-chat-bubbles">
          {selectedMessages.length ? (
            selectedMessages.map((message) => (
              <div
                key={message.id}
                className={`admin-chat-bubble admin-chat-bubble--${message.role}`}
              >
                <span>{message.role} · {formatDate(message.created_at)}</span>
                <p>{message.content}</p>
              </div>
            ))
          ) : (
            <div className="admin-empty">Pick a chat to review the full conversation.</div>
          )}
        </div>

        <form className="admin-reply" onSubmit={handleSend}>
          <input name="message" placeholder="Join and reply as human..." disabled={!selectedSession} />
          <button disabled={!selectedSession || sending}>{sending ? "Sending" : "Send"}</button>
        </form>
      </div>
    </section>
  );

  const visitorsPanel = (
    <section className="admin-visitor-grid" id="visitors">
      <section className="admin-panel admin-visitor-panel">
        <div className="admin-panel__head">
          <h2>Visitors</h2>
          <span>{data?.analytics?.totalVisitors || 0} total</span>
        </div>
        <div className="admin-visitor-list">
          {(data?.analytics?.visitors || []).map((visitor) => (
            <article key={visitor.visitorId} className="admin-visitor-card">
              <div className="admin-visitor-card__head">
                <div>
                  <strong>Visitor {shortId(visitor.visitorId)}</strong>
                  <span>{visitor.devices.join(", ") || "Unknown"} · {visitor.paths[0] || "/"}</span>
                </div>
                <time>{timeAgo(visitor.lastSeen)} ago</time>
              </div>
              <dl>
                <div><dt>Sessions</dt><dd>{visitor.sessionCount}</dd></div>
                <div><dt>Events</dt><dd>{visitor.eventCount}</dd></div>
                <div><dt>Clicks</dt><dd>{visitor.clicks}</dd></div>
                <div><dt>Total time</dt><dd>{duration(visitor.totalTimeSpentSeconds)}</dd></div>
              </dl>
              <div className="admin-session-timeline-list">
                {visitor.sessions.map((session) => (
                  <details key={session.sessionId} className="admin-session-timeline">
                    <summary>
                      <span>
                        <strong>{session.device} session</strong>
                        <small>{session.path} · {duration(session.timeSpentSeconds)} · {session.eventCount} events</small>
                      </span>
                      <time>{timeAgo(session.lastSeen)} ago</time>
                    </summary>
                    <ol>
                      {session.timeline.map((event) => (
                        <li key={event.id}>
                          <span>{formatDate(event.created_at)}</span>
                          <strong>{event.label}</strong>
                          <small>{event.detail}</small>
                        </li>
                      ))}
                    </ol>
                  </details>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel admin-visitor-panel">
        <div className="admin-panel__head">
          <h2>Session summary</h2>
          <span>Devices and time</span>
        </div>
        <div className="admin-device-row">
          {["Desktop", "Tablet", "Mobile", "Unknown"].map((device) => (
            <div key={device}>
              <span>{device}</span>
              <strong>{deviceCounts[device] || 0}</strong>
            </div>
          ))}
        </div>
        <div className="admin-session-stats">
          {(data?.analytics?.sessionStats || []).map((session) => (
            <article key={session.sessionId}>
              <strong>{session.device} · {session.path}</strong>
              <span>
                {duration(session.timeSpentSeconds)} · {session.eventCount} events · {session.clicks} clicks ·{" "}
                {session.maxScroll}% scroll
              </span>
              <small>{timeAgo(session.lastSeen)} ago</small>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel admin-visitor-panel">
        <div className="admin-panel__head">
          <h2>Activity feed</h2>
          <span>Latest events</span>
        </div>
        <div className="admin-activity-list">
          {(data?.analytics?.recentActivity || []).map((event) => (
            <article key={event.id} className="admin-activity-row">
              <div>
                <strong>{event.label}</strong>
                <span>{event.detail}</span>
              </div>
              <time>{timeAgo(event.created_at)} ago</time>
            </article>
          ))}
        </div>
        <div className="admin-panel__head admin-panel__head--sub">
          <h2>Top pages</h2>
          <span>Pageviews</span>
        </div>
        <div className="admin-top-pages admin-top-pages--compact">
          {(data?.analytics?.topPages || []).map((page) => (
            <div key={page.path}>
              <span>{page.path}</span>
              <strong>{page.count}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <span>OPEN LIMITS</span>
          <h1>Admin</h1>
          <small>{admin}</small>
        </div>
        <nav aria-label="Admin sections">
          {adminTabs.map((tab) => (
            <Link
              className={tab.view === view ? "admin-sidebar__link--active" : ""}
              href={tab.href}
              key={tab.view}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout}>Logout</button>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar" id="overview">
          <div>
            <span>{activeTitle.eyebrow}</span>
            <h1>{activeTitle.title}</h1>
          </div>
          <div className="admin-topbar__right">
            <small>Live refresh: 6s</small>
            <strong>{data ? "Online" : "Loading"}</strong>
          </div>
        </header>

        {metrics}

        {view === "overview" ? (
          <>
            <section className="admin-overview-grid">
              {leadsPanel}
              {chatsPanel}
            </section>
            {visitorsPanel}
          </>
        ) : null}

        {view === "leads" ? <section className="admin-single-page">{leadsPanel}</section> : null}
        {view === "chats" ? <section className="admin-single-page admin-single-page--chat">{chatsPanel}</section> : null}
        {view === "visitors" ? visitorsPanel : null}
      </section>
    </main>
  );
}
