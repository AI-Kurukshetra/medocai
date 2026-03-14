import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const demoUsers = [
  { email: 'admin@demo.local', password: 'password', role: 'admin', display_name: 'Admin Demo' },
  { email: 'cdi1@demo.local', password: 'password', role: 'cdi', display_name: 'CDI One' },
  { email: 'cdi2@demo.local', password: 'password', role: 'cdi', display_name: 'CDI Two' },
  { email: 'coder1@demo.local', password: 'password', role: 'coder', display_name: 'Coder One' },
  { email: 'coder2@demo.local', password: 'password', role: 'coder', display_name: 'Coder Two' },
  { email: 'phys1@demo.local', password: 'password', role: 'physician', display_name: 'Dr. One' },
  { email: 'phys2@demo.local', password: 'password', role: 'physician', display_name: 'Dr. Two' },
];

for (const u of demoUsers) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { role: u.role, display_name: u.display_name },
  });

  if (error) {
    console.error('createUser failed:', u.email, error.message);
    continue;
  }

  const userId = data.user.id;

  const { error: profileErr } = await supabase.from('users').upsert({
    id: userId,
    organization_id: '11111111-1111-1111-1111-111111111111',
    role: u.role,
    display_name: u.display_name,
    email: u.email,
  });

  if (profileErr) {
    console.error('profile upsert failed:', u.email, profileErr.message);
  } else {
    console.log('seeded:', u.email);
  }
}
