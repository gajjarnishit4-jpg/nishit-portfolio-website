"use client";

const SESSION_KEY = "open-limits-session-id";
const VISITOR_KEY = "open-limits-visitor-id";

export function getBrowserVisitorId() {
  let visitorId = window.localStorage.getItem(VISITOR_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, visitorId);
  }
  return visitorId;
}

export function getBrowserSessionId() {
  let sessionId = window.sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}
