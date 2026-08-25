# PRM-WP01 — Pilot Scope Decision Packet — v0.1

- Work package: PRM-WP01 — Pilot Scope & Owner Parameter Definition
- Authorization level: **OWNER-DECISION RECORD — DOCUMENTATION ONLY.** This
  document originated as OWNER-INPUT PREPARATION; it now records, verbatim in
  substance, the 13 genuine pilot-scope decisions the Owner has since made.
  No decision here was authored, inferred, or broadened by Claude, and this
  document itself authorizes nothing.
- Controlling sources: accepted Master Plan PRM-WP01; Step 8 §4.2 (Pilot
  Scope Profile and Owner-Supplied Parameters); Owner scope decisions 1–13,
  recorded 2026-08-25.
- Status: **OWNER DECISIONS RECORDED / PILOT SCOPE PROFILE COMPLETED —
  P2 NOT RE-ASSESSED.**
- Date: 2026-08-24 (drafted); 2026-08-25 (Owner decisions recorded).

## 1. What this document is and is not

This packet began as the decision *aid* that precedes a Pilot Scope Profile.
With every genuine Owner-input row now answered (§4, consolidated in §6), it
serves as the auditable **Owner Decision Record and completed Pilot Scope
Profile candidate** for the current program stage. It remains a document: it
does not authorize pilot execution, real student data, deployment,
AI/external-tool enablement, or Phase 9.

It does **not** state that P2 is satisfied. Recording the Owner's decisions
supplies the Owner-scope *input* P2 was waiting on; completion of that
decision record does not itself change P2. **P2 remains UNRESOLVED / NOT
EVIDENCED** and may be re-assessed only through the Master Plan's authorized
evidence-reassessment path at PRM-WP18.

## 2. Structural discipline preserved from Step 8 §4.2

Step 8 §4.2's 15-row table is not uniform. This packet keeps that
distinction explicit:

- **13 rows are genuine `OWNER INPUT REQUIRED` parameters** — real Owner
  policy choices, presented in §4 below with the Owner's recorded decision.
- **2 rows are governance-fixed, non-parameter rows**, carried directly from
  their controlling source, never converted into an Owner choice — presented
  in §3 below for information only, with no decision field.

No absolute Step 1–8 prohibition can be waived by an Owner answer anywhere in
this packet. Where a row touches an absolute prohibition, that is stated
explicitly and no "include anyway" option is offered.

## 3. Governance-fixed rows (NOT Owner decisions — informational only)

**REPOSITORY-EVIDENCED CONTEXT — NOT OWNER DECISION**

| Row | Controlling source | Fixed content |
|---|---|---|
| Identity-linked / safeguarding-relevant attributes expected | Step 6 §3.1.2 | Governed by Step 6 at runtime, per request. Not a fixed pilot parameter — the Owner cannot pre-set which attributes will appear; the six-dimension determination model (§14.2 of Step 8) applies to whatever content actually arises during the pilot, automatically. |
| Explicitly prohibited uses | Step 4 §12.4 / Step 6 §9.3.3 | Consequential decisions are absolutely prohibited regardless of pilot status. No pilot-scope declaration can waive this. If any later Owner answer in §4 appears to describe a consequential-decision use case, that use is excluded from pilot scope automatically, not included on request. |

## 4. Genuine Owner-input parameters (13 rows) — Owner decisions recorded

For each row: what it is, why it matters, the controlling constraint,
feasible option categories (not a forced menu), consequences/dependencies of
the choice, what cannot be chosen because governance already prohibits it,
and the Owner's recorded decision.

The analysis bullets below are preserved as drafted. The
**OWNER DECISION (RECORDED)** field carries the Owner's own decision text; it
is not Claude's interpretation of it, and it does not extend the decision
beyond what the Owner stated.

---

### 4.1 Intended purpose

- **Why it matters:** Step 6 §4.1 requires a stated purpose per governed act;
  every downstream privacy/consent evaluation (P8, P9) depends on knowing
  what the pilot is actually for.
- **Controlling constraint:** Step 6 §4.1; purpose cannot be inferred or
  assumed — it must be stated.
- **Feasible option categories:** e.g. "internal engineering rehearsal
  validation with synthetic data only" vs. "limited real-cohort trial of
  specific features" vs. "counselor/staff-facing evaluation without student
  participation." These are illustrative categories, not an exhaustive menu.
