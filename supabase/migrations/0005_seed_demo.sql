-- Demo seed data (synthetic)

-- Organization
insert into public.organizations (id, name, created_at)
values ('11111111-1111-1111-1111-111111111111', 'Demo Health System', now())
on conflict (id) do nothing;

-- Facilities
insert into public.facilities (id, organization_id, name, created_at)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Demo Medical Center', now()),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Demo Community Hospital', now())
on conflict (id) do nothing;

-- Departments
insert into public.departments (id, organization_id, facility_id, name, created_at)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'Cardiology', now()),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'Pulmonology', now()),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Hospital Medicine', now())
on conflict (id) do nothing;

-- Ensure at least one auth instance exists (required for auth.users)
do $$
begin
  if (select count(*) from auth.instances) = 0 then
    insert into auth.instances (id) values (gen_random_uuid());
  end if;
end $$;

-- Auth users (minimal demo)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  seed.id,
  inst.id,
  'authenticated',
  'authenticated',
  seed.email,
  crypt('password', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('role', seed.role, 'display_name', seed.display_name),
  now(),
  now()
from (
  values
    ('44444444-4444-4444-4444-444444444441'::uuid, 'admin@demo.local', 'Admin Demo', 'admin'),
    ('44444444-4444-4444-4444-444444444442'::uuid, 'cdi1@demo.local', 'CDI One', 'cdi'),
    ('44444444-4444-4444-4444-444444444443'::uuid, 'cdi2@demo.local', 'CDI Two', 'cdi'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'coder1@demo.local', 'Coder One', 'coder'),
    ('44444444-4444-4444-4444-444444444445'::uuid, 'coder2@demo.local', 'Coder Two', 'coder'),
    ('44444444-4444-4444-4444-444444444446'::uuid, 'phys1@demo.local', 'Dr. One', 'physician'),
    ('44444444-4444-4444-4444-444444444447'::uuid, 'phys2@demo.local', 'Dr. Two', 'physician')
) as seed(id, email, display_name, role)
cross join lateral (select id from auth.instances limit 1) as inst
on conflict (id) do nothing;

-- User profiles
insert into public.users (id, organization_id, facility_id, department_id, role, display_name, email, created_at)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', null, null, 'admin', 'Admin Demo', 'admin@demo.local', now()),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'cdi', 'CDI One', 'cdi1@demo.local', now()),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332', 'cdi', 'CDI Two', 'cdi2@demo.local', now()),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'coder', 'Coder One', 'coder1@demo.local', now()),
  ('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'coder', 'Coder Two', 'coder2@demo.local', now()),
  ('44444444-4444-4444-4444-444444444446', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'physician', 'Dr. One', 'phys1@demo.local', now()),
  ('44444444-4444-4444-4444-444444444447', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332', 'physician', 'Dr. Two', 'phys2@demo.local', now())
on conflict (id) do nothing;

-- Patients
insert into public.patients (id, organization_id, mrn, first_name, last_name, dob, sex, is_demo, data_source, created_at)
values
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'MRN-0001', 'Ava', 'Reed', '1978-04-10', 'F', true, 'synthetic', now()),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'MRN-0002', 'Noah', 'Patel', '1966-12-22', 'M', true, 'synthetic', now()),
  ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', 'MRN-0003', 'Mia', 'Chen', '1959-07-02', 'F', true, 'synthetic', now()),
  ('55555555-5555-5555-5555-555555555554', '11111111-1111-1111-1111-111111111111', 'MRN-0004', 'Liam', 'Garcia', '1988-09-16', 'M', true, 'synthetic', now()),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'MRN-0005', 'Sophia', 'Nguyen', '1971-01-28', 'F', true, 'synthetic', now())
on conflict (id) do nothing;

-- Encounters
insert into public.encounters (id, organization_id, patient_id, facility_id, department_id, admit_at, discharge_at, attending_user_id, is_demo, data_source, created_at)
values
  ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', now() - interval '3 days', now() - interval '1 day', '44444444-4444-4444-4444-444444444446', true, 'synthetic', now()),
  ('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332', now() - interval '2 days', null, '44444444-4444-4444-4444-444444444447', true, 'synthetic', now())
on conflict (id) do nothing;

