# CDI Domain Notes (Actionable for Product + Data Model)

## Restated In CDI Terms
We need an MVP CDI platform that captures documentation gaps, generates neutral queries, supports coder review, and tracks audit/compliance and revenue impact for inpatient encounters. The system should operate on synthetic/de-identified data only and keep a defensible audit trail.

## Key CDI Workflows (MVP)
1. Clinician creates or uploads a clinical note tied to an encounter.
2. System analyzes the note, identifies documentation gaps, and stores evidence.
3. CDI specialist reviews gaps, prioritizes, and generates neutral queries.
4. Physician responds; the query is updated to closed with timestamps.
5. Coder reviews documentation and accepts/rejects code suggestions.
6. Analytics track query turnaround and revenue impact deltas.

## Common Documentation Gaps to Detect
- Diagnosis specificity missing (e.g., pneumonia type, CHF type).
- Severity/acuity missing (acute vs chronic, stage/grade).
- Etiology/cause missing (e.g., AKI cause).
- Clinical validation gaps (diagnosis stated without evidence).
- Conflicting documentation (two notes disagree on diagnosis or status).

## Query Triggers (When to Ask)
- A diagnosis is present but lacks required specificity for coding.
- A diagnosis appears without supporting evidence (labs/vitals/imaging references).
- Note text contains ambiguous terms ("possible", "rule out", "likely") without clarification.
- Documentation conflicts across notes within the same encounter.
- Missing linkage between procedures and indications.

## Required Data Fields (Product + Data Model)
### Core Context
- Organization/facility/department
- Encounter: admit/discharge dates, service line, attending physician
- Patient: identifiers (synthetic), demographics

### Clinical Documents
- Document metadata: author, timestamp, note type, version
- Document text (or sections) with `is_demo` and `data_source`

### Gaps + Evidence
- Gap record: type, severity, reason, referenced document
- Evidence links: labs/vitals/imaging references or textual spans
- Status + assignee (CDI reviewer)

### Queries
- Query content (neutral template), trigger reason, suggested options
- Lifecycle: draft/sent/answered/closed with timestamps
- Response content and responder

### Coding + Validation
- Diagnosis/procedure codes (suggested + accepted)
- Validation checks: diagnosis-to-evidence links and results
- DRG recommendation (before/after, rationale)

### Compliance + Audit
- Audit log: who changed what, when, and why
- PHI guardrails: enforce demo-only for OpenAI calls

### Analytics
- Revenue impact: delta attributable to documentation improvement
- Quality metrics: query turnaround, response rate, denial risk

## Compliance / PHI Constraints
- Treat all clinical notes as PHI; enforce least-privilege access by role.
- OpenAI calls must be blocked unless `is_demo=true` and `data_source` is `synthetic` or `deidentified`.
- Audit trail is immutable for documentation changes and queries.

## Product Implications
- Queries must be neutral and non-leading; provide limited options.
- Use plain language labels with tooltips for clinical terms.
- Preserve evidence links to make queries and validations defensible.

## Assumptions & Dependencies
- US inpatient CDI workflows only.
- Synthetic/de-identified notes for all NLP/analysis.
- Roles: physician, CDI, coder, admin with least-privilege access.
- Data model must support audit logging and query lifecycle.

## Risks / Missing Info
- Payer-specific documentation rules not defined; validate with certified coders if needed.
- Specific coding guidelines (ICD-10/11) require scope clarification.
