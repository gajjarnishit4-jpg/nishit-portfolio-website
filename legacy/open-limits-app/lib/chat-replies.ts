import {
  ADMIN_EMAIL,
  CALENDAR_LINK,
  OFFICE_ADDRESS,
  WHATSAPP_NUMBER,
  type ChatMessage,
  type LeadProfile,
} from "./open-limits-brain";
import { splitAssistantContent } from "./chat-content";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const userText = (messages: ChatMessage[]) =>
  messages.filter((message) => message.role === "user");

function nextQuestion(messages: ChatMessage[], lead: LeadProfile) {
  const previous = messages
    .filter((message) => message.role === "assistant")
    .map((message) => normalize(message.content));
  const questions = [
    "What should someone be able to do in the first version?",
    "Who will use it: customers, your internal team, or both?",
    "Which feature is essential for launch, and which can wait?",
    ...(!lead.timeline ? ["Do you have a target launch date?"] : []),
    "Does it need to connect to any existing tools or data?",
  ];
  return (
    questions.find(
      (question) =>
        !previous.some((answer) => answer.includes(normalize(question))),
    ) || "What part of the project would you like to explore next?"
  );
}

export function answerFallback(
  messages: ChatMessage[],
  lead: LeadProfile = {},
) {
  const users = userText(messages);
  const latest = users.at(-1)?.content.toLowerCase() || "";
  const context = users
    .slice(-5)
    .map((message) => message.content)
    .join(" ")
    .toLowerCase();
  let answer: string;

  if (/\b(?:hosting|domain|maintenance|ongoing fees)\b/.test(latest)) {
    answer =
      "Hosting, domain registration, and ongoing maintenance are separate scope items, not automatic inclusions in a starting price. The team should confirm who manages them and any recurring platform or third-party fees before you approve the work. Do you already have a domain or hosting account?";
  } else if (
    /\b(?:2[,.]?000|2k)\b/.test(latest) &&
    /\b(?:what|include|comes|cover|get|deliver|package|build|buy)\b/.test(
      latest,
    )
  ) {
    answer =
      "$2,000 is a starting point for focused work, not a fixed package with guaranteed inclusions. A possible scope to discuss is a landing page or small marketing website with responsive layouts, a contact form, and basic SEO setup. Custom logins, dashboards, payments, integrations, and mobile apps need separate scoping. Is your goal a website that presents the business, or a product people log into and use?";
  } else if (
    /\b(?:include|comes with|cover|deliverables)\b/.test(latest) &&
    /2[,.]?000|2k/.test(messages.map((message) => message.content).join(" "))
  ) {
    answer =
      "There isn't a fixed $2,000 package I can promise. We would agree the pages, design work, functionality, content responsibilities, testing, and handover in the scope first. A simple marketing site and a logged-in software product need very different work. Which are you planning?";
  } else if (
    /\b(?:book|schedule|arrange)\b.*\b(?:call|meeting|consultation)\b|\bwhatsapp\b|\b(?:speak|talk|chat)\b.*\b(?:someone|person|human|expert|team|developer|consultant)\b/.test(
      latest,
    )
  ) {
    answer = `You can choose a discovery-call slot below. Bring your main goal and must-have features; the team can use those to discuss the scope and a personalized quote.\n\nBook a call: ${CALENDAR_LINK}\nFast-track on WhatsApp: ${WHATSAPP_NUMBER}`;
  } else if (/\b(?:how long|timeline|deadline|weeks|months)\b/.test(latest)) {
    answer =
      "The biggest scheduling factors are the number of screens, custom functionality, integrations, and how ready the content is. We would break the work into design, development, testing, and launch rather than promise a date before knowing the scope. What date are you aiming for?";
  } else if (
    /\b(?:price|pricing|cost|budget|quote|estimate|expensive)\b|\$/.test(latest)
  ) {
    answer =
      "Pricing depends on what the first version needs to do, not just whether we call it a website or an app. The biggest drivers are custom screens, user accounts, payments, integrations, and admin tools; our experts confirm the quote after reviewing those. What are the two or three must-have features?";
  } else if (
    /\b(?:contact details|email address|phone number|office address|where are you|reach you)\b/.test(
      latest,
    )
  ) {
    answer = `Our email is ${ADMIN_EMAIL} and our office address is ${OFFICE_ADDRESS}. You can also use WhatsApp or choose a call slot below.\n\nBook a call: ${CALENDAR_LINK}\nFast-track on WhatsApp: ${WHATSAPP_NUMBER}`;
  } else if (
    /website,? app,? or software|website,? app,? (?:and|or) software/.test(
      latest,
    )
  ) {
    answer = `We can help with all three. A website usually presents or sells your business, an app gives customers a mobile experience, and custom software supports specific workflows. Which best describes your idea?\n\nBook a call: ${CALENDAR_LINK}\nFast-track on WhatsApp: ${WHATSAPP_NUMBER}`;
  } else if (
    /\b(?:difference|which|better|choose|recommend)\b/.test(latest) &&
    /\b(?:app|website|web|native|react|next|stack)\b/.test(context)
  ) {
    answer =
      "A responsive web app is often worth considering when you need one experience across phones and computers. Native mobile development is more relevant when the core experience depends on device features, offline use, or an App Store presence. Does your product need any of those mobile-specific capabilities?";
  } else if (
    /\b(?:login|roles|permissions|security|secure|data model|database)\b/.test(
      latest,
    )
  ) {
    answer =
      "Start with who can read, create, edit, and delete each kind of data. Those rules should be enforced on the server, with authentication, validation, and appropriate logging; hiding a button in the interface is not enough. What kinds of users and sensitive data will the product have?";
  } else if (
    /\b(?:payment|payments|checkout|subscription|subscriptions)\b/.test(latest)
  ) {
    answer =
      "Payment scope includes the checkout experience, order or subscription records, payment-provider integration, and handling failed or refunded payments. Recurring billing adds renewals and cancellation flows. Will customers pay once, subscribe, or both?";
  } else if (/\b(?:ios|iphone|ipad|mobile|native|app store)\b/.test(latest)) {
    answer =
      "For a mobile build, we would define the main user journey first, then the screens, backend, and device features it needs. Login, notifications, offline access, and payments each affect the work involved. What is the main thing a customer should accomplish in the app?";
  } else if (
    /\b(?:software|dashboard|portal|crm|admin|internal tool|saas|platform)\b/.test(
      latest,
    )
  ) {
    answer =
      "For custom software, the useful starting point is the workflow it will replace or improve. For example, a customer portal needs different permissions and screens from an internal operations dashboard. What task is currently slow or difficult for your team or customers?";
  } else if (
    /\b(?:ai|automation|workflow|chatbot|api|integration|tracking|pixel|capi)\b/.test(
      latest,
    )
  ) {
    answer =
      "We can scope the trigger, the systems involved, and the action the automation should take. A reliable build also needs error handling, logs, and a way for a person to step in when something fails. Which tools are you trying to connect, and what should happen automatically?";
  } else if (
    /\b(?:portfolio|examples|case studies|previous work)\b/.test(latest)
  ) {
    answer =
      "You can explore the live project links in our Projects section. Examples include Emani for beauty commerce, Nerdy Nuts for food commerce, and Happy Pet for a digital product website. What industry is your project in?";
  } else if (
    /\b(?:website|landing page|shopify|store|redesign|ecommerce)\b/.test(latest)
  ) {
    answer =
      "For a website, we would start with the visitor's main action: making an inquiry, booking, buying, or using a service. That determines the pages and functionality before we choose the design and platform. What should visitors do on yours?";
  } else if (/\b(?:hi|hello|hey)\b/.test(latest) && latest.length < 25) {
    answer = "Hi! What are you hoping to build or improve?";
  } else if (/\b(?:thanks|thank you)\b/.test(latest)) {
    answer =
      "You're welcome. We can keep working through the idea here whenever you're ready.";
  } else if (lead.email && /@/.test(latest)) {
    answer = `Thanks for sharing your email. ${nextQuestion(messages, lead)}`;
  } else {
    answer = `Let's make the scope more concrete. ${nextQuestion(messages, lead)}`;
  }

  const prior = messages.filter((message) => message.role === "assistant");
  if (
    prior.some((message) => normalize(message.content) === normalize(answer))
  ) {
    return `Let's take the next detail rather than repeat the overview. ${nextQuestion(messages, lead)}`;
  }
  return answer;
}

