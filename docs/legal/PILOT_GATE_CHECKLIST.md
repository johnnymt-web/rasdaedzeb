# Pilot Gate Checklist — Real Student Onboarding

> **DRAFT — requires review by qualified legal counsel before use.** Not legal advice.
> The gate that must be satisfied before onboarding **any real student**. Each ⚖️ item requires
> legal review/sign-off. This checklist is itself the onboarding gate.

## A. MUST be complete BEFORE real onboarding (hard blockers)
- [ ] **⚖️ Jurisdiction + lawful basis** decided (`[[governing law]]`, `[[lawful basis]]`, `[[consenting age]]`).
- [ ] **⚖️ School DPA signed** (controller/processor) — `SCHOOL_DPA_OUTLINE.md`.
- [ ] **⚖️ Sub-processor DPAs** signed + transfer mechanism set — `SUB_PROCESSOR_REGISTER_DRAFT.md`.
- [ ] **⚖️ Privacy notice published (ka + en)** — `PRIVACY_NOTICE_*_DRAFT.md`.
- [ ] **⚖️ Parental consent form** finalized + verification method — `PARENTAL_CONSENT_FORM_DRAFT.md`.
- [ ] **⚖️ Student assent text** finalized (if required) — `STUDENT_ASSENT_TEXT_DRAFT.md`.
- [ ] **⚖️ Assessment disclaimer** finalized + acknowledgment captured — `ASSESSMENT_DISCLAIMER_DRAFT.md`.
- [ ] **⚖️ Retention periods** decided — `RETENTION_SCHEDULE_DRAFT.md`.
- [ ] **Consent enforcement LIVE** — migration applied (staging→prod), `has_ai_consent()` enforced
      **default-deny across all student-data AI paths**, parental capture operational + **auditable
      + version-linked**.
- [ ] **DSAR export + delete operable** — `DSAR_EXPORT_DELETE_PROCEDURE_DRAFT.md` (⚠️ export not built yet).
- [ ] **Data minimization verified** on every third-party AI call.
- [ ] **Staff-copilot gating decision** made (gate or documented interim mitigation).

## B. Can be completed AFTER internal testing (not blocking)
- [ ] Consent-screen UX polish / localization refinements.
- [ ] Retention **automation** hardening (scheduled purge/anonymize) — `chore/retention-automation`.
- [ ] DSAR export-format niceties (e.g. PDF in addition to structured export).
- [ ] Hardened-PWA (A+B+D) + draft-persistence + "Cloud sync timed out" race fix.

## C. Require legal review (⚖️)
All A-items marked ⚖️, plus: special-category classification of psychometric minor data; breach-
notification timeline; DSAR response timeline; international-transfer mechanism; verifiable-parental-
consent standard; consent granularity (assessment vs AI).

## D. Then — and only then
- [ ] Small **real-user pilot** with a limited cohort.
- [ ] **Re-run real-user monitoring** (E2 lockdown watch: `42501` RLS-denials, stale-client save
      reports, `question_set_version` population, "Cloud sync timed out" race) — see
      `docs/CURRENT_PROJECT_STATUS.md`.

> ⓘ Technical go-live deploy ordering (separate gated task): **migration first → regen Supabase
> types → remove `any` casts → deploy functions → deploy frontend → verify enforcement → pilot.**
> The consent technical layer is CI-green on PR #14 (verification only, **not merged/live**).
