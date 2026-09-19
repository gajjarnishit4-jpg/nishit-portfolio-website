export type NewsItem = {
  title: string;
  href: string;
  published: string;
  source: string;
  summary: string;
};

const feeds = [
  { source: "OpenAI", url: "https://openai.com/news/rss.xml" },
  { source: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml" },
  { source: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  { source: "arXiv AI", url: "https://export.arxiv.org/rss/cs.AI" },
];

function decode(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function field(xml: string, names: string[]) {
  for (const name of names) {
    const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match?.[1]) return decode(match[1]);
  }
  return "";
}

function link(xml: string) {
  const atom = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  return atom || field(xml, ["link", "guid"]);
}

async function readFeed(feed: (typeof feeds)[number]): Promise<NewsItem[]> {
  try {
    const response = await fetch(feed.url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];
    const xml = await response.text();
    const entries = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)];
    return entries.slice(0, 12).map((entry) => {
      const body = entry[2];
      return {
        title: field(body, ["title"]),
        href: link(body),
        published: field(body, ["pubDate", "published", "updated"]),
        source: feed.source,
        summary: field(body, ["description", "summary", "content"]).slice(0, 260),
      };
    }).filter((item) => item.title && item.href);
  } catch {
    return [];
  }
}

export async function getLatestAiNews() {
  const items = (await Promise.all(feeds.map(readFeed))).flat();
  return items
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .slice(0, 36);
}