- **Consequences/dependencies:** a purpose involving real student data
  activates the full P8/P9 legal/consent chain (PRM-WP08, WP09, WP10); a
  purpose confined to synthetic data and staff use does not.
- **What cannot be chosen:** any purpose whose primary function is a
  consequential decision (Step 4 §12.4 / Step 6 §9.3.3) — that component is
  excluded regardless of framing.
- **OWNER DECISION (RECORDED — Owner Decision 1):** **APPROVED.**
  Synthetic-only RGKB engineering, integration, governed report-generation
  development, and end-to-end validation. **No real participants and no real
  student/personal data at this stage.**

---

### 4.2 Cohort / participating school or site

- **Why it matters:** determines which legal entity (WP09), which real
  people (if any), and which operational footprint the pilot has.
- **Controlling constraint:** none found in repository — this is entirely an
  Owner/organizational fact, not derivable from any Step.
- **Feasible option categories:** no site (synthetic-only rehearsal); a
  single pilot school/site; a specific counselor/staff group without
  students.
- **Consequences/dependencies:** any real school/site triggers PRM-WP09's
  School DPA requirement; "no site" (synthetic-only) does not.
- **What cannot be chosen:** nothing is governance-prohibited here; this row
  is a pure fact, not a policy question.
- **OWNER DECISION (RECORDED — Owner Decision 2):** **APPROVED.** Use the
  existing fictional/sample student, parent/guardian, administrator, and
  counselor accounts as the synthetic test cohort. Existing assessment
  results associated with fictional student accounts are approved as
  synthetic test/reference fixtures for sample-report validation. **No real
  individual, real school cohort, or real pilot site participates.**

  **ENVIRONMENT REFINEMENT (part of the same Owner decision):** these
  fictional/sample accounts, currently hosted in the production system, may
  serve as approved synthetic reference/test personas. This decision does
  **NOT** authorize:

  1. new RGKB runtime deployment to production;
  2. new production-side RGKB execution;
  3. treating production as an isolated pilot environment.

  Any later live-system execution against production-hosted sample accounts
  requires a **separate explicit authorization** issued after the relevant
  runtime, deployment, and safety boundaries are reviewed. See §4.11 and the
  companion PRM-WP14 packet (Option C, current stage) — the two rows are
  consistent and neither opens production-side RGKB execution.

---

### 4.3 Pilot dates

- **Why it matters:** bounds the pilot in time, which the retention window
  (§4.13) and environment decision (PRM-WP14) both depend on.
- **Controlling constraint:** none found; Owner/organizational fact.
- **Feasible option categories:** a specific start/end date range; a
  duration-bound window (e.g. "2 weeks from technical go-live"); "not yet
  scheduled — architecture/legal work first."
- **Consequences/dependencies:** dates interact with PRM-WP09's legal-review
  timeline and PRM-WP14's environment provisioning lead time.
- **What cannot be chosen:** nothing prohibited; pure fact.
- **OWNER DECISION (RECORDED — Owner Decision 3):** **APPROVED.** No fixed
  real-pilot dates at this stage. The synthetic validation window begins when
  separately authorized RGKB runtime implementation becomes available for
  testing, and continues through completion of the planned synthetic
  end-to-end rehearsal. Any future real-data pilot dates will be established
  separately, and only after the required readiness evidence exists.

---

### 4.4 Participant age/grade scope

- **Why it matters:** the platform serves grades 7–12 generally; a pilot may
  narrow this, which affects minors-safeguarding scope (P9) and consent
  requirements (age-dependent per `docs/legal/README.md`'s open lawful-basis/
  consenting-age question).
- **Controlling constraint:** CLAUDE.md states the platform serves grades
  7–12; no pilot-specific narrower scope exists yet.
- **Feasible option categories:** full 7–12 range; a narrower band (e.g. only
  grade 10–12); no real students (synthetic-only).
- **Consequences/dependencies:** narrower age scope may simplify (but does
  not eliminate) the consenting-age legal determination PRM-WP09 requires
  from qualified counsel.
