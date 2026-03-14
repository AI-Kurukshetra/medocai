import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const ORG_ID = '11111111-1111-1111-1111-111111111111';
const FACILITY_1 = '22222222-2222-2222-2222-222222222221';
const FACILITY_2 = '22222222-2222-2222-2222-222222222222';
const DEPT_CARD = '33333333-3333-3333-3333-333333333331';
const DEPT_PULM = '33333333-3333-3333-3333-333333333332';
const DEPT_HOSP = '33333333-3333-3333-3333-333333333333';

const demoUsers = [
  { email: 'admin@demo.local', password: 'password', role: 'admin', display_name: 'Admin Demo' },
  { email: 'cdi1@demo.local', password: 'password', role: 'cdi', display_name: 'CDI One' },
  { email: 'cdi2@demo.local', password: 'password', role: 'cdi', display_name: 'CDI Two' },
  { email: 'coder1@demo.local', password: 'password', role: 'coder', display_name: 'Coder One' },
  { email: 'coder2@demo.local', password: 'password', role: 'coder', display_name: 'Coder Two' },
  { email: 'phys1@demo.local', password: 'password', role: 'physician', display_name: 'Dr. One' },
  { email: 'phys2@demo.local', password: 'password', role: 'physician', display_name: 'Dr. Two' },
];

async function listAllUsers() {
  const all = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    all.push(...(data.users || []));
    if (!data.total || all.length >= data.total) break;
    page += 1;
  }
  return all;
}

async function findUserByEmail(email) {
  const users = await listAllUsers();
  return users.find((u) => u.email === email) || null;
}

async function ensureAuthUser(u) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { role: u.role, display_name: u.display_name },
  });

  if (!error && data?.user?.id) return data.user;

  const existing = await findUserByEmail(u.email);
  if (existing) return existing;

  throw new Error(`createUser failed for ${u.email}: ${error?.message || 'unknown error'}`);
}

