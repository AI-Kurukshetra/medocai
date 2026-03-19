# CDI Platform MVP — Complete Implementation Plan
> Hand this document to Claude Code (or any agentic AI) to build the full MVP.

---

## Project Overview

Build a **Clinical Documentation Improvement (CDI) SaaS platform** MVP using Next.js 14 (App Router) and Supabase. The platform helps hospitals improve doctor documentation quality, generate accurate ICD-10 codes, and maximize reimbursement revenue.

**Stack:**
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- AI: Anthropic Claude API (via claude-sonnet-4-20250514) for NLP and code suggestions
- Charts: Recharts
- Forms: React Hook Form + Zod

---

## Design Direction

**Aesthetic:** Clinical precision meets modern SaaS — think dark navy sidebar, crisp white content areas, mint/teal accents. Medical seriousness without feeling cold. Typography: `DM Sans` for UI, `JetBrains Mono` for codes and data.

**Color Palette (CSS Variables):**
```css
--background: #F8FAFC
--foreground: #0F172A
--sidebar: #0F172A
--sidebar-foreground: #94A3B8
--sidebar-active: #14B8A6
--primary: #0D9488
--primary-foreground: #FFFFFF
--accent: #14B8A6
--muted: #F1F5F9
--muted-foreground: #64748B
--border: #E2E8F0
--destructive: #EF4444
--warning: #F59E0B
--success: #10B981
--card: #FFFFFF
--card-foreground: #0F172A
```

---

## Repository Structure

```
cdi-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Sidebar + header shell
│   │   ├── dashboard/page.tsx            # Overview stats
│   │   ├── cases/
│   │   │   ├── page.tsx                  # Case worklist
│   │   │   └── [id]/page.tsx             # Single case detail
│   │   ├── queries/
│   │   │   ├── page.tsx                  # All queries
│   │   │   └── [id]/page.tsx             # Query detail
│   │   ├── patients/
│   │   │   └── page.tsx                  # Patient list
│   │   ├── analytics/page.tsx            # Revenue + quality dashboards
│   │   └── settings/page.tsx             # User/org settings
│   ├── api/
│   │   ├── analyze-document/route.ts     # AI document analysis
│   │   ├── suggest-codes/route.ts        # ICD-10 suggestions
│   │   ├── generate-query/route.ts       # Auto query generation
│   │   └── calculate-drg/route.ts        # DRG + revenue calc
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                          # Redirect to /dashboard
├── components/
│   ├── ui/                               # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageHeader.tsx
│   ├── cases/
│   │   ├── CaseWorklist.tsx
│   │   ├── CaseCard.tsx
│   │   ├── CaseDetail.tsx
│   │   ├── DocumentViewer.tsx
│   │   ├── CodeSuggestionPanel.tsx
│   │   └── GapAlertBadge.tsx
│   ├── queries/
│   │   ├── QueryList.tsx
│   │   ├── QueryCard.tsx
│   │   ├── QueryComposer.tsx
│   │   └── QueryStatusBadge.tsx
│   ├── analytics/
│   │   ├── RevenueImpactChart.tsx
│   │   ├── QueryResponseRateChart.tsx
│   │   ├── CMITrendChart.tsx
│   │   └── KPICard.tsx
│   └── shared/
│       ├── ICD10Badge.tsx
│       ├── DRGBadge.tsx
│       ├── PatientAvatar.tsx
│       └── StatusPill.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client
│   │   ├── server.ts                     # Server client
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── anthropic.ts                  # Anthropic client setup
│   │   ├── prompts.ts                    # All AI system prompts
│   │   └── parsers.ts                    # Parse AI responses
│   ├── icd10/
│   │   └── lookup.ts                     # ICD-10 code lookup utilities
│   └── utils.ts
├── types/
│   └── database.ts                       # Generated Supabase types
├── hooks/
│   ├── useCase.ts
│   ├── useQueries.ts
│   ├── useAnalytics.ts
│   └── useRealtimeUpdates.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── middleware.ts
├── .env.local.example
└── package.json
```

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Project

```bash
npx create-next-app@latest cdi-platform --typescript --tailwind --app --src-dir=false
cd cdi-platform
npx shadcn@latest init
```

**Install dependencies:**
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk
npm install recharts
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react
npm install date-fns
npm install clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs
```

**Install shadcn components:**
```bash
npx shadcn@latest add button card badge dialog select tabs table textarea input label avatar separator skeleton toast
```

### 1.2 Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.3 Supabase Client Setup

**lib/supabase/client.ts** — Browser client (for use in Client Components):
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**lib/supabase/server.ts** — Server client (for Server Components and API routes):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch {}
        },
      },
    }
  )
}
```

