import { NextRequest, NextResponse } from "next/server";
import {
  ChatMessage,
  LEAD_EXTRACTION_PROMPT,
  LeadProfile,
  SYSTEM_PROMPT,
} from "@/app/lib/open-limits-brain";
import {
  getChatSession,
  saveChatTurn,
  toClientMessages,
} from "@/app/lib/chat-storage";
import { saveLead } from "@/app/lib/lead-storage";
import { sendMetaEvent } from "@/app/lib/meta-capi";
import { answerFallback, finalizeAnswer } from "@/app/lib/chat-replies";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  page?: string;
  sessionId?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
};

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_MESSAGES = 16;
const MAX_MESSAGE_LENGTH = 1200;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/;
const urlPattern =
  /(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+\S*/i;

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function cleanMessages(messages: ChatMessage[] = []): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        (message.role === "user" ||
          message.role === "assistant" ||
          message.role === "admin") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
}

function parseJsonObject<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

function latestUserContent(messages: ChatMessage[]) {
  return (
    [...messages].reverse().find((message) => message.role === "user")
      ?.content || ""
  );
}

function cleanCapturedText(value?: string | null) {
  if (!value) return null;
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^[\s:,-]+|[\s.,!?;:)-]+$/g, "")
    .trim();
  return cleaned || null;
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function extractName(text: string) {
  const patterns = [
    /\b(?:my\s+)?(?:name|anme)\s*(?:is|:|-)?\s*([a-z][a-z.'-]*(?:\s+[a-z][a-z.'-]*){0,3})/i,
    /\b(?:i\s+am|i'm|im|this\s+is)\s+([a-z][a-z.'-]*(?:\s+[a-z][a-z.'-]*){0,3})\b/i,
  ];
  const blocked =
    /^(looking|building|working|from|under|on|in|interested|ready|launching|starting)\b/i;

  for (const pattern of patterns) {
    const value = cleanCapturedText(
      text
        .match(pattern)?.[1]
        ?.replace(
          /\b(?:email|phone|budget|niche|website|site|url|timeline).*$/i,
          "",
        ),
    );
    if (value && !blocked.test(value)) return toTitleCase(value);
  }
  return null;
}

function extractCompanyOrUrl(text: string) {
  const textWithoutEmails = text.replace(emailPattern, " ");
  const direct =
    text.match(/\b(?:website|site|url|store)\s*(?:is|:|-)?\s*(\S+)/i)?.[1] ||
    text.match(
      /\b(?:brand|company|store)\s*(?:is|:|-)?\s*([a-z0-9][a-z0-9 .'&-]{1,80})/i,
    )?.[1] ||
    textWithoutEmails.match(urlPattern)?.[0];
  return cleanCapturedText(direct);
}

function extractNiche(text: string) {
  const explicit =
    text.match(
      /\b(?:niche|industry|category)\s*(?:is|:|-)?\s*([a-z][a-z &/-]{2,50})/i,
    )?.[1] ||
    text.match(
      /\b(?:in|for)\s+(?:the\s+)?([a-z][a-z &/-]{2,35})\s+(?:niche|industry|space|brand)/i,
    )?.[1] ||
    text.match(
      /\b(?:we|i)\s+(?:sell|make|offer)\s+([a-z][a-z &/-]{2,45})/i,
    )?.[1];
  if (explicit) return cleanCapturedText(explicit);

  return (
    text.match(
      /\b(?:beauty|skincare|skin care|fashion|apparel|food|drink|supplement|wellness|pet|jewelry|fitness|saas|clinic|dental|coffee|fragrance|streetwear|homeware|baby|haircare|perfume|health)\b/i,
    )?.[0] || null
  );
}

function extractBudget(text: string) {
  const explicit =
    text.match(
      /\b(?:budget|spend|investment)\s*(?:is|:|-|around|about|under|below|less than)?\s*(\$?\s?[1-9][\d,]*(?:\s?k)?(?:\s?usd|\s?dollars)?)\b/i,
    )?.[1] ||
    text.match(
      /\b(?:under|below|less than|around|about)\s*(\$?\s?[1-9][\d,]*(?:\s?k)?(?:\s?usd|\s?dollars)?)\b/i,
    )?.[1];
  return cleanCapturedText(explicit);
}

function extractTimeline(text: string) {
  const timeline =
    text.match(
      /\b(?:timeline|launch|deadline)\s*(?:is|:|-)?\s*([a-z0-9 ,/-]{2,50})/i,
    )?.[1] ||
    text.match(
      /\b(?:asap|urgent|this month|next month|in \d+\s?weeks?|in \d+\s?months?|q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
    )?.[0];
  return cleanCapturedText(timeline);
}

function estimateLeadScore(lead: LeadProfile, text: string) {
  const hasProjectSignal =
    /software|ios|app|mobile|dashboard|portal|automation|api|ai|shopify|store|theme|redesign|website|landing|brand|launch|conversion|ecommerce|e-commerce|design|developer|agency|ads|growth/i.test(
      text,
    );
  return Math.min(
    100,
    18 +
      (lead.name ? 8 : 0) +
      (lead.email ? 24 : 0) +
      (lead.phone ? 18 : 0) +
      (lead.niche ? 10 : 0) +
      (lead.company ? 8 : 0) +
      (lead.budget ? 12 : 0) +
      (lead.timeline ? 10 : 0) +
      (hasProjectSignal ? 12 : 0),
  );
}

function intentFromScore(score: number): LeadProfile["intent"] {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function looksLikeUrl(value?: string | null) {
  return Boolean(value && /\.[a-z]{2,}/i.test(value));
}

function extractFallbackLead(messages: ChatMessage[]): LeadProfile {
  const fullText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  const latest = latestUserContent(messages);
  const lead: LeadProfile = {
    name: extractName(fullText),
    email: fullText.match(emailPattern)?.[0] || null,
    phone: fullText.match(phonePattern)?.[0]?.trim() || null,
    company: extractCompanyOrUrl(fullText),
    niche: extractNiche(fullText),
    budget: extractBudget(fullText),
    timeline: extractTimeline(fullText),
  };
  const hasProjectSignal =
    /software|ios|app|mobile|dashboard|portal|automation|api|ai|shopify|store|theme|redesign|website|landing|brand|launch|conversion|ecommerce|e-commerce|design|developer|agency|ads|growth/i.test(
      fullText,
    );
  const score = estimateLeadScore(lead, fullText);

  return {
    ...lead,
    projectType: hasProjectSignal
      ? "Digital product and development inquiry"
      : null,
    summary: latest.slice(0, 260),
    score,
    intent: intentFromScore(score),
  };
}

function mergeLeadProfiles(
  primary: LeadProfile,
  deterministic: LeadProfile,
  messages: ChatMessage[],
) {
  const merged: LeadProfile = {
    ...primary,
    name: primary.name || deterministic.name || null,
    email: primary.email || deterministic.email || null,
    phone: primary.phone || deterministic.phone || null,
    company:
      deterministic.company &&
      looksLikeUrl(deterministic.company) &&
      !looksLikeUrl(primary.company)
        ? deterministic.company
        : primary.company || deterministic.company || null,
    niche: primary.niche || deterministic.niche || null,
    budget: primary.budget || deterministic.budget || null,
    timeline: primary.timeline || deterministic.timeline || null,
    projectType: primary.projectType || deterministic.projectType || null,
    summary: primary.summary || deterministic.summary || null,
  };
  const text = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  const score = Math.max(
    primary.score || 0,
    deterministic.score || 0,
    estimateLeadScore(merged, text),
  );
  return {
    ...merged,
    score,
    intent:
      primary.intent === "high" || deterministic.intent === "high"
        ? "high"
        : intentFromScore(score),
  };
}

async function callGroq(messages: GroqMessage[], jsonMode = false) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    signal: AbortSignal.timeout(12000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
      messages,
      temperature: jsonMode ? 0.1 : 0.45,
      max_tokens: jsonMode ? 520 : 420,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function scoreWithHuggingFace(messages: ChatMessage[]) {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ||
    messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join("\n")
      .slice(-1500);

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: latestUserMessage,
          parameters: {
            candidate_labels: [
              "ready to hire a technology partner",
              "researching website ideas",
              "support question",
            ],
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) return null;
    const result = (await response.json()) as {
      labels?: string[];
      scores?: number[];
    };

    if (!result.labels?.length) return null;
    return `${result.labels[0]}:${Math.round((result.scores?.[0] || 0) * 100)}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function safeSaveLead(input: Parameters<typeof saveLead>[0]) {
  try {
    return await saveLead(input);
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function safeSaveChatTurn(input: Parameters<typeof saveChatTurn>[0]) {
  try {
    await saveChatTurn(input);
  } catch (error) {
    console.error(error);
  }
}

function toGroqHistory(messages: ChatMessage[]): GroqMessage[] {
  return messages.map((message) => ({
    role: message.role === "user" ? "user" : "assistant",
    content: message.content,
  }));
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonResponse({ error: "Send a valid chat payload." }, 400);
  }

  const messages = cleanMessages(body.messages);
  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return jsonResponse({ error: "Send at least one user message." }, 400);
  }

  const sessionId = body.sessionId || crypto.randomUUID();
  const latestUserMessage = messages[messages.length - 1]?.content || "";
  let answer = "";
  let source: "groq" | "fallback" = "groq";
  let lead = extractFallbackLead(messages);

  try {
    answer = await callGroq([
      { role: "system", content: SYSTEM_PROMPT },
      ...toGroqHistory(messages),
    ]);
  } catch {
    console.warn("Chat generation unavailable; using the contextual fallback.");
    source = "fallback";
  }
  if (!answer.trim()) {
    source = "fallback";
    answer = answerFallback(messages, lead);
  }

  // Optional lead enrichment must not discard a successful answer.
  if (source === "groq") {
    try {
      const extraction = await callGroq(
        [
          { role: "system", content: LEAD_EXTRACTION_PROMPT },
          {
            role: "user",
            content: JSON.stringify(
              messages.filter((message) => message.role === "user"),
            ),
          },
        ],
        true,
      );
      lead = mergeLeadProfiles(
        parseJsonObject<LeadProfile>(extraction) || {},
        lead,
        messages,
      );
    } catch {
      console.warn(
        "Lead enrichment unavailable; retaining visitor-supplied details.",
      );
    }
  }

  answer = finalizeAnswer(answer, messages, lead);
  const transcript = [
    ...messages,
    { role: "assistant" as const, content: answer },
  ];
  const hfIntent = await scoreWithHuggingFace(messages);
  const saved = await safeSaveLead({
    lead,
    transcript,
    page: body.page,
    userAgent: request.headers.get("user-agent"),
    hfIntent: hfIntent || (source === "fallback" ? "fallback" : null),
  });
  await safeSaveChatTurn({
    sessionId,
    userMessage: latestUserMessage,
    assistantMessage: answer,
    lead,
    page: body.page,
    userAgent: request.headers.get("user-agent"),
  });
  if (saved) {
    try {
      await sendMetaEvent({
        eventName: "Lead",
        request,
        eventId: body.eventId,
        sourceUrl: body.page,
        fbp: body.fbp,
        fbc: body.fbc,
        lead,
        customData: {
          content_name: "Lead chat",
          lead_score: lead.score,
          lead_intent: lead.intent,
        },
      });
    } catch {
      console.warn(
        "Chat lead tracking unavailable; the reply is already saved.",
      );
    }
  }
  return jsonResponse({ answer, lead, saved, hfIntent, source, sessionId });
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return jsonResponse({ error: "Missing sessionId." }, 400);
  }

  try {
    const { session, messages } = await getChatSession(sessionId);
    return jsonResponse({
      session,
      messages: toClientMessages(messages),
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: "Chat session unavailable." }, 503);
  }
}
