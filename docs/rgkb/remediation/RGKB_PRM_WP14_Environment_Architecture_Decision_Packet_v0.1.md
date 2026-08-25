# PRM-WP14 — Environment Architecture Decision Packet — v0.1

- Work package: PRM-WP14 — Pilot Environment Architecture Decision &
  Isolation Evidence
- Authorization level: **DISCOVERY + OPTIONS + OWNER DECISION RECORD ONLY.**
  No environment created, no deployment performed, no production change made
  — before or after the Owner's decision was recorded.
- Controlling sources: Step 8 §3.3, §13 (environment isolation); accepted
  Master Plan PRM-WP14; carried finding PR8-2; Owner Decision 11, recorded
  2026-08-25.
- Status: **OWNER DECISION RECORDED — OPTION C APPROVED FOR THE CURRENT
  SYNTHETIC-ONLY STAGE. P13 UNRESOLVED / NOT EVIDENCED. NO ENVIRONMENT
  PROVISIONED.**
- Date: 2026-08-24 (drafted); 2026-08-25 (Owner decision recorded).

## 1. Purpose

Presents the current evidenced environment state, the nine boundary gaps
Step 8 identifies, and bounded architecture options. The analysis in §2–§5
was authored without choosing among the options; the Owner subsequently made
the decision, which is recorded verbatim in **§6**. This packet records that
decision — it does not make one, and it provisions nothing.

## 2. Current evidenced architecture

Read-only discovery performed this session, corroborating and extending
Step 8's own findings (PR8-2):

- `supabase/config.toml` declares exactly **one** `project_id`
  (`sxhzxlfxfveidjrepvwe`) — the same project referenced throughout
  CLAUDE.md as the live production Supabase project. No second project ID,
  no staging/preview project configuration, was found anywhere in the
  repository.
- `vercel.json` contains only SPA-routing rewrites; no environment-specific
  or staging-deployment configuration.
- `.github/workflows/` contains `test.yml`, `typecheck.yml`, and
  `deploy-functions.yml` — CI gates and a production edge-function deploy
  workflow. No dedicated staging-environment deploy workflow was found.
- Step 8 §9.2 (carried forward, not re-litigated here) already established
  that Vercel Preview deployments and Supabase "Preview" branches exist as
  **CI-ephemeral verification mechanisms** (used to check a PR's migration
  applies cleanly, for example), not as a persistent, isolated pilot
  environment — `docs/professional-audit/remediation-phase-1a/01-production-verification-checklist.md`
  explicitly recommends "a staging project or a throwaway test account" for
  ad hoc manual verification, which itself implies no standing dedicated
  environment exists as normal practice.

**Conclusion: exactly one persistent environment exists — production.**
No second, standing, isolated environment was found anywhere in the
repository or its configuration.

## 3. Nine-boundary evidence review

| Boundary | Evidence | Status |
|---|---|---|
| 1. Data-store isolation | Single Supabase project (`sxhzxlfxfveidjrepvwe`) serves all traffic; no second data store found | **NOT EVIDENCED** — no isolation exists |
| 2. Secrets isolation | No evidence of a separate secrets store for a non-production environment (none exists to isolate) | **NOT EVIDENCED** |
| 3. Access isolation | Existing RLS/`has_role` model applies uniformly to the single environment; no pilot-specific access boundary found | **NOT EVIDENCED** |
| 4. Deployment isolation | Vercel auto-deploys `main` to production (CLAUDE.md); no separate pilot deployment target found | **NOT EVIDENCED** |
| 5. Logging isolation | `audit_logs`/`ai_logs` write to the single production database; no separate pilot log store found | **NOT EVIDENCED** |
| 6. Synthetic-vs-real-data isolation | No mechanism found to structurally prevent synthetic pilot/rehearsal data from mixing with real production data in the same tables | **NOT EVIDENCED** |
| 7. External-integration isolation | `AI_FEATURES_ENABLED` is a single global flag (Step 8 §16.1 P7); no environment-scoped external-integration boundary found | **NOT EVIDENCED** |
| 8. Production isolation | By definition absent — there is only the one environment | **NOT EVIDENCED** |
| 9. Rollback/containment posture | No environment-level rollback/containment mechanism found beyond ordinary code-level git revert; no pilot-specific containment boundary found | **NOT EVIDENCED** |

All nine boundaries are currently **NOT EVIDENCED**, consistent with Step 8
§16.1's P13 = UNRESOLVED / NOT EVIDENCED and with PR8-2. This is not a claim
that isolation is impossible — it is a claim that none currently exists.

## 4. Feasible bounded architecture options

Presented as options, not a decision. Each has genuine tradeoffs; none is
selected here.

### Option A — Dedicated second Supabase project + dedicated Vercel deployment

A fully separate Supabase project (its own `project_id`, database, secrets,
RLS) and a separate Vercel deployment/domain for pilot use.

- **Benefits:** strongest isolation across all nine boundaries; real
  production data structurally cannot leak into the pilot environment and
  vice versa; independent rollback (delete/reset the second project without
  touching production).