- **What cannot be chosen:** nothing prohibited; a policy/scope choice.
- **OWNER DECISION (RECORDED — Owner Decision 4):** **APPROVED.** Synthetic
  validation covers **Grades 7–12 using fictional/sample student accounts
  only. No real minors participate.** Grade-band-sensitive interpretation/
  governance logic must be preserved; Grades 7–12 must **not** be treated as
  developmentally identical.

---

### 4.5 Data domains involved

- **Why it matters:** Step 6 §3.1.1 fixes the seven base content-domain
  vocabulary; which domains a specific pilot actually touches is
  pilot-specific and drives which Step 6 dimensions are live.
- **Controlling constraint:** Step 6 §3.1.1 fixes the vocabulary itself (not
  an Owner choice); which subset applies to this pilot is the Owner choice.
- **Feasible option categories:** canonical RGKB knowledge only (no personal
  data); operational assessment results; student/profile/context data;
  generated student-specific output; human-review records; orchestration/
  runtime provenance; external/untrusted content — any combination the pilot
  scope actually needs.
- **Consequences/dependencies:** any domain involving identity-linked or
  safeguarding-relevant content (§3 above) activates the corresponding Step 6
  determination automatically, regardless of this answer.
- **What cannot be chosen:** the vocabulary itself is fixed by Step 6 — the
  Owner selects which apply, not what the categories are.
- **OWNER DECISION (RECORDED — Owner Decision 5):** **APPROVED.** Synthetic
  validation scope includes:

  1. canonical RGKB knowledge;
  2. synthetic operational assessment results;
  3. synthetic student/profile/context data;
  4. generated student-specific output;
  5. human-review records;
  6. orchestration/runtime provenance.

  **General external/untrusted content remains EXCLUDED**, except for the
  narrow later refinement recorded in §4.9 (Owner Decision 9): content
  returned by, or sent to, a **separately governed/authorized** external tool
  may be exercised **only** within WP06/WP07-controlled synthetic integration
  tests. §4.9 is the controlling later refinement and **does not broadly open
  external/untrusted content**. **No real personal/student data is
  included.**

---

### 4.6 Enabled assessments/features

- **Why it matters:** determines the functional surface of the pilot.
- **Controlling constraint:** `docs/CURRENT_PROJECT_STATUS.md` (2026-06-20)
  records RIASEC/Skills/EQ/Big Five/CAAS/Work Values as live features
  (description, not independently re-verified as currently live in this
  session); which subset a pilot enables is unspecified.
- **Feasible option categories:** the current live scoring/presentation
  pipeline as-is (unrelated to RGKB Step 4 claim classification, per Step 8
  §7.3); a subset of assessments; none (process-only pilot).
- **Consequences/dependencies:** enabling any assessment for real students
  activates P8/P9's full legal/consent chain; a pilot presenting output AS
  RGKB Step 4-governed requires the runtime substrate PRM-WP02–WP05 do not
  yet implement (Step 8 PR8-1).
- **What cannot be chosen:** nothing prohibited; a scope choice.
- **OWNER DECISION (RECORDED — Owner Decision 6):** **APPROVED.** Synthetic
  validation covers all six currently supported assessment families: RIASEC;
  Big Five; Career Adapt-Abilities Scale (CAAS); Emotional Intelligence (EQ);
  Employability Skills; Work Values. It also covers governed
  report-generation and cross-assessment synthesis **once the relevant RGKB
  runtime components are separately implemented and authorized**. Existing
  legacy scoring/presentation output may be used as input/reference evidence.
  **Existing legacy output MUST NOT be represented as RGKB-governed
  interpretation merely because it already exists** (consistent with Step 8
  §7.3 and PR8-1).

---

### 4.7 Output categories permitted

- **Why it matters:** Step 4 §6.2 fixes the ten-row taxonomy; which classes a
  pilot actually renders is pilot-specific.
- **Controlling constraint:** Step 4 §6.2 fixes the taxonomy itself; the
  Owner selects which classes apply to this pilot's scope.
- **Feasible option categories:** direct result-derived statements only;
  add construct-level interpretation; add cross-assessment synthesis;
  add guidance/recommendation classes — increasing scope increases the
  runtime-fidelity requirement on PRM-WP05.
- **Consequences/dependencies:** any class beyond what PRM-WP05 has
  implemented and evidenced cannot actually be produced with RGKB governance
  until that implementation exists.
