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
