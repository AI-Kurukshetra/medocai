# medocai MVP — Demo Script

**Total runtime:** ~8–10 minutes
**Format:** Screen recording with voiceover
**Preparation:** Have two browser windows/profiles ready — one logged in as CDI specialist (Sarah Chen), one as physician (Dr. Michael Torres)

---

## SCENE 1 — Landing Page

**[Action: Open browser to `localhost:5500` or your Vercel URL]**

> "This is medocai — an AI-powered clinical documentation improvement platform built for hospitals to capture revenue they're already clinically entitled to but losing due to incomplete documentation."

**[Action: Slowly scroll down the landing page]**

> "CDI specialists use it to find documentation gaps, suggest accurate ICD-10 codes, and communicate with physicians — all in one place. Let me show you the full workflow."

**[Action: Pause on the dashboard mockup screenshot in the hero]**

> "The platform has two roles — the CDI specialist who reviews cases, and the attending physician who documents and responds to queries."

---

## SCENE 2 — CDI Specialist Login

**[Action: Click "Get started" → login page]**

> "Let's start from the CDI specialist's perspective."

**[Action: Log in as Sarah Chen — CDI specialist]**

---

## SCENE 3 — Dashboard

**[Action: Dashboard loads, pause for 2 seconds]**

> "The CDI specialist lands on the overview dashboard. They can see active encounters, pending queries, revenue captured this month, and recently completed cases at a glance."

**[Action: Point to each KPI card]**

> "Every number here is live — it updates as cases move through the workflow."

---

## SCENE 4 — Case Worklist

**[Action: Click "Cases" in the sidebar]**

> "The Case Worklist shows all active patient encounters across the organization. Notice cases are flagged with amber warning icons when documentation gaps have been detected."

**[Action: Point to a row with gaps shown]**

> "The CDI specialist can search by patient name or MRN, and filter by CDI status — unreviewed, in review, queried, or complete."

**[Action: Type a name in the search box, then clear it]**

---

## SCENE 5 — Creating a New Case

**[Action: Click the "New Case" button]**

> "When a new patient is admitted, the CDI specialist creates the case directly in medocai. They enter the patient's details..."

**[Action: Fill in — First Name: "James", Last Name: "Carter", MRN: "MRN-00099", DOB: any past date]**

> "...select the encounter type and department..."

**[Action: Set Encounter Type to "Inpatient", Department to "Cardiology"]**

> "...and assign the attending physician. Notice the admission date and time defaulted to right now."

**[Action: Open the Attending Physician dropdown — select Dr. Michael Torres]**

> "Once the physician is assigned, they'll immediately see this case in their own view."

**[Action: Add admitting diagnosis "Chest pain, shortness of breath", then click "Create Case"]**

> "The case is created and appears in the worklist — status: Unreviewed."

---

## SCENE 6 — Case Detail (CDI View)

**[Action: Click on an existing case that already has documents — e.g. Robert Johnson]**

> "Let's open an existing case that already has clinical documents. The CDI specialist sees the patient header — name, MRN, admission date, attending physician, and current CDI status."

**[Action: Point to the header area]**

> "There's a documents tab, a diagnoses and codes tab, and a queries tab. On the right is the AI analysis panel."

**[Action: Point to the right-side panel with Gaps / Codes / Revenue tabs]**

> "The AI panel has already pre-loaded findings from a previously analyzed document. The Gaps tab is the default — this is what the CDI specialist acts on first."

**[Action: Click through Gaps → Codes → Revenue tabs slowly]**

> "Documentation gaps are the primary action item. Each gap tells the specialist what's missing, why it matters for DRG assignment, and suggests a query to send to the physician."

> "The Codes tab shows AI-suggested ICD-10 codes with confidence scores. The specialist can add them directly to the encounter's diagnosis list."

---

## SCENE 7 — Diagnoses & Codes Tab

**[Action: Click the "Diagnoses & Codes" tab at the top]**

> "The Diagnoses tab shows all codes currently documented on this encounter — including the type, source, and AI confidence score."

**[Action: Scroll through the list if there are entries]**

---

## SCENE 8 — Creating a Physician Query

**[Action: Go back to Documents tab, click "Generate Query" on a gap card in the AI panel]**

> "When the CDI specialist spots a gap — say, heart failure type isn't specified — they click Generate Query. The AI drafts a compliant, evidence-based query following AHIMA guidelines."

**[Action: QueryComposer dialog opens — pause to show the pre-filled subject and body]**

