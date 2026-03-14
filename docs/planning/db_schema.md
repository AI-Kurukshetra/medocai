# Supabase Schema + RLS Plan (Epic 1)

## Scope
- Covers Epic 1 core entities and guardrails (demo data, audit).  
- Assumes multi-tenant by `organization_id` with optional `facility_id` / `department_id` scoping.  
- Roles: `admin`, `cdi`, `coder`, `physician`.

## Core Entities & Relationships
**Tenancy + Org Structure**
- `organizations`
  - `id` (uuid, pk)
  - `name` (text)
  - `created_at` (timestamptz)
- `facilities`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk -> organizations)
  - `name` (text)
  - `created_at`
- `departments`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `facility_id` (uuid, fk -> facilities, nullable)
  - `name` (text)
  - `created_at`

**Users & Roles**
- `users` (profile table linked to `auth.users`)
  - `id` (uuid, pk, fk -> auth.users)
  - `organization_id` (uuid, fk)
  - `facility_id` (uuid, fk, nullable)
  - `department_id` (uuid, fk, nullable)
  - `role` (text enum: admin|cdi|coder|physician)
  - `display_name` (text)
  - `email` (text)
  - `created_at`

**Patients & Encounters**
- `patients`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `mrn` (text, unique per org)
  - `first_name`/`last_name` (text)
  - `dob` (date)
  - `sex` (text)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`
- `encounters`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `patient_id` (uuid, fk -> patients)
  - `facility_id` (uuid, fk)
  - `department_id` (uuid, fk, nullable)
  - `admit_at`/`discharge_at` (timestamptz, nullable)
  - `attending_user_id` (uuid, fk -> users, nullable)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

**Clinical Documents**
- `clinical_documents`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `encounter_id` (uuid, fk)
  - `author_user_id` (uuid, fk -> users)
  - `document_type` (text)  
  - `title` (text)
  - `content` (text)
  - `version` (int)
  - `status` (text: draft|final)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at` / `updated_at`
- `document_sections` (optional for NLP granularity)
  - `id` (uuid, pk)
  - `document_id` (uuid, fk)
  - `section_type` (text)
  - `content` (text)
  - `created_at`

**Code Catalogs**
- `diagnosis_codes`
  - `code` (text, pk)
  - `system` (text: icd10|icd11)
  - `description` (text)
- `procedure_codes`
  - `code` (text, pk)
  - `system` (text: cpt|hcpcs|icd10pcs)
  - `description` (text)

**Derived/CDI Workflow Tables**
- `code_suggestions`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `document_id` (uuid, fk)
  - `code` (text)
  - `code_system` (text)
  - `confidence` (numeric)
  - `evidence` (jsonb)
  - `status` (text: pending|accepted|rejected)
  - `decision_by` (uuid, fk -> users, nullable)
  - `decided_at` (timestamptz, nullable)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

- `documentation_gaps`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `document_id` (uuid, fk)
  - `gap_type` (text)  
  - `severity` (text: low|medium|high)
  - `description` (text)
  - `evidence` (jsonb)
  - `status` (text: open|converted|closed)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

