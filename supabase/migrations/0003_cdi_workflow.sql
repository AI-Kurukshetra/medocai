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
