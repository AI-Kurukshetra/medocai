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