- **What cannot be chosen:** "Unsupported claim" is never a producible class
  under any pilot scope (Step 4, absolute); Recommendation/Guidance content
  that functions as a consequential decision is excluded per §3 above.
- **OWNER DECISION (RECORDED — Owner Decision 7):** **APPROVED.** Synthetic
  validation may produce: direct result-derived statements; construct-level
  interpretations; cross-assessment synthesis; advisory guidance/
  recommendations. **All outputs must remain within the governed Step 4
  taxonomy/evidence boundary.**

  **ABSOLUTE EXCLUSIONS:** unsupported claims; machine-produced consequential
  decisions; machine consequential-decision candidates.

  Guidance/recommendation remains **advisory** and must never function as the
  machine making a consequential decision for the student.

---

### 4.8 Recipients

- **Why it matters:** Step 6's read/write/share/export separation depends on
  knowing who receives pilot output.
- **Controlling constraint:** none found; Owner/organizational fact,
  constrained by Step 6 §5.2's access-scope rules once named.
- **Feasible option categories:** the student only; student + parent/
  guardian; student + counselor; internal engineering/QA staff only
  (synthetic-data pilot).
- **Consequences/dependencies:** any recipient who is a real minor or their
  guardian activates the full consent/assent chain (PRM-WP08, WP09).
- **What cannot be chosen:** a recipient scope or use case where the pilot's
  output would itself function as a consequential decision, or where a
  machine-produced output would be treated as a consequential-decision
  candidate, is excluded absolutely (Step 6 §11.1/§11.3) — regardless of
  whether a human subsequently reviews it. Human review does not cure a
  machine-produced consequential-decision candidate and is never a mechanism
  for approving one; it FAILS CLOSED unconditionally. This is distinct from,
  and must not be confused with, ordinary governed interpretation or
  guidance output that a human recipient (e.g. a counselor) reviews before
  deciding what to do with it — that ordinary review step is permitted and
  expected; what is excluded is any use case where the machine's own output
  constitutes the consequential decision itself, reviewed or not.
- **OWNER DECISION (RECORDED — Owner Decision 8):** **APPROVED.** Synthetic
  reports/outputs may be presented to the corresponding **fictional/sample**
  student, parent/guardian, counselor, and authorized administrator/QA role.

  **Validation is role-specific.** The existence of a report does **NOT**
  imply that every role receives the same report, all underlying data, or
  identical permissions.

  **No public sharing. No uncontrolled external export. No external recipient
  access at this stage.**

---

### 4.9 External tools, if any

- **Why it matters:** determines whether any Tier 3 (external side-effect)
  boundary is exercised at all.
- **Controlling constraint:** `AI_FEATURES_ENABLED` is implemented in
  repository code as a kill-switch, default-off by code/config design; its
  actual live-environment value was not independently verified this session
  (Step 8 §16.1, P7). CLAUDE.md: AI stays disabled until separately governed.
- **Feasible option categories:** no external tools (fully offline pilot);
  external AI tools enabled under a separate, later, explicit Owner
  authorization (never implied by this packet).
- **Consequences/dependencies:** enabling any external tool requires
  PRM-WP06/WP07's Tier 3 boundary to exist and be authorized, which is not
  in Wave 0's scope.
- **What cannot be chosen:** AI feature enablement cannot be decided by this
  packet under any circumstance — it requires its own separate, explicit
  Owner act, per CLAUDE.md and Step 8 §19.
- **OWNER DECISION (RECORDED — Owner Decision 9):** **APPROVED AS INTENDED
  SYNTHETIC VALIDATION SCOPE — NOT YET ENABLED.** External AI/tools are
  included in the *intended* synthetic integration-testing scope. They may be
  exercised only:

  1. with **synthetic/non-real data**;
  2. **after** PRM-WP06/WP07 establish the necessary orchestration,
     authority, transmission, provenance, and fail-closed controls;
  3. **after a separate explicit Owner authorization** for actual enablement
     / external transmission.

  **No real student/personal data may be transmitted externally.**

  **This Owner scope decision is NOT itself external-tool enablement.** It
  states intended future scope only. `AI_FEATURES_ENABLED` remains untouched
  and human-only, per CLAUDE.md and Step 8 §19. This row is also the narrow
  refinement referenced from §4.5 — it does not broadly admit external/
  untrusted content into scope.

