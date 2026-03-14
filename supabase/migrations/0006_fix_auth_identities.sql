-- Ensure demo auth users have matching identities for password sign-in.
-- Supabase email/password auth expects an auth.identities row.
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
