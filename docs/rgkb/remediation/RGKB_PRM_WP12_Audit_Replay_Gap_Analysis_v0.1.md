# PRM-WP12 — Audit / Replay Gap Analysis — v0.1

- Work package: PRM-WP12 — Audit / Replay Gap Analysis
- Authorization level: **READ-ONLY ANALYSIS.** No implementation performed.
- Controlling sources: Step 7 §13.1 (minimum reconstructable end-to-end
  record); Step 8 §11.2 (P12 readiness assessment, evidence-bounded); accepted
  Master Plan PRM-WP12/PRM-WP13.
- Status: analysis complete; outcome stated with evidence.
- Date: 2026-08-24.

## 1. Scope of this analysis

Field-by-field comparison of the existing repository audit/logging
implementation against Step 7 §13.1's minimum reconstructable end-to-end
record, plus the extended field set the accepted Master Plan's PRM-WP12/
PRM-WP13 entries specify (which adds "later use," "stop/escalation," and
"incident" to §13.1's 12-bullet list, tracing to Step 6 §9.3.2 and Step 8
§12 respectively).

## 2. Evidence base actually inspected

### 2.1 Schema (as in the RC1-original analysis, unchanged)

- `supabase/migrations/20260417230000_audit_logging.sql` — `audit_logs`
  table: `id, admin_id, action, target_type, target_id, details (JSONB),
  created_at`. Populated by the `delete_user` RPC for admin-triggered
  actions (e.g. `DELETE_USER`).
- `supabase/migrations/20260417236000_ai_logging.sql` — `ai_logs` table:
  `id, user_id, feature_name, prompt_summary, response_content,
  tokens_estimated, created_at`.
- `supabase/migrations/20260618150000_ai_processing_consent.sql` —
  `ai_processing_consent` table: `id, student_id, consent_given,
  consent_method, consented_by, consented_at, withdrawn_at, created_at,
  updated_at`.
- `supabase/migrations/20260618130000_add_grade_band_and_question_set_version_to_assessments.sql`
  — `assessments.question_set_version`, `assessments.grade_band`.
- A repository-wide grep across all ~50 migration files for
  `provenance|evidence|disposition|reviewed_by|review_status|escalat|
  incident|stop_` found one additional hit: `reviewed_by` on
  `public.school_gatsby_progress` (`20260505203000_unified_upgrades.sql`) —
  a UK Gatsby-Benchmarks school career-guidance attainment-tracking table,
  unrelated to RGKB governed-claim review; noted for completeness, not
  counted as coverage.
- No table or column matching `governed_instance`, `instance_id`, purpose,
  determination, taxonomy, orchestration, OER, safeguarding-routing, or
  incident semantics was found anywhere else in the migrations directory.

### 2.2 Bounded read-only extension: actual writers/usages (RC1-C)

Per Owner-side correction RC1-C, a further bounded, read-only inspection of
actual write paths (not just schema) was performed before finalizing the
outcome:

- **`audit_logs` client-side/edge writers:** `grep -rl "audit_logs" src/
  supabase/functions/` found references in
  `src/components/admin/BulkTools.tsx`, `src/integrations/supabase/types.ts`
  (generated types, not a writer), `src/pages/SuperAdminStudentDetail.tsx`,
  and `src/test/privilegedReadAudit.test.ts`. The actual INSERT logic lives
  in SQL, not client code — see below.
- **`audit_logs` SQL writers beyond the original `delete_user` RPC:**
  `supabase/migrations/20260419100000_critical_security_fixes.sql` (one
  additional `INSERT INTO public.audit_logs`) and, materially,
  `supabase/migrations/20260723170000_audited_superadmin_read_boundary.sql`
  — four `INSERT INTO public.audit_logs` statements inside SECURITY DEFINER
  RPCs implementing an audited superadmin cross-school read boundary
  (PF-007). One was read in full: the `details` JSONB payload for a
  `READ_STUDENT_LIST` action populates `actor_role: 'superadmin'`,
  `access_mode: 'list'`, `resource_class: 'profile'`, `result_count`,
  `search_applied`, `limit`, `offset` — in addition to the outer columns
  `admin_id` (who), `action` (what act), `target_type` (resource class,
  redundantly), `created_at` (when). The migration's own comment is explicit
  that this exists specifically because "PostgreSQL cannot trigger on
  SELECT" and that "No psychometric payload is ever written to the audit
  metadata — only proof that access occurred, by whom, to whose record."
  This is real, additional evidence of a second, richer (but still narrow,
  privileged-read-specific) admin-audit pattern, distinct from the original
  `DELETE_USER` example.
- **`ai_logs` edge-function writers:** `supabase/functions/admin-insights/index.ts`,
  `counselor-coach/index.ts`, `parent-coach/index.ts` each call
  `serviceClient.from("ai_logs").insert(...)`. One was read in full
  (`admin-insights/index.ts`): the insert populates exactly `user_id`,
  `feature_name`, `prompt_summary` — matching the schema exactly, with no
  additional generic/JSONB payload and no purpose, version, evidence,
  determination, taxonomy, orchestration, dimension, review, disposition,
  later-use, stop/escalation, or incident field present anywhere in the
  insert call.
