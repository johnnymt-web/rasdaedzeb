# Data Processing Register — AI Sub-processors

**Product:** Pathfinder (Super Riasec) · **Controller:** the School · **Processor:** Pathfinder
**Audience:** students aged ~12–18 (minors) · **Last updated:** 2026-06-18

This register documents every transfer of student data to a third-party AI sub-processor,
the data minimised in each case, and the lawful basis. AI features are **default-deny**:
no student data is sent to any sub-processor until parental/guardian consent (or admin
school-attestation) is recorded (`ai_processing_consent`).

## Sub-processors

| Sub-processor | Purpose | Data sent (minimised) | Identifiers sent |
|---|---|---|---|
| **Anthropic** | Deep synthesis report (`generate-synthesis`) | Psychometric scores + grade **band** | None — no name/email/school/exact grade |
| **OpenAI** | Parent insight (`generate-parent-insight`) | Assessment types + scores | **Name withheld** (fixed 2026-06-18) |
| **OpenAI** | Student report Q&A (`career-coach`) | Pseudonymous report context + the student's own chat | None (report is pseudonymous) |
| **OpenAI** | Career title translation (`localize-careers`) | Occupation title strings only | None |
| **Lovable AI gateway** | Counselor/parent/admin copilots (`*-coach`, `admin-insights`) | Staff-typed chat messages (free-text) | ⚠️ whatever the staff member types — guidance: use initials, not names |
| **O*NET (onet-proxy)** | Occupation reference data | Occupation queries | None |

## Lawful basis & consent
- **Basis:** parental/guardian consent, obtained by the School (controller) at enrolment;
  recorded per-student and revocable (`ai_processing_consent`, default-deny).
- **Granularity:** assessments and reports function without AI consent; only third-party
  AI generation is gated.
- **Withdrawal:** setting `withdrawn_at` immediately disables AI processing for that student.

## Data minimisation principles
1. Send the **minimum** required — scores + grade band; never email, school, or exact DOB.
2. **No real names** to third-party AI (parent-insight fixed; coaches mitigated by UI guidance).
3. Reports passed to AI are **pseudonymous**.
4. `ai_logs.prompt_summary` free-text retention should be redacted/short (C4, pending).

## Outstanding (owner actions)
- [ ] Sign **DPAs** with Anthropic, OpenAI, and the Lovable gateway provider.
- [ ] Legal review of jurisdiction (EU GDPR + Georgia) and consenting-age threshold.
- [ ] Publish a public **privacy policy** referencing this register.
- [ ] Apply the `ai_processing_consent` migration to production (after staging review).