**middleware.ts** (root):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/public).*)'],
}
```

---

## Phase 2: Database Schema

Run this SQL in Supabase SQL Editor (or save as `supabase/migrations/001_initial_schema.sql`):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ORGANIZATIONS & USERS
-- ==========================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'hospital', -- hospital, clinic, health_system
  beds_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('cdi_specialist', 'physician', 'admin', 'coder')),
  specialty TEXT, -- cardiology, oncology, surgery (for physicians)
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
  mrn TEXT NOT NULL, -- Medical Record Number
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  insurance_type TEXT, -- medicare, medicaid, commercial, self_pay
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, mrn)
);

-- ==========================================
-- ENCOUNTERS (Hospital Visits)
-- ==========================================

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  attending_physician_id UUID REFERENCES user_profiles(id),
  cdi_specialist_id UUID REFERENCES user_profiles(id),
  
  encounter_type TEXT NOT NULL DEFAULT 'inpatient', -- inpatient, outpatient, observation
  admission_date DATE NOT NULL,
  discharge_date DATE,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'pending_query', 'pending_coding', 'coded', 'billed', 'closed')),
  cdi_status TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (cdi_status IN ('unreviewed', 'in_review', 'queried', 'complete')),
  
  -- DRG and Revenue
  principal_diagnosis_code TEXT, -- ICD-10 code
  admitting_diagnosis TEXT,
  assigned_drg TEXT,
  drg_description TEXT,
  drg_weight DECIMAL(6,4),
  base_reimbursement DECIMAL(10,2),
  optimized_drg TEXT,
  optimized_reimbursement DECIMAL(10,2),
  revenue_impact DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(optimized_reimbursement, 0) - COALESCE(base_reimbursement, 0)) STORED,
  
  -- CDI AI Analysis
  ai_analysis_completed BOOLEAN DEFAULT FALSE,
  ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 0 AND 100), -- documentation completeness risk
  documentation_gaps_count INTEGER DEFAULT 0,
  
  -- Metadata
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
  content TEXT NOT NULL, -- Full document text
  author_id UUID REFERENCES user_profiles(id),
  author_name TEXT, -- Denormalized for display
  document_date TIMESTAMPTZ NOT NULL,
  
  -- AI Processing
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_processed_at TIMESTAMPTZ,
  extracted_diagnoses JSONB DEFAULT '[]', -- Array of {text, icd10_code, confidence}
  extracted_procedures JSONB DEFAULT '[]',
  extracted_labs JSONB DEFAULT '[]', -- Key lab values found in text
  documentation_gaps JSONB DEFAULT '[]', -- Array of gap descriptions
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- DIAGNOSIS CODES (per encounter)
-- ==========================================

CREATE TABLE encounter_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID REFERENCES encounters(id) NOT NULL,
  
  icd10_code TEXT NOT NULL,
  icd10_description TEXT NOT NULL,
  diagnosis_type TEXT NOT NULL 
    CHECK (diagnosis_type IN ('principal', 'secondary', 'admitting', 'procedure')),
  
  cc_mcc_status TEXT CHECK (cc_mcc_status IN ('none', 'cc', 'mcc')), -- Complication/Comorbidity status
  
  -- How this was added
  source TEXT NOT NULL DEFAULT 'cdi_specialist' 
    CHECK (source IN ('physician', 'cdi_specialist', 'ai_suggested', 'coder')),
  
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  clinical_evidence TEXT, -- What clinical data supports this code
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- QUERIES (CDI → Physician)
-- ==========================================

CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID REFERENCES encounters(id) NOT NULL,
  
  -- Parties
  created_by UUID REFERENCES user_profiles(id) NOT NULL, -- CDI Specialist
  assigned_to UUID REFERENCES user_profiles(id) NOT NULL, -- Physician
  
  -- Content
  query_type TEXT NOT NULL 
    CHECK (query_type IN ('diagnosis_clarification', 'specificity', 'clinical_validation', 'procedure_clarification', 'cc_mcc_capture')),
  
  subject TEXT NOT NULL,
  body TEXT NOT NULL, -- The question asked
  clinical_indicator TEXT, -- What triggered this query (lab value, etc.)
  
  suggested_options JSONB DEFAULT '[]', -- Array of {code, description, rationale} options to present to physician
  
  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'answered', 'agreed', 'disagreed', 'withdrawn', 'expired')),
  
  -- Response
  physician_response TEXT,
  agreed_code TEXT,
  agreed_description TEXT,
  response_date TIMESTAMPTZ,
  
  -- Priority and timing
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date DATE,
  sent_at TIMESTAMPTZ,
  
  -- AI generation
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
  
  action TEXT NOT NULL, -- 'query_sent', 'code_added', 'document_analyzed', etc.
  entity_type TEXT NOT NULL, -- 'encounter', 'query', 'diagnosis', etc.
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

-- Users can only see data from their organization
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
```

---

## Phase 3: Seed Data

Save as `supabase/seed.sql` and run after migrations:

