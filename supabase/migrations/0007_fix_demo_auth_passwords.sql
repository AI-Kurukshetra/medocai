-- Ensure demo auth users have a known password and email identity.
-- This updates existing rows if they were created earlier without a valid password.

do $$
declare
  inst_id uuid;
begin
  select id into inst_id from auth.instances limit 1;
  if inst_id is null then
    insert into auth.instances (id) values (gen_random_uuid()) returning id into inst_id;
  end if;

  update auth.users u
  set
    instance_id = inst_id,
    encrypted_password = crypt('password', gen_salt('bf')),
    email_confirmed_at = coalesce(u.email_confirmed_at, now()),
    raw_app_meta_data = jsonb_build_object('provider','email','providers',array['email']),
    raw_user_meta_data = jsonb_build_object(
      'role', p.role,
      'display_name', p.display_name
    ),
    updated_at = now()
  from public.users p
  where u.email = p.email
    and u.email like '%@demo.local';
end $$;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true
  ),
  'email',
  u.email,
  now(),
  now()
from auth.users u
left join auth.identities i
  on i.user_id = u.id and i.provider = 'email'
where u.email like '%@demo.local'
  and i.user_id is null;
