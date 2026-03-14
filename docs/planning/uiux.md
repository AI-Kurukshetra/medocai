# UI/UX Plan (MVP)

## Primary Users
- Physician
- CDI Specialist
- Coder
- Admin

## Core User Flows
1. Physician responds to query
- Entry: Login -> Physician Dashboard
- Actions: Open pending query -> Review note/context -> Respond -> Submit -> Query status becomes Answered/Closed
- Success state: Response recorded, audit entry created, task removed from list

2. CDI reviews documentation gaps and creates query
- Entry: Login -> CDI Queue -> Case Detail
- Actions: Review documents -> Inspect gaps -> Create query from gap -> Send to physician
- Success state: Query status Draft/Sent with evidence link

3. Document ingestion and analysis
- Entry: New document create/upload from Encounter
- Actions: Create/edit note -> Save -> Analysis job triggered -> View analysis results (gaps, suggestions, validation)
- Success state: Analysis status Complete with results panels populated

4. Coder reviews code suggestions
- Entry: Login -> Coder task list (or CDI case detail)
- Actions: Review suggestions -> Accept/Reject -> Decision logged
- Success state: Suggestion status updated with audit trail

5. Admin manages templates
- Entry: Login -> Templates
- Actions: Create/edit template -> Save -> Apply to document
- Success state: Template version stored and applied to note

## Page List (MVP)
- Auth: Login
- Shared: App shell, role switch (dev only), not-found, error
- Physician
- `Dashboard /physician`
- `Query Detail /queries/:id`
- CDI
- `CDI Queue /cdi`
- `CDI Case Detail /cdi/cases/:id`
- Coder
- `Coder Tasks /coder`
- `Suggestion Review /suggestions/:id`
- Admin
- `Templates /templates`
- `Template Editor /templates/:id`
- Clinical
- `Encounter Detail /encounters/:id`
- `Document Editor /documents/:id`
- Analytics
- `Revenue Impact /analytics/revenue`
- Compliance
- `Compliance Checklist /compliance/:encounter_id`
- Audit
- `Audit Timeline /audit`

## Information Architecture Notes
- Primary navigation is role-aware with clear section labels: Physician, CDI, Coder, Admin, Analytics, Compliance, Audit.
- Encounter is the anchor entity; case details aggregate documents, gaps, queries, codes, validation, DRG impact.
- Documents are the authoring surface; analysis outputs appear as panels on the right rail.

## Key Screens (Wireframe Notes)
1. Physician Dashboard
- KPI strip: pending queries, suggestions, average response time
- Task list with filters: status, specialty, due date
- Primary action: open query

2. CDI Case Detail
- Left: patient/encounter summary + document list
- Center: document viewer with highlights
- Right rail: tabs for Gaps, Queries, Suggestions, Validation, DRG
- Inline actions: create query, assign severity, add note

3. Document Editor
- Header: encounter meta, save status, analysis status
- Main: rich text editor with section outline
- Right rail: analysis results with evidence chips linking to text

4. Query Detail
- Query text with neutral tone checker badge
- Suggested response options
- Timeline of status changes and audit

5. Templates
- Library table with specialty, version, last updated
- Template editor with section builder

## Component Inventory
- App shell: sidebar nav, top bar, role badge, notifications
- Data display: KPI cards, status badges, evidence chips, tags
- Lists: task list, document list, gap list, suggestion list
- Tables: templates, audits, analytics
- Editors: document editor, template editor, query composer
- Panels: right-rail analysis panels, detail drawer
- Forms: query response, suggestion decision, compliance checklist
- Feedback: toasts, empty states, loading skeletons, error banners
- Charts: simple bar/line for revenue impact

## Visual Direction
- Theme: Clinical precision with warm, human clarity
- Palette
- Base: off-white with subtle warm gray
- Accent: deep teal for primary actions
- Secondary: amber for warnings/gaps, slate for neutral
- Typography
- Headlines: "Instrument Serif" for authority
- Body: "IBM Plex Sans" for readability
- Monospace: "IBM Plex Mono" for codes and audit IDs
- Layout
- Strong grid with generous white space
- Right-rail panels for analysis context
- Motion
- Page load fade-in with slight upward motion
- Staggered list reveal for task lists
- Hover emphasis on evidence chips and linked text

## Accessibility and Responsiveness
- Contrast targets: WCAG AA for text and key UI elements
- Keyboard-first navigation for queues and editors
- Responsive behavior: collapse right rail into accordion on mobile; tables become cards

## Risks and Assumptions
- Assumes role-based navigation and access are enforced in app shell.
- Assumes analysis results are available within <30 seconds; UI includes visible status and retry.
- Assumes synthetic demo data is clearly labeled to avoid confusion in demos.

## Dependencies
- Requires data model for documents, gaps, queries, suggestions, validation, DRG.
- Requires analysis status and audit timeline endpoints for detail pages.
