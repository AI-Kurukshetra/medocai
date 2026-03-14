# QA Plan - Lean Test Checklist (MVP)

## Scope
Focus on Milestones M1-M4 with core flows plus PHI/OpenAI guardrails. Keep tests minimal, high-signal.

## Unit Tests (Vitest)
1. Env schema validation rejects missing/invalid env vars.
2. Role/permission helpers enforce physician/CDI/coder/admin access rules.
3. Audit log helper always writes on create/update/delete.
4. Demo-data guard: OpenAI call blocked when `is_demo=false`.
5. PHI redaction utility removes identifiers from logs and prompts.
6. Gap detection ruleset returns expected flags for sample notes.
7. Query template renderer produces neutral, non-leading queries.

## API Tests (Vitest with Supabase/OpenAI mocks)
1. `POST /api/documents` creates document version and links to encounter.
2. Note save enqueues analysis job and sets status.
3. `GET /api/gaps?document_id=` returns gaps with evidence links.
4. `POST /api/queries/generate` returns draft queries and stores audit entries.
5. Query lifecycle transitions enforce valid status changes and timestamps.
6. `GET /api/suggestions?document_id=` returns code suggestions with confidence.
7. Suggestion decision endpoint logs accept/reject audit entry.
8. `GET /api/validation?document_id=` returns validation warnings.
9. `GET /api/drg-impact?encounter_id=` returns DRG recommendation payload.
10. `GET /api/physician/tasks` returns pending items for physician role only.
11. `GET /api/cdi/cases` returns prioritized CDI queue.
12. `POST /api/queries/:id/respond` records response, closes query, writes audit.
13. `POST /api/integrations/webhooks` rejects invalid signatures and logs failures.

## E2E Smoke Tests (Playwright)
1. Physician flow: login -> view dashboard -> respond to query -> query status closed.
2. CDI flow: login -> queue -> case detail -> create query from gap -> status draft.
3. Document ingestion: create note -> analysis status updates -> gaps/suggestions visible.

## Auth & Role Guard Tests (Pending)
1. [Pending] Unauthenticated user redirected to login for all protected routes.
2. [Pending] Physician cannot access CDI queue or admin settings pages.
3. [Pending] CDI can access CDI queue and case detail; cannot access admin-only pages.
4. [Pending] Coder can access code suggestions but cannot edit templates.
5. [Pending] Admin can access all routes and role management screens.
6. [Pending] API routes enforce role-based access (403 for disallowed roles).
7. [Pending] Session expiry forces re-auth and blocks API calls.

## Core Pages (Pending)
1. [Pending] Landing/login page renders; invalid credentials show error state.
2. [Pending] Physician dashboard loads with empty state when no tasks.
3. [Pending] CDI queue shows prioritized list and empty state.
4. [Pending] Case detail aggregates docs, gaps, queries, and suggestions.
5. [Pending] Document editor loads with template apply UI (placeholder acceptable).
6. [Pending] Error boundary renders on thrown error and offers recovery action.

## Guardrail Tests (PHI/OpenAI)
1. OpenAI calls blocked for any non-demo document/encounter.
2. OpenAI calls allowed only when `is_demo=true` and `data_source in ('synthetic','deidentified')`.
3. Request logs contain no PHI (verify redacted output for known identifiers).
4. Synthetic seed data flagged correctly (`is_demo=true`, `data_source='synthetic'`).

## Assumptions
1. Auth roles are implemented and seeded for tests.
2. Supabase is mocked for unit/API tests; no live PHI or real OpenAI calls.
3. Demo data seed script exists for E2E baselines.

## Dependencies / Risks
1. Missing RLS policies or role mapping will block API/E2E tests.
2. Analysis job runner/edge function may need a test stub for deterministic E2E.
3. If query lifecycle states differ from plan, update tests accordingly.