- **Conclusion of the extension:** no runtime write path was found recording
  any Step 7 §13.1 / extended field inside a generic payload that the schema
  inspection alone would have missed, for the fields classified ABSENT
  below. The one genuinely new fact this extension surfaces is that the
  `audit_logs.details` JSONB payload, in its richest observed use
  (`audited_superadmin_read_boundary.sql`), captures actor-role/access-mode/
  resource-class/result-scope information for privileged reads specifically
  — which strengthens (with a second concrete example) the already-PARTIAL
  classification for the "request" and "data/content" fields below, but
  does not newly cover any field previously classified ABSENT, and does not
  cover Step 6 §14.2 dimension 1 ("authority" in the purpose-authorization
  sense) — `actor_role` records *who* acted and in what platform role, which
  is a distinct concept from whether the act's *purpose* was authorized;
  conflating the two would misclassify the evidence.

This remains a targeted, evidence-based search (direct inspection of every
plausibly-relevant table and writer, plus a repository-wide grep for the
governing vocabulary), not an exhaustive line-by-line read of all ~50
migration files or all edge functions. That scope is stated honestly in the
evidence classifications below.

## 3. Field-by-field mapping

| Step 7 §13.1 / extended field | Evidence found | Classification |
|---|---|---|
| What request was made | `audit_logs.action` (admin actions, e.g. `DELETE_USER`, `READ_STUDENT_LIST` — two concrete examples now confirmed by the §2.2 writer-path inspection); `ai_logs.feature_name` (AI-feature invocations only, confirmed by direct read of the `admin-insights` writer). No general governed-request record. | **PARTIAL** — narrow, subsystem-specific action labels across two admin-audit examples and one AI-logging example; no general Governed Request Envelope equivalent |
| For what purpose (Step 6 §4.1) | No field anywhere states a purpose per act; confirmed absent in the `ai_logs` insert call itself (§2.2), not merely absent from the schema | **ABSENT** |
| What data/content was used — base domain, attributes, exact operational instance (Step 6 §3.1.1–3.1.2) | `audit_logs.target_type`/`target_id`, and the richer `resource_class`/`access_mode` fields inside `details` JSONB for the superadmin-read-boundary writer (§2.2), narrowly identify the affected resource for admin/superadmin actions only; no base-domain/attribute classification anywhere; `ai_logs` has no data-classification field at all (confirmed by direct read of its writer) | **PARTIAL** for admin/superadmin actions only; **ABSENT** for the general Step 6 domain/attribute model and for AI-feature actions |
| Under what authority (Step 6 §14.2 dimension 1 — purpose authorization) | No field records a purpose-authorization determination. The `details.actor_role` field found in §2.2 records *who* acted and in what platform role — a distinct concept from whether the act's *purpose* was authorized — and is not counted as coverage of this field | **ABSENT** |
| Which exact canonical-knowledge versions were used (Step 1 §11.1) | No `governed_instance`/`instance_id` citation exists anywhere (confirmed independently by PRM-WP02's discovery, §2 of that document); `assessments.question_set_version` is a narrow, assessment-scoped analog for a different, adjacent problem | **ABSENT** for general RGKB version citation; **PARTIAL**, narrowly, for assessment scoring-version only |
| What evidence/provenance supported them (Step 2 §7) | No evidence/provenance table or column found anywhere | **ABSENT** |
| What scientific determinations applied, per dimension (Step 3 §5–6) | No determination/dimension substrate found (consistent with Step 8 §16.1 P5 NOT SATISFIED) | **ABSENT** |
| What Step 4 claim(s) were produced, exact taxonomy row + origin set (Step 4 §14.2) | No taxonomy classification implementation found (consistent with Step 8 §16.1 P6 NOT SATISFIED) | **ABSENT** |
| What orchestration roles/handoffs occurred, and dispositions (Step 5 §5.2/§14.2) | No Orchestration Event Record or disposition-tracking implementation found (consistent with Step 8 §16.1 P7 NOT SATISFIED) | **ABSENT** |
| What privacy/safeguarding/consequentiality determinations applied, per dimension (Step 6 §14.2) | `ai_processing_consent`'s `consent_given/consent_method/consented_by/consented_at/withdrawn_at` provide narrow, real coverage of ONE dimension (purpose/consent authorization) for ONE use case (AI processing consent specifically) | **PARTIAL**, narrow and single-dimension/single-use-case; **ABSENT** for the other five Step 6 dimensions and for general applicability |
| Whether human review or safeguarding routing occurred, and its outcome | No governed-claim review-event or safeguarding-routing record found; the one `reviewed_by` hit found (`school_gatsby_progress`) is an unrelated administrative attainment-tracking field, not a governed-claim review event | **ABSENT** |
| What final disposition resulted | No field matching Step 5's disposition set (PROCEED/QUALIFY/PRESERVE DISCREPANCY/REQUEST INQUIRY/RETAIN MULTIPLE HYPOTHESES/ESCALATE/ABSTAIN/FAIL CLOSED) found anywhere | **ABSENT** |
| What rendered output, if any, was permitted, and its exact taxonomy classification | Dependent on the absent taxonomy-classification substrate (above); no record found | **ABSENT** |
| Later use (Step 6 §9.3.2 — proposed-use classification, distinct from output production) | No proposed-use-event record found | **ABSENT** |
| Stop/escalation (Step 8 §12) | No stop/escalation event record found. `ai_processing_consent.withdrawn_at` is a narrow, single-purpose, tangential analog to a "stop" for consent withdrawal specifically — noted for completeness but not counted as coverage of this field, to avoid double-counting it as both absent and partial | **ABSENT** (primary classification; tangential analog noted, not separately counted) |
| Incident (Step 8 §12) | No incident table or record found anywhere | **ABSENT** |

## 4. Missing-field register (explicit, exact 16-field accounting)

Every one of the 16 fields appears in exactly one of the two buckets below
— no field is dropped, and no field is double-counted across both buckets
(a defect present in an earlier draft of this analysis, corrected here: the
earlier version listed "stop/escalation" under both ABSENT and PARTIAL, and
as a direct consequence silently omitted "human review or safeguarding
routing" from the accounting entirely, even though §3's table always
classified it ABSENT). Numbers refer to §3's table row order.

**ABSENT (12 of 16), zero coverage found by any existing structure:**
(2) purpose statement; (4) authority/purpose-authorization determination;
(6) evidence/provenance; (7) scientific determinations; (8) Step 4 taxonomy
classification; (9) orchestration roles/handoffs/dispositions; **(11) human
review or safeguarding routing occurred, and its outcome**; (12) final
disposition; (13) permitted-output taxonomy classification; (14) later-use
classification; (15) stop/escalation (general — the consent-withdrawal
analog is a tangential note, not separate coverage, per §3's row above);
(16) incident record.

**PARTIAL (4 of 16), each narrow and single-purpose, not extensible to the
general RGKB model without new implementation:**
(1) request/action label (admin actions — two examples, `DELETE_USER` and
`READ_STUDENT_LIST` — plus AI-feature invocations); (3) data/content
instance (admin/superadmin actions only, including the richer
`resource_class`/`access_mode` fields found in §2.2); (5) canonical-version
citation (assessment scoring version only, not general `instance_id`
citation); (10) one Step 6 dimension for one use case (AI processing
consent).

12 + 4 = 16. No field is classified UNRESOLVED — for every field, the
evidence found (or its confirmed absence via targeted inspection, the §2.2
writer-path extension, and repository-wide grep) was sufficient to reach a
positive PARTIAL or ABSENT classification, not an inconclusive one.

## 5. Outcome

**Outcome C — required capability genuinely absent; new implementation
required.**

Positive evidentiary basis for this outcome (not inferred from ambiguity,
per the authorization's explicit rule that ambiguity must not become C):
12 of 16 required fields have zero coverage anywhere in the schema —
including, correctly counted, human review/safeguarding-routing occurrence
and outcome (§4) — directly confirmed by inspecting every plausibly-relevant
existing table and writer (including the bounded read-only extension of
§2.2, which inspected actual `audit_logs`/`ai_logs` write paths, not schema
alone) and by a repository-wide grep for the governing vocabulary that
returned no further matches. The remaining 4 fields have only narrow,
single-purpose, subsystem-specific partial coverage (admin/superadmin-action
logging, AI-interaction logging, AI-consent tracking, assessment
scoring-version tracking) that does not implement, and was not designed to
implement, Step 7 §13.1's general governed-request reconstructable record.
No field's absence rests on ambiguous or inconclusive evidence; every ABSENT
and PARTIAL classification above is grounded in a specific, cited existing
artifact, its actual writer-path content, or its confirmed absence. The §2.2
extension changed no field's classification bucket — it added a second
concrete example to the "request" and "data/content" PARTIAL rows and
confirmed, by direct read of an `ai_logs` writer, that no hidden generic
payload exists anywhere covering an ABSENT field — so the extension
strengthens, rather than merely repeats, the evidentiary basis for outcome
C.

**PRM-WP13 is recommended as triggered** on this evidence-supported outcome
C. Per the accepted Master Plan, PRM-WP13's own scope is limited to exactly
the gaps this register identifies — no broader scope is implied, and
PRM-WP13's start remains subject to its own separate authorization; this
document does not authorize or perform PRM-WP13 implementation.

## 6. What this analysis does not establish

This analysis does not conclude that the existing `audit_logs`/`ai_logs`/
`ai_processing_consent` infrastructure is inadequate for its OWN original
purposes (admin-action audit, AI-interaction logging, AI-consent tracking) —
it may be entirely adequate for those. This analysis concludes only that
none of it, individually or combined, implements Step 7 §13.1's governed-
request reconstructable record, which is a different and broader
requirement those tables were never designed to satisfy.

This analysis does not change P12's evidence state. Per the accepted Master
Plan, only PRM-WP18 may do that, using this document (and, if triggered and
completed, PRM-WP13's evidence) as input.
