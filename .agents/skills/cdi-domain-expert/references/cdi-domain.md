# CDI Domain Reference

## Glossary (Plain English)

- Clinical documentation: The written record of patient care (notes, summaries, orders).
- CDI (Clinical Documentation Improvement): Ensures documentation is complete, specific, and compliant for coding and quality.
- Coding: Translating documentation into standardized billing/quality codes.
- ICD-10/11: Diagnosis code systems.
- CPT/HCPCS: Procedure/service codes (often outpatient).
- DRG: Inpatient payment grouping driven by diagnoses/procedures.
- Query: Formal request to a physician to clarify documentation.
- Denial: Payer refuses or reduces payment due to insufficient documentation.
- Audit trail: Evidence of who changed what and why, for compliance.

## Typical CDI Workflow

1. Clinician writes documentation.
2. CDI system analyzes the text in real time.
3. Gaps are identified (missing specificity, conflicting info).
4. Query is generated and routed to the physician.
5. Physician responds/clarifies in the record.
6. Coder assigns final codes and DRG.
7. Analytics track revenue impact, quality metrics, and query turnaround.

## Common Documentation Gaps (Examples)

- Diagnosis lacks specificity: “pneumonia” vs “aspiration pneumonia”.
- Severity missing: “heart failure” without acute/chronic or systolic/diastolic.
- Clinical validation not documented: diagnosis without supporting labs or findings.
- Cause not documented: “acute kidney injury” without etiology.

## Query Best Practices (Product Implications)

- Be neutral and non-leading.
- Ask for clarification, not conclusions.
- Provide limited, clinically plausible options.
- Track response status and timestamps.

## Key Data Elements to Capture

- Encounter metadata (admit/discharge dates, facility, department).
- Clinical document metadata (author, timestamp, note type).
- Diagnoses and procedures (raw text + coded).
- Evidence links (labs, vitals, imaging references).
- Query lifecycle (trigger, sent, response, closed).
- Audit log (who changed what, when, and why).
- Revenue impact attribution (before/after coding delta).

## Compliance and PHI

- Treat all clinical notes as PHI.
- Minimum necessary access for roles (physician, CDI, coder, admin).
- Immutable audit log for documentation changes and queries.
- Avoid automated clinical decision-making claims; this is documentation support.

## UX Considerations for Non-Clinicians

- Use plain-language labels with tooltips for clinical terms.
- Provide examples and “why this matters” for each query.
- Keep physician workflow low-friction: quick accept/clarify actions.
