# Phase 1C — Superadmin RLS Policy Drift Analysis

**Branch:** `fix/superadmin-policy-drift-phase1c` (off `dc02fd6`, which committed Phase 1A/1B) · **Date:** 2026-07-23 · **Mode:** read-only analysis. **No migration was created — exact production evidence is insufficient (see §Decision).** No SQL applied, no production change, no source change.

## Migration decision (headline)

**RESOLVED — migration created (Phase 1C.1, 2026-07-23).** Exact read-only production evidence was received (`pg_policies` exports A1/A2/A3 + `has_role` definition A4) and inspected directly. It confirms all five policies verbatim, so the capture migration was written from evidence:

> `supabase/migrations/20260723120000_capture_superadmin_select_policies.sql`

Strategy: **deterministic replacement** (`DROP POLICY IF EXISTS` + `CREATE POLICY`) — additive, SELECT-only, idempotent; normalizes a clean DB and the already-patched production DB to the same reviewed definition. **Not applied** (no SQL run; owner applies after review). The earlier deferral (below, retained for history) is superseded.

### Evidence received (A1–A4)
- **A1** — the five superadmin policies by name: **exactly 5 rows**, each `PERMISSIVE / SELECT / {public} / qual = has_role(auth.uid(), 'superadmin'::app_role) / with_check = NULL`.
- **A3** — any policy whose `qual` references superadmin: **the same 5 rows, no others** → **A1 and A3 are consistent** (no additional superadmin policy anywhere).
- **A2** — full policy inventory for the five tables: the five superadmin policies appear within it with identical attributes; the other rows are the pre-existing student/parent/counselor/admin/lockdown policies (and some duplicate INSERT/UPDATE/SELECT generations) — **out of scope, not touched**.
- **A4** — `public.has_role`: `SECURITY DEFINER`, volatility `STABLE`, `search_path=public`, reads `public.user_roles`; **identical to repo migration `20260618170000`** → the helper is captured and unmodified.

The live `qual` is stored unqualified (`has_role(...'superadmin'::app_role)`) because `search_path` includes `public`; the migration writes it schema-qualified (`public.has_role(...'superadmin'::public.app_role)`) — semantically identical.

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
| Superadmin select all profiles | ✅ (A1/A2/A3) | ❌ → now captured | ❌ | **YES** | Captured in `20260723120000` |
| Superadmin select all assessments | ✅ | ❌ → now captured | ❌ | **YES** | Captured |
| Superadmin select all big_five | ✅ | ❌ → now captured | ❌ | **YES** | Captured |
| Superadmin select all caas | ✅ | ❌ → now captured | ❌ | **YES** | Captured |
| Superadmin select all work_values | ✅ | ❌ → now captured | ❌ | **YES** | Captured |

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

## Unresolved drift / evidence gaps — resolved

1. ~~Exact live definitions~~ **Received (A1/A2/A3):** all five are `PERMISSIVE / SELECT / {public} / has_role(auth.uid(),'superadmin'::app_role) / with_check NULL`.
2. ~~Whether all five were actually applied~~ **Confirmed applied** — A1 returns all five.
3. ~~Other production-only superadmin policy~~ **None** — A3 shows only these five reference superadmin. (A2 does reveal unrelated duplicate INSERT/UPDATE/SELECT generations on these tables — pre-existing, **out of scope** for this phase.)
4. ~~Roles binding~~ **Confirmed `{public}`** — matches the migration's `TO public`.

**PF-006 status:** repository drift for these five policies is now **captured in code** (migration `20260723120000`). It is **not yet production-verified** — the migration has not been applied, and a clean-deploy reproduction check (Supabase Preview / `db reset`) still needs to run. Note the broader migrations-folder reproducibility caveat (legacy non-timestamped SQL) is separate and unchanged.

## Remaining PF-007 limitation (unchanged, out of scope here)

Even once captured, these policies grant superadmin **unlogged** global read of minors' data. PF-007 (privileged-read audit logging) is **not** implemented in Phase 1C and must not be. Capturing the policies makes the *existing* production grant reproducible; it does not add oversight.

## Decision

**No migration file created in Phase 1C.** Proceed to introspection (`01-…`), then a follow-up may create one additive capture migration using **Strategy A (deterministic `drop policy if exists` + `create policy`)** — recommended because the goal is to normalize the repo to the exact reviewed definition and make a clean deploy reproduce production; it is safe here because the change is additive/read-only and idempotent. That migration must be written **only** from the confirmed `pg_policies` output, must not widen access, and must not be applied until reviewed.
