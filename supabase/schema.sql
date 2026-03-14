-- Base tenancy + users + helper functions + RLS policies

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  role text not null check (role in ('admin','cdi','coder','physician')),
  display_name text,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select organization_id from public.users where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_user_role() = 'admin';
$$;

alter table public.organizations enable row level security;
alter table public.facilities enable row level security;
alter table public.departments enable row level security;
alter table public.users enable row level security;

-- organizations
create policy "org_select" on public.organizations
  for select using (id = public.current_user_org_id());

create policy "org_insert_admin" on public.organizations
  for insert with check (public.is_admin());

create policy "org_update_admin" on public.organizations
  for update using (public.is_admin()) with check (public.is_admin());

create policy "org_delete_admin" on public.organizations
  for delete using (public.is_admin());

-- facilities
create policy "facilities_select" on public.facilities
  for select using (organization_id = public.current_user_org_id());

create policy "facilities_admin_write" on public.facilities
  for insert with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "facilities_admin_update" on public.facilities
  for update using (public.is_admin()) with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "facilities_admin_delete" on public.facilities
  for delete using (public.is_admin());

-- departments
create policy "departments_select" on public.departments
  for select using (organization_id = public.current_user_org_id());

create policy "departments_admin_write" on public.departments
  for insert with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "departments_admin_update" on public.departments
  for update using (public.is_admin()) with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "departments_admin_delete" on public.departments
  for delete using (public.is_admin());

-- users
create policy "users_select" on public.users
  for select using (organization_id = public.current_user_org_id());

create policy "users_admin_insert" on public.users
  for insert with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "users_self_update" on public.users
  for update using (id = auth.uid() or public.is_admin())
  with check (organization_id = public.current_user_org_id());

create policy "users_admin_delete" on public.users
  for delete using (public.is_admin());
-- Core clinical tables + demo guardrails + RLS

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mrn text not null,
  first_name text,
  last_name text,
  dob date,
  sex text,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint patients_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified')),
  constraint patients_org_mrn_unique unique (organization_id, mrn)
);

create table if not exists public.encounters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  admit_at timestamptz,
  discharge_at timestamptz,
  attending_user_id uuid references public.users(id) on delete set null,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint encounters_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.clinical_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  author_user_id uuid not null references public.users(id) on delete set null,
  document_type text not null,
  title text,
  content text,
  version int not null default 1,
  status text not null check (status in ('draft','final')),
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinical_documents_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.document_sections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.clinical_documents(id) on delete cascade,
  section_type text not null,
  content text,
  created_at timestamptz not null default now()
);

create index if not exists patients_org_mrn_idx on public.patients (organization_id, mrn);
create index if not exists encounters_org_patient_idx on public.encounters (organization_id, patient_id);
create index if not exists clinical_documents_org_encounter_created_idx on public.clinical_documents (organization_id, encounter_id, created_at desc);

alter table public.patients enable row level security;
alter table public.encounters enable row level security;
alter table public.clinical_documents enable row level security;
alter table public.document_sections enable row level security;

-- patients
create policy "patients_select" on public.patients
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "patients_insert" on public.patients
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "patients_update" on public.patients
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "patients_delete" on public.patients
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- encounters
create policy "encounters_select" on public.encounters
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "encounters_insert" on public.encounters
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "encounters_update" on public.encounters
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "encounters_delete" on public.encounters
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- clinical_documents
create policy "documents_select" on public.clinical_documents
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "documents_insert" on public.clinical_documents
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "documents_update" on public.clinical_documents
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "documents_delete" on public.clinical_documents
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- document_sections
create policy "document_sections_select" on public.document_sections
  for select using (
    exists (
      select 1 from public.clinical_documents d
      where d.id = document_id
        and d.organization_id = public.current_user_org_id()
        and (d.is_demo or public.is_admin())
    )
  );

