-- ============================================================
-- Fix seed data:
-- 1. Link physician + CDI specialist to encounters
-- 2. Populate documentation_gaps in clinical_documents
-- 3. Add query records for the "Queried" encounter
-- ============================================================

-- Replace these UUIDs with your actual auth user IDs if different
-- CDI:    bf043277-0e72-421d-9fef-4894c06c8067
-- Doctor: 3dc1e13f-faa7-4343-8d93-ec81b8880934

-- 1. Link attending physician + CDI specialist to encounters
UPDATE encounters SET
  attending_physician_id = '3dc1e13f-faa7-4343-8d93-ec81b8880934',
  cdi_specialist_id      = 'bf043277-0e72-421d-9fef-4894c06c8067'
WHERE id IN (
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777'
);

-- 2. Mark clinical_documents as AI-processed with pre-populated gaps

-- Robert Johnson (Heart failure) — 2 gaps
UPDATE clinical_documents SET
  ai_processed       = TRUE,
  ai_processed_at    = NOW(),
  extracted_diagnoses = '[
    {"text":"Heart failure","suggested_icd10":"I50.21","description":"Acute systolic (congestive) heart failure","confidence":0.92,"requires_clarification":true,"clarification_reason":"Systolic vs diastolic not specified — EF 35% on echo suggests systolic"},
    {"text":"CKD","suggested_icd10":"N18.3","description":"Chronic kidney disease, stage 3","confidence":0.88,"requires_clarification":false,"clarification_reason":null},
    {"text":"Type 2 diabetes","suggested_icd10":"E11.65","description":"Type 2 diabetes mellitus with hyperglycemia","confidence":0.85,"requires_clarification":false,"clarification_reason":null}
  ]',
  extracted_labs = '[
    {"name":"BNP","value":"1850 pg/mL","significance":"Markedly elevated — consistent with acute heart failure exacerbation"},
    {"name":"Creatinine","value":"2.8 mg/dL","significance":"Elevated — suggests CKD Stage 3, qualifies as MCC if documented"},
    {"name":"EF","value":"35%","significance":"Reduced — supports acute systolic heart failure (I50.21)"}
  ]',
  documentation_gaps = '[
    {"gap_type":"specificity","description":"Heart failure documented but systolic vs diastolic not specified","impact":"Missing specificity prevents MCC capture — echo shows EF 35% consistent with systolic","suggested_query":"Based on echo EF of 35%, is this acute systolic (I50.21) or diastolic (I50.31) heart failure?"},
    {"gap_type":"cc_mcc_capture","description":"CKD not staged despite Creatinine 2.8 mg/dL","impact":"Documenting CKD Stage 3 would qualify as MCC and could improve DRG from 293 to 291, capturing ~$4,200","suggested_query":"Please document the CKD stage — creatinine of 2.8 mg/dL is consistent with Stage 3 (GFR 30–59 mL/min)"}
  ]'
WHERE encounter_id = '55555555-5555-5555-5555-555555555555';

-- Mary Williams (Pneumonia) — 3 gaps
UPDATE clinical_documents SET
  ai_processed       = TRUE,
  ai_processed_at    = NOW(),
  extracted_diagnoses = '[
    {"text":"Pneumonia","suggested_icd10":"J18.1","description":"Lobar pneumonia, unspecified organism","confidence":0.90,"requires_clarification":false,"clarification_reason":null},
    {"text":"Hyperglycemia / possible undiagnosed diabetes","suggested_icd10":"E11.65","description":"Type 2 diabetes mellitus with hyperglycemia","confidence":0.87,"requires_clarification":true,"clarification_reason":"Glucose 310 + HbA1c 9.2% — physician has not documented diabetes diagnosis"},
    {"text":"Hypoxia","suggested_icd10":"R09.02","description":"Hypoxemia","confidence":0.82,"requires_clarification":false,"clarification_reason":null}
  ]',
  extracted_labs = '[
    {"name":"WBC","value":"14.2","significance":"Elevated — consistent with active infection/pneumonia"},
    {"name":"O2 Sat","value":"91% on room air","significance":"Hypoxemia present — may support additional CC"},
    {"name":"Blood glucose","value":"310 mg/dL","significance":"Markedly elevated — HbA1c 9.2% suggests undiagnosed diabetes"},
    {"name":"HbA1c","value":"9.2%","significance":"Consistent with uncontrolled type 2 diabetes — not yet diagnosed"}
  ]',
  documentation_gaps = '[
    {"gap_type":"diagnosis_clarification","description":"Glucose 310 mg/dL and HbA1c 9.2% not linked to a diagnosis","impact":"Undiagnosed diabetes would qualify as a CC and improve DRG weight","suggested_query":"Patient has glucose 310 mg/dL and HbA1c 9.2%. Does this represent a new diagnosis of Type 2 diabetes mellitus?"},
    {"gap_type":"specificity","description":"Pneumonia not identified by organism or lobe specificity","impact":"Lobar pneumonia (J18.1) is more specific than J18.9 and may affect DRG grouping","suggested_query":"CXR shows right lower lobe infiltrate. Can you specify the pneumonia as lobar or document the likely causative organism?"},
    {"gap_type":"cc_mcc_capture","description":"Hypoxemia (O2 sat 91%) not documented as a separate diagnosis","impact":"Documenting hypoxemia (R09.02) as a secondary diagnosis would add a CC to this encounter","suggested_query":"O2 sat was 91% on room air. Please document hypoxemia as a secondary diagnosis if clinically appropriate."}
  ]'
WHERE encounter_id = '66666666-6666-6666-6666-666666666666';

-- 3. Add a seeded query for Robert Johnson's "Queried" encounter
INSERT INTO queries (
  id, encounter_id, created_by, assigned_to,
  query_type, subject, body, suggested_options,
  status, sent_at, ai_generated, priority
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '55555555-5555-5555-5555-555555555555',
  'bf043277-0e72-421d-9fef-4894c06c8067',  -- CDI Sarah Chen
  '3dc1e13f-faa7-4343-8d93-ec81b8880934',  -- Dr. Michael Torres
  'specificity',
  'Heart Failure — Systolic vs Diastolic Clarification Needed',
  'Dear Dr. Torres,

Thank you for your care of Mr. Robert Johnson (MRN001, admitted 3/16/2026).

Clinical indicators in the documentation support further specificity regarding the type of heart failure:
• Most recent echocardiogram: EF of 35% (reduced ejection fraction)
• BNP: 1,850 pg/mL (markedly elevated)
• Symptoms: orthopnea, PND, bilateral lower extremity edema

Based on the above clinical evidence, could you please clarify which of the following best describes this patient''s heart failure?',
  '[
    {"code":"I50.21","description":"Acute systolic (congestive) heart failure","rationale":"EF 35% on echo supports reduced ejection fraction — systolic dysfunction"},
    {"code":"I50.31","description":"Acute diastolic (congestive) heart failure","rationale":"Use if EF is preserved (>50%) and symptoms are diastolic"},
    {"code":"I50.9","description":"Heart failure, unspecified (current documentation)","rationale":"Maintain current if specificity cannot be confirmed"},
    {"code":"OTHER","description":"Other — please clarify in chart","rationale":null}
  ]',
  'sent',
  NOW() - INTERVAL '2 days',
  FALSE,
  'high'
);
