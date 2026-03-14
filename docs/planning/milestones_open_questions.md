# CDI Platform Plan - Milestones and Decisions

## Milestones (Suggested Sequencing)
1. M1: Setup + Auth + Audit baseline
2. M2: Core data model + ingestion + analysis trigger
3. M3: Gap detection + query lifecycle
4. M4: Physician + CDI dashboards
5. M5: Code suggestions + clinical validation + DRG
6. M6: Revenue + compliance + EMR integration

## Decisions (Locked for MVP)
1. EMR integration: FHIR-only (vendor-agnostic).
2. Initial specialties: Cardiology, Pulmonology, Hospital Medicine (general inpatient).
3. "Real-time" SLA: Target <30 seconds per note.
4. NLP approach: OpenAI API for NLP tasks (entity extraction, gap detection, query drafting) with synthetic/de-identified demo data only.
5. Testing strategy: unit tests (Vitest), API integration tests (Vitest with mocks), 2–3 E2E smoke flows (Playwright).
6. Synthetic data: 50–100 demo encounters seeded deterministically; all demo records flagged.
7. Background jobs: analysis queue table + scheduled Supabase Edge Function every minute.
8. FHIR scope: Patient, Encounter, DocumentReference/ClinicalNote only.
9. Observability: request IDs + job/error logs + retries with backoff.

## Demo Data Policy (NLP)
- Do not send PHI or real patient identifiers to the OpenAI API.
- Use synthetic or de-identified clinical notes for all demo NLP processing.