create policy "document_sections_write" on public.document_sections
  for insert with check (
    exists (
      select 1 from public.clinical_documents d
      where d.id = document_id
        and d.organization_id = public.current_user_org_id()
        and (d.is_demo or public.is_admin())
    )
  );

create policy "document_sections_update" on public.document_sections
  for update using (
    exists (
      select 1 from public.clinical_documents d
      where d.id = document_id
        and d.organization_id = public.current_user_org_id()
        and (d.is_demo or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.clinical_documents d
      where d.id = document_id
        and d.organization_id = public.current_user_org_id()
        and (d.is_demo or public.is_admin())
    )
  );

create policy "document_sections_delete" on public.document_sections
  for delete using (
    exists (
      select 1 from public.clinical_documents d
      where d.id = document_id
        and d.organization_id = public.current_user_org_id()
        and (d.is_demo or public.is_admin())
    )
  );
-- CDI workflow tables, catalogs, templates + RLS

create table if not exists public.diagnosis_codes (
  code text primary key,
  system text not null check (system in ('icd10','icd11')),
  description text
);

create table if not exists public.procedure_codes (
  code text primary key,
  system text not null check (system in ('cpt','hcpcs','icd10pcs')),
  description text
);

create table if not exists public.code_suggestions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.clinical_documents(id) on delete cascade,
  code text not null,
  code_system text not null,
  confidence numeric,
  evidence jsonb,
  status text not null check (status in ('pending','accepted','rejected')),
  decision_by uuid references public.users(id) on delete set null,
  decided_at timestamptz,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint code_suggestions_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.documentation_gaps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.clinical_documents(id) on delete cascade,
  gap_type text not null,
  severity text not null check (severity in ('low','medium','high')),
  description text,
  evidence jsonb,
  status text not null check (status in ('open','converted','closed')),
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint documentation_gaps_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  document_id uuid references public.clinical_documents(id) on delete set null,
  created_by uuid not null references public.users(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  status text not null check (status in ('draft','sent','answered','closed')),
  prompt text not null,
  options jsonb,
  reason text,
  sla_due_at timestamptz,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint queries_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.query_responses (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references public.queries(id) on delete cascade,
  responded_by uuid not null references public.users(id) on delete set null,
  response text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.drg_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  current_drg text,
  recommended_drg text,
  rationale text,
  evidence jsonb,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint drg_recommendations_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.clinical_validation_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.clinical_documents(id) on delete cascade,
  check_type text not null,
  status text not null check (status in ('pass','warn','fail')),
  details jsonb,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint clinical_validation_checks_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  check_type text not null,
  status text not null check (status in ('pass','warn','fail')),
  details jsonb,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint compliance_checks_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.revenue_impact (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  delta_amount numeric,
  currency text,
  assumptions jsonb,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint revenue_impact_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.quality_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  metric_type text not null,
  value text,
  details jsonb,
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint quality_metrics_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  specialty text not null,
  name text not null,
  content jsonb not null,
  version int not null default 1,
  is_active boolean not null default true,
  created_by uuid not null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documentation_gaps_doc_status_idx on public.documentation_gaps (document_id, status);
create index if not exists queries_encounter_status_assigned_idx on public.queries (encounter_id, status, assigned_to);
create index if not exists code_suggestions_doc_status_idx on public.code_suggestions (document_id, status);

alter table public.diagnosis_codes enable row level security;
alter table public.procedure_codes enable row level security;
alter table public.code_suggestions enable row level security;
alter table public.documentation_gaps enable row level security;
alter table public.queries enable row level security;
alter table public.query_responses enable row level security;
alter table public.drg_recommendations enable row level security;
alter table public.clinical_validation_checks enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.revenue_impact enable row level security;
alter table public.quality_metrics enable row level security;
alter table public.templates enable row level security;

-- catalogs (read for authenticated users, write for admins)
create policy "diagnosis_codes_select" on public.diagnosis_codes
  for select using (auth.role() = 'authenticated');
create policy "diagnosis_codes_admin_write" on public.diagnosis_codes
  for insert with check (public.is_admin());
create policy "diagnosis_codes_admin_update" on public.diagnosis_codes
  for update using (public.is_admin()) with check (public.is_admin());
create policy "diagnosis_codes_admin_delete" on public.diagnosis_codes
  for delete using (public.is_admin());

create policy "procedure_codes_select" on public.procedure_codes
  for select using (auth.role() = 'authenticated');
create policy "procedure_codes_admin_write" on public.procedure_codes
  for insert with check (public.is_admin());
create policy "procedure_codes_admin_update" on public.procedure_codes
  for update using (public.is_admin()) with check (public.is_admin());
create policy "procedure_codes_admin_delete" on public.procedure_codes
  for delete using (public.is_admin());

-- code_suggestions
create policy "code_suggestions_select" on public.code_suggestions
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "code_suggestions_insert" on public.code_suggestions
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "code_suggestions_update" on public.code_suggestions
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "code_suggestions_delete" on public.code_suggestions
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- documentation_gaps
create policy "documentation_gaps_select" on public.documentation_gaps
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "documentation_gaps_insert" on public.documentation_gaps
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "documentation_gaps_update" on public.documentation_gaps
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "documentation_gaps_delete" on public.documentation_gaps
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- queries
create policy "queries_select" on public.queries
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "queries_insert" on public.queries
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "queries_update" on public.queries
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "queries_delete" on public.queries
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- query_responses (join to queries)
create policy "query_responses_select" on public.query_responses
  for select using (
    exists (
      select 1 from public.queries q
      where q.id = query_id
        and q.organization_id = public.current_user_org_id()
        and (q.is_demo or public.is_admin())
    )
  );
create policy "query_responses_insert" on public.query_responses
  for insert with check (
    exists (
      select 1 from public.queries q
      where q.id = query_id
        and q.organization_id = public.current_user_org_id()
        and (q.is_demo or public.is_admin())
    )
  );
create policy "query_responses_update" on public.query_responses
  for update using (
    exists (
      select 1 from public.queries q
      where q.id = query_id
        and q.organization_id = public.current_user_org_id()
        and (q.is_demo or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.queries q
      where q.id = query_id
        and q.organization_id = public.current_user_org_id()
        and (q.is_demo or public.is_admin())
    )
  );
create policy "query_responses_delete" on public.query_responses
  for delete using (
    exists (
      select 1 from public.queries q
      where q.id = query_id
        and q.organization_id = public.current_user_org_id()
        and (q.is_demo or public.is_admin())
    )
  );

-- drg_recommendations
create policy "drg_recommendations_select" on public.drg_recommendations
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "drg_recommendations_insert" on public.drg_recommendations
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "drg_recommendations_update" on public.drg_recommendations
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "drg_recommendations_delete" on public.drg_recommendations
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- clinical_validation_checks
create policy "clinical_validation_checks_select" on public.clinical_validation_checks
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "clinical_validation_checks_insert" on public.clinical_validation_checks
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "clinical_validation_checks_update" on public.clinical_validation_checks
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "clinical_validation_checks_delete" on public.clinical_validation_checks
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- compliance_checks
create policy "compliance_checks_select" on public.compliance_checks
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "compliance_checks_insert" on public.compliance_checks
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "compliance_checks_update" on public.compliance_checks
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "compliance_checks_delete" on public.compliance_checks
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- revenue_impact
create policy "revenue_impact_select" on public.revenue_impact
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "revenue_impact_insert" on public.revenue_impact
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "revenue_impact_update" on public.revenue_impact
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "revenue_impact_delete" on public.revenue_impact
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- quality_metrics
create policy "quality_metrics_select" on public.quality_metrics
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "quality_metrics_insert" on public.quality_metrics
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "quality_metrics_update" on public.quality_metrics
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));
create policy "quality_metrics_delete" on public.quality_metrics
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- templates (admin or cdi write)
create policy "templates_select" on public.templates
  for select using (organization_id = public.current_user_org_id());
create policy "templates_insert" on public.templates
  for insert with check (organization_id = public.current_user_org_id() and (public.is_admin() or public.current_user_role() = 'cdi'));
create policy "templates_update" on public.templates
  for update using (organization_id = public.current_user_org_id() and (public.is_admin() or public.current_user_role() = 'cdi'))
  with check (organization_id = public.current_user_org_id() and (public.is_admin() or public.current_user_role() = 'cdi'));
create policy "templates_delete" on public.templates
  for delete using (organization_id = public.current_user_org_id() and public.is_admin());
-- Audit logs + triggers

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('insert','update','delete')),
  diff jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "audit_logs_select" on public.audit_logs
  for select using (organization_id = public.current_user_org_id());

create policy "audit_logs_insert" on public.audit_logs
  for insert with check (organization_id = public.current_user_org_id());

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    diff
  )
  values (
    coalesce(new.organization_id, old.organization_id),
    auth.uid(),
    tg_table_name,
    coalesce(new.id, old.id),
    lower(tg_op),
    jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
  );

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

-- Attach audit triggers to core tables
create trigger audit_patients
after insert or update or delete on public.patients
for each row execute function public.write_audit_log();

create trigger audit_encounters
after insert or update or delete on public.encounters
for each row execute function public.write_audit_log();

create trigger audit_clinical_documents
after insert or update or delete on public.clinical_documents
for each row execute function public.write_audit_log();

create trigger audit_documentation_gaps
after insert or update or delete on public.documentation_gaps
for each row execute function public.write_audit_log();

create trigger audit_queries
after insert or update or delete on public.queries
for each row execute function public.write_audit_log();

create trigger audit_query_responses
after insert or update or delete on public.query_responses
for each row execute function public.write_audit_log();

create trigger audit_code_suggestions
after insert or update or delete on public.code_suggestions
for each row execute function public.write_audit_log();

create trigger audit_drg_recommendations
after insert or update or delete on public.drg_recommendations
for each row execute function public.write_audit_log();

create trigger audit_templates
after insert or update or delete on public.templates
for each row execute function public.write_audit_log();
-- Epic 2: Analysis jobs + document analysis storage

create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.clinical_documents(id) on delete cascade,
  status text not null check (status in ('queued','running','succeeded','failed')),
  attempts int not null default 0,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  constraint analysis_jobs_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create table if not exists public.document_analysis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.clinical_documents(id) on delete cascade,
  entities jsonb,
  negations jsonb,
  certainty jsonb,
  raw_output jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_demo boolean not null default false,
  data_source text not null default 'unknown',
  constraint document_analysis_demo_source_chk check (is_demo = false or data_source in ('synthetic','deidentified'))
);

create index if not exists analysis_jobs_org_document_status_idx
  on public.analysis_jobs (organization_id, document_id, status);

create index if not exists document_analysis_org_document_idx
  on public.document_analysis (organization_id, document_id);

alter table public.analysis_jobs enable row level security;
alter table public.document_analysis enable row level security;

-- analysis_jobs policies
create policy "analysis_jobs_select" on public.analysis_jobs
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "analysis_jobs_insert" on public.analysis_jobs
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "analysis_jobs_update" on public.analysis_jobs
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "analysis_jobs_delete" on public.analysis_jobs
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- document_analysis policies
create policy "document_analysis_select" on public.document_analysis
  for select using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "document_analysis_insert" on public.document_analysis
  for insert with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "document_analysis_update" on public.document_analysis
  for update using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()))
  with check (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

create policy "document_analysis_delete" on public.document_analysis
  for delete using (organization_id = public.current_user_org_id() and (is_demo or public.is_admin()));

-- Schema adjustments originally added in seed migration (0005).
alter table public.query_responses add column if not exists organization_id uuid;
alter table public.query_responses add column if not exists is_demo boolean not null default false;
alter table public.query_responses add column if not exists data_source text not null default 'unknown';