> "The query is pre-written with the clinical rationale and multiple-choice options for the physician to respond to. The specialist can edit it before sending."

**[Action: Click "Send Query"]**

> "Sent. The physician will see this in their portal immediately."

---

## SCENE 9 — Queries Page (CDI View)

**[Action: Click "Queries" in the sidebar]**

> "The Queries page shows everything the CDI specialist has sent — with status, physician response, and whether it was AI-generated."

**[Action: Point to a query card, show the status pill and AI Generated badge]**

---

## SCENE 10 — Switch to Physician View

**[Action: Switch to the second browser window logged in as Dr. Michael Torres]**

> "Now let's switch to the physician's perspective. Dr. Michael Torres logs in and lands directly on his case list — only his assigned patients."

---

## SCENE 11 — Physician Case List

**[Action: Show the "My Cases" page]**

> "The physician sees a clean, focused view — just their patients, no CDI-specific panels or AI analysis. They're not distracted by revenue optimization details."

**[Action: Point out the simpler view vs CDI worklist]**

---

## SCENE 12 — Physician Opens a Case

**[Action: Click on a case — ideally the one just created (James Carter) or Robert Johnson]**

> "The physician opens the case and sees the clinical documents. Notice there's no AI analysis panel on the right — that's CDI's workspace, not the physician's."

**[Action: Point to the full-width document view]**

---

## SCENE 13 — Physician Adds a Document

**[Action: Click "Add Clinical Document"]**

> "This is how new cases get populated. The physician writes their clinical notes directly in medocai."

**[Action: Select document type "Progress Note", type a title "Cardiology Progress Note – Day 2"]**

**[Action: Type or paste the following note in the text area:]**

```
Patient presents with acute chest pain radiating to left arm.
BP 158/94. HR 88. EKG shows ST depression in V4-V6.
BNP elevated at 980 pg/mL. Troponin trending up at 0.8.
Assessment: Likely NSTEMI with possible underlying heart failure.
Plan: Cardiology consult, echo ordered, heparin drip initiated.
```

> "The physician writes their note — this is the clinical documentation that the CDI specialist will then analyze for coding opportunities."

**[Action: Click "Save Document" — document appears in the list]**

---

## SCENE 14 — Physician Responds to a Query

**[Action: Click the "Queries" tab inside the case, or navigate to Queries in sidebar]**

> "The physician also sees queries sent to them by the CDI team."

**[Action: Show a query card with subject and body visible]**

> "The CDI specialist asked for clarification on the heart failure type. The physician reads the query and responds."

**[Action: Click "Agree" or type a response in the response field]**

> "The physician agrees with the suggested diagnosis. This response flows back to the CDI specialist instantly."

---

## SCENE 15 — Back to CDI — Completed Loop

**[Action: Switch back to CDI specialist window, navigate to Queries]**

> "Back on the CDI side — the query now shows the physician's response."

**[Action: Point to the green physician response block on the query card]**

> "The CDI specialist takes the confirmed diagnosis, adds the specific ICD-10 code to the encounter, and the DRG is updated. Revenue is captured."

---

## SCENE 16 — Analytics

**[Action: Click "Analytics" in the sidebar]**

> "Finally, the analytics page gives leadership a real-time view of CDI performance — query response rates, revenue captured over time, and case completion trends."

**[Action: Slowly scroll through the analytics page showing charts]**

---

## SCENE 17 — Closing

**[Action: Return to the landing page]**

> "That's the complete medocai workflow — from patient admission, through AI-assisted gap detection, physician query and response, to final code capture and revenue realization."

> "Built with Next.js, Supabase, and a pluggable AI layer that supports Claude, OpenAI, and Gemini — switchable with a single environment variable."

> "Thank you."

---

## Pre-Demo Checklist

- [ ] Log in as CDI specialist in Window 1, physician in Window 2 (incognito)
- [ ] Ensure at least one case with pre-existing documents exists (Robert Johnson / Mary Williams from seed data)
- [ ] Ensure Dr. Michael Torres is in the physician dropdown
- [ ] Hide browser bookmarks bar for cleaner recording
- [ ] Set browser zoom to 90% so full page is visible
- [ ] Use a screen recorder that captures tab audio if doing voiceover live
- [ ] Keep `.env.local` with `AI_PROVIDER` set but skip clicking "Analyze with AI" — frame it as: *"once the physician submits their note, the CDI specialist can trigger AI analysis — the findings pre-populate the panel you saw earlier"*
