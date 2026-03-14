# Neutral Query Templates + Gap-to-Query Mappings

## Restated In CDI Terms
Provide compliant, neutral query templates that map common documentation gaps to clarification requests, with examples for Cardiology, Pulmonology, and Hospital Medicine. Queries must be non-leading, auditable, and include an "unable to determine" option.

## Plain-English Guidance
Queries should ask the clinician to clarify existing documentation when it is ambiguous or incomplete for coding/quality. The query must not suggest a diagnosis; it should ask for specificity or supporting evidence already present in the record.

## Product Implications
- Store query template ID, gap type, trigger reason, and evidence links.
- Always include a free-text response option and an "unable to determine" option.
- Surface "why this is being asked" to keep the request transparent.
- Track lifecycle status and timestamps for auditability.

## Compliance / PHI Notes
- Queries must be neutral and non-leading.
- Do not ask clinicians to create new diagnoses without documentation in the record.
- Keep an immutable audit trail for query creation, sending, and response.

---

# Gap-to-Query Mappings (Generic)

## 1) Diagnosis Specificity Missing
**Gap**: Diagnosis documented but lacks required specificity.
**Trigger**: General diagnosis without type/etiology/organism.
**Neutral Template**:
"Based on the current documentation, can you clarify the specific type or etiology of [DIAGNOSIS] for this encounter?"
**Suggested Options** (examples):
- "Specify: [type/etiology]"
- "Not applicable"
- "Unable to determine"
- "Other (free text)"

## 2) Severity / Acuity Missing
**Gap**: Diagnosis documented without acuity/severity.
**Trigger**: Terms like "heart failure" without acute/chronic or stage.
**Neutral Template**:
"For [DIAGNOSIS], can you clarify the acuity or severity as supported by the record?"
**Suggested Options**:
- "Acute"
- "Chronic"
- "Acute on chronic"
- "Unable to determine"
- "Other (free text)"

## 3) Etiology / Cause Missing
**Gap**: Condition documented without cause.
**Trigger**: "AKI" without etiology; "respiratory failure" without underlying cause.
**Neutral Template**:
"Is there a documented etiology or contributing factor for [CONDITION] in this encounter?"
**Suggested Options**:
- "Documented etiology: [free text]"
- "No documented etiology"
- "Unable to determine"

## 4) Clinical Validation Gap
**Gap**: Diagnosis documented without supporting evidence.
**Trigger**: Diagnosis present but no linked labs/vitals/imaging/findings.
**Neutral Template**:
"Can you confirm whether the diagnosis of [DIAGNOSIS] is supported by findings in the record (e.g., labs, imaging, exam)?"
**Suggested Options**:
- "Supported by: [free text evidence]"
- "Not supported"
- "Unable to determine"

## 5) Conflicting Documentation
**Gap**: Two notes disagree on diagnosis/status.
**Trigger**: Conflicting terms across notes (e.g., "ruled out" vs "confirmed").
**Neutral Template**:
"The record contains differing documentation regarding [DIAGNOSIS]. Can you clarify the final status for this encounter?"
**Suggested Options**:
- "Confirmed"
- "Ruled out"
- "Still under evaluation"
- "Unable to determine"

## 6) Ambiguous Language
**Gap**: "Possible", "likely", "rule out" without clarification.
**Trigger**: Ambiguity in assessment/plan.
**Neutral Template**:
"The documentation describes [DIAGNOSIS] as [AMBIGUOUS_TERM]. Can you clarify the final status during this encounter?"
**Suggested Options**:
- "Confirmed"
- "Ruled out"
- "Unable to determine"
- "Other (free text)"

## 7) Procedure Indication Missing
**Gap**: Procedure documented without medical necessity/indication.
**Trigger**: Procedure listed without clinical rationale.
**Neutral Template**:
"For the documented procedure [PROCEDURE], can you clarify the clinical indication as supported by the record?"
**Suggested Options**:
- "Indication: [free text]"
- "Not documented"
- "Unable to determine"

---

# Specialty Examples (Neutral, Non-Leading)

## Cardiology

### A) Heart Failure Specificity
**Gap**: "Heart failure" without acuity/type.
**Query**:
"For the documented heart failure, can you clarify the acuity and type as supported by the record?"
**Options**:
- "Acute systolic"
- "Chronic systolic"
- "Acute on chronic systolic"
- "Acute diastolic"
- "Chronic diastolic"
- "Acute on chronic diastolic"
- "Unable to determine"
- "Other (free text)"

### B) Myocardial Infarction Type
**Gap**: "MI" documented without type.
**Query**:
"For the documented myocardial infarction, can you clarify the type based on the record?"
**Options**:
- "STEMI"
- "NSTEMI"
- "Type 2 MI"
- "Unable to determine"
- "Other (free text)"

### C) Chest Pain Etiology
**Gap**: Chest pain documented without cause.
**Query**:
"Is there a documented etiology for the chest pain during this encounter?"
**Options**:
- "Cardiac etiology documented: [free text]"
- "Non-cardiac etiology documented: [free text]"
- "No documented etiology"
- "Unable to determine"

## Pulmonology

### A) Pneumonia Type
**Gap**: "Pneumonia" without type.
**Query**:
"For the documented pneumonia, can you clarify the type or etiology based on the record?"
**Options**:
- "Aspiration"
- "Bacterial"
- "Viral"
- "Hospital-acquired"
- "Community-acquired"
- "Unable to determine"
- "Other (free text)"

### B) Respiratory Failure Acuity
**Gap**: "Respiratory failure" without acuity.
**Query**:
"For the documented respiratory failure, can you clarify the acuity as supported by the record?"
**Options**:
- "Acute"
- "Chronic"
- "Acute on chronic"
- "Unable to determine"
- "Other (free text)"

### C) COPD Exacerbation Status
**Gap**: COPD mentioned without whether exacerbation.
**Query**:
"For COPD in this encounter, can you clarify whether there was an acute exacerbation?"
**Options**:
- "Acute exacerbation"
- "No acute exacerbation documented"
- "Unable to determine"
- "Other (free text)"

## Hospital Medicine (General Inpatient)

### A) Sepsis Status
**Gap**: Sepsis terminology ambiguous or conflicting.
**Query**:
"The record references sepsis-related terms. Can you clarify the final status during this encounter?"
**Options**:
- "Sepsis confirmed"
- "Sepsis ruled out"
- "Still under evaluation"
- "Unable to determine"
- "Other (free text)"

### B) Acute Kidney Injury (AKI) Etiology
**Gap**: AKI documented without cause.
**Query**:
"Is there a documented etiology or contributing factor for acute kidney injury in this encounter?"
**Options**:
- "Etiology documented: [free text]"
- "No documented etiology"
- "Unable to determine"

### C) Encephalopathy Type
**Gap**: "Encephalopathy" without type.
**Query**:
"For the documented encephalopathy, can you clarify the type based on the record?"
**Options**:
- "Metabolic"
- "Toxic"
- "Infectious"
- "Other (free text)"
- "Unable to determine"

---

# Audit Fields to Capture (For Each Query)
- `gap_type`
- `trigger_reason`
- `evidence_links` (labs/vitals/imaging/text spans)
- `template_id`
- `options_presented`
- `created_by`, `sent_by`, `responded_by`
- `timestamps` for draft/sent/answered/closed

## Assumptions & Dependencies
- US inpatient CDI context.
- All data is synthetic/de-identified for NLP.
- Final coding rules validated by certified coder or compliance lead.