---

### 4.10 Human roles (reviewer, safeguarding, stop authority)

- **Why it matters:** feeds directly into PRM-WP11 (reviewer competence) and
  PRM-WP16 (operating model), both blocked pending these names.
- **Controlling constraint:** `app_role`/`superadmin` exist as PLATFORM
  roles (migrations, `has_role`) but Step 6 §5.3 fixes platform role ≠
  reviewer/safeguarding competence — naming a platform-role holder here does
  not itself supply competence evidence.
- **Feasible option categories:** named individuals per role (pilot owner,
  operational lead, reviewer(s) per dimension, safeguarding-responsible
  process, stop/incident authority, resumption authority); "not yet named —
  deferred to Wave 4."
- **Consequences/dependencies:** PRM-WP11/WP15/WP16 cannot reach full
  evidence without these names; competence attestation for reviewers still
  requires the correct qualified authority per dimension (Master Plan §5,
  WP11), which naming alone does not supply.
- **What cannot be chosen:** the Owner cannot name a reviewer AND declare
  them competent in the same act — competence is a separate, authority-
  specific attestation (scientific/safeguarding/legal, as applicable).
- **OWNER DECISION (RECORDED — Owner Decision 10):** **APPROVED FOR THE
  CURRENT SYNTHETIC STAGE.** The Owner will serve as:

  1. Pilot Owner / Final Governance Authority;
  2. Operational Lead;
  3. Stop / Incident Authority;
  4. Resumption Authority;
  5. **provisional** Scientific/Career Reviewer;
  6. **provisional** Safeguarding / Incident Routing Lead.

  These role assignments are sufficient **only** for synthetic workflow,
  rehearsal, and sample-report validation. They **DO NOT by themselves
  establish**: scientific/career reviewer competence; safeguarding
  professional adequacy; legal competence; WP10 closure; WP11 closure.

  Required competence/adequacy evidence remains separately governed by the
  applicable work packages and qualified authorities — consistent with Step 6
  §5.3 (platform role ≠ competence) and with the constraint above that naming
  and attesting competence are two distinct acts.

---

### 4.11 Environment

- **Why it matters:** feeds directly into PRM-WP14 (see the companion
  Environment Architecture Decision Packet).
- **Controlling constraint:** a single production Vercel/Supabase
  environment is documented; no separate pilot/staging environment was found
  (Step 8 PR8-2; confirmed again in Wave 0 discovery — see the companion
  PRM-WP14 packet §2).
- **Feasible option categories:** see PRM-WP14's dedicated packet — this row
  intentionally defers the decision there rather than duplicating it.
- **Consequences/dependencies:** no real-data pilot activity may occur before
  this is resolved (Step 8 §3.3, absolute).
- **What cannot be chosen:** real student data in the current
  undifferentiated single-environment setup, under any framing.
- **OWNER DECISION (RECORDED — Owner Decision 11):** **APPROVED —
  PRM-WP14 Option C for the current stage: synthetic-only deferral.**

  Formal RGKB development, integration testing, and end-to-end rehearsal
  should use synthetic data in local/CI or otherwise authorized
  **non-production** test execution. **The current production environment is
  NOT an isolated pilot environment.**

  Existing production-hosted fictional/sample personas (§4.2) may remain
  reference/test fixtures, but this **does not authorize RGKB production
  deployment or new live RGKB execution**.

  **P13 remains UNRESOLVED / NOT EVIDENCED.** Option C is a deferral, not an
  isolation architecture, and does not evidence any of the nine boundaries.

  For a future real-data pilot:

  1. **Option B as currently described remains NOT P13-SATISFYING and NOT
     ELIGIBLE** for real-data pilot entry;
  2. Option A, a materially redesigned Option B, or another bounded
     architecture may be considered later;
  3. **no future architecture is selected by this current decision.**

  See the companion PRM-WP14 packet for the full boundary analysis.

---

### 4.12 Retention window (and longitudinal assessment history)

- **Why it matters:** Step 6 §7.3 prohibits inferring a retention rule; one
  must be explicitly set.
- **Controlling constraint:** Step 6 §7.3 (no inference permitted); no
  pilot-specific rule exists yet.
