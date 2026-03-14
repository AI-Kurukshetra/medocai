# CDI Platform Plan - Epics, Stories, Tasks (Core Features)

## Scope Assumptions
- US healthcare context.
- MVP includes Core Features only (no advanced/innovative features).
- One EMR integration for MVP (FHIR-only).
- Initial specialties: Cardiology, Pulmonology, Hospital Medicine (general inpatient).
- "Real-time" SLA target: <30 seconds per note.
- NLP approach: OpenAI API for NLP tasks (entity extraction, gap detection, query drafting) with synthetic/de-identified demo data only.

## Demo Data Policy (NLP)
- Do not send PHI or real patient identifiers to the OpenAI API.
- Use synthetic or de-identified clinical notes for all demo NLP processing.
- Store a flag on demo data to prevent accidental PHI ingestion in demos.

## Epic 0: Project Setup & Foundations

### Story: Repo + CI baseline
Acceptance: `dev/test/prod` envs documented; CI lint/test passes.
Tasks:
- Initialize Next.js (TS, lint, format, testing).
- Configure env schema validation.
- Set up logging/telemetry baseline.
- Add error boundary and API error handling pattern.
- Configure testing stack (Vitest + Testing Library + Playwright).
- Define deployment environment variables and secret handling (OpenAI, Supabase, webhook secrets).

### Story: Auth + Role Model
Acceptance: Role-based access enforced for physician/CDI/coder/admin.
Tasks:
- Supabase auth setup and role mapping table.
- Middleware/guards in Next.js for role checks.
- Seed users and roles for dev.

### Story: PHI & Audit Baseline
Acceptance: All writes generate audit log entries; no PHI in client logs.
Tasks:
- Audit log schema + append-only policy.
- Audit triggers for critical tables.
- Client logging policy and redaction.
- Implement server-side demo-data guardrails for OpenAI calls.
- Add PHI/PII guardrail tests (blocked OpenAI calls when `is_demo=false`).

## Epic 1: Data Model & RLS (Core Entities)

### Story: Core clinical entities
Acceptance: Schema created with indexes + RLS.
Tasks:
- Create `organizations`, `facilities`, `departments`.
- Create `users` profile table linked to `auth.users`.
- Create `patients`, `encounters`.
- Create `clinical_documents` (+ optional `document_sections`).
- Create `diagnosis_codes`, `procedure_codes`.
- Create `code_suggestions`, `documentation_gaps`.
- Create `queries`, `query_responses`.
- Create `drg_recommendations`.
- Create `clinical_validation_checks`.
- Create `compliance_checks`.
- Create `revenue_impact`, `quality_metrics`.
- Create `templates` (specialty templates).
- Add `is_demo` and `data_source` fields on demo-scoped tables.
- Add check constraint to enforce `is_demo` implies `data_source in ('synthetic','deidentified')`.
- Define RLS policies per role.
- Create migrations + seed data.

## Epic 2: Clinical Document Ingestion & Real-time Analysis

### Story: Note ingestion
Acceptance: Notes saved with author, timestamp, type; linked to encounter.
Tasks:
- API `POST /api/documents`.
- UI for document upload/create/edit.
- Store note versions.

### Story: Real-time analysis trigger
Acceptance: Note save triggers analysis job; results stored.
Tasks:
- Analysis job queue stub or worker.
- Analysis status tracking.
- Persist NLP outputs (entities, negations, certainty).
- Implement `analysis_jobs` queue table with retries/backoff.
- Scheduled Supabase Edge Function to process jobs every minute.
- Add request IDs and job/error logs for observability.
- Add rate limiting for analysis jobs and OpenAI calls.

## Epic 3: Documentation Gap Detection

### Story: Gap detection engine
Acceptance: Vague or missing specificity flagged with reasons.
Tasks:
- Ruleset for common gaps (acuity, type, specificity).
- Store `documentation_gaps` with evidence links.
- Endpoint `GET /api/gaps?document_id=`.

### Story: Gap review UX
Acceptance: CDI can review, prioritize, and convert gaps to queries.
Tasks:
- Gap list component + severity indicators.
- "Create query from gap" action.

## Epic 4: Clinical Query Generation & Lifecycle

### Story: Query generation
Acceptance: Queries are neutral, non-leading, and auditable.
Tasks:
- Query generation service (template-based MVP).
- Endpoint `POST /api/queries/generate`.
- Store `queries` with trigger reason, suggested options.

### Story: Query lifecycle
Acceptance: Draft -> Sent -> Answered -> Closed tracked with timestamps.
Tasks:
- Status transition API.
- SLA timers and assignee fields.
- Audit log for query actions.

## Epic 5: ICD-10/11 Code Suggestions

### Story: Suggest codes
Acceptance: Suggestions show confidence and source evidence.
Tasks:
- NLP -> code mapping stub.
- Store `code_suggestions`.
- Endpoint `GET /api/suggestions?document_id=`.

### Story: Accept/Reject flow
Acceptance: CDI/coder can accept/reject; decision logged.
Tasks:
- UI panel with decisions.
- Endpoint `POST /api/suggestions/:id/decision`.
- Audit on decision change.

## Epic 6: Clinical Validation Engine

