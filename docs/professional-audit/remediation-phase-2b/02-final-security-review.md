# Phase 2B — Final Security & Acceptance Review (PF-012)

**Reviewer role:** independent PostgreSQL / Supabase-RLS / data-integrity / safeguarding reviewer.
**Scope:** the uncommitted Phase 2B change set only (migration `20260723150000_block_assessment_history_deletion.sql`, test `src/test/assessmentDeletionProtection.test.ts`, `docs/professional-audit/remediation-phase-2b/`) plus the earlier migrations/FKs needed to reason about DELETE on the four assessment tables. Review-only except a minimal doc-accuracy correction (below).
**Date:** 2026-07-23 · **Branch:** `fix/assessment-deletion-protection-phase2b`.

---

## 1. Verdict — **ACCEPT WITH CONDITIONS**

The migration SQL is correct, minimal, and safe; it fully closes PF-012's stated vector (surgical hard-DELETE of a completed attempt row by a client role) and is regression-proof. **One confirmed defect was a documentation over-claim**, not a code defect: the migration comment and both docs asserted there was *no student-accessible cascade path*, which is false. This was corrected in place (doc-only; SQL unchanged). Acceptance is conditioned on tracking the residual `request_self_deletion()` cascade path as a separate pre-pilot governance item.

---

## 2. Root-cause confirmation — CONFIRMED

Before Phase 2B (source: `20260605210211_phase1a_security_rls.sql:200-210`, matching the live `pg_policies` A2 export):

- `assessments`: `CREATE POLICY "Delete own assessments" … FOR DELETE USING (public.is_self(user_id))` — permissive, client-usable.
- `big_five_assessments`: `"Delete own big_five" … USING (public.is_self(student_id))`.
- `caas_assessments`: `"Delete own caas" … USING (public.is_self(student_id))`.
- `work_values_assessments`: **no** DELETE policy (already delete-denied).

These three were the **only** DELETE policies on any completed-assessment table. A student authenticated to PostgREST could issue `delete from assessments where user_id = <self>` and the row would be removed — directly erasing longitudinal minors' psychometric history. UI hiding was never a database boundary. **PF-012 is correctly scoped** as unauthorized hard deletion of completed assessment/history data.

---

## 3. Assessment-table inventory — CONFIRMED complete

| Table | Owner col | SELECT | INSERT | UPDATE | DELETE (before) | DELETE (after) | FK → auth.users |
|---|---|---|---|---|---|---|---|
| `assessments` | `user_id` | Scoped/own/parent (kept) | none (Phase-B lockdown; service-role only) | none (Phase-B lockdown) | `Delete own assessments` | **restrictive `USING(false)`** | `user_id` = student `auth.users` id, ON DELETE CASCADE |
| `big_five_assessments` | `student_id` | scoped (kept) | own INSERT (kept) | recompute-trigger governed | `Delete own big_five` | **restrictive `USING(false)`** | `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `caas_assessments` | `student_id` | scoped (kept) | own INSERT (kept) | recompute-trigger governed | `Delete own caas` | **restrictive `USING(false)`** | `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `work_values_assessments` | `student_id` | scoped (kept) | own INSERT (kept) | governed | none | **restrictive `USING(false)`** | `REFERENCES auth.users(id) ON DELETE CASCADE` |

Excluded tables re-checked — none hold equivalent completed-assessment attempt history with a student DELETE policy: `reflections`, `employability_skills`, `student_skill_snapshots`, `skills_gap_analyses`, `ai_reports`/`ai_report_counselor_notes` (regenerable cache), `student_goals` (goals, not attempts). EQ/RIASEC/Skills have no separate tables (they live in `assessments`). Scope is neither too narrow nor broadened merely because a table holds student data.

---

## 4. Restrictive-policy analysis — CONFIRMED safe (design endorsed)

`AS RESTRICTIVE FOR DELETE TO public USING (false)` on all four tables:

