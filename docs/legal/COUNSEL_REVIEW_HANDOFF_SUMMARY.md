# Legal Counsel Handoff Summary

> **Not legal advice.**
> **DRAFT — requires review by qualified legal counsel before use.**
> This document is an **engineering/operational handoff for legal review and school review**.
> **Nothing in this document approves real student onboarding or PR #14 merge/go-live.**

> Repo state at authoring: `main = 55b218f`. The draft Legal/Policy Foundation Pack lives in
> `docs/legal/` (all DRAFT). The consent **technical** layer is CI-green on **PR #14** but is
> **verification-only and must not be merged**. Real student onboarding remains blocked by the
> legal/policy decisions below and a separate, gated technical go-live.

---

## 1. Executive summary
- **What the platform does:** Pathfinder ("Super Riasec") is a **school-based career-development
  ecosystem for grades 7–12** (primary audience: Georgian-speaking). Students complete psychometric/
  career instruments (RIASEC, Employability Skills, Big Five, CAAS, Work Values, EQ); the system
  produces **age-appropriate, non-deterministic** career guidance, including **AI-generated
  interpretation** via third-party AI providers, with role-based access for students, parents,
  counselors, and school admins.
- **Why minors' data protection matters:** the data subjects are **minors (~12–18)**; the data
  includes **identity/PII** and **psychometric results**, some of which is sent (minimized) to
  **third-party AI sub-processors** (incl. US-based). This is sensitive, high-accountability
  processing of children's data.
- **Why legal review is required before onboarding:** the platform's *model* is implemented in code
  (school = controller, Pathfinder = processor; default-deny AI consent; sub-processor register),
  but the **binding legal instruments and decisions do not yet exist in approved form** (DPA, lawful
  basis, consent/assent, privacy notice, retention, DSAR, sub-processor DPAs, transfer mechanism).
  Onboarding real students before these are decided and signed would create legal and child-
  safeguarding risk.

## 2. Documents ready for counsel review (`docs/legal/`, all DRAFT)
| # | File | Purpose |
|---|---|---|
| 1 | [README.md](README.md) | Index + consolidated open legal decisions; how to read placeholder markers. |
| 2 | [SCHOOL_DPA_OUTLINE.md](SCHOOL_DPA_OUTLINE.md) | Controller/processor agreement outline: scope, data categories, sub-processors, security (TOMs), breach, deletion/return, audit. |
| 3 | [PARENTAL_CONSENT_FORM_DRAFT.md](PARENTAL_CONSENT_FORM_DRAFT.md) | Parental/guardian consent for AI processing: what/why, AI meaning, right to refuse, withdrawal, verification. |
| 4 | [STUDENT_ASSENT_TEXT_DRAFT.md](STUDENT_ASSENT_TEXT_DRAFT.md) | Age-appropriate student assent: what the platform does / does not do; rights & support. |
| 5 | [PRIVACY_NOTICE_KA_DRAFT.md](PRIVACY_NOTICE_KA_DRAFT.md) | Public privacy notice — **Georgian** (authoritative for primary audience). |
| 6 | [PRIVACY_NOTICE_EN_DRAFT.md](PRIVACY_NOTICE_EN_DRAFT.md) | Public privacy notice — **English** (kept in sync with KA). |
| 7 | [ASSESSMENT_DISCLAIMER_DRAFT.md](ASSESSMENT_DISCLAIMER_DRAFT.md) | "Career-guidance tool only, not clinical/diagnostic; results exploratory; discuss with counselor/parent." |
| 8 | [RETENTION_SCHEDULE_DRAFT.md](RETENTION_SCHEDULE_DRAFT.md) | Retention options + delete/anonymize triggers; periods left for decision. |
| 9 | [DSAR_EXPORT_DELETE_PROCEDURE_DRAFT.md](DSAR_EXPORT_DELETE_PROCEDURE_DRAFT.md) | Data-subject access/export/delete; parent-on-behalf-of-minor; verification; timelines. |
| 10 | [SUB_PROCESSOR_REGISTER_DRAFT.md](SUB_PROCESSOR_REGISTER_DRAFT.md) | Sub-processors (Supabase, Vercel, OpenAI, Anthropic, Lovable gateway, O*NET) + DPA/transfer status. |
| 11 | [PILOT_GATE_CHECKLIST.md](PILOT_GATE_CHECKLIST.md) | The onboarding gate: must-clear-before vs after-internal-testing vs legal-review items. |

*Consent **versioning/audit** is embedded as a `§9`/acknowledgment section across the consent,
assent, and disclaimer drafts (plus a flagged technical gap); it is not a standalone file.*

