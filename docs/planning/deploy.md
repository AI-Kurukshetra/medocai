# Deployment Checklist (Vercel)

## Build/Output Settings
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next` (default)
- Install command: `npm install`
- Node version: use Vercel default (match local Node 20.x if set in your environment)

## Required Environment Variables
These are validated at runtime by `src/lib/env.ts` and must be set in Vercel.

Server-side only (do not expose to client):
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Shared (safe to expose as public env vars):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:
- `OPENAI_BASE_URL` (only if using a non-default OpenAI endpoint)
- `OPENAI_MODEL` (set if you want to override the default model selection)

## Environment Value Guidance
Preview:
- Use a separate Supabase project or a dedicated preview schema if possible.
- Use a non-production OpenAI key with lower rate limits.
- Consider a dedicated `OPENAI_MODEL` for preview to control costs.

Production:
- Use production Supabase URL + anon key.
- Use production OpenAI key with production rate limits.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is stored as a server-only secret and never referenced client-side.

## Deployment Steps
1. Create a new Vercel project and link this repo.
2. Add all required environment variables in Vercel for Preview and Production.
3. Trigger a Preview deployment to validate build.
4. Run smoke tests on Preview (see below).
5. Promote to Production once Preview is healthy.

## Smoke Test (Post-Deploy)
- Load the home page and verify no runtime env errors in server logs.
- Confirm middleware request IDs are present in logs for a request.
- Hit a basic API route (once implemented) and confirm error handling format is correct.

## Notes / Risks
- `src/lib/env.ts` throws on missing env vars at startup; deploy will fail fast if any required vars are absent.
- Avoid placing `SUPABASE_SERVICE_ROLE_KEY` in any `NEXT_PUBLIC_*` env var.

## Assumptions / Dependencies
- Supabase project is provisioned with URL, anon key, and service role key.
- OpenAI account has an API key for preview/prod.