### Story: Evidence validation
Acceptance: Diagnoses without evidence flagged.
Tasks:
- Link diagnosis to evidence (labs, vitals, imaging references).
- Store `clinical_validation_checks`.
- Endpoint `GET /api/validation?document_id=`.

### Story: Validation UI
Acceptance: Warnings displayed with rationale.
Tasks:
- Validation warnings UI.
- Tooltip/rationale display.

## Epic 7: DRG Optimization

### Story: DRG recommendations
Acceptance: "Before/after" DRG impact shown with evidence links.
Tasks:
- DRG recommendation service stub.
- Store `drg_recommendations`.
- Endpoint `GET /api/drg-impact?encounter_id=`.
- UI widget.

## Epic 8: Multi-specialty Templates

### Story: Template library
Acceptance: Admin can manage templates; clinicians can apply.
Tasks:
- `templates` table and management UI.
- Endpoint `GET /api/templates`.

### Story: Apply template
Acceptance: Template applied to document editor with versioning.
Tasks:
- Apply endpoint `POST /api/templates/:id/apply`.
- Store template version on document.

## Epic 9: Physician Dashboard

### Story: Physician task list
Acceptance: Physician sees pending queries and suggestions.
Tasks:
- Dashboard page + task list component.
- Endpoint `GET /api/physician/tasks`.

### Story: Query response
Acceptance: Responses update documentation and close query.
Tasks:
- Response form UI.
- Endpoint `POST /api/queries/:id/respond`.
- Audit trail.

## Epic 10: CDI Specialist Workflow

### Story: CDI queue
Acceptance: CDI sees cases needing review and prioritizes.
Tasks:
- CDI queue UI.
- Endpoint `GET /api/cdi/cases`.

### Story: CDI case detail
Acceptance: View docs, gaps, queries, codes in one view.
Tasks:
- Case detail page.
- Endpoint `GET /api/cdi/cases/:id`.

## Epic 11: Revenue Impact Analytics

### Story: Revenue impact per encounter
Acceptance: Delta shown based on documentation improvement.
Tasks:
- Store `revenue_impact`.
- Endpoint `GET /api/analytics/revenue`.
- Analytics UI (basic chart).

### Story: Basic reporting
Acceptance: Export placeholder or summary view.
Tasks:
- Simple CSV export stub.

## Epic 12: Compliance Monitoring

### Story: Compliance checks
Acceptance: Compliance status per encounter documented with evidence.
Tasks:
- Store `compliance_checks`.
- Endpoint `GET /api/compliance?encounter_id=`.
- Compliance checklist UI.

## Epic 13: Integration Hub (EMR/HIS)

### Story: EMR data ingestion
Acceptance: Patient/encounter/document sync works for one vendor.
Tasks:
- Integration config model.
- Webhook receiver `POST /api/integrations/webhooks`.
- FHIR import stub for Patient/Encounter/Document.
- Scope FHIR mapping to Patient, Encounter, DocumentReference/ClinicalNote (minimal fields).
- Define FHIR auth strategy (SMART on FHIR/OAuth) and token storage.
- Implement retry/backoff + failure logging for FHIR sync.

### Story: Data provenance
Acceptance: Imported data marked with source and timestamp.
Tasks:
- Add provenance fields.
- Display source in UI.

## Epic 14: Audit Trail Management

### Story: Audit timeline
Acceptance: Every key action is visible in audit timeline.
Tasks:
- Audit log endpoint `GET /api/audit?entity=...`.
- Audit timeline component.

## Epic 15: Testing & Demo Data

### Story: Testing coverage (MVP)
Acceptance: Unit, API, and E2E smoke tests exist for core flows.
Tasks:
- Unit tests for utilities and UI components (Vitest).
- API route tests with mocked Supabase/OpenAI (Vitest).
- E2E smoke tests for physician query response, CDI review, document ingestion (Playwright).
- Guardrail tests for PHI detection and OpenAI call blocking.

### Story: Synthetic demo dataset
Acceptance: Repeatable seed dataset loads and flagged as demo data.
Tasks:
- Create synthetic data templates per specialty (Cardiology, Pulmonology, Hospital Medicine).
- Seed 50–100 encounters via SQL or script (`db/seed` or `0011_seed.sql`).
- Ensure all seeded records are `is_demo=true` and `data_source='synthetic'`.

## Epic 16: OpenAI NLP Integration

### Story: OpenAI model + prompt management
Acceptance: Model selection, prompt templates, and versioning are documented and used in code.
Tasks:
- Choose OpenAI model and define rate limits/timeouts.
- Create prompt templates for entity extraction, gap detection, and query drafting.
- Add prompt versioning and log prompt version per analysis job.

### Story: OpenAI request safety
Acceptance: OpenAI calls are gated by demo data flags and sanitized inputs.
Tasks:
- Enforce server-side checks for `is_demo=true` on documents/encounters.
- Add input sanitization for PHI-like patterns before calls.
- Log OpenAI calls with redacted prompt and `demo_data=true`.

## Epic 17: Deployment & Secrets

### Story: Deployment readiness
Acceptance: App can be deployed with documented secrets and environment setup.
Tasks:
- Document required env vars for deployment.
- Configure environment variables in hosting (OpenAI key, Supabase URL/keys, webhook secrets).
- Add startup checks to fail fast on missing env vars.
