"use client";

// Version the chat session after the personal-brand relaunch so browsers do not
// reload conversations created under the previous agency identity.
const SESSION_KEY = "fullstack-guys-session-id-v3";
const VISITOR_KEY = "fullstack-guys-visitor-id";

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