## 3. Open legal decisions (for counsel + School)
| Decision | Status / placeholder |
|---|---|
| **Applicable law / jurisdiction** | Law of Georgia on Personal Data Protection; **GDPR** if any EU/EEA students. `[[governing law]]` |
| **Controller/processor model** | Proposed: School = controller, Pathfinder = processor — **confirm**. |
| **Lawful basis** | Parental consent vs School public-task/legitimate-interest. `[[lawful basis]]` |
| **Parental consent vs school authorization** | Which is primary; whether both required. |
| **Student assent threshold** | Age + whether assent is required in addition to parental consent. `[[age]]` |
| **Psychometric / sensitive-data classification** | Is psychometric minor data special-category here? |
| **International transfer mechanism** | For US sub-processors (OpenAI/Anthropic) + hosting regions. `[[mechanism]]` |
| **Retention periods** | Per data category + `ai_logs`. `[[periods]]` |
| **DSAR/export/delete timeline** | Response SLA + deletion exemptions. `[[timeline]]` |
| **Sub-processor DPAs** | Sign with Supabase, Vercel, OpenAI, Anthropic, Lovable gateway; confirm O*NET. |
| **Staff-copilot gating** | Whether counselor/parent/admin copilots (staff free-text) need a consent gate or documented interim mitigation. |

## 4. Pilot blockers
- **Must be legally approved BEFORE real onboarding:** jurisdiction + lawful basis · signed **school
  DPA** + sub-processor DPAs · published **privacy notice (ka/en)** · final **parental consent** +
  verification · **student assent** (if required) · **assessment disclaimer** · **retention periods**
  · **DSAR** procedure + timelines · transfer mechanism · special-category determination.
- **Can remain draft/internal until after legal review:** UX polish of consent screens; retention
  **automation** hardening; export-format niceties; staff-copilot gating *implementation* (decision first).
- **Cannot be activated yet:** consent **technical go-live** (migration apply, gate enforcement live,
  merge of PR #14); any real student onboarding; sending real students' data to AI without recorded consent.

## 5. Technical dependencies gated on legal decisions
| Technical item | Depends on | Status |
|---|---|---|
| **PR #14** (consent technical layer) | lawful basis + DPAs + notice | CI-green but **must not merge** until legal go |
| **Consent versioning/audit** (notice/form version + disclaimer ack + withdrawal history) | consent form/notice finalized | gap → `feat/consent-versioning-audit` |
| **DSAR export/delete** | DSAR procedure + timelines | delete exists; **export not built** → `feat/dsar-export-delete` |
| **Retention automation** | decided retention periods/triggers | not built → `chore/retention-automation` |
| **Go-live deploy ordering** | all above approved | **migration → regen types → remove `any` casts → functions → frontend → verify → pilot** |

## 6. Questions for counsel / School (checklist)
- [ ] Which law(s) govern (Georgia PDP only, or GDPR too if EU students)?
- [ ] Is the **controller (School) / processor (Pathfinder)** model correct?
- [ ] What is the **lawful basis** for processing minors' data and for AI processing specifically?
- [ ] What is the **consenting age** and is **student assent** separately required?
- [ ] Is psychometric/personality data on minors **special-category/sensitive** here?
- [ ] What **international-transfer mechanism** is acceptable for US sub-processors?
- [ ] What **retention periods** apply per data category (incl. `ai_logs`)?
- [ ] What **DSAR response timeline** and **deletion exemptions** apply?
- [ ] What **verifiable parental consent** method does the School accept?
- [ ] Should consent be **granular** (assessment vs AI interpretation)?
- [ ] Do **staff copilots** (counselor/parent/admin) require a consent gate?
- [ ] What **breach-notification timeline** must the DPA specify?
- [ ] Which **sub-processor DPAs** must be signed, and who signs them?
- [ ] Who is the **point of contact / DPO**?

## 7. Recommended next actions
1. **Owner + legal/School review** of the `docs/legal/` pack; answer §3 decisions and the §6 checklist.
2. **Update the drafts** based on legal feedback (fill `[[PLACEHOLDER]]`s; finalize wording; sign DPAs) — a docs-only follow-up.
3. **Only then** plan the **gated technical consent go-live** (PR #14 follow-through + consent
   versioning + DSAR export + retention automation), in the deploy order above, each individually approved.
4. **Then** a small real-user pilot + re-run the real-user monitoring.

## 8. Closing note
This is **not legal advice**. Every document in `docs/legal/` (including this summary) is **DRAFT and
requires review by qualified legal counsel** before use. **Nothing here approves real student
onboarding, nor the merge/go-live of PR #14.** No legal conclusion stated here is final.