- **Feasible option categories:** a fixed window tied to pilot dates (§4.3)
  plus a defined post-pilot deletion/anonymization point; "no real data
  retained" (synthetic-only pilot, retention question does not arise).
- **Consequences/dependencies:** any real-data retention decision also
  requires PRM-WP09's legal determination of legally required retention
  periods — the Owner's operational preference and counsel's legal minimum/
  maximum are two distinct inputs that must agree.
- **What cannot be chosen:** an indefinite or unstated retention period for
  real student data — Step 6 §7.3 forbids proceeding without an explicit
  answer.
- **OWNER DECISION (RECORDED — Owner Decision 12):** **APPROVED.** Assessment
  history is **longitudinal and versioned, not replacement-based.** Each
  semester's distinct historical record must be **preservable**, including as
  applicable: assessment event; instrument/version; assessment result;
  governed interpretation/report; recommendations/interventions; relevant
  follow-up evidence.

  **A newer semester MUST NOT overwrite the prior semester merely because it
  is newer.**

  The intended longitudinal model is:

  > Student → semester / assessment event → instrument/version → result →
  > interpretation/report → recommendation/intervention → follow-up evidence.

  The system should eventually be able to distinguish **CURRENT PROFILE**
  from **LONGITUDINAL TRAJECTORY**.

  For the current synthetic cohort, these histories may be retained across
  RGKB development and validation as reusable longitudinal/regression
  fixtures.

  For **future real-student use**, longitudinal retention is an *intended
  functional requirement*, but the exact legally permissible retention
  duration and post-program/school retention rule **MUST be separately
  determined under PRM-WP09**. **No indefinite real-data retention rule is
  established here** — consistent with Step 6 §7.3, which forbids inferring a
  retention rule.

  **IMPORTANT SCIENTIFIC BOUNDARY:** a later semester change may be
  associated *temporally* with a prior intervention, but **the system must
  not automatically claim that the intervention CAUSED the change** without
  separate evidence sufficient for that causal claim.

---

### 4.13 Excluded functions

- **Why it matters:** bounds the pilot explicitly, reducing the surface any
  other gate must evaluate.
- **Controlling constraint:** none found; Owner/organizational choice.
- **Feasible option categories:** any named feature/assessment/output class
  the Owner wants explicitly out of scope, beyond what §4.6/§4.7 already
  exclude by omission.
- **Consequences/dependencies:** an explicit exclusion here removes that
  surface from every downstream gate's evaluation scope for this pilot.
- **What cannot be chosen:** nothing prohibited; this row only narrows scope.
- **OWNER DECISION (RECORDED — Owner Decision 13):** **APPROVED.** The
  current synthetic RGKB validation **explicitly excludes**:

  1. any real student, parent, counselor, staff, or other real-person data;
  2. any real-school / real-cohort pilot execution;
  3. any machine-produced consequential decision or consequential-decision
     candidate — **absolute, FAIL CLOSED**;
  4. any unsupported claim outside the governed Step 4 taxonomy/evidence
     boundary;
  5. any automated decision concerning admissions, educational track/subject
     placement, employment, eligibility, disciplinary action, diagnosis, or
     another materially consequential outcome;
  6. any AI investigation or determination of safeguarding/abuse concerns —
     safeguarding signals may **only** stop/route/escalate to the responsible
     human process;
  7. any external-tool transmission before WP06/WP07 controls exist **AND** a
     separate explicit Owner enablement authorization is issued;
  8. public sharing, uncontrolled external export, or uncontrolled external
     recipient access;
  9. production deployment, or treating the current production environment as
     an isolated pilot environment;
  10. overwriting/deleting a prior semester assessment history merely because
      a newer result exists;
  11. automatically claiming that a later change was **caused** by a prior
      recommendation/intervention without separate causal evidence;
  12. Phase 9 / production-readiness activity under this synthetic-validation
      scope.

  **Scope note (not an exception):** exclusion 7 excludes *premature
  enablement and transmission*. It does **not** remove external-tool
  integration testing from the *intended future* synthetic scope recorded in
  §4.9 — that scope remains intended, gated, and not yet enabled.

---

## 5. Owner-decision status (quick-reference)

