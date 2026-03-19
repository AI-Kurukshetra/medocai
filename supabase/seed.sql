-- Demo organization
INSERT INTO organizations (id, name, type, beds_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'City General Hospital', 'hospital', 450);

-- NOTE: Create these users via Supabase Auth dashboard first, then run this seed
-- Supabase Dashboard > Authentication > Users > Add User
-- Email: cdi@demo.com, Password: Demo1234!
-- Email: doctor@demo.com, Password: Demo1234!
-- Email: admin@demo.com, Password: Demo1234!
-- Then replace the UUIDs below with the actual auth user IDs

-- EXAMPLE (replace UUIDs with actual auth user IDs):
-- INSERT INTO user_profiles (id, organization_id, full_name, role) VALUES
--   ('REPLACE_WITH_CDI_AUTH_ID',   '11111111-1111-1111-1111-111111111111', 'Sarah Chen', 'cdi_specialist'),
--   ('REPLACE_WITH_DOCTOR_AUTH_ID','11111111-1111-1111-1111-111111111111', 'Dr. Michael Torres', 'physician'),
--   ('REPLACE_WITH_ADMIN_AUTH_ID', '11111111-1111-1111-1111-111111111111', 'Admin User', 'admin');

-- Demo patients
INSERT INTO patients (id, organization_id, mrn, first_name, last_name, date_of_birth, gender, insurance_type) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'MRN001', 'Robert', 'Johnson', '1948-03-15', 'Male', 'medicare'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'MRN002', 'Mary', 'Williams', '1955-07-22', 'Female', 'commercial'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'MRN003', 'James', 'Brown', '1939-11-08', 'Male', 'medicare');

-- Demo encounters
INSERT INTO encounters (id, patient_id, organization_id, encounter_type, admission_date, status, cdi_status, principal_diagnosis_code, admitting_diagnosis, assigned_drg, drg_description, drg_weight, base_reimbursement, optimized_reimbursement, department, documentation_gaps_count) VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'inpatient', CURRENT_DATE - 3, 'pending_query', 'queried', 'I50.9', 'Heart failure', '291', 'Heart failure & shock w MCC', 1.8827, 12400.00, 16600.00, 'Cardiology', 2),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'inpatient', CURRENT_DATE - 1, 'active', 'in_review', 'J18.9', 'Pneumonia', '194', 'Simple pneumonia & pleurisy w CC', 1.0324, 7200.00, NULL, 'Pulmonology', 3),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'inpatient', CURRENT_DATE - 5, 'coded', 'complete', 'N17.9', 'Acute kidney injury', '682', 'Renal failure w MCC', 1.7533, 11500.00, 11500.00, 'Nephrology', 0);

-- Demo clinical documents
INSERT INTO clinical_documents (encounter_id, document_type, title, content, author_name, document_date) VALUES
  ('55555555-5555-5555-5555-555555555555', 'hp', 'H&P - Admission',
   'Chief Complaint: Shortness of breath and leg swelling x 3 days.

History of Present Illness: Mr. Johnson is a 76-year-old male with history of heart failure who presents with worsening dyspnea and bilateral lower extremity edema. Patient reports 2-pillow orthopnea and PND. Recent BNP was 1850 pg/mL (elevated). Creatinine 2.8 mg/dL. Last echo showed EF of 35%.

Past Medical History: Heart failure, hypertension, type 2 diabetes, CKD

Medications: Lisinopril 10mg, Metformin 1000mg, Furosemide 40mg

Assessment/Plan: Heart failure exacerbation. Will start IV diuresis. Monitor renal function.',
   'Dr. Sarah Chen', NOW() - INTERVAL '3 days'),

  ('66666666-6666-6666-6666-666666666666', 'progress_note', 'Progress Note Day 1',
   'Patient: Mary Williams, 68F
Diagnosis: Pneumonia

Subjective: Patient continues to have productive cough, fever 38.9C. O2 sat 91% on room air. WBC 14.2, CXR shows right lower lobe infiltrate.

Labs: Blood glucose 310 mg/dL (elevated). HbA1c 9.2% (not previously documented). Patient reports polyuria and polydipsia x 2 months. No known diabetes diagnosis.

Objective: Patient appears ill. Decreased breath sounds RLL.

Assessment: Community-acquired pneumonia, right lower lobe. Starting ceftriaxone + azithromycin.

Plan: Continue antibiotics. O2 supplementation. Monitor glucose.',
   'Dr. Michael Torres', NOW() - INTERVAL '1 day');