- **Semantics:** restrictive policies are **AND-ed** with the union of permissive policies; `USING(false)` matches no row, so DELETE is denied for every role the policy applies to. `FOR DELETE` scopes it to DELETE only — SELECT/INSERT/UPDATE are unaffected (verified: no `FOR SELECT|INSERT|UPDATE` in the migration).
- **Regression-proofing:** if a future migration re-introduces a permissive `Delete own …`, the restrictive deny still AND-s to false → DELETE stays blocked. This is the decisive advantage over "just no permissive policy" (which a single future permissive grant would silently re-open). Explicit restrictive deny is the **correct** choice here and is endorsed.
- **`TO public`:** in PostgreSQL `public` is the pseudo-role every role belongs to, so the deny reaches `anon`, `authenticated`, and any client role — intended.
- **BYPASSRLS / owner:** `service_role` has BYPASSRLS and is **not** constrained (intended, for internal maintenance). The table owner (`postgres`/`supabase_admin`) also bypasses RLS **because FORCE ROW LEVEL SECURITY is not set** (see §5) — but app traffic never runs as the owner, so this is not a client exposure. The migration does not falsely claim otherwise.
- **Downsides considered:** no legitimate client-side DELETE workflow is blocked (§8 — no role had a non-`Delete own …` DELETE path; app issues zero assessment `.delete()` calls). A *future admin* hard-delete workflow would be blocked and would need its own governed path (RPC/service-role) rather than a permissive policy — acceptable and desirable. Clean replay and apply-to-already-patched are safe (all statements `DROP … IF EXISTS` then `CREATE`).

---

## 5. RLS enablement / bypass — CONFIRMED

All four tables have `ENABLE ROW LEVEL SECURITY` (assessments `20260605210211:34`; big_five/caas `20260505203000:29,79`; work_values `20260508180000:23`; re-asserted in phase1a). **`FORCE ROW LEVEL SECURITY` is set on none** of them (repo-wide search returns zero `FORCE` statements). Consequence: the table owner and BYPASSRLS roles are not subject to RLS — which is the intended Supabase model (app roles `anon`/`authenticated` are non-owner and fully subject to the deny; `service_role` intentionally bypasses). No SECURITY DEFINER function exposes a *direct* client DELETE of an assessment row. (A DEFINER **cascade** path exists via account erasure — §10.) The deny is meaningful for exactly the roles it must bind.

---

## 6. Policy-name & migration safety — CONFIRMED

- Three `DROP POLICY IF EXISTS` target exactly the unsafe names, matching phase1a and the live export. `IF EXISTS` used throughout.
- Only DELETE policies are dropped; no SELECT/INSERT/UPDATE policy is touched (test-enforced).
- The four new restrictive names (`No client delete of assessments|big_five|caas|work_values`) are unique, deterministic, and each is `DROP … IF EXISTS`-guarded before `CREATE` (idempotent, safe on an already-patched DB).
- No function/trigger/grant/revoke is altered (verified). Migration ordering (`20260723150000`) is after all prior policy migrations. Clean replay is logically safe.

---

## 7. Effective DELETE authorization matrix (post-migration)

| Role | Direct DELETE on the 4 tables | Basis |
|---|---|---|
| anon | ❌ denied | restrictive `USING(false)` (+ no permissive grant) |
| student owner | ❌ denied | permissive `Delete own …` dropped; restrictive deny |
| student non-owner | ❌ denied | also fails SELECT scope |
| counselor | ❌ denied | never had a DELETE policy; restrictive deny |
| school admin | ❌ denied | never had a DELETE policy; restrictive deny |
| platform admin (`user_roles.role='admin'`) | ❌ denied | no assessment DELETE policy exists for admins; restrictive deny |
| superadmin | ❌ denied | no assessment DELETE policy; restrictive deny |
| authenticated generic | ❌ denied | restrictive deny |
| table owner (postgres) | ✅ (bypasses RLS, FORCE off) | not a client identity |
| service_role / internal | ✅ (BYPASSRLS) | governed maintenance + account-erasure cascade |

No admin/superadmin previously had a *client* DELETE path on these tables (searched — only `Delete own …` existed). Product boundary "no ordinary client role hard-deletes completed assessment history" is met.

---

## 8. Service-role & internal deletion — CONFIRMED

- `service_role` bypasses RLS as expected; Phase 2B makes no false claim that RLS constrains it.
- Service-role key is server-only (edge functions); the frontend uses the anon key (not re-verified in this phase, but no new exposure introduced).
- No client-accessible RPC wraps *service-role* deletion of an assessment row.
- Internal/governed deletion of assessments happens only via `auth.users` cascade (account erasure), documented as intentional.

---

## 9 & 10. Cascade-bypass review — **DEFECT FOUND (corrected in docs), residual tracked**

