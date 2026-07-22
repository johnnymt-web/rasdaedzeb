# Phase 1C — Superadmin RLS Policy Drift Analysis

**Branch:** `fix/superadmin-policy-drift-phase1c` (off `dc02fd6`, which committed Phase 1A/1B) · **Date:** 2026-07-23 · **Mode:** read-only analysis. **No migration was created — exact production evidence is insufficient (see §Decision).** No SQL applied, no production change, no source change.

## Migration decision (headline)

**DEFERRED.** Per the Phase 1C evidence rule (§4), a capture migration may be written only when the exact live definition of every policy is known from production introspection (`pg_policies`) — not reconstructed from summaries, prose, or memory. **No `pg_policies` dump of these policies is available to this review.** The only artifact in hand is the *proposed* SQL drafted earlier in the session (which the owner was asked to run) — that is memory/prose, explicitly disallowed as the migration basis, and it does not confirm (a) that all five were applied, (b) their live names, (c) their target roles, (d) permissive vs restrictive mode, or (e) the exact PostgreSQL-normalized `qual`. See `01-migration-and-production-checklist.md` for the exact introspection queries required to proceed.

## Five-policy inventory (as proposed / to be confirmed)

These are the **intended** definitions from the earlier session draft. They are the *starting hypothesis* for introspection, **not** confirmed live evidence:

| # | Table (schema.public) | Proposed policy name | Cmd | Proposed `USING` |
|---|---|---|---|---|
| 1 | `profiles` | `Superadmin select all profiles` | SELECT | `public.has_role(auth.uid(), 'superadmin'::public.app_role)` |
| 2 | `assessments` | `Superadmin select all assessments` | SELECT | same |
| 3 | `big_five_assessments` | `Superadmin select all big_five` | SELECT | same |
| 4 | `caas_assessments` | `Superadmin select all caas` | SELECT | same |
| 5 | `work_values_assessments` | `Superadmin select all work_values` | SELECT | same |

Proposed mode: PERMISSIVE (default), roles: unspecified in the draft → would default to `public`. **All of this must be confirmed by `pg_policies`.**

## Live-vs-migration comparison

| Policy | Live definition available | Present in migrations | Equivalent migration (other name) | Drift confirmed | Action |
|---|---|---|---|---|---|
| Superadmin select all profiles | ❌ (proposed only) | ❌ | ❌ (no policy references `has_role(...,'superadmin')`) | Repo-side **YES**; live-side **unconfirmed** | Introspect → capture |
| Superadmin select all assessments | ❌ | ❌ | ❌ | Repo **YES**; live unconfirmed | Introspect → capture |
| Superadmin select all big_five | ❌ | ❌ | ❌ | Repo **YES**; live unconfirmed | Introspect → capture |
| Superadmin select all caas | ❌ | ❌ | ❌ | Repo **YES**; live unconfirmed | Introspect → capture |
| Superadmin select all work_values | ❌ | ❌ | ❌ | Repo **YES**; live unconfirmed | Introspect → capture |

**Verified facts (repository side):**
- `grep` of `supabase/migrations/*.sql` for `Superadmin select all`, any `... FOR SELECT ... superadmin`, and `has_role(...,'superadmin')` **in a policy** → **zero matches**. No migration creates these policies or an equivalent under another name.
- The five affected tables get their existing SELECT policies from: `20260605210211_phase1a_security_rls.sql` (profiles/assessments/big_five/caas), `20260508180000_work_values.sql` (work_values), and the write-lockdown `20260618140000_g5_phaseb_assessments_rls_lockdown.sql` (assessments writes). **None of these adds a superadmin SELECT clause.**
- The policies exist **only in production** (if applied), not in any branch. The related `feat/superadmin-student-roster` branch is UI only (roster page); it contains no RLS policy.
- **A clean `db reset` from migrations would NOT reproduce production** for these five SELECT grants → a superadmin on a freshly-built DB would see no student rows. This is the PF-006 drift, confirmed at the repository level.

## Affected tables

`public.profiles`, `public.assessments`, `public.big_five_assessments`, `public.caas_assessments`, `public.work_values_assessments`. All hold minors' data. The proposed policies add **read-only** superadmin visibility; they do not touch INSERT/UPDATE/DELETE (notably, `assessments` remains write-locked to the service role by `20260618140000`).

## Helper-function analysis (`public.has_role`) — captured, sound

The five policies depend on `public.has_role(auth.uid(), 'superadmin'::public.app_role)`. This helper **is present in migrations** (`20260618170000_superadmin_privileges.sql:17-28`) — it is **not** drift. Security review (repo evidence):

- **Storage of superadmin status:** `public.user_roles.role = 'superadmin'` — a trusted application table.
- **Evaluator:** `has_role(_user_id uuid, _role app_role)` — `LANGUAGE sql`, `STABLE`, **`SECURITY DEFINER`**, **`SET search_path TO 'public'`**, schema-qualified read of `public.user_roles`.
- **Does it read JWT claims / `raw_user_meta_data`?** No — it reads only `user_roles`. Not influenced by client-set metadata.
- **Can an ordinary client change the value?** No — `enforce_role_assignment()` (`20260618170000:33-62`) raises unless the caller is already superadmin; `user_roles` write policies are admin-scoped. No self-grant path.
- **Executable by authenticated users?** Yes (RLS calls it), but it only returns true for the caller's actual stored role → no escalation via calling it.
- **Grant surface of the five policies:** SELECT only (per proposal; confirm via introspection).
- **Verdict:** no directly exploitable defect in the helper mechanism → **no blocker** to capturing the policies once their live definitions are confirmed. `search_path` is safely pinned; table/function references are schema-qualified.

## Confirmed drift

At the repository level, drift is **confirmed**: the five superadmin SELECT policies are absent from all migrations and from all branches, and (if live) exist only in production. The dependency helper is captured, so only the policies themselves are missing.

## Unresolved drift / evidence gaps

1. **Exact live definitions** of all five policies (name, `roles`, `permissive`, `cmd`, `qual`, `with_check`) — require `pg_policies` output.
2. **Whether all five were actually applied** in production (the session pivoted to a UI-roster gap; no post-apply `pg_policies` confirmation was captured for these policies).
3. **Whether any *other* production-only policy exists** on these five tables beyond the proposed superadmin ones (introspection should list all policies per table, not just the five names, to catch additional drift).
4. **Roles binding:** the proposed `CREATE POLICY` had no `TO` clause → `public`; production may differ. Capturing the wrong role binding would be its own drift.

## Remaining PF-007 limitation (unchanged, out of scope here)

Even once captured, these policies grant superadmin **unlogged** global read of minors' data. PF-007 (privileged-read audit logging) is **not** implemented in Phase 1C and must not be. Capturing the policies makes the *existing* production grant reproducible; it does not add oversight.

## Decision

**No migration file created in Phase 1C.** Proceed to introspection (`01-…`), then a follow-up may create one additive capture migration using **Strategy A (deterministic `drop policy if exists` + `create policy`)** — recommended because the goal is to normalize the repo to the exact reviewed definition and make a clean deploy reproduce production; it is safe here because the change is additive/read-only and idempotent. That migration must be written **only** from the confirmed `pg_policies` output, must not widen access, and must not be applied until reviewed.