- **Risks/costs:** additional infrastructure to provision and maintain;
  schema must be kept in sync with production (migration discipline across
  two projects); additional cost (a second Supabase project tier);
  additional secrets management surface.
- **Dependencies:** requires migration-replication tooling or process
  discipline to keep the pilot schema current with production.

### Option B — Isolated test/pilot accounts within the existing production project, with structural data-tagging

**NOT P13-SATISFYING AS CURRENTLY DESCRIBED. NOT ELIGIBLE FOR REAL-DATA
PILOT ENTRY**, unless and until a later redesign can evidence all nine
boundaries. Retained here only as an analyzed alternative — not presented as
an equally eligible choice alongside Option A.

Real production project, but pilot activity is confined to specifically
designated test accounts/records, structurally tagged (e.g. a `is_pilot`
flag or a dedicated pilot-cohort table) and RLS-scoped to prevent ordinary
users from seeing pilot data and vice versa.

- **Benefits:** no additional infrastructure; simpler operationally; uses
  the exact same code path as production, so no "pilot-only" code drift.
- **Risks/costs:** weaker isolation — a bug in the tagging/RLS logic could
  leak real and pilot data into each other's view; **as described, this
  option explicitly leaves boundaries 2 (secrets), 4 (deployment), and 5
  (logging) effectively unisolated** — it shares the same secrets store, the
  same deployment target, and the same log tables as production, by design.
  A design that leaves three of nine required boundaries structurally
  unisolated does not evidence environment isolation for those boundaries no
  matter how carefully the remaining boundaries (data-store tagging, access)
  are implemented; rollback/containment of a pilot incident could affect
  production if not carefully scoped, and boundary 9 (rollback/containment)
  is therefore also weakened by construction, not merely undecided.
- **Dependencies:** requires new, carefully reviewed RLS policies (L2 work
  per CLAUDE.md) and a reliable tagging mechanism — and, to become eligible
  for real-data pilot entry at all, would additionally require a redesign
  addressing boundaries 2, 4, 5, and 9 specifically, which this description
  does not attempt and does not claim to solve.

### Option C — Fully synthetic, non-deployed rehearsal only (no environment decision needed yet)