- `queries`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `encounter_id` (uuid, fk)
  - `document_id` (uuid, fk, nullable)
  - `created_by` (uuid, fk -> users)
  - `assigned_to` (uuid, fk -> users, nullable)
  - `status` (text: draft|sent|answered|closed)
  - `prompt` (text)
  - `options` (jsonb)  
  - `reason` (text)
  - `sla_due_at` (timestamptz, nullable)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at` / `updated_at`

- `query_responses`
  - `id` (uuid, pk)
  - `query_id` (uuid, fk -> queries)
  - `responded_by` (uuid, fk -> users)
  - `response` (text)
  - `created_at`

- `drg_recommendations`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `encounter_id` (uuid, fk)
  - `current_drg` (text)
  - `recommended_drg` (text)
  - `rationale` (text)
  - `evidence` (jsonb)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

- `clinical_validation_checks`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `document_id` (uuid, fk)
  - `check_type` (text)
  - `status` (text: pass|warn|fail)
  - `details` (jsonb)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

- `compliance_checks`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `encounter_id` (uuid, fk)
  - `check_type` (text)
  - `status` (text: pass|warn|fail)
  - `details` (jsonb)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

- `revenue_impact`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `encounter_id` (uuid, fk)
  - `delta_amount` (numeric)
  - `currency` (text)
  - `assumptions` (jsonb)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

- `quality_metrics`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `encounter_id` (uuid, fk)
  - `metric_type` (text)
  - `value` (text)
  - `details` (jsonb)
  - `is_demo` (bool)
  - `data_source` (text)
  - `created_at`

- `templates`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `specialty` (text)
  - `name` (text)
  - `content` (jsonb)
  - `version` (int)
  - `is_active` (bool)
  - `created_by` (uuid, fk -> users)
  - `created_at` / `updated_at`

**Audit**
- `audit_logs`
  - `id` (uuid, pk)
  - `organization_id` (uuid, fk)
  - `actor_user_id` (uuid, fk -> users, nullable)
  - `entity_type` (text)
  - `entity_id` (uuid)
  - `action` (text: insert|update|delete)
  - `diff` (jsonb)
  - `created_at`

## Guardrails & Constraints
- `is_demo` + `data_source` constraint on all demo-scoped tables:
  - Check: `is_demo = true -> data_source IN ('synthetic','deidentified')`
- `mrn` unique per `organization_id`.
- Foreign keys enforce tenancy joins.
- Audit logs are append-only (no updates/deletes).

## Indexing Plan (MVP)
- `patients(organization_id, mrn)`
- `encounters(organization_id, patient_id)`
- `clinical_documents(organization_id, encounter_id, created_at)`
- `documentation_gaps(document_id, status)`
- `queries(encounter_id, status, assigned_to)`
- `code_suggestions(document_id, status)`
- `audit_logs(organization_id, entity_type, entity_id, created_at)`

## RLS Policy Plan (Least-Privilege)
**Common helper**
- Create a view or SQL function `current_user_profile()` or inline policies that join `users` on `auth.uid()`.
- All policies restrict by `organization_id = users.organization_id`.

**Role access rules (MVP)**
- `admin`: full access to all org rows, including `is_demo=false`.
- `cdi`, `coder`, `physician`: read/write only rows with `is_demo=true` (demo-only guardrail) unless explicitly overridden later.
- Optional tightening (future): limit `physician` to encounters where `attending_user_id = auth.uid()`.

**Per-table summary**
- `organizations`: read own org; update only admin.
- `facilities`, `departments`: read own org; write only admin.
- `users`: read own org; update self profile; admin can manage.
- `patients`, `encounters`, `clinical_documents`, `document_sections`: read/write within org; non-admin limited to `is_demo=true`.
- `documentation_gaps`, `queries`, `query_responses`, `code_suggestions`: read/write within org; non-admin limited to `is_demo=true`.
- `drg_recommendations`, `clinical_validation_checks`, `compliance_checks`, `revenue_impact`, `quality_metrics`: read/write within org; non-admin limited to `is_demo=true`.
- `templates`: read own org; write only admin or cdi (configurable).
- `audit_logs`: insert only via trigger; read own org; no update/delete.

## Migration Plan (SQL Files)
**Phase 1: Base tenancy + users**
1. Create `organizations`, `facilities`, `departments`.
2. Create `users` profile table linked to `auth.users`.
3. Enable RLS + base policies.

**Phase 2: Core clinical**
4. Create `patients`, `encounters`, `clinical_documents`, `document_sections`.
5. Add `is_demo`, `data_source` + check constraint.
6. Indexes.

**Phase 3: CDI workflow tables**
7. Create `documentation_gaps`, `queries`, `query_responses`.
8. Create `code_suggestions`, `diagnosis_codes`, `procedure_codes`.
9. Create `clinical_validation_checks`, `drg_recommendations`, `compliance_checks`.
10. Create `revenue_impact`, `quality_metrics`, `templates`.

**Phase 4: Audit**
11. Create `audit_logs` table.
12. Add trigger functions to write audit logs on insert/update/delete for critical tables.

**Implemented SQL files (ordered)**
- `supabase/migrations/0001_base_tenancy_users.sql`
- `supabase/migrations/0002_core_clinical.sql`
- `supabase/migrations/0003_cdi_workflow.sql`
- `supabase/migrations/0004_audit.sql`
- `supabase/migrations/0005_seed_demo.sql`

## Seed Strategy (Demo Data)
- Seed 1 `organization`, 2 `facilities`, 3–5 `departments`.
- Seed users per role: 1 admin, 2 cdi, 2 coder, 4 physician.
- Seed 50–100 `patients` with `is_demo=true`, `data_source='synthetic'`.
- Create 1–2 `encounters` per patient with `is_demo=true`.
- Add 1–3 `clinical_documents` per encounter with synthetic content.
- Generate `documentation_gaps`, `queries`, `code_suggestions`, and `drg_recommendations` for a subset to support demos.
- Ensure all seeded rows are `is_demo=true` and satisfy constraint.

## Assumptions / Risks
- Demo-only guardrail for non-admin roles may block realistic PHI flows; can be loosened later with explicit approvals.
- Role model assumes single role per user. If multi-role is required, add `user_roles` join table.
- Code catalogs are minimal and do not include full ICD/CPT sets for MVP.
