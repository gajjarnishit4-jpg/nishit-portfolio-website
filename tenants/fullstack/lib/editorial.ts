export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  readTime: string;
  sections: Array<{ heading: string; paragraphs: string[]; points?: string[] }>;
  sources: Array<{ label: string; href: string }>;
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "us-vs-chinese-ai-models",
    title: "US vs Chinese AI models: a practical comparison",
    description: "Compare US and Chinese AI models by capability, price, openness, deployment, language coverage, and operational risk—not nationality alone.",
    published: "2026-09-19",
    updated: "2026-09-19",
    readTime: "8 min read",
    sections: [
      { heading: "There is no single AI race scoreboard", paragraphs: ["The useful comparison is model against workload. Frontier reasoning, coding, multilingual quality, latency, context length, tool use, hosting options, data policy, and price can produce different winners.", "US labs such as OpenAI, Anthropic, Google and Meta span closed APIs and open-weight releases. Chinese labs such as DeepSeek, Alibaba Qwen, Moonshot AI and Zhipu follow similarly varied strategies. Treat each model and deployment separately." ] },
      { heading: "Where Chinese models are changing the market", paragraphs: ["Chinese model families have increased pressure on cost, open-weight availability, multilingual performance and efficient reasoning. That competition matters to product teams because it expands viable self-hosted and lower-cost options."], points: ["Evaluate English and Chinese performance on your own prompts.", "Check the exact licence before commercial deployment.", "Separate model weights from the service that hosts them.", "Test tool calling, structured output and long-context reliability."] },
      { heading: "Where US models remain strong", paragraphs: ["Leading US providers continue to compete heavily on frontier reasoning, multimodal systems, agent tooling, safety evaluation, enterprise controls and developer ecosystems. Those advantages can matter more than a small benchmark gap when reliability and operations drive the product." ] },
      { heading: "A defensible selection process", paragraphs: ["Build a private evaluation set from real customer tasks. Score factual accuracy, completion rate, latency, total cost, refusal behaviour and human preference. Re-run it when a provider changes a model version.", "A production system can route different tasks to different models. The best architecture is often a measured portfolio rather than permanent loyalty to one lab or country." ] },
    ],
    sources: [
      { label: "LMArena leaderboard", href: "https://lmarena.ai/leaderboard" },
      { label: "Artificial Analysis model benchmarks", href: "https://artificialanalysis.ai/models" },
      { label: "Stanford AI Index", href: "https://hai.stanford.edu/ai-index" },
    ],
  },
  {
    slug: "how-to-read-ai-benchmarks",
    title: "How to read AI benchmarks without being misled",
    description: "A practical guide to benchmark contamination, judge bias, test validity, latency, price, and real-world model evaluation.",
    published: "2026-09-19",
    updated: "2026-09-19",
    readTime: "7 min read",
    sections: [
      { heading: "A benchmark measures a slice, not a product", paragraphs: ["A high score can demonstrate capability on a defined test while saying little about your documents, customers, tools or failure costs. Always inspect the task, scoring method, model settings and test date." ] },
      { heading: "Watch for contamination and judge effects", paragraphs: ["Public test questions can leak into training data. Model-as-judge evaluations can also favour certain response styles. Prefer fresh or private test sets, blinded comparisons and multiple evaluation methods."], points: ["Check whether the test set was public before training.", "Compare pass rates with human preference and error severity.", "Record model version and reasoning settings.", "Include latency and cost alongside quality."] },
      { heading: "Translate scores into business risk", paragraphs: ["For support, measure resolution and harmful error rates. For coding, run repository-level tasks and tests. For extraction, validate every field. For agents, score end-to-end task completion, recovery and permission safety." ] },
    ],
    sources: [
      { label: "Google DeepMind on double-blind evaluations", href: "https://deepmind.google/blog/piloting-the-worlds-first-double-blind-ai-evaluations/" },
      { label: "LMArena", href: "https://lmarena.ai/" },
      { label: "OpenAI deployment safety evaluations", href: "https://deploymentsafety.openai.com/" },
    ],
  },
  {
    slug: "choosing-an-ai-model-for-your-app",
    title: "Choosing an AI model for a production app",
    description: "A requirements-first framework for choosing models, providers, routing, evaluation, privacy controls, and fallbacks.",
    published: "2026-09-19",
    updated: "2026-09-19",
    readTime: "6 min read",
    sections: [
      { heading: "Start with the job", paragraphs: ["Define the input, expected output, acceptable latency, error cost, languages, data sensitivity and monthly volume before comparing providers. A fast small model can outperform an expensive frontier model on a constrained workflow." ] },
      { heading: "Test the complete system", paragraphs: ["Retrieval quality, prompts, tools, schemas, retries and human review often matter as much as the base model. Test the exact system with production-like data and adversarial cases."], points: ["Create a versioned evaluation set.", "Measure quality, p95 latency and total cost.", "Add timeouts, fallbacks and provider health checks.", "Log model versions without storing unnecessary sensitive content."] },
      { heading: "Keep an exit route", paragraphs: ["Use a thin provider adapter, avoid provider-specific assumptions in core business logic, and keep prompts and evaluation data portable. Model routing lets you change providers without rebuilding the product." ] },
    ],
    sources: [
      { label: "OpenAI model documentation", href: "https://platform.openai.com/docs/models" },
      { label: "Google DeepMind model cards", href: "https://deepmind.google/models/model-cards/" },
      { label: "Hugging Face models", href: "https://huggingface.co/models" },
    ],
  },
];

export function getBlogArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}
