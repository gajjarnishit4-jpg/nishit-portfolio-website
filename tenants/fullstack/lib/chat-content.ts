import {
  CALENDAR_LINK,
  DEFAULT_ASSISTANT_MESSAGE,
  WHATSAPP_NUMBER,
  type ChatMessage,
} from "./business-context";

const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

export function splitAssistantContent(content: string) {
  const bookingUrlPattern = /https?:\/\/(?:www\.)?(?:calendly\.com|calendar\.app|calendar\.google\.com)\/\S+/gi;
  const showCalendar = content.includes(CALENDAR_LINK) || bookingUrlPattern.test(content);
  const showWhatsapp =
    Boolean(WHATSAPP_NUMBER) && (content.includes(WHATSAPP_NUMBER) || content.includes(whatsappLink));
  // Remove the link itself, never the answer that happens to share its line.
  const text = content
    .replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, label: string, url: string) =>
      [CALENDAR_LINK, whatsappLink].includes(url) ? "" : match,
    )
    .replaceAll(CALENDAR_LINK, "")
    .replace(bookingUrlPattern, "")
    .replaceAll(WHATSAPP_NUMBER, "")
    .replaceAll(whatsappLink, "");
  const paragraphs = text
    .split("\n")
    .map((line) => line.trim())
    .map((line) =>
      line
        .replace(
          /(?:Book (?:a |your )?(?:quick |discovery )?call(?: for a personalized(?: expert)? quote)?|Fast-track(?: on)? WhatsApp|WhatsApp)\s*:\s*$/i,
          "",
        )
        .trim(),
    )
    .filter(
      (line) =>
        /[a-z0-9]/i.test(line) &&
        !/^(?:book (?:a |your )?(?:quick |discovery )?call|schedule (?:a |your )?call|fast-track(?: on)? whatsapp|whatsapp)[.!:]*$/i.test(
          line,
        ),
    );
  return { paragraphs, showCalendar, showWhatsapp };
}

export function reconcileChatHistory(
  current: ChatMessage[],
  incoming: ChatMessage[],
) {
  if (!incoming.length) return current;
  if (current.length === 1 && current[0].content === DEFAULT_ASSISTANT_MESSAGE)
    return incoming;
  const last = current.at(-1);
  const match = incoming.findLastIndex(
    (message) =>
      message.role === last?.role && message.content === last.content,
  );
  // A delayed poll must not roll back a newer local turn.
  const unchanged =
    current.length === incoming.length &&
    current.every(
      (message, index) =>
        message.role === incoming[index].role &&
        message.content === incoming[index].content,
    );
  return match >= 0 && !unchanged ? incoming : current;
}
