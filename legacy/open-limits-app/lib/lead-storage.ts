import { ChatMessage, LeadProfile } from "@/app/lib/open-limits-brain";
import { getSql } from "@/app/lib/neon";

type SaveLeadInput = {
  lead: LeadProfile;
  transcript: ChatMessage[];
  page?: string;
  userAgent?: string | null;
  hfIntent?: string | null;
};

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
}: SaveLeadInput) {
  if (!shouldStoreLead(lead)) return false;

  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS open_limits_leads (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT,
      email TEXT,
      phone TEXT,
      company TEXT,
      niche TEXT,
      budget TEXT,
      timeline TEXT,
      project_type TEXT,
      lead_score INTEGER,
      intent TEXT,
      summary TEXT,
      transcript JSONB NOT NULL,
      source_page TEXT,
      user_agent TEXT,
      hf_intent TEXT
    )
  `;
  await sql`ALTER TABLE open_limits_leads ADD COLUMN IF NOT EXISTS niche TEXT`;
  await sql`
    CREATE INDEX IF NOT EXISTS open_limits_leads_created_at_idx
      ON open_limits_leads (created_at DESC)
  `;
  await sql`
    INSERT INTO open_limits_leads (
      name,
      email,
      phone,
      company,
      niche,
      budget,
      timeline,
      project_type,
      lead_score,
      intent,
      summary,
      transcript,
      source_page,
      user_agent,
      hf_intent
    )
    VALUES (
      ${lead.name || null},
      ${lead.email || null},
      ${lead.phone || null},
      ${lead.company || null},
      ${lead.niche || null},
      ${lead.budget || null},
      ${lead.timeline || null},
      ${lead.projectType || null},
      ${lead.score || null},
      ${lead.intent || null},
      ${lead.summary || null},
      ${JSON.stringify(transcript)},
      ${page || null},
      ${userAgent || null},
      ${hfIntent || null}
    )
  `;

  return true;
}
