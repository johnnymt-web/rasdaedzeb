# School Data-Processing Agreement (DPA) — Outline

> **DRAFT — requires review by qualified legal counsel before use.** Not legal advice.
> This is a structural outline to guide counsel in drafting a binding DPA between the School
> (controller) and Pathfinder (processor). Bracketed `[[PLACEHOLDER]]` and `⚖️ LEGAL DECISION`
> markers indicate content that counsel/the School must supply.

## 0. Parties & roles
- **Controller:** the School — `[[PLACEHOLDER: school legal name, address, representative]]`.
- **Processor:** Pathfinder (Super Riasec) — `[[PLACEHOLDER: legal entity, address, representative]]`.
- **Model:** School = **data controller**; Pathfinder = **data processor** acting only on the
  School's documented instructions. **⚖️ LEGAL DECISION:** confirm this model is correct under the
  applicable law (`[[PLACEHOLDER: governing law]]`).

## 1. Subject-matter, duration, nature & purpose
- **Purpose:** developmental career guidance for enrolled students (grades 7–12).
- **Duration:** term of the service agreement; survival of deletion/return clauses.
- **Nature:** collection, storage, scoring, AI-assisted interpretation, role-based access.

## 2. Categories of data subjects & data
- **Data subjects:** students (minors ~12–18), parents/guardians, school staff (counselors/admins).
- **Data categories** (ⓘ current schema): identity/PII (name, grade, school, email/login, language,
  parent/counselor links); psychometric (answers + results: RIASEC, Employability Skills, Big Five,
  CAAS, Work Values, EQ); AI-generated interpretations + `ai_logs`.
- **⚖️ LEGAL DECISION:** special-category/sensitive classification of psychometric minor data.

## 3. Processor obligations
- Process only on documented instructions; confidentiality of personnel; assist controller with
  data-subject requests (DSAR — see DSAR procedure) and with security/breach/DPIA obligations.

## 4. Sub-processors
- **General/specific authorization** model + **change-notification** to the School.
- Current list + flow-down obligations → see `SUB_PROCESSOR_REGISTER_DRAFT.md`.
- **⚖️ LEGAL DECISION:** authorization model; objection window.

## 5. Security measures (TOMs)
- ⓘ Current technical controls: Row-Level Security on all public tables; least-privilege app roles;
  service-role key server-side only (never to frontend); provider/API keys server-side only;
  scores recomputed server-side (tamper-resistant); access/audit logging.
- **⚖️ LEGAL DECISION:** whether these TOMs are sufficient for minors' data; additional controls.
- `[[PLACEHOLDER: encryption-at-rest / hosting-region commitments from sub-processors]]`

## 6. Personal-data breach notification
- Processor notifies controller **without undue delay** after becoming aware; required content
  (nature, categories/approx. numbers, likely consequences, measures taken).
- **⚖️ LEGAL DECISION / `[[PLACEHOLDER: notification timeline]]`** (e.g. within N hours).

## 7. Deletion / return of data
- On termination: return or delete personal data at the School's choice; delete existing copies
  unless law requires retention; flow-down to sub-processors.
- Ties to `RETENTION_SCHEDULE_DRAFT.md`.

## 8. Audit & accountability
- Records of processing (controller + processor); audit/inspection rights; cooperation with
  supervisory authority; **point of contact / DPO** `[[PLACEHOLDER]]`.

## 9. International transfers
- US-based AI sub-processors (OpenAI/Anthropic) + hosting (Supabase/Vercel — `[[PLACEHOLDER: regions]]`).
- **⚖️ LEGAL DECISION / `[[PLACEHOLDER: transfer mechanism]]`** (e.g. SCCs/adequacy/other).

## 10. Liability, governing law, signatures
- `[[PLACEHOLDER: liability, indemnity]]` · **⚖️ governing law** `[[PLACEHOLDER]]` · signature blocks.
