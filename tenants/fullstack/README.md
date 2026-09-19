# The Fullstack Guys

The Fullstack Guys is the personal portfolio and project brand of Nishit Gajjar, an independent full-stack freelancer. It is not represented as a company or multi-person agency.

The active application uses:

- Supabase tables prefixed with `fullstack_`
- Groq for generated project answers
- Hugging Face for optional inquiry-intent classification
- A server-only local environment for credentials
- First-party page, engagement, form, performance, and chat tracking

The homepage, information pages, chatbot, metadata, footer, admin labels, and policy text identify Nishit personally. The showreel uses the supplied Gumlet video URL.

## Local verification

```sh
npm run dev -- --hostname 127.0.0.1
npm run lint
npm test
```

The project remains local-only. No deployment or hosting change is included.