FK reality: all satellites and `assessments` reference `auth.users(id) ON DELETE CASCADE`. The only cascade path to assessment history is deleting the `auth.users` account row. Two SECURITY DEFINER RPCs reach it:

1. **`public.delete_user(target_user_id)`** (`20260419100000:54`) — checks `has_role(caller,'admin')`, blocks self-delete, writes `audit_logs`. **Admin-only, governed, audited. Not student-accessible.** ✅
2. **`public.request_self_deletion()`** (`20260417233000_gdpr_self_delete.sql`) — `SECURITY DEFINER`, body `DELETE FROM auth.users WHERE id = auth.uid()`, **no role check, no audit entry, no consent/parental gate.** It is present in generated `types.ts` (PostgREST-exposed as `Args: never`), has **no `REVOKE`** anywhere in the repo (so default `EXECUTE` to PUBLIC/`authenticated` stands), and is **not** referenced by any frontend code — but a student can call `supabase.rpc('request_self_deletion')` directly.

**Confirmed defect (documentation, not code):** the migration comment, `00-implementation-summary.md`, and `01-…md` stated the cascade path was reachable "**only** through the admin-only `delete_user` RPC" and that "**No student-accessible cascade bypass exists** / students cannot delete `auth.users`." That is **factually wrong** — `request_self_deletion()` is a student-accessible cascade that erases assessment history.

