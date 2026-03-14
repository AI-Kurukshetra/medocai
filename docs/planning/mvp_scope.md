# MVP Scope Validation and Refinement

## MVP Scope (In)
- US healthcare CDI platform demo with synthetic/de-identified data only.
- Core roles: Physician, CDI Specialist, Coder, Admin.
- Core entities and workflows:
  - Patient/Encounter/Clinical Document ingestion (manual + FHIR stub).
  - Real-time analysis trigger with OpenAI-backed NLP (demo-only).
  - Documentation gap detection and CDI review.
  - Query generation, lifecycle, and physician response.
  - ICD-10/11 code suggestions with accept/reject decisions.
  - Clinical validation checks (evidence flags).
  - DRG recommendation stub with before/after impact.
  - Minimal dashboards for Physician and CDI.
  - Audit trail and PHI guardrails.
- Testing: unit + API integration (mocked) + 2–3 E2E smoke tests.
- Deployment readiness with documented environment variables.

## Explicit Non-Goals (Out of Scope for MVP)
- Real PHI ingestion or production EMR integration beyond FHIR stub.
- Multi-vendor EMR adapters; full SMART on FHIR app flows.
- Advanced analytics, payer-specific rules, or reimbursement guarantees.
- Automated clinical decision support or treatment recommendations.
- Complex RBAC beyond role-based checks (no fine-grained ABAC).
- Multi-tenant billing, usage metering, or enterprise SSO.
- Real-time streaming or sub-second analysis; SLA target is <30s.
- Full clinical evidence extraction from labs/imaging systems.
- Comprehensive template marketplace; only core templates.

## Acceptance Criteria Clarifications (MVP)
- Auth + Roles:
  - Users can sign in via Supabase auth.
  - Role assignment controls page/API access for physician/CDI/coder/admin.
- Audit + PHI guardrails:
  - All writes to clinical entities generate audit log entries.
  - OpenAI calls are blocked unless `is_demo=true`.
  - Client logs are redacted; no PHI-like strings in console logs.
- Data model:
  - Core tables exist with RLS policies per role.
  - `is_demo` and `data_source` enforced by constraint.
- Ingestion:
  - Document create/update stores author, timestamp, type, and version.
  - Documents link to encounters and patients.
- Analysis trigger:
  - On document save, a job is created and processed on schedule.
  - Job state transitions (queued -> processing -> completed/failed).
  - NLP outputs (entities/gaps/query drafts) stored and viewable.
- Gap detection:
  - Gaps include reason + evidence reference to document section.
  - CDI can view gaps and create a query draft from a gap.
- Query lifecycle:
  - Queries move Draft -> Sent -> Answered -> Closed with timestamps.
  - Physician response updates query and closes it.
- Code suggestions:
  - Suggestions include confidence and evidence references.
  - CDI/Coder accept/reject decisions are logged.
- Validation + DRG:
  - Validation flags show missing evidence and rationale.
  - DRG recommendation shows before/after impact with evidence.
- Dashboards:
  - Physician dashboard lists pending queries and suggestions.
  - CDI dashboard lists cases needing review.
- Testing:
  - E2E flows: document ingestion, CDI review -> query, physician response.

## Dependency Order (Milestone Sequencing + Rationale)
1. M1: Setup + Auth + Audit baseline
   - Enables secure access, logging, and guardrails for all subsequent work.
2. M2: Core data model + ingestion + analysis trigger
   - Data schema and ingestion are prerequisites for gaps/queries/suggestions.
3. M3: Gap detection + query lifecycle
   - Requires analysis outputs and document storage from M2.
4. M4: Physician + CDI dashboards
   - Depends on queries/gaps stored and accessible.
5. M5: Code suggestions + clinical validation + DRG
   - Dependent on analysis outputs and core entities.
6. M6: Revenue + compliance + EMR integration
   - Built on stable core workflows and auditability.

## Assumptions
- Synthetic/de-identified demo data is available for development and demo.
- OpenAI API use is permitted only for demo data with strict guardrails.
- One EMR integration path: FHIR stub for Patient/Encounter/Document.

## Open Questions / Risks
- Confirmation of exact MVP user roles and permissions matrix.
- Level of detail needed for query phrasing templates.
- Final choice of OpenAI model and rate limits for demo.
