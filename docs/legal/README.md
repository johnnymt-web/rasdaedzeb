# Legal/Policy Foundation Pack — Index

> **DRAFT — requires review by qualified legal counsel before use.**
> **Not legal advice.** These documents are engineering/operational drafts and placeholders
> prepared to *structure* the legal review. They must be reviewed, completed, and approved by
> qualified counsel (and, where applicable, the School as data controller) **before any real
> student onboarding**. Do not publish, sign, or rely on any document here in its current state.

## Purpose
Assemble, in one place, every legal/policy artifact required **before real student onboarding** of
the Pathfinder (Super Riasec) platform — a school-based career-development ecosystem for **minors
(grades 7–12)** that processes psychometric data and sends minimized data to third-party AI
sub-processors. The platform model is **School = data controller, Pathfinder = data processor**.

## Documents in this pack
| # | File | Covers |
|---|---|---|
| 1 | [SCHOOL_DPA_OUTLINE.md](SCHOOL_DPA_OUTLINE.md) | Controller/processor agreement (school ⇄ Pathfinder) |
| 2 | [PARENTAL_CONSENT_FORM_DRAFT.md](PARENTAL_CONSENT_FORM_DRAFT.md) | Parental/guardian consent for AI processing |
| 3 | [STUDENT_ASSENT_TEXT_DRAFT.md](STUDENT_ASSENT_TEXT_DRAFT.md) | Age-appropriate student assent |
| 4 | [PRIVACY_NOTICE_KA_DRAFT.md](PRIVACY_NOTICE_KA_DRAFT.md) · [PRIVACY_NOTICE_EN_DRAFT.md](PRIVACY_NOTICE_EN_DRAFT.md) | Public privacy notice (ka + en) |
| 5 | [ASSESSMENT_DISCLAIMER_DRAFT.md](ASSESSMENT_DISCLAIMER_DRAFT.md) | Guidance-tool, not-diagnosis disclaimer |
| 6 | [RETENTION_SCHEDULE_DRAFT.md](RETENTION_SCHEDULE_DRAFT.md) | Retention options + decision points |
| 7 | [DSAR_EXPORT_DELETE_PROCEDURE_DRAFT.md](DSAR_EXPORT_DELETE_PROCEDURE_DRAFT.md) | Data-subject access / export / delete |
| 8 | [SUB_PROCESSOR_REGISTER_DRAFT.md](SUB_PROCESSOR_REGISTER_DRAFT.md) | Sub-processors + DPA/transfer status |
| 9 | (consent versioning) | Covered in §9 of each consent doc + `ai_processing_consent` schema |
| 10 | [PILOT_GATE_CHECKLIST.md](PILOT_GATE_CHECKLIST.md) | What must clear before onboarding |

## How to read the markers
- **`⚖️ LEGAL DECISION`** — a question only qualified counsel (and/or the School) can answer. Left as a placeholder.
- **`[[PLACEHOLDER: …]]`** — a value to be filled after the legal decision is made.
- **`ⓘ`** — engineering note / current technical reality (verifiable in the codebase).

## Open legal decisions that gate the whole pack
1. **⚖️ Applicable law / jurisdiction** — Law of Georgia on Personal Data Protection; **GDPR** if any EU/EEA students. `[[PLACEHOLDER: governing law]]`
2. **⚖️ Lawful basis** — parental consent vs the School's public-task/legitimate-interest. `[[PLACEHOLDER: lawful basis]]`
3. **⚖️ Consenting age / student assent threshold.** `[[PLACEHOLDER: age]]`
4. **⚖️ International-transfer mechanism** for US-based AI sub-processors. `[[PLACEHOLDER: transfer mechanism]]`
5. **⚖️ Retention periods.** `[[PLACEHOLDER: periods]]`
6. **⚖️ Special-category / sensitive-data classification** of psychometric minor data.
7. **⚖️ Sub-processor DPAs** signed (Supabase, Vercel, OpenAI, Anthropic, Lovable gateway).
8. **⚖️ Breach-notification timelines.** `[[PLACEHOLDER: timeline]]`
9. **⚖️ DSAR response timelines.** `[[PLACEHOLDER: timeline]]`

## Status
- **Stage:** skeleton/draft for legal review. **Nothing here is finalized or in force.**
- **Related technical state:** the consent *technical* layer is rebased + CI-green on PR #14 (verification only, **not live**); see `docs/CURRENT_PROJECT_STATUS.md`.
- **Source structure:** the Legal/Policy Foundation Pack report (session 2026-06-20).