```sql
-- Demo organization
INSERT INTO organizations (id, name, type, beds_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'City General Hospital', 'hospital', 450);

-- NOTE: Create these users via Supabase Auth dashboard first, then run this seed
-- Replace UUIDs with actual auth user IDs after creating them

-- Demo user profiles (replace UUIDs with real auth.users IDs)
-- Create via: Supabase Dashboard > Authentication > Users > Add User
-- Email: cdi@demo.com, Password: Demo1234!
-- Email: doctor@demo.com, Password: Demo1234!
-- Email: admin@demo.com, Password: Demo1234!

-- After creating auth users, insert profiles:
-- INSERT INTO user_profiles VALUES (auth_user_id, org_id, name, role, specialty)

-- Demo patients
INSERT INTO patients (id, organization_id, mrn, first_name, last_name, date_of_birth, gender, insurance_type) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'MRN001', 'Robert', 'Johnson', '1948-03-15', 'Male', 'medicare'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'MRN002', 'Mary', 'Williams', '1955-07-22', 'Female', 'commercial'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'MRN003', 'James', 'Brown', '1939-11-08', 'Male', 'medicare');

-- Demo encounters with documentation gaps
INSERT INTO encounters (id, patient_id, organization_id, encounter_type, admission_date, status, cdi_status, principal_diagnosis_code, admitting_diagnosis, assigned_drg, drg_description, drg_weight, base_reimbursement, department, documentation_gaps_count) VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'inpatient', CURRENT_DATE - 3, 'pending_query', 'queried', 'I50.9', 'Heart failure', '291', 'Heart failure & shock w MCC', 1.8827, 12400.00, 'Cardiology', 2),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'inpatient', CURRENT_DATE - 1, 'active', 'in_review', 'J18.9', 'Pneumonia', '194', 'Simple pneumonia & pleurisy w CC', 1.0324, 7200.00, 'Pulmonology', 3),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'inpatient', CURRENT_DATE - 5, 'coded', 'complete', 'N17.9', 'Acute kidney injury', '682', 'Renal failure w MCC', 1.7533, 11500.00, 'Nephrology', 0);

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
```

---

## Phase 4: AI Integration

### 4.1 Anthropic Client Setup

**lib/ai/anthropic.ts:**
```typescript
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const AI_MODEL = 'claude-sonnet-4-20250514'
```

### 4.2 AI Prompts

**lib/ai/prompts.ts:**
```typescript
export const DOCUMENT_ANALYSIS_PROMPT = `You are an expert Clinical Documentation Improvement (CDI) specialist AI. Analyze the provided clinical document and return a JSON response.

Extract and identify:
1. All diagnoses mentioned (explicit and implied)
2. Procedures performed
3. Key lab values (with their clinical significance)
4. Documentation gaps (missing specificity, unlinked diagnoses, etc.)
5. Potential ICD-10 code suggestions with confidence scores

Return ONLY valid JSON in this exact format:
{
  "diagnoses": [
    {
      "text": "diagnosis as written in document",
      "suggested_icd10": "X00.0",
      "description": "ICD-10 full description",
      "confidence": 0.95,
      "requires_clarification": false,
      "clarification_reason": null
    }
  ],
  "procedures": [
    { "text": "procedure name", "cpt_hint": "12345", "confidence": 0.8 }
  ],
  "key_labs": [
    { "name": "BNP", "value": "1850 pg/mL", "significance": "Markedly elevated, consistent with heart failure exacerbation" }
  ],
  "documentation_gaps": [
    {
      "gap_type": "specificity",
      "description": "Heart failure documented but systolic vs diastolic not specified",
      "impact": "Missing specificity prevents MCC capture",
      "suggested_query": "Is this acute systolic or diastolic heart failure?"
    }
  ],
  "drg_opportunities": [
    {
      "current_drg": "293",
      "suggested_drg": "291",
      "rationale": "Adding CKD Stage 3 (supported by Cr 2.8) would qualify as MCC",
      "revenue_impact": 4200
    }
  ]
}`

export const QUERY_GENERATION_PROMPT = `You are a CDI specialist generating a physician query. Based on the clinical gap provided, generate a professional, compliant query following AHIMA/ACDIS guidelines.

Rules:
- Be specific but non-leading
- Present multiple options when appropriate
- Reference the clinical evidence
- Keep it concise and respectful of physician time
- Always include a "does not fit any of the above" option

Return ONLY valid JSON:
{
  "subject": "Query subject line",
  "body": "Full query text",
  "options": [
    { "code": "I50.21", "description": "Acute systolic heart failure", "rationale": "EF 35% on echo" },
    { "code": "I50.31", "description": "Acute diastolic heart failure" },
    { "code": "I50.9", "description": "Heart failure, unspecified (current)" },
    { "code": "OTHER", "description": "Other - please clarify" }
  ]
}`

export const ICD10_SUGGESTION_PROMPT = `You are an ICD-10-CM coding expert. Given a clinical description, suggest the most specific appropriate ICD-10 code(s).

Return ONLY valid JSON array:
[
  {
    "code": "I50.21",
    "description": "Acute systolic (congestive) heart failure",
    "confidence": 0.92,
    "specificity_level": "high",
    "cc_mcc": "mcc",
    "notes": "Use when EF < 40% is documented"
  }
]`
```

### 4.3 API Routes

