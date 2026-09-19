import { ChatMessage, LeadProfile } from "@/tenants/fullstack/lib/business-context";
import { getSupabaseAdmin, throwIfSupabaseError } from "@/tenants/fullstack/lib/supabase";

type SaveLeadInput = {
  lead: LeadProfile;
  transcript: ChatMessage[];
  page?: string;
  userAgent?: string | null;
  hfIntent?: string | null;
  sessionId?: string | null;
  captureSource?: string;
  consentContext?: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function shouldStoreLead(lead: LeadProfile) {
  return Boolean(
    lead.email ||
      lead.phone ||
      (lead.intent === "high" && (lead.budget || lead.timeline || lead.company)) ||
      (lead.score || 0) >= 55,
  );
}

export async function saveLead({
  lead,
  transcript,
  page,
  userAgent,
  hfIntent,
  sessionId,
  captureSource = "chat",
  consentContext,
}: SaveLeadInput) {
  if (!shouldStoreLead(lead)) return false;

  const supabase = getSupabaseAdmin();
  const validSessionId = sessionId && uuidPattern.test(sessionId) ? sessionId : null;
  const { data: analyticsSession } = validSessionId
    ? await supabase
        .from("fullstack_sessions")
        .select("visitor_id")
        .eq("session_id", validSessionId)
        .maybeSingle()
    : { data: null };

  const { error } = await supabase.from("fullstack_leads").insert({
    visitor_id: analyticsSession?.visitor_id || null,
    session_id: validSessionId,
    chat_session_id: captureSource === "chat" ? validSessionId : null,
    capture_source: captureSource,
    name: lead.name || null,
    email: lead.email || null,
    phone: lead.phone || null,
    company: lead.company || null,
    niche: lead.niche || null,
    budget: lead.budget || null,
    timeline: lead.timeline || null,
    project_type: lead.projectType || null,
    lead_score: lead.score || null,
    intent: lead.intent || null,
    summary: lead.summary || null,
    transcript,
    source_page: page || null,
    user_agent: userAgent || null,
    hf_intent: hfIntent || null,
    consent_context: consentContext || null,
  });
  throwIfSupabaseError(error);
  return true;
}