Defer any real-data environment decision entirely; restrict all near-term
activity (specifically PRM-WP17's rehearsal) to synthetic data executed in
whatever isolated context the engineering implementation is developed and
tested in (e.g. local/CI test runs), with no persistent "pilot environment"
provisioned at all until a real-data pilot is separately authorized.

- **Benefits:** no infrastructure decision required now; fully consistent
  with the current Wave 0/1 scope, which uses synthetic data only; defers
  cost and complexity until actually needed.
- **Risks/costs:** does not itself resolve P13 for a future real-data pilot
  — Option A or B (or another option) would still need deciding before any
  real student data is used.
- **Dependencies:** none beyond what Wave 0/1 already require.

### Other explicitly bounded designs

The Owner may specify a different architecture not listed above; this
packet's option set is illustrative, not exhaustive, per the authorization's
own instruction that Claude may recommend but not decide.

## 5. Recommendation, where evidence supports one

Evidence supports a **narrow, conditional** recommendation: **Option C is
the correct choice for the current program stage** (Wave 0/1, synthetic-only
work), because no real-data pilot is authorized or imminent, and provisioning
Option A or B now would be premature infrastructure work not yet justified
by any Owner-approved pilot scope. (At drafting, PRM-WP01 was open. The
Owner's scope decisions have since been recorded and define a **synthetic-
only** stage with no real-data pilot — which confirms rather than disturbs
this recommendation. **P2 remains UNRESOLVED / NOT EVIDENCED.**)

For a *future real-data pilot*, Option A and Option B are **not** presented
as equally eligible alternatives. Option B, **as currently described**, is
NOT P13-SATISFYING and NOT ELIGIBLE for real-data pilot entry, because it
structurally leaves boundaries 2, 4, 5, and 9 unisolated by design (§4) —
this is not a matter of Owner risk tolerance, it is a description that does
not evidence the required boundaries regardless of preference. Option A
evidences all nine boundaries by design. Between Option A and an eventual
*redesigned* Option B that actually addresses boundaries 2/4/5/9, evidence
does not support a confident recommendation — that narrower choice would
depend on Owner risk tolerance, budget, and operational capacity, none of
which is repository-evidenced. But Option B in its *current, analyzed form*
is not a live candidate for real-data pilot entry; only Option A or a
redesigned alternative are.

## 6. Owner decision — RECORDED

The decision required by this packet was:

1. Confirm Option C (defer) for the current program stage — or direct
   otherwise.
2. For any future real-data pilot: select Option A, or direct that Option B
   be redesigned to address boundaries 2/4/5/9 before it may be reconsidered,
   or specify a different alternative bounded design, once PRM-WP01's scope
   is resolved enough to inform the choice. **Option B as currently
   described in §4 is not an available selection for real-data pilot entry**
   — selecting it in its current form would not satisfy P13 regardless of
   Owner preference; the Owner may direct a redesign, not adopt the
   unmodified description.

### 6.1 Recorded decision (Owner Decision 11, 2026-08-25)

> **OPTION C — APPROVED FOR THE CURRENT SYNTHETIC-ONLY STAGE.**
>
> Formal RGKB development, integration testing, and end-to-end rehearsal
> should use synthetic data in local/CI or otherwise authorized
> non-production test execution. The current production environment is **NOT**
> an isolated pilot environment. Existing production-hosted fictional/sample
> personas may remain reference/test fixtures, but this does **not** authorize
> RGKB production deployment or new live RGKB execution.
>
> **P13 remains UNRESOLVED / NOT EVIDENCED.**
>
> For a future real-data pilot: Option B as currently described remains **NOT
> P13-SATISFYING and NOT ELIGIBLE**; Option A, a materially redesigned Option
> B, or another bounded architecture may be considered later; **no future
> architecture is selected by this decision.**

The corresponding row in the companion PRM-WP01 packet is §4.11 (Owner
Decision 11); the two records are consistent.

### 6.2 What this decision explicitly does NOT do

Preserved without weakening:

- **Option C does NOT satisfy P13.** It defers the environment decision
  rather than evidencing any boundary. All nine boundaries in §3 remain
  **NOT EVIDENCED**.
- **Option C is a deferral, not an isolated real-data environment.** It
  creates no isolation and provisions no environment.
- **Option B, as currently described in §4, is NOT P13-satisfying and is NOT
  eligible for real-data pilot entry.** It is not selected, not endorsed, and
  not made eligible by this decision.
- **Future real-data architecture remains undecided.** Item 2 above is not
  answered by this decision and stays open until PRM-WP01's scope and the
  applicable readiness evidence support a choice.
- **P13 remains UNRESOLVED / NOT EVIDENCED**, re-assessable only at PRM-WP18.
- **No environment mutation occurred.** Nothing was provisioned, created,
  configured, deployed, or changed in Supabase, Vercel, GitHub Actions, or
  any other environment. This decision is a documentation record only.
- Production-hosted fictional/sample personas remaining usable as reference
  fixtures (PRM-WP01 §4.2) does **not** authorize new production-side RGKB
  execution, and does **not** reclassify production as a pilot environment.
  Any later live-system execution against those personas requires separate
  explicit Owner authorization after the runtime, deployment, and safety
  boundaries are reviewed.
- The §8 prohibition below is **unaffected**: no real student data, and no
  real-data pilot activity, before the §3 boundaries are evidenced for
  whichever architecture the Owner eventually selects.

## 7. Engineering work that would follow each choice

- **Option A:** provision a second Supabase project; establish a migration-
  sync process; configure a separate Vercel deployment target; replicate
  secrets management; separately authorized L2/L3 work throughout.
- **Option B (redesigned only — the current description is not
  implementable as a P13-satisfying target):** design and review new RLS
  policies for pilot-data isolation (L2, Human Gate 1 required per
  CLAUDE.md §3); design the tagging mechanism; audit existing queries for
  pilot/production leakage risk; **additionally** design a secrets-isolation
  mechanism (boundary 2), a deployment-isolation mechanism (boundary 4), a
  logging-isolation mechanism (boundary 5), and a pilot-specific rollback/
  containment posture (boundary 9) — none of which the current description
  attempts, and all of which would need to exist before this option could be
  evidenced as P13-satisfying.
- **Option C:** no new engineering work — proceed with existing synthetic/
  test-execution paths already available to Wave 0/1. Confirmed explicitly:
  Option C does not satisfy P13 either — it defers the environment decision
  entirely rather than evidencing any boundary, and remains appropriate only
  because no real-data pilot is authorized or imminent (§5).

## 8. Explicit prohibition

No real student data may be used, and no real-data pilot activity may occur,
before the boundaries in §3 are evidenced for whichever architecture the
Owner eventually selects (Step 8 §3.3, absolute). This prohibition is
unaffected by which option, if any, the Owner chooses now.

## 9. Explicit confirmation

**NO ENVIRONMENT MUTATION** — no infrastructure was created, modified, or
deployed in the production of this document. P13 is not stated as satisfied
anywhere in this packet; it remains UNRESOLVED / NOT EVIDENCED until the
Owner decides and the resulting architecture is actually evidenced, re-
assessed only at PRM-WP18.

This confirmation is **re-affirmed as of the 2026-08-25 revision** that
recorded Owner Decision 11 (§6.1). Recording the decision was a documentation
act only:

- **NO ENVIRONMENT MUTATION** — nothing provisioned, created, configured,
  deployed, or deleted in Supabase, Vercel, GitHub Actions, or elsewhere.
- **P13 remains UNRESOLVED / NOT EVIDENCED**; all nine boundaries in §3
  remain **NOT EVIDENCED**. Choosing Option C did not evidence any of them.
- **No real-data pilot architecture is selected.** Option B as described
  remains ineligible; Option A is not selected either.
- **No pilot, real data, deployment, production execution, external-tool
  enablement, or Phase 9 activity is authorized** by this packet.
- PR8-2 stands as carried; no other P-gate or finding state changed.