| # | Parameter | Decision status |
|---|---|---|
| 4.1 | Intended purpose | **OWNER DECISION RECORDED** |
| 4.2 | Cohort / school / site | **OWNER DECISION RECORDED** |
| 4.3 | Pilot dates | **OWNER DECISION RECORDED** |
| 4.4 | Participant age/grade scope | **OWNER DECISION RECORDED** |
| 4.5 | Data domains involved | **OWNER DECISION RECORDED** |
| 4.6 | Enabled assessments/features | **OWNER DECISION RECORDED** |
| 4.7 | Output categories permitted | **OWNER DECISION RECORDED** |
| 4.8 | Recipients | **OWNER DECISION RECORDED** |
| 4.9 | External tools, if any | **OWNER DECISION RECORDED** (intended scope; NOT enabled) |
| 4.10 | Human roles | **OWNER DECISION RECORDED** (provisional; not competence evidence) |
| 4.11 | Environment | **OWNER DECISION RECORDED** — PRM-WP14 **Option C** (current stage) |
| 4.12 | Retention window / longitudinal history | **OWNER DECISION RECORDED** (real-data duration deferred to PRM-WP09) |
| 4.13 | Excluded functions | **OWNER DECISION RECORDED** |

All 13 genuine Owner-input rows are recorded. No percentage or completeness
metric is computed. **Recording these decisions does not change any P-gate
state.** P2 remains **UNRESOLVED / NOT EVIDENCED** and may be re-assessed
only at PRM-WP18 via the Master Plan's authorized evidence-reassessment path.

## 6. COMPLETED PILOT SCOPE PROFILE — OWNER DECISIONS RECORDED

This section consolidates the 13 recorded Owner decisions (§4) together with
the 2 governance-fixed, non-parameter rows (§3) into a single auditable
profile. It restates; it does not extend. Where this summary and §3/§4
differ in detail, **§3 and §4 control**.

**Profile stage:** synthetic-only. **Pilot: NOT AUTHORIZED. Real data: NOT
AUTHORIZED. Phase 9: NOT AUTHORIZED.**

### 6.1 The 13 recorded Owner decisions

| # | Parameter | Recorded Owner decision (summary — §4 controls) |
|---|---|---|
| 1 | Intended purpose | Synthetic-only RGKB engineering, integration, governed report-generation development, and end-to-end validation. No real participants, no real student/personal data at this stage. |
| 2 | Cohort / site | Existing fictional/sample student, parent/guardian, administrator, counselor accounts as the synthetic cohort; existing fictional-student assessment results approved as synthetic fixtures. No real individual, cohort, or site. Production-hosted sample personas may serve as reference fixtures, but this authorizes **no** production RGKB deployment or execution and does **not** make production an isolated pilot environment. |
| 3 | Validation window / dates | No fixed real-pilot dates. Synthetic window begins when separately authorized RGKB runtime is available for testing; runs through the synthetic end-to-end rehearsal. Real-data pilot dates set separately, only after readiness evidence exists. |
| 4 | Age / grade scope | Grades 7–12, fictional/sample accounts only. No real minors. Grade-band-sensitive interpretation/governance logic preserved; 7–12 not developmentally identical. |
| 5 | Data / content domains | Canonical RGKB knowledge; synthetic assessment results; synthetic student/profile/context data; generated student-specific output; human-review records; orchestration/runtime provenance. General external/untrusted content **excluded**, except the narrow Decision 9 refinement. No real personal/student data. |
| 6 | Enabled assessments / features | All six families (RIASEC, Big Five, CAAS, EQ, Employability Skills, Work Values); governed report-generation and cross-assessment synthesis **only once** the RGKB runtime components are separately implemented and authorized. Legacy output usable as input/reference evidence; legacy output **must not** be presented as RGKB-governed interpretation. |
| 7 | Permitted output categories | Direct result-derived statements; construct-level interpretations; cross-assessment synthesis; advisory guidance/recommendations — all within the Step 4 taxonomy/evidence boundary. **Absolute exclusions:** unsupported claims; machine-produced consequential decisions; machine consequential-decision candidates. Guidance stays advisory. |
| 8 | Recipients | Corresponding fictional/sample student, parent/guardian, counselor, authorized administrator/QA role. Role-specific validation; a report's existence implies no uniform report, data access, or permissions. No public sharing, no uncontrolled external export, no external recipient access. |
| 9 | External tools | Included as **intended** synthetic integration-testing scope; **NOT ENABLED**. Permitted only with synthetic/non-real data, after WP06/WP07 controls exist, and after a separate explicit Owner enablement authorization. No real personal data transmitted externally. This decision is not enablement. |
| 10 | Human roles | Owner serves as Pilot Owner / Final Governance Authority, Operational Lead, Stop/Incident Authority, Resumption Authority, and **provisional** Scientific/Career Reviewer and Safeguarding/Incident Routing Lead. Sufficient for synthetic work only; establishes **no** competence, adequacy, legal competence, WP10 closure, or WP11 closure. |
| 11 | Environment | **PRM-WP14 Option C** — synthetic-only deferral. Local/CI or otherwise authorized non-production execution. Production is **not** an isolated pilot environment. **P13 remains UNRESOLVED / NOT EVIDENCED.** Option B as described stays non-eligible; no future architecture selected. |
| 12 | Longitudinal retention / history | Longitudinal and versioned, not replacement-based; each semester's record preservable; newer must not overwrite older. Synthetic histories retained as regression fixtures. Real-data retention duration and post-program rule deferred to **PRM-WP09**; no indefinite real-data rule set. Temporal association ≠ causal claim. |
| 13 | Explicitly excluded functions | The 12 exclusions listed in §4.13, including the absolute consequential-decision prohibition and the fail-closed machine consequential-decision-candidate rule. |