async function upsert(table, rows, onConflict = 'id') {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table} upsert failed: ${error.message}`);
}

async function assertSchemaReady() {
  const { error } = await supabase.from('users').select('id').limit(1);
  if (!error) return;
  if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
    throw new Error(
      "Schema not found. Apply migrations in Supabase SQL editor (at minimum create public.users) before running seed."
    );
  }
  throw new Error(`Schema check failed: ${error.message}`);
}

async function run() {
  await assertSchemaReady();

  await upsert('organizations', [
    { id: ORG_ID, name: 'Demo Health System' },
  ]);

  await upsert('facilities', [
    { id: FACILITY_1, organization_id: ORG_ID, name: 'Demo Medical Center' },
    { id: FACILITY_2, organization_id: ORG_ID, name: 'Demo Community Hospital' },
  ]);

  await upsert('departments', [
    { id: DEPT_CARD, organization_id: ORG_ID, facility_id: FACILITY_1, name: 'Cardiology' },
    { id: DEPT_PULM, organization_id: ORG_ID, facility_id: FACILITY_1, name: 'Pulmonology' },
    { id: DEPT_HOSP, organization_id: ORG_ID, facility_id: FACILITY_2, name: 'Hospital Medicine' },
  ]);

  const userMap = new Map();
  for (const u of demoUsers) {
    const user = await ensureAuthUser(u);
    userMap.set(u.email, user.id);
  }

  await upsert('users', [
    { id: userMap.get('admin@demo.local'), organization_id: ORG_ID, role: 'admin', display_name: 'Admin Demo', email: 'admin@demo.local' },
    { id: userMap.get('cdi1@demo.local'), organization_id: ORG_ID, facility_id: FACILITY_1, department_id: DEPT_CARD, role: 'cdi', display_name: 'CDI One', email: 'cdi1@demo.local' },
    { id: userMap.get('cdi2@demo.local'), organization_id: ORG_ID, facility_id: FACILITY_1, department_id: DEPT_PULM, role: 'cdi', display_name: 'CDI Two', email: 'cdi2@demo.local' },
    { id: userMap.get('coder1@demo.local'), organization_id: ORG_ID, facility_id: FACILITY_2, department_id: DEPT_HOSP, role: 'coder', display_name: 'Coder One', email: 'coder1@demo.local' },
    { id: userMap.get('coder2@demo.local'), organization_id: ORG_ID, facility_id: FACILITY_2, department_id: DEPT_HOSP, role: 'coder', display_name: 'Coder Two', email: 'coder2@demo.local' },
    { id: userMap.get('phys1@demo.local'), organization_id: ORG_ID, facility_id: FACILITY_1, department_id: DEPT_CARD, role: 'physician', display_name: 'Dr. One', email: 'phys1@demo.local' },
    { id: userMap.get('phys2@demo.local'), organization_id: ORG_ID, facility_id: FACILITY_1, department_id: DEPT_PULM, role: 'physician', display_name: 'Dr. Two', email: 'phys2@demo.local' },
  ]);

  await upsert('patients', [
    { id: '55555555-5555-5555-5555-555555555551', organization_id: ORG_ID, mrn: 'MRN-0001', first_name: 'Ava', last_name: 'Reed', dob: '1978-04-10', sex: 'F', is_demo: true, data_source: 'synthetic' },
    { id: '55555555-5555-5555-5555-555555555552', organization_id: ORG_ID, mrn: 'MRN-0002', first_name: 'Noah', last_name: 'Patel', dob: '1966-12-22', sex: 'M', is_demo: true, data_source: 'synthetic' },
    { id: '55555555-5555-5555-5555-555555555553', organization_id: ORG_ID, mrn: 'MRN-0003', first_name: 'Mia', last_name: 'Chen', dob: '1959-07-02', sex: 'F', is_demo: true, data_source: 'synthetic' },
    { id: '55555555-5555-5555-5555-555555555554', organization_id: ORG_ID, mrn: 'MRN-0004', first_name: 'Liam', last_name: 'Garcia', dob: '1988-09-16', sex: 'M', is_demo: true, data_source: 'synthetic' },
    { id: '55555555-5555-5555-5555-555555555555', organization_id: ORG_ID, mrn: 'MRN-0005', first_name: 'Sophia', last_name: 'Nguyen', dob: '1971-01-28', sex: 'F', is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('encounters', [
    { id: '66666666-6666-6666-6666-666666666661', organization_id: ORG_ID, patient_id: '55555555-5555-5555-5555-555555555551', facility_id: FACILITY_1, department_id: DEPT_CARD, admit_at: new Date(Date.now() - 3 * 86400000).toISOString(), discharge_at: new Date(Date.now() - 1 * 86400000).toISOString(), attending_user_id: userMap.get('phys1@demo.local'), is_demo: true, data_source: 'synthetic' },
    { id: '66666666-6666-6666-6666-666666666662', organization_id: ORG_ID, patient_id: '55555555-5555-5555-5555-555555555552', facility_id: FACILITY_1, department_id: DEPT_PULM, admit_at: new Date(Date.now() - 2 * 86400000).toISOString(), discharge_at: null, attending_user_id: userMap.get('phys2@demo.local'), is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('clinical_documents', [
    { id: '77777777-7777-7777-7777-777777777771', organization_id: ORG_ID, encounter_id: '66666666-6666-6666-6666-666666666661', author_user_id: userMap.get('phys1@demo.local'), document_type: 'progress_note', title: 'Cardiology Progress Note', content: 'Synthetic note content for cardiology encounter.', version: 1, status: 'final', is_demo: true, data_source: 'synthetic' },
    { id: '77777777-7777-7777-7777-777777777772', organization_id: ORG_ID, encounter_id: '66666666-6666-6666-6666-666666666662', author_user_id: userMap.get('phys2@demo.local'), document_type: 'progress_note', title: 'Pulmonology Progress Note', content: 'Synthetic note content for pulmonology encounter.', version: 1, status: 'draft', is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('documentation_gaps', [
    { id: '88888888-8888-8888-8888-888888888881', organization_id: ORG_ID, document_id: '77777777-7777-7777-7777-777777777771', gap_type: 'acuity', severity: 'high', description: 'Acuity not specified for condition.', evidence: { quote: 'Synthetic evidence' }, status: 'open', is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('queries', [
    { id: '99999999-9999-9999-9999-999999999991', organization_id: ORG_ID, encounter_id: '66666666-6666-6666-6666-666666666661', document_id: '77777777-7777-7777-7777-777777777771', created_by: userMap.get('cdi1@demo.local'), assigned_to: userMap.get('phys1@demo.local'), status: 'sent', prompt: 'Please clarify acuity for the documented condition.', options: ['Acute', 'Chronic', 'Unable to determine'], reason: 'Documentation specificity', sla_due_at: new Date(Date.now() + 2 * 86400000).toISOString(), is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('query_responses', [
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', organization_id: ORG_ID, query_id: '99999999-9999-9999-9999-999999999991', responded_by: userMap.get('phys1@demo.local'), response: 'Acute condition confirmed.', is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('code_suggestions', [
    { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', organization_id: ORG_ID, document_id: '77777777-7777-7777-7777-777777777771', code: 'I50.9', code_system: 'icd10', confidence: 0.72, evidence: { evidence: 'Synthetic evidence' }, status: 'pending', decision_by: null, decided_at: null, is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('drg_recommendations', [
    { id: 'cccccccc-cccc-cccc-cccc-ccccccccccc1', organization_id: ORG_ID, encounter_id: '66666666-6666-6666-6666-666666666661', current_drg: '291', recommended_drg: '290', rationale: 'Synthetic DRG optimization rationale.', evidence: { evidence: 'Synthetic' }, is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('clinical_validation_checks', [
    { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', organization_id: ORG_ID, document_id: '77777777-7777-7777-7777-777777777771', check_type: 'evidence', status: 'warn', details: { detail: 'Synthetic warning' }, is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('compliance_checks', [
    { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', organization_id: ORG_ID, encounter_id: '66666666-6666-6666-6666-666666666661', check_type: 'query_neutrality', status: 'pass', details: { detail: 'Synthetic pass' }, is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('revenue_impact', [
    { id: 'ffffffff-ffff-ffff-ffff-fffffffffff1', organization_id: ORG_ID, encounter_id: '66666666-6666-6666-6666-666666666661', delta_amount: 1200.0, currency: 'USD', assumptions: { assumption: 'Synthetic' }, is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('quality_metrics', [
    { id: 'abababab-abab-abab-abab-abababababab', organization_id: ORG_ID, encounter_id: '66666666-6666-6666-6666-666666666661', metric_type: 'comorbidity_capture', value: 'improved', details: { detail: 'Synthetic' }, is_demo: true, data_source: 'synthetic' },
  ]);

  await upsert('templates', [
    { id: 'acacacac-acac-acac-acac-acacacacacac', organization_id: ORG_ID, specialty: 'cardiology', name: 'Cardiology Progress Template', content: { sections: ['HPI', 'Assessment', 'Plan'] }, version: 1, is_active: true, created_by: userMap.get('cdi1@demo.local') },
  ]);

  console.log('Seed complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
