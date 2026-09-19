# The Fullstack Guys

Local-only Next.js portfolio for Nishit Gajjar, an independent full-stack freelancer using The Fullstack Guys as his personal project brand.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Configuration

Copy `.env.example` to `.env.local` and configure:

- `SUPABASE_URL` and server-only `SUPABASE_SECRET_KEY`
- `ANALYTICS_HASH_SALT`
- `GROQ_API_KEY` and optional `GROQ_MODEL`
- `HUGGINGFACE_API_KEY`
- `FULLSTACK_ADMIN_EMAIL`, `FULLSTACK_ADMIN_PASSWORD`, and optional `FULLSTACK_ADMIN_DISPLAY_NAME`

Never expose the Supabase secret, Groq key, Hugging Face token, or admin secrets to browser code.

## Data

The complete schema is in `supabase/fullstack_schema.sql`. All application data is stored in Supabase. The previous starter database integrations are not part of this project.

## Verification

```bash
npm run build
npm run lint
```

This project is intentionally local-only until a hosting destination is explicitly requested.

## Vercel readiness

When importing the repository into Vercel, set the project Root Directory to
`thefullstack-guys`. Keep the detected framework as Next.js and the standard
build command (`npm run build`). Add every server-side value from `.env.example`
to the Production and Preview environments; do not add `NEXT_PUBLIC_` to private
keys. Generate a different long `ANALYTICS_HASH_SALT` for production.

Required runtime variables:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ANALYTICS_HASH_SALT`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `HUGGINGFACE_API_KEY`
- `FULLSTACK_ADMIN_EMAIL`
- `FULLSTACK_ADMIN_PASSWORD`
- `FULLSTACK_ADMIN_DISPLAY_NAME` (defaults to `Nolan`)

After the first preview deployment, verify `/`, `/admin`, `/api/track`, and a
complete visitor-chat/admin-takeover flow before promoting that exact preview to
production.