**app/api/analyze-document/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/ai/anthropic'
import { DOCUMENT_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { documentId, content } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      system: DOCUMENT_ANALYSIS_PROMPT,
      messages: [{ role: 'user', content: `Analyze this clinical document:\n\n${content}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const analysis = JSON.parse(responseText)

    // Update document in database with analysis results
    await supabase
      .from('clinical_documents')
      .update({
        ai_processed: true,
        ai_processed_at: new Date().toISOString(),
        extracted_diagnoses: analysis.diagnoses,
        extracted_procedures: analysis.procedures,
        extracted_labs: analysis.key_labs,
        documentation_gaps: analysis.documentation_gaps,
      })
      .eq('id', documentId)

    // Update encounter gap count
    if (documentId) {
      const { data: doc } = await supabase
        .from('clinical_documents')
        .select('encounter_id')
        .eq('id', documentId)
        .single()

      if (doc?.encounter_id) {
        const { count } = await supabase
          .from('clinical_documents')
          .select('documentation_gaps', { count: 'exact' })
          .eq('encounter_id', doc.encounter_id)
        
        await supabase
          .from('encounters')
          .update({ 
            documentation_gaps_count: analysis.documentation_gaps?.length || 0,
            ai_analysis_completed: true 
          })
          .eq('id', doc.encounter_id)
      }
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('Document analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
```

**app/api/generate-query/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/ai/anthropic'
import { QUERY_GENERATION_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { encounterId, gap, clinicalEvidence } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1000,
      system: QUERY_GENERATION_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a physician query for this gap:\n\nGap: ${gap}\nClinical Evidence: ${clinicalEvidence}`
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const query = JSON.parse(responseText)

    return NextResponse.json({ success: true, query })
  } catch (error) {
    console.error('Query generation error:', error)
    return NextResponse.json({ error: 'Query generation failed' }, { status: 500 })
  }
}
```

**app/api/suggest-codes/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/ai/anthropic'
import { ICD10_SUGGESTION_PROMPT } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 800,
      system: ICD10_SUGGESTION_PROMPT,
      messages: [{ role: 'user', content: `Suggest ICD-10 codes for: ${description}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const suggestions = JSON.parse(responseText)

    return NextResponse.json({ success: true, suggestions })
  } catch (error) {
    return NextResponse.json({ error: 'Code suggestion failed' }, { status: 500 })
  }
}
```

---

## Phase 5: Core UI Components

### 5.1 Root Layout & Global Styles

**app/globals.css** — Add after Tailwind directives:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --background: #F8FAFC;
  --foreground: #0F172A;
  --sidebar-bg: #0F172A;
  --sidebar-fg: #94A3B8;
  --sidebar-active: #14B8A6;
  --primary: #0D9488;
  --primary-foreground: #FFFFFF;
  --accent: #14B8A6;
  --muted: #F1F5F9;
  --muted-foreground: #64748B;
  --border: #E2E8F0;
  --card: #FFFFFF;
  --success: #10B981;
  --warning: #F59E0B;
  --destructive: #EF4444;
}

body {
  font-family: 'DM Sans', sans-serif;
  background-color: var(--background);
  color: var(--foreground);
}

code, .mono {
  font-family: 'JetBrains Mono', monospace;
}
```

### 5.2 Dashboard Layout (Sidebar)

**app/(dashboard)/layout.tsx:**
```typescript
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar userRole={profile?.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**components/layout/Sidebar.tsx:**
```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, MessageSquare, Users,
  BarChart3, Settings, Stethoscope, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['cdi_specialist', 'admin', 'physician'] },
  { href: '/cases', label: 'Case Worklist', icon: ClipboardList, roles: ['cdi_specialist', 'admin'] },
  { href: '/queries', label: 'Queries', icon: MessageSquare, roles: ['cdi_specialist', 'physician', 'admin'] },
  { href: '/patients', label: 'Patients', icon: Users, roles: ['cdi_specialist', 'admin', 'physician'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'cdi_specialist'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'cdi_specialist', 'physician'] },
]

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()

  const filtered = navItems.filter(item => !userRole || item.roles.includes(userRole))

  return (
    <aside className="w-64 flex flex-col h-full" style={{ background: 'var(--sidebar-bg)' }}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">CDI Platform</p>
            <p className="text-xs" style={{ color: 'var(--sidebar-fg)' }}>Clinical Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filtered.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'text-white'
                  : 'hover:text-white'
              }`}
              style={{
                background: active ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                color: active ? 'var(--sidebar-active)' : 'var(--sidebar-fg)',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-center" style={{ color: 'var(--sidebar-fg)' }}>
          Powered by Claude AI
        </p>
      </div>
    </aside>
  )
}
```

### 5.3 Status Components

**components/shared/StatusPill.tsx:**
```typescript
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  unreviewed: { label: 'Unreviewed', color: '#64748B', bg: '#F1F5F9' },
  in_review: { label: 'In Review', color: '#D97706', bg: '#FEF3C7' },
  queried: { label: 'Queried', color: '#2563EB', bg: '#DBEAFE' },
  complete: { label: 'Complete', color: '#059669', bg: '#D1FAE5' },
  sent: { label: 'Sent', color: '#2563EB', bg: '#DBEAFE' },
  answered: { label: 'Answered', color: '#059669', bg: '#D1FAE5' },
  agreed: { label: 'Agreed', color: '#059669', bg: '#D1FAE5' },
  disagreed: { label: 'Disagreed', color: '#DC2626', bg: '#FEE2E2' },
  pending_query: { label: 'Pending Query', color: '#D97706', bg: '#FEF3C7' },
  active: { label: 'Active', color: '#2563EB', bg: '#DBEAFE' },
  coded: { label: 'Coded', color: '#059669', bg: '#D1FAE5' },
}

export function StatusPill({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  )
}
```

**components/shared/ICD10Badge.tsx:**
```typescript
export function ICD10Badge({ code, description, ccMcc }: {
  code: string
  description?: string
  ccMcc?: 'cc' | 'mcc' | 'none' | null
}) {
  const ccMccColors = {
    mcc: { bg: '#FEE2E2', color: '#991B1B', label: 'MCC' },
    cc: { bg: '#FEF3C7', color: '#92400E', label: 'CC' },
    none: null,
  }
  const badge = ccMcc && ccMcc !== 'none' ? ccMccColors[ccMcc] : null

  return (
    <div className="flex items-center gap-2">
      <code
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{ background: '#F0FDFA', color: '#0F766E', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {code}
      </code>
      {description && <span className="text-sm text-slate-600">{description}</span>}
      {badge && (
        <span
          className="px-1.5 py-0.5 rounded text-xs font-bold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      )}
    </div>
  )
}
```

---

## Phase 6: Core Pages

### 6.1 Dashboard Overview Page

**app/(dashboard)/dashboard/page.tsx:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/analytics/KPICard'
import { RevenueImpactChart } from '@/components/analytics/RevenueImpactChart'
import { QueryResponseRateChart } from '@/components/analytics/QueryResponseRateChart'
import { DollarSign, FileSearch, MessageSquare, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('user_profiles').select('organization_id').eq('id', user!.id).single()
  const orgId = profile?.organization_id

  // Fetch KPI data
  const [
    { count: activeEncounters },
    { count: pendingQueries },
    { data: revenueData },
    { count: completedThisWeek },
  ] = await Promise.all([
    supabase.from('encounters').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['active', 'pending_query']),
    supabase.from('queries').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('encounters').select('revenue_impact').eq('organization_id', orgId).not('revenue_impact', 'is', null),
    supabase.from('encounters').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('cdi_status', 'complete').gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const totalRevenue = revenueData?.reduce((sum, e) => sum + (e.revenue_impact || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">CDI Overview</h1>
        <p className="text-slate-500 mt-1">Clinical documentation performance at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Cases"
          value={activeEncounters || 0}
          icon={FileSearch}
          trend="+12% this week"
          trendUp={true}
          color="blue"
        />
        <KPICard
          title="Pending Queries"
          value={pendingQueries || 0}
          icon={MessageSquare}
          trend="Avg 18hr response"
          color="amber"
        />
        <KPICard
          title="Revenue Impact"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          trend="This month"
          trendUp={true}
          color="green"
        />
        <KPICard
          title="Completed This Week"
          value={completedThisWeek || 0}
          icon={TrendingUp}
          trend="Cases closed"
          trendUp={true}
          color="teal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueImpactChart organizationId={orgId!} />
        <QueryResponseRateChart organizationId={orgId!} />
      </div>
    </div>
  )
}
```

### 6.2 Case Worklist Page

**app/(dashboard)/cases/page.tsx:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { CaseWorklist } from '@/components/cases/CaseWorklist'

export default async function CasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('user_profiles').select('organization_id, role').eq('id', user!.id).single()

  const { data: encounters } = await supabase
    .from('encounters')
    .select(`
      *,
      patients (first_name, last_name, mrn, insurance_type),
      user_profiles!attending_physician_id (full_name),
      queries (count)
    `)
    .eq('organization_id', profile?.organization_id)
    .order('updated_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Case Worklist</h1>
        <p className="text-slate-500 mt-1">Active encounters requiring CDI review</p>
      </div>
      <CaseWorklist encounters={encounters || []} />
    </div>
  )
}
```

**components/cases/CaseWorklist.tsx** (Client Component):
```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { StatusPill } from '@/components/shared/StatusPill'
import { ICD10Badge } from '@/components/shared/ICD10Badge'
import { AlertTriangle, ChevronRight, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

export function CaseWorklist({ encounters }: { encounters: any[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = encounters.filter(e => {
    const patient = e.patients
    const matchesSearch = !search ||
      `${patient?.first_name} ${patient?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      patient?.mrn?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.cdi_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by patient name or MRN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unreviewed">Unreviewed</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="queried">Queried</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Admitted</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Principal Dx</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">DRG</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gaps</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">CDI Status</th>
              <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue Impact</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(encounter => (
              <tr key={encounter.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {encounter.patients?.first_name} {encounter.patients?.last_name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{encounter.patients?.mrn}</p>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {format(new Date(encounter.admission_date), 'MMM d, yyyy')}
                </td>
                <td className="p-4">
                  {encounter.principal_diagnosis_code ? (
                    <ICD10Badge code={encounter.principal_diagnosis_code} />
                  ) : (
                    <span className="text-xs text-slate-400">Not assigned</span>
                  )}
                </td>
                <td className="p-4">
                  {encounter.assigned_drg ? (
                    <div>
                      <span className="font-mono text-xs font-medium text-slate-700">DRG {encounter.assigned_drg}</span>
                      <p className="text-xs text-slate-400 truncate max-w-32">{encounter.drg_description}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="p-4">
                  {encounter.documentation_gaps_count > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">{encounter.documentation_gaps_count}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </td>
                <td className="p-4">
                  <StatusPill status={encounter.cdi_status} />
                </td>
                <td className="p-4 text-right">
                  {encounter.revenue_impact > 0 ? (
                    <span className="text-sm font-semibold text-green-600">
                      +${encounter.revenue_impact.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="p-4">
                  <Link href={`/cases/${encounter.id}`}>
                    <ChevronRight className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500">No cases match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 6.3 Case Detail Page

**app/(dashboard)/cases/[id]/page.tsx:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CaseDetail } from '@/components/cases/CaseDetail'

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: encounter } = await supabase
    .from('encounters')
    .select(`
      *,
      patients (*),
      user_profiles!attending_physician_id (full_name, specialty),
      clinical_documents (*),
      encounter_diagnoses (*),
      queries (*)
    `)
    .eq('id', params.id)
    .single()

  if (!encounter) notFound()

  return <CaseDetail encounter={encounter} />
}
```

**components/cases/CaseDetail.tsx** (Client Component with tabs, document viewer, AI analysis, query composer):

```typescript
'use client'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentViewer } from './DocumentViewer'
import { CodeSuggestionPanel } from './CodeSuggestionPanel'
import { QueryComposer } from '@/components/queries/QueryComposer'
import { StatusPill } from '@/components/shared/StatusPill'
import { ICD10Badge } from '@/components/shared/ICD10Badge'
import { AlertTriangle, Brain, FileText, MessageSquare, DollarSign, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export function CaseDetail({ encounter }: { encounter: any }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showQueryComposer, setShowQueryComposer] = useState(false)
  const [selectedGap, setSelectedGap] = useState<any>(null)

  const handleAnalyzeDocument = async (documentId: string, content: string) => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, content }),
      })
      const data = await res.json()
      setAnalysisResult(data.analysis)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCreateQuery = (gap: any) => {
    setSelectedGap(gap)
    setShowQueryComposer(true)
  }

  const patient = encounter.patients
  const physician = encounter.user_profiles
  const documents = encounter.clinical_documents || []
  const diagnoses = encounter.encounter_diagnoses || []
  const queries = encounter.queries || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <StatusPill status={encounter.cdi_status} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            <span className="font-mono">{patient.mrn}</span>
            <span>•</span>
            <span>Admitted {format(new Date(encounter.admission_date), 'MMMM d, yyyy')}</span>
            <span>•</span>
            <span>{physician?.full_name || 'No physician assigned'}</span>
            <span>•</span>
            <span>{encounter.department}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {encounter.revenue_impact > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                +${encounter.revenue_impact?.toLocaleString()} captured
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Documentation Gaps Alert */}
      {encounter.documentation_gaps_count > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {encounter.documentation_gaps_count} documentation gap{encounter.documentation_gaps_count > 1 ? 's' : ''} detected
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review AI findings and create queries to improve DRG assignment and revenue capture.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="diagnoses" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Diagnoses & Codes
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Queries ({queries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {documents.map((doc: any) => (
                <DocumentViewer
                  key={doc.id}
                  document={doc}
                  onAnalyze={handleAnalyzeDocument}
                  analyzing={analyzing}
                />
              ))}
            </div>
            <div>
              <CodeSuggestionPanel
                analysisResult={analysisResult}
                existingDiagnoses={diagnoses}
                encounterId={encounter.id}
                onCreateQuery={handleCreateQuery}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diagnoses">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documented Diagnoses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnoses.map((dx: any) => (
                  <div key={dx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="space-y-1">
                      <ICD10Badge
                        code={dx.icd10_code}
                        description={dx.icd10_description}
                        ccMcc={dx.cc_mcc_status}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 capitalize">{dx.diagnosis_type}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400 capitalize">Added by {dx.source.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {dx.ai_confidence && (
                      <div className="text-right">
                        <span className="text-xs text-slate-400">AI Confidence</span>
                        <p className="text-sm font-medium text-slate-700">{Math.round(dx.ai_confidence * 100)}%</p>
                      </div>
                    )}
                  </div>
                ))}
                {diagnoses.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No diagnoses documented yet. Analyze documents to get AI suggestions.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries">
          <div className="space-y-4">
            {queries.map((query: any) => (
              <Card key={query.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusPill status={query.status} />
                        <span className="text-xs text-slate-400 capitalize">{query.query_type.replace('_', ' ')}</span>
                        {query.ai_generated && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">AI Generated</span>
                        )}
                      </div>
                      <p className="font-medium text-slate-800">{query.subject}</p>
                      <p className="text-sm text-slate-600">{query.body}</p>
                      {query.physician_response && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-xs font-medium text-green-700 mb-1">Physician Response:</p>
                          <p className="text-sm text-green-800">{query.physician_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              onClick={() => setShowQueryComposer(true)}
              variant="outline"
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Create New Query
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Query Composer Dialog */}
      {showQueryComposer && (
        <QueryComposer
          encounterId={encounter.id}
          gap={selectedGap}
          physicianId={encounter.attending_physician_id}
          physicianName={physician?.full_name}
          onClose={() => { setShowQueryComposer(false); setSelectedGap(null) }}
        />
      )}
    </div>
  )
}
```

### 6.4 Document Viewer Component

**components/cases/DocumentViewer.tsx:**
```typescript
'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, ChevronDown, ChevronUp, Loader2, FileText } from 'lucide-react'
import { format } from 'date-fns'

const DOC_TYPE_LABELS: Record<string, string> = {
  hp: 'H&P',
  progress_note: 'Progress Note',
  discharge_summary: 'Discharge Summary',
  operative_note: 'Operative Note',
  consult_note: 'Consult Note',
  lab_report: 'Lab Report',
  radiology_report: 'Radiology Report',
}

export function DocumentViewer({ document, onAnalyze, analyzing }: {
  document: any
  onAnalyze: (id: string, content: string) => void
  analyzing: boolean
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">{document.title}</p>
              <p className="text-xs text-slate-400">
                {DOC_TYPE_LABELS[document.document_type] || document.document_type}
                {document.author_name && ` • ${document.author_name}`}
                {` • ${format(new Date(document.document_date), 'MMM d, yyyy h:mm a')}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!document.ai_processed && (
              <Button
                size="sm"
                onClick={() => onAnalyze(document.id, document.content)}
                disabled={analyzing}
                className="text-xs"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {analyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
                {analyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            )}
            {document.ai_processed && (
              <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full font-medium">✓ AI Analyzed</span>
            )}
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div
            className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed p-4 rounded-lg"
            style={{ background: '#F8FAFC', fontSize: '0.8125rem', maxHeight: '400px', overflowY: 'auto' }}
          >
            {document.content}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
```

### 6.5 Code Suggestion Panel

**components/cases/CodeSuggestionPanel.tsx:**
```typescript
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ICD10Badge } from '@/components/shared/ICD10Badge'
import { AlertTriangle, Plus, MessageSquare, TrendingUp, Sparkles } from 'lucide-react'

export function CodeSuggestionPanel({ analysisResult, existingDiagnoses, encounterId, onCreateQuery }: {
  analysisResult: any
  existingDiagnoses: any[]
  encounterId: string
  onCreateQuery: (gap: any) => void
}) {
  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-6">
            Click "Analyze with AI" on a document to see code suggestions and documentation gaps.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Code Suggestions */}
      {analysisResult.diagnoses?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Suggested Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.diagnoses.map((dx: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-2">
                <ICD10Badge code={dx.suggested_icd10} description={dx.description} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${dx.confidence * 100}%`, background: 'var(--primary)' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{Math.round(dx.confidence * 100)}%</span>
                  </div>
                  {dx.requires_clarification ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => onCreateQuery({ description: dx.clarification_reason, code: dx.suggested_icd10 })}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Query
                    </Button>
                  ) : (
                    <Button size="sm" className="text-xs h-7" style={{ background: 'var(--primary)', color: 'white' }}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Documentation Gaps */}
      {analysisResult.documentation_gaps?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Documentation Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.documentation_gaps.map((gap: any, i: number) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-2">
                <p className="text-xs font-medium text-amber-800 capitalize">{gap.gap_type.replace('_', ' ')}</p>
                <p className="text-xs text-amber-700">{gap.description}</p>
                <p className="text-xs text-amber-600 italic">{gap.impact}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 w-full border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={() => onCreateQuery(gap)}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Generate Query
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* DRG Opportunities */}
      {analysisResult.drg_opportunities?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Revenue Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.drg_opportunities.map((opp: any, i: number) => (
              <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-green-800">
                    DRG {opp.current_drg} → {opp.suggested_drg}
                  </span>
                  <span className="text-sm font-bold text-green-700">+${opp.revenue_impact?.toLocaleString()}</span>
                </div>
                <p className="text-xs text-green-700">{opp.rationale}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 6.6 Query Composer

**components/queries/QueryComposer.tsx:**
```typescript
'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function QueryComposer({ encounterId, gap, physicianId, physicianName, onClose }: {
  encounterId: string
  gap?: any
  physicianId?: string
  physicianName?: string
  onClose: () => void
}) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [queryData, setQueryData] = useState<any>(null)
  const [queryType, setQueryType] = useState('diagnosis_clarification')
  const [customBody, setCustomBody] = useState('')

  const handleGenerateQuery = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounterId,
          gap: gap?.description || 'Documentation needs clarification',
          clinicalEvidence: gap?.impact || '',
        }),
      })
      const data = await res.json()
      setQueryData(data.query)
      setCustomBody(data.query.body)
    } finally {
      setGenerating(false)
    }
  }

  const handleSendQuery = async () => {
    setSending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('queries').insert({
      encounter_id: encounterId,
      created_by: user!.id,
      assigned_to: physicianId,
      query_type: queryType,
      subject: queryData?.subject || 'Documentation Clarification Needed',
      body: customBody,
      suggested_options: queryData?.options || [],
      status: 'sent',
      sent_at: new Date().toISOString(),
      ai_generated: !!queryData,
      priority: 'normal',
    })

    setSending(false)
    onClose()
    router.refresh()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Physician Query</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-medium text-teal-700">
              {physicianName?.charAt(0) || 'P'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{physicianName || 'Attending Physician'}</p>
              <p className="text-xs text-slate-400">Query recipient</p>
            </div>
          </div>

          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger>
              <SelectValue placeholder="Query type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diagnosis_clarification">Diagnosis Clarification</SelectItem>
              <SelectItem value="specificity">Specificity Required</SelectItem>
              <SelectItem value="clinical_validation">Clinical Validation</SelectItem>
              <SelectItem value="cc_mcc_capture">CC/MCC Capture</SelectItem>
              <SelectItem value="procedure_clarification">Procedure Clarification</SelectItem>
            </SelectContent>
          </Select>

          {gap && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-medium text-amber-700 mb-1">Documentation Gap:</p>
              <p className="text-sm text-amber-800">{gap.description}</p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGenerateQuery}
            disabled={generating}
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            {generating ? 'Generating with AI...' : 'Generate Query with AI'}
          </Button>

          {queryData && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-xs font-medium text-teal-700 mb-1">Subject: {queryData.subject}</p>
              <p className="text-xs text-teal-600">Options: {queryData.options?.length} presented to physician</p>
            </div>
          )}

          <Textarea
            placeholder="Query message to physician..."
            value={customBody}
            onChange={e => setCustomBody(e.target.value)}
            rows={6}
            className="resize-none"
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSendQuery}
              disabled={sending || !customBody}
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Query
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Phase 7: Analytics Components

**components/analytics/KPICard.tsx:**
```typescript
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  blue: { bg: '#EFF6FF', icon: '#2563EB' },
  amber: { bg: '#FFFBEB', icon: '#D97706' },
  green: { bg: '#F0FDF4', icon: '#16A34A' },
  teal: { bg: '#F0FDFA', icon: '#0D9488' },
}

export function KPICard({ title, value, icon: Icon, trend, trendUp, color = 'teal' }: {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  color?: keyof typeof colorMap
}) {
  const colors = colorMap[color]
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trendUp !== undefined && (
                  trendUp
                    ? <TrendingUp className="w-3 h-3 text-green-500" />
                    : <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className="text-xs text-slate-400">{trend}</span>
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: colors.bg }}>
            <Icon className="w-5 h-5" style={{ color: colors.icon }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**components/analytics/RevenueImpactChart.tsx** (Client Component using Recharts):
```typescript
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'

export function RevenueImpactChart({ organizationId }: { organizationId: string }) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: encounters } = await supabase
        .from('encounters')
        .select('admission_date, revenue_impact')
        .eq('organization_id', organizationId)
        .not('revenue_impact', 'is', null)
        .gte('admission_date', subDays(new Date(), 30).toISOString())

      // Group by week
      const grouped: Record<string, number> = {}
      encounters?.forEach(e => {
        const week = format(new Date(e.admission_date), 'MMM d')
        grouped[week] = (grouped[week] || 0) + (e.revenue_impact || 0)
      })
      setData(Object.entries(grouped).map(([week, revenue]) => ({ week, revenue })))
    }
    fetch()
  }, [organizationId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Impact (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue Impact']} />
            <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## Phase 8: Authentication Pages

**app/(auth)/login/page.tsx:**
```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stethoscope, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sidebar-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ background: 'var(--primary)' }}>
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CDI Platform</h1>
          <p className="text-slate-400 mt-1 text-sm">Clinical Documentation Intelligence</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Sign in to your account</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@hospital.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading} style={{ background: 'var(--primary)', color: 'white' }}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">
            Demo: cdi@demo.com / Demo1234!
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 9: Queries Page

**app/(dashboard)/queries/page.tsx:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { QueryList } from '@/components/queries/QueryList'

export default async function QueriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user!.id).single()

  const query = supabase
    .from('queries')
    .select(`
      *,
      encounters (
        id,
        patients (first_name, last_name, mrn)
      ),
      user_profiles!created_by (full_name),
      user_profiles!assigned_to (full_name)
    `)
    .order('created_at', { ascending: false })

  // Physicians only see their queries
  if (profile?.role === 'physician') {
    query.eq('assigned_to', user!.id)
  }

  const { data: queries } = await query.limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Queries</h1>
        <p className="text-slate-500 mt-1">
          {profile?.role === 'physician' ? 'Queries awaiting your response' : 'All physician queries'}
        </p>
      </div>
      <QueryList queries={queries || []} userRole={profile?.role} />
    </div>
  )
}
```

---

## Phase 10: Final Configuration

**tailwind.config.ts** — Extend with custom fonts:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

**next.config.ts:**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
}

export default nextConfig
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "npx supabase db push",
    "db:seed": "npx supabase db seed"
  }
}
```

---

## Build Order for Claude Code

Execute in this exact sequence:

```
1. npx create-next-app + install all dependencies
2. Configure globals.css (fonts + CSS variables)
3. Set up Supabase clients (client.ts, server.ts, middleware.ts)
4. Set up Anthropic client (lib/ai/anthropic.ts, prompts.ts)
5. Run database migration SQL in Supabase
6. Run seed SQL in Supabase  
7. Create auth pages (login)
8. Create dashboard layout (Sidebar + Header)
9. Create shared components (StatusPill, ICD10Badge, DRGBadge)
10. Create API routes (analyze-document, suggest-codes, generate-query)
11. Create Dashboard overview page + KPICard + charts
12. Create Case Worklist page + CaseWorklist component
13. Create Case Detail page + all sub-components (DocumentViewer, CodeSuggestionPanel, QueryComposer)
14. Create Queries page + QueryList component
15. Create Analytics page
16. Test full flow: Login → View cases → Analyze document → Generate query → Send query
```

---

## Key Behaviors to Verify After Build

- [ ] Login redirects to `/dashboard`, unauthenticated users redirect to `/login`
- [ ] Sidebar highlights active route
- [ ] Case worklist filters by search and CDI status
- [ ] Clicking a case row navigates to `/cases/[id]`
- [ ] "Analyze with AI" button calls Claude API and populates the right panel
- [ ] Documentation gaps show yellow alerts with "Generate Query" buttons
- [ ] Query Composer pre-fills from AI gap data and AI-generates query body
- [ ] Sending a query updates the encounter status and refreshes the page
- [ ] Revenue impact shows in green on case rows and detail view
- [ ] Analytics charts load data from Supabase
- [ ] Row Level Security enforces org isolation (users can't see other org's data)

---

*This plan is complete and self-contained. Hand it to Claude Code with the instruction: "Implement this plan exactly as written, in the build order specified."*