export function finalizeAnswer(
  answer: string,
  messages: ChatMessage[],
  lead: LeadProfile,
) {
  const parsed = splitAssistantContent(answer);
  const body = parsed.paragraphs.join("\n\n");
  const normalized = normalize(body);
  const recent = messages
    .filter((message) => message.role === "assistant")
    .slice(-3);
  const isRepeated = recent.some(
    (message) =>
      normalize(splitAssistantContent(message.content).paragraphs.join(" ")) ===
      normalized,
  );
  const onlyCta =
    /^(?:please |you can |for (?:a |your )?(?:personalized |expert )?quote[, ]*)?(?:book|schedule|contact|visit|click|talk|reach)\b/i.test(
      body,
    ) && !/[.!?]\s+[A-Z]/.test(body);
  if (normalized.split(" ").length < 8 || onlyCta || isRepeated)
    return answerFallback(messages, lead);

  const latest = userText(messages).at(-1)?.content || "";
  const explicitContact =
    /\b(?:call|meeting|whatsapp|contact|reach you|email address|phone number)\b|\b(?:speak|talk|chat)\b.*\b(?:someone|person|human|expert|team|developer|consultant)\b/i.test(
      latest,
    );
  const starterRequest =
    /website,? app,? or software|website,? app,? (?:and|or) software/i.test(
      latest,
    );
  const pricingRequest = /\b(?:quote|estimate|pricing|cost|budget)\b/i.test(
    latest,
  );
  const recentlyOffered = recent.some((message) =>
    message.content.includes(CALENDAR_LINK),
  );
  const forceCta = explicitContact || starterRequest;
  const allowCta = forceCta || (pricingRequest && !recentlyOffered);
  return (
    body +
    (forceCta || (allowCta && parsed.showCalendar)
      ? `\n\nBook a call: ${CALENDAR_LINK}`
      : "") +
    (forceCta || (allowCta && parsed.showWhatsapp)
      ? `\nFast-track on WhatsApp: ${WHATSAPP_NUMBER}`
      : "")
  );
}
