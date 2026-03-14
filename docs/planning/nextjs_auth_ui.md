# Next.js Auth + UI Scaffold Progress

## Summary
- Added mock auth flow using cookie-based session for demo roles (physician, CDI, coder, admin).
- Implemented role-aware app shell with sidebar nav, role switcher (dev), and sign-out.
- Added route guards in middleware to enforce role access and redirect unauthorized users.
- Scaffolded MVP routes and placeholder pages per `docs/planning/uiux.md`.

## What’s Implemented
- Mock users + role landing routes in `src/lib/mock-users.ts`.
- Auth helpers (get/set/clear cookies) in `src/lib/auth.ts`.
- Role-based nav config in `src/lib/nav.ts`.
- App shell layout in `src/app/(app)/layout.tsx` + styles in `src/app/(app)/app-shell.module.css`.
- Login flow at `src/app/login/page.tsx` (mock select user).
- Unauthorized state at `src/app/unauthorized/page.tsx`.
- Route guards in `src/middleware.ts`.
- Core pages scaffolded under `src/app/(app)/` for physician, CDI, coder, templates, analytics, compliance, audit, documents, encounters, queries, and suggestions.

## TODO / Integration Notes
- Replace mock auth with Supabase Auth (session + RLS), and remove role switcher.
- Wire nav items and role access rules to the real permissions model once the DB schema is live.
- Implement data fetching for queues and detail views.

## Assumptions
- MVP uses cookie-based mock auth until Supabase integration is ready.
- Role access is simplified and may need to be broadened (e.g., CDI access to query detail).

## Update: Supabase Auth Integration
- Added Supabase SSR client helper in `src/lib/supabase/server.ts`.
- Replaced mock auth with Supabase Auth session checks in `src/lib/auth.ts`.
- Updated login to email/password (demo seed uses `password`), and redirected by role from `public.users`.
- Removed role switcher from the app shell; sign-out now calls Supabase Auth.
- Middleware now verifies Supabase session and loads role from `public.users` before enforcing route access.

## Remaining TODOs
- Confirm Supabase Auth + RLS works in the deployed environment (cookie domain + headers).
- Add a lightweight "forgot password" or admin reset flow for demo accounts if needed.
