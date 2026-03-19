-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ORGANIZATIONS & USERS
-- ==========================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'hospital',
  beds_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('cdi_specialist', 'physician', 'admin', 'coder')),
  specialty TEXT,
  employee_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PATIENTS
-- ==========================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  mrn TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  insurance_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, mrn)
);

-- ==========================================
-- ENCOUNTERS
-- ==========================================

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  attending_physician_id UUID REFERENCES user_profiles(id),
  cdi_specialist_id UUID REFERENCES user_profiles(id),
  encounter_type TEXT NOT NULL DEFAULT 'inpatient',
  admission_date DATE NOT NULL,
  discharge_date DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending_query', 'pending_coding', 'coded', 'billed', 'closed')),
  cdi_status TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (cdi_status IN ('unreviewed', 'in_review', 'queried', 'complete')),
  principal_diagnosis_code TEXT,
  admitting_diagnosis TEXT,
  assigned_drg TEXT,
  drg_description TEXT,
  drg_weight DECIMAL(6,4),
  base_reimbursement DECIMAL(10,2),
  optimized_drg TEXT,
  optimized_reimbursement DECIMAL(10,2),
  revenue_impact DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(optimized_reimbursement, 0) - COALESCE(base_reimbursement, 0)) STORED,
  ai_analysis_completed BOOLEAN DEFAULT FALSE,
  ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 0 AND 100),
  documentation_gaps_count INTEGER DEFAULT 0,
  department TEXT,
  ward TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CLINICAL DOCUMENTS
-- ==========================================

CREATE TABLE clinical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID REFERENCES encounters(id) NOT NULL,
  document_type TEXT NOT NULL
    CHECK (document_type IN ('hp', 'progress_note', 'discharge_summary', 'operative_note', 'consult_note', 'lab_report', 'radiology_report', 'nursing_note')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES user_profiles(id),
  author_name TEXT,
  document_date TIMESTAMPTZ NOT NULL,
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_processed_at TIMESTAMPTZ,
  extracted_diagnoses JSONB DEFAULT '[]',
  extracted_procedures JSONB DEFAULT '[]',
  extracted_labs JSONB DEFAULT '[]',
  documentation_gaps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- DIAGNOSIS CODES
-- ==========================================

CREATE TABLE encounter_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID REFERENCES encounters(id) NOT NULL,
  icd10_code TEXT NOT NULL,
  icd10_description TEXT NOT NULL,
  diagnosis_type TEXT NOT NULL
    CHECK (diagnosis_type IN ('principal', 'secondary', 'admitting', 'procedure')),
  cc_mcc_status TEXT CHECK (cc_mcc_status IN ('none', 'cc', 'mcc')),
  source TEXT NOT NULL DEFAULT 'cdi_specialist'
    CHECK (source IN ('physician', 'cdi_specialist', 'ai_suggested', 'coder')),
  ai_confidence DECIMAL(3,2),
  clinical_evidence TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- QUERIES
-- ==========================================

CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID REFERENCES encounters(id) NOT NULL,
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  assigned_to UUID REFERENCES user_profiles(id) NOT NULL,
  query_type TEXT NOT NULL
    CHECK (query_type IN ('diagnosis_clarification', 'specificity', 'clinical_validation', 'procedure_clarification', 'cc_mcc_capture')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  clinical_indicator TEXT,
  suggested_options JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'answered', 'agreed', 'disagreed', 'withdrawn', 'expired')),
  physician_response TEXT,
  agreed_code TEXT,
  agreed_description TEXT,
  response_date TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date DATE,
  sent_at TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AUDIT LOG
-- ==========================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_encounters_org ON encounters(organization_id);
CREATE INDEX idx_encounters_status ON encounters(status);
CREATE INDEX idx_encounters_cdi_status ON encounters(cdi_status);
CREATE INDEX idx_encounters_physician ON encounters(attending_physician_id);
CREATE INDEX idx_encounters_specialist ON encounters(cdi_specialist_id);
CREATE INDEX idx_clinical_docs_encounter ON clinical_documents(encounter_id);
CREATE INDEX idx_queries_encounter ON queries(encounter_id);
CREATE INDEX idx_queries_assigned_to ON queries(assigned_to);
CREATE INDEX idx_queries_status ON queries(status);
CREATE INDEX idx_encounter_diagnoses_encounter ON encounter_diagnoses(encounter_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounter_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_encounters" ON encounters
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_isolation_patients" ON patients
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_isolation_queries" ON queries
  FOR ALL USING (
    encounter_id IN (
      SELECT id FROM encounters WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "org_members_view_profiles" ON user_profiles
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_isolation_clinical_docs" ON clinical_documents
  FOR ALL USING (
    encounter_id IN (
      SELECT id FROM encounters WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "org_isolation_diagnoses" ON encounter_diagnoses
  FOR ALL USING (
    encounter_id IN (
      SELECT id FROM encounters WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- ==========================================
-- UPDATED_AT TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encounters_updated_at BEFORE UPDATE ON encounters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER queries_updated_at BEFORE UPDATE ON queries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