- **Severity:** Medium for PF-012 as scoped; High as a standalone minors'-safeguarding gap (see below). Does **not** make the migration unsafe.
- **Blocking status for Phase 2B acceptance:** **non-blocking** for the migration. `request_self_deletion` performs **whole-account** GDPR self-erasure (login, profile, roles, all data) — materially different from PF-012's surgical "delete one attempt, keep the account, retake to game the report" vector, which the migration fully closes. The task explicitly carves out "account erasure by a trusted governed workflow" as potentially valid/out of scope. And a restrictive DELETE policy **cannot**, by design, constrain a SECURITY-DEFINER cascade — so no in-scope migration change could address it. It is therefore correctly out of Phase 2B's *direct-DELETE* scope.
- **But it is a real residual:** `request_self_deletion` is **not well-governed for minors** — no audit trail, no consent/parental verification, no anon `REVOKE`, no soft-delete/retention. A minor (or anyone with the minor's session) can irreversibly erase all longitudinal data with one RPC call. This must be governed **before pilot**.
- **Correction applied (doc-only, SQL untouched):** the migration comment and both docs now accurately describe both RPCs, state that `request_self_deletion` IS a student-accessible cascade, and flag it as a tracked pre-pilot follow-up. Added a read-only grant-inspection query to `01-…md` §E.

**Recommended follow-up (new finding — suggest "PF-013 / PF-012-residual", out of Phase 2B):** `REVOKE EXECUTE … FROM anon`; add a consent/parental-authorization + confirmation gate; write an `audit_logs` entry; consider soft-delete/retention for minors' records instead of immediate hard cascade. Not to be done inside Phase 2B.

---

## 11. Retake / history preservation — CONFIRMED

Phase 2A's retake calls `public.start_new_assessment_cycle()` which increments `current_assessment_cycle` only; prior attempt rows (with their `cycle_number`, `grade_band`, `question_set_version`, timestamps) remain. Repo search: **zero** `.delete()` calls on any assessment table. Blocking client DELETE therefore breaks no workflow; the report cycle selector continues to show prior cycles. (Runtime confirmation = test C12.)

---

## 12. Work-values rationale — CONFIRMED justified

`work_values_assessments` had no unsafe student DELETE policy, yet the restrictive deny is warranted: it makes the longitudinal-history boundary **uniform** across all four tables and **prevents a future accidental permissive DELETE grant** from silently re-opening the hole (the same regression vector that produced the phase1a policies). It introduces no current regression (no client ever had, or needs, DELETE here). Keep it.

---

## 13. Rollback review — CONFIRMED honest (with the correct caveat)

Rollback drops only the four restrictive policies and explicitly does **not** restore the unsafe `Delete own …` policies. This is a **security-preserving forward-fix**, not a full historical rollback — dropping the restrictive policies returns the tables to "no DELETE policy at all" (still delete-denied for clients since no permissive grant remains), **not** to the pre-migration state. The docs state this correctly and correctly refuse to restore the unsafe policies "for symmetry." Honest and safe.

---

## 14. Test review — CONFIRMED (structural only, honestly scoped)

`src/test/assessmentDeletionProtection.test.ts` asserts: the three unsafe policies are dropped; a `AS RESTRICTIVE FOR DELETE TO public USING (false)` policy exists on each of the four tables; no `FOR SELECT|INSERT|UPDATE` policy is created/dropped; all DROP targets are DELETE policies; no function/trigger/grant is added; and no source file issues a `.delete()` on an assessment table. **11/11 structural assertions pass** (dependency-free verifier — vitest can't run locally on the broken `node_modules`). The test is **text/structural matching only** and does not claim to prove runtime RLS behavior — the file header explicitly defers that to the disposable-DB runtime matrix. No false runtime proof. (Note: the test does not — and cannot at the text level — cover the `request_self_deletion` cascade; that belongs to the runtime matrix.)

---

## 15. Runtime test matrix — PRESENT, extended

`01-…md` §C covers student own/prior-cycle/other-student DELETE denial, anon, counselor, school-admin, platform-admin denial, service-role bypass, SELECT/INSERT/UPDATE regression, retake history preservation, and a future-permissive-policy resistance test. Superadmin denial should be added explicitly (currently implied by "no client role"). The residual `request_self_deletion` grant check was added to §E. All runtime tests remain **pending** (no disposable Postgres in this environment). Must never run against production.

---

## 16. Validation commands executed

| Command | Result |
|---|---|
| `git status --short` | only untracked audit/config dirs + the 3 Phase 2B artifacts; no tracked source modified |
| `git diff --check` | clean |
| Structural verifier (11 assertions) | **11/11 pass** |
| `npx tsc --noEmit -p tsconfig.app.json` | only pre-existing `TS2307` missing-module errors (date-fns, embla); **0 in any Phase 2B file** |
| `npx vitest run …` | **blocked** locally (broken `node_modules`); CI: `npm ci && npx vitest run src/test/assessmentDeletionProtection.test.ts` |

No dependencies installed, no migration applied, no SQL run, no deploy, no production data touched.

---

## 17. Defects

**D1 — Documentation over-claim: false "no student-accessible cascade bypass."**
- **Severity:** Medium (PF-012 scope) / High (standalone minors'-safeguarding).
- **Blocking:** non-blocking for the migration; blocking for the *accuracy* of the completeness claim → corrected.
- **Evidence:** `request_self_deletion()` (`20260417233000_gdpr_self_delete.sql`, SECURITY DEFINER, no role gate, in `types.ts`, no REVOKE) vs. the docs' "reachable only through the admin-only delete_user RPC … students cannot delete auth.users."
- **Correction:** doc-only edits to the migration comment, `00-…md` (cascade section), and `01-…md` (§E) to describe both RPCs accurately, mark `request_self_deletion` as a student-accessible residual, and add a grant-inspection query. **Migration SQL unchanged.**

No other defects. Policy names, restrictive semantics, role scope, RLS enablement, SELECT/INSERT/UPDATE preservation, migration validity, and rollback honesty are all correct.

---

## 18. Readiness

- **Safe to commit:** ✅ yes (migration + test + docs, as corrected).
- **Safe for preview apply:** ✅ yes (disposable DB; run the §B/§C/§E matrix).
- **Safe to merge to main:** ⚠️ **conditional** — only after the runtime matrix passes in preview **and** the owner records the `request_self_deletion` residual as a tracked pre-pilot follow-up. Merging the migration itself does not worsen security; the condition is governance-tracking, not a code block. Requires the standard explicit human "go" per CLAUDE.md §3.
- **Safe for production apply:** ❌ **not yet** — pending runtime verification in preview and explicit human approval. Nothing about Phase 2B should be applied to production autonomously.
- **Remaining conditions:** (1) preview runtime matrix green (incl. explicit superadmin denial + future-permissive-policy test); (2) `request_self_deletion` governance tracked as a separate finding before pilot; (3) human "go" before any prod apply/merge.
- **PF-012 status:** **Remediated in code — runtime verification pending.** Direct client hard-DELETE vector fully closed in code; whole-account self-erasure cascade is an out-of-scope, now-documented residual.

---

## 19. Confirmation

No SQL was applied. No migration was run. No database, production, config, secret, dependency, or deployment change was made. The only writes this review made are the three in-place documentation-accuracy corrections and this review file. No other remediation phase was started.
