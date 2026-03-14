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