-- Clinical documents
insert into public.clinical_documents (
  id, organization_id, encounter_id, author_user_id, document_type, title, content, version, status, is_demo, data_source, created_at, updated_at
)
values
  ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', '44444444-4444-4444-4444-444444444446', 'progress_note', 'Cardiology Progress Note', 'Synthetic note content for cardiology encounter.', 1, 'final', true, 'synthetic', now(), now()),
  ('77777777-7777-7777-7777-777777777772', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666662', '44444444-4444-4444-4444-444444444447', 'progress_note', 'Pulmonology Progress Note', 'Synthetic note content for pulmonology encounter.', 1, 'draft', true, 'synthetic', now(), now())
on conflict (id) do nothing;

-- Documentation gaps
insert into public.documentation_gaps (
  id, organization_id, document_id, gap_type, severity, description, evidence, status, is_demo, data_source, created_at
)
values
  ('88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777771', 'acuity', 'high', 'Acuity not specified for condition.', '{"quote":"Synthetic evidence"}'::jsonb, 'open', true, 'synthetic', now())
on conflict (id) do nothing;

-- Queries
insert into public.queries (
  id, organization_id, encounter_id, document_id, created_by, assigned_to, status, prompt, options, reason, sla_due_at, is_demo, data_source, created_at, updated_at
)
values
  ('99999999-9999-9999-9999-999999999991', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', '77777777-7777-7777-7777-777777777771', '44444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444446', 'sent', 'Please clarify acuity for the documented condition.', '["Acute","Chronic","Unable to determine"]'::jsonb, 'Documentation specificity', now() + interval '2 days', true, 'synthetic', now(), now())
on conflict (id) do nothing;

-- Query responses
alter table public.query_responses add column if not exists organization_id uuid;
alter table public.query_responses add column if not exists is_demo boolean not null default false;
alter table public.query_responses add column if not exists data_source text not null default 'unknown';

insert into public.query_responses (id, organization_id, query_id, responded_by, response, is_demo, data_source, created_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999991', '44444444-4444-4444-4444-444444444446', 'Acute condition confirmed.', true, 'synthetic', now())
on conflict (id) do nothing;

-- Code suggestions
insert into public.code_suggestions (
  id, organization_id, document_id, code, code_system, confidence, evidence, status, decision_by, decided_at, is_demo, data_source, created_at
)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777771', 'I50.9', 'icd10', 0.72, '{"evidence":"Synthetic evidence"}'::jsonb, 'pending', null, null, true, 'synthetic', now())
on conflict (id) do nothing;

-- DRG recommendation
insert into public.drg_recommendations (
  id, organization_id, encounter_id, current_drg, recommended_drg, rationale, evidence, is_demo, data_source, created_at
)
values
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', '291', '290', 'Synthetic DRG optimization rationale.', '{"evidence":"Synthetic"}'::jsonb, true, 'synthetic', now())
on conflict (id) do nothing;

-- Validation + compliance
insert into public.clinical_validation_checks (
  id, organization_id, document_id, check_type, status, details, is_demo, data_source, created_at
)
values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777771', 'evidence', 'warn', '{"detail":"Synthetic warning"}'::jsonb, true, 'synthetic', now())
on conflict (id) do nothing;

insert into public.compliance_checks (
  id, organization_id, encounter_id, check_type, status, details, is_demo, data_source, created_at
)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', 'query_neutrality', 'pass', '{"detail":"Synthetic pass"}'::jsonb, true, 'synthetic', now())
on conflict (id) do nothing;

-- Revenue + quality metrics
insert into public.revenue_impact (
  id, organization_id, encounter_id, delta_amount, currency, assumptions, is_demo, data_source, created_at
)
values
  ('ffffffff-ffff-ffff-ffff-fffffffffff1', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', 1200.00, 'USD', '{"assumption":"Synthetic"}'::jsonb, true, 'synthetic', now())
on conflict (id) do nothing;

insert into public.quality_metrics (
  id, organization_id, encounter_id, metric_type, value, details, is_demo, data_source, created_at
)
values
  ('abababab-abab-abab-abab-abababababab', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', 'comorbidity_capture', 'improved', '{"detail":"Synthetic"}'::jsonb, true, 'synthetic', now())
on conflict (id) do nothing;

-- Template
insert into public.templates (
  id, organization_id, specialty, name, content, version, is_active, created_by, created_at, updated_at
)
values
  ('acacacac-acac-acac-acac-acacacacacac', '11111111-1111-1111-1111-111111111111', 'cardiology', 'Cardiology Progress Template', '{"sections":["HPI","Assessment","Plan"]}'::jsonb, 1, true, '44444444-4444-4444-4444-444444444442', now(), now())
on conflict (id) do nothing;