### 6.2 The 2 governance-fixed rows (unchanged — not Owner decisions)

Carried verbatim in force from §3. No Owner decision was recorded against
either row, and none may be:

| Row | Controlling source | Status |
|---|---|---|
| Identity-linked / safeguarding-relevant attributes expected | Step 6 §3.1.2 | **UNCHANGED — governance-fixed.** Determined by Step 6 at runtime, per request; not an Owner-settable pilot parameter. |
| Explicitly prohibited uses | Step 4 §12.4 / Step 6 §9.3.3 | **UNCHANGED — governance-fixed, absolute.** Consequential decisions are prohibited regardless of pilot status; no Owner answer above waives this, and Owner Decisions 7 and 13 restate it rather than modify it. |

### 6.3 What this profile does NOT establish

- It does **not** state or imply **P2 SATISFIED**. All currently required
  Owner scope inputs are recorded; **completion of the decision record does
  not itself change P2**; P2 may be re-assessed only through the Master
  Plan's authorized evidence reassessment path at **PRM-WP18**.
- It does **not** resolve **P13**, which remains **UNRESOLVED / NOT
  EVIDENCED** (§4.11; PRM-WP14).
- It does **not** authorize a pilot, real data, deployment, production
  execution, external-tool enablement, or Phase 9.
- It does **not** close **WP10** or **WP11**, and does not supply reviewer
  competence or safeguarding adequacy evidence (§4.10).
- It does **not** change any other P-gate, finding, or work-package state.

## 7. Non-authorization

This packet does not authorize a pilot, real student data, deployment, AI
enablement, or Phase 9. Answering these questions does not itself change any
P-gate state — only PRM-WP18 may do that, using the resulting evidence.

Recording the Owner's answers (2026-08-25) does not alter that position. The
following remain true as of this revision:

- **Pilot: NOT AUTHORIZED. Real data: NOT AUTHORIZED. Phase 9: NOT
  AUTHORIZED.**
- **P2: UNRESOLVED / NOT EVIDENCED — not re-assessed by this document.**
- **P13: UNRESOLVED / NOT EVIDENCED.** P1–P16 otherwise unchanged.
- No environment was provisioned or mutated; no deployment occurred.
- `AI_FEATURES_ENABLED` untouched; no external tool enabled; no external
  transmission performed.
- No schema, migration, RLS, auth, or runtime change was made — this revision
  is documentation only.
- PR8-1 / PR8-2 / PR8-3 unchanged; F-04 and F-07 remain **OPEN**.
- WP02 Tier 2 remains **BLOCKED** pending controlled catalog specification;
  WP12 outcome **C** stands; WP13 remains **triggered but NOT EXECUTED**;
  WP15 remains **DRAFT / NOT OPERATIONALLY VALIDATED**.
