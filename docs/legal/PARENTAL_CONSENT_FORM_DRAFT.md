# Parental / Guardian Consent Form — Draft

> **DRAFT — requires review by qualified legal counsel before use.** Not legal advice.
> Wording below is illustrative scaffolding only; counsel must finalize language, lawful basis,
> and verification method. Bilingual (ka + en) final versions required.

## 0. Context
The School (data controller) obtains parental/guardian consent before any of a student's data is
sent to **third-party AI sub-processors**. ⓘ AI features are **default-deny** in the platform: the
assessments and the student's report function **without** AI; only AI-generated interpretation is
gated. (Technical gate: `ai_processing_consent` + `has_ai_consent()`.)

## 1. What data is collected
Identity (name, grade, school, login, language), psychometric **assessment answers and results**
(RIASEC, Employability Skills, Big Five, CAAS, Work Values, EQ), and any AI-generated interpretation.

## 2. Why it is collected
To provide **developmental career guidance** to the student (exploration and growth), and to enable
the student's counselor/parent to support them. **Not** for marketing or automated decisions with
legal effect, and **not** for clinical/diagnostic use.

## 3. What "AI processing" means
Minimized data (scores + grade **band**; no avoidable identifiers) is sent to named third-party AI
sub-processors to generate age-appropriate interpretations. Sub-processors: `[[PLACEHOLDER: list —
see SUB_PROCESSOR_REGISTER_DRAFT.md]]`. International transfer: **⚖️ `[[PLACEHOLDER: mechanism]]`**.

## 4. Right to refuse AI processing
You may **decline** AI processing. If you decline, the student can still take assessments and view
results; only AI-generated guidance is turned off (default-deny).

## 5. Withdrawal of consent
You may withdraw consent at any time. Withdrawal takes effect **immediately** for future AI
processing (ⓘ technical: sets `withdrawn_at`). `[[PLACEHOLDER: effect on already-generated content]]`.

## 6. Parent contact & verification
- Parent/guardian name + relationship + contact: `[[PLACEHOLDER]]`.
- **⚖️ LEGAL DECISION:** the **verifiable parental consent** method (how the School verifies the
  parent's identity/authority — e.g. school-mediated, portal, signature).

## 7. Granularity (decision)
- **⚖️ LEGAL DECISION:** whether to offer separate toggles for (a) assessment processing and
  (b) third-party AI interpretation, or a single consent.

## 8. Lawful basis & jurisdiction
- **⚖️ `[[PLACEHOLDER: lawful basis]]`** (consent vs school public-task) · **⚖️ `[[PLACEHOLDER:
  governing law]]`** · **⚖️ `[[PLACEHOLDER: consenting age / who must consent]]`**.

## 9. Versioning & audit (required)
Each consent record must capture: **privacy-notice version**, **consent-form version**, timestamp,
`consented_by`, method, and **withdrawal history**. ⓘ Current schema has consent/withdraw timestamps
+ `consented_by` + method; **notice/form version + disclaimer-acknowledgment are not yet captured**
(gap → `feat/consent-versioning-audit`).

## 10. Signature
`[[PLACEHOLDER: signature / e-consent record block + date + form version]]`
