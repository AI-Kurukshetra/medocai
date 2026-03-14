# Next.js Setup Summary (Epic 0)

## What I implemented
- Initialized Next.js app (TypeScript, App Router, ESLint, `src/` dir).
- Added testing stack:
  - Vitest + Testing Library (`vitest.config.ts`, `test/setup.ts`).
  - Playwright config (`playwright.config.ts`) with a basic smoke test (`tests/smoke.spec.ts`).
- Added error boundary UI (`src/app/error.tsx`) and a `not-found` page (`src/app/not-found.tsx`).
- Added API error handling pattern (`src/lib/api-error.ts`) and a sample health endpoint (`src/app/api/health/route.ts`).
- Added env schema validation (`src/lib/env.ts`) with strict parsing and `.env.example`.
- Added logging baseline (`src/lib/logger.ts`) and request ID middleware (`src/middleware.ts`).
- Updated `package.json` with test scripts and dev dependencies.

## Notes / assumptions
- Env validation is strict: missing required variables will throw on app startup because `src/app/layout.tsx` imports `@/lib/env`.
- `.env.example` lists required env vars; you should provide actual values in `.env.local` before running `npm run dev`.
- Playwright uses `npm run dev` as the web server; set `PLAYWRIGHT_BASE_URL` to override.

## Key files
- `src/lib/env.ts` (schema validation)
- `src/lib/logger.ts` (baseline logging)
- `src/lib/api-error.ts` (API error handling pattern)
- `src/app/error.tsx` (error boundary)
- `src/middleware.ts` (request ID propagation)
- `vitest.config.ts`, `test/setup.ts`
- `playwright.config.ts`, `tests/smoke.spec.ts`
