# Phase 2D.1 — Privileged Read Audit (PF-007): Discovery & Architecture Decision

**Branch:** `fix/privileged-read-audit-phase2d` · **Date:** 2026-07-23 · **Type:** discovery & design only — **no** implementation. Nothing applied/deployed. Sizes: S / M / L.

---

## 1. PF-007 confirmation — **CONFIRMED (Medium), two sub-claims narrowed**

**Finding:** privileged **superadmin** cross-school reads of sensitive student/assessment data leave **no audit trail**.

Independently re-verified after PF-006 (the five superadmin SELECT policies were captured in `20260723120000_capture_superadmin_select_policies.sql`):

- **Cross-school read exists:** a user with `user_roles.role = 'superadmin'` has **global, permissive `FOR SELECT`** on `profiles`, `assessments`, `big_five_assessments`, `caas_assessments`, `work_values_assessments` — `USING has_role(auth.uid(),'superadmin')`, `TO public` (`…capture…:30-68`). No school predicate → reads every school's minors' data.
- **No read logging:** `audit_logs` is **action/write-oriented** — populated only by `SECURITY DEFINER` RPCs (e.g. `delete_user`, `20260417230000:45-53`). There is **no SELECT/read event** anywhere. A superadmin can bulk-read every child's profile + full psychometric results with **zero** trace.
- **Narrowings (still true, reduce severity to Medium):** (a) superadmin status is **not** client-settable — `enforce_role_assignment` blocks self-grant (`20260618170000:33-62`); (b) audit evidence is **not** client-deletable — `audit_logs` has **only** a SELECT policy (`20260417230000:19-22`), no INSERT/UPDATE/DELETE policy, so clients can neither forge nor erase entries.

**Correctly scoped as:** *unlogged privileged cross-school read of sensitive minors' data.* Not a confidentiality-boundary break (the access is intended for the superadmin role) — an **auditability/accountability** gap.

---

## 2. Effective privileged-read matrix (cross-school student data)

Role model verified: `has_role(uid,'admin')` returns **true for superadmins** (superadmin **inherits** admin — `20260618170000:23-28`); `is_school_admin_for_user` matches only `user_roles.role='admin'` **with equal `school_id`** (`phase1a:64-74`); assessment SELECT uses `can_access_student_assessment` = self ∪ parent ∪ assigned-counselor (`phase1a:81-84`), which **excludes** admin.

| Role | profiles | assessments / big_five / caas / work_values | Cross-school? | Basis |
|---|---|---|---|---|
| student | self | self | no | `is_self` |
| parent | own children | own children | no | `is_parent_of_student` |
| counselor | assigned students | assigned students | **school-scoped only** | `is_assigned_counselor` (assignment validated same-school) |
| school admin (`admin` + school_id) | **own school** | **none** (no admin assessment policy) | no (in-tenant) | `is_school_admin_for_user` |
| platform admin (`admin`, no school) | none cross-school | none | no | not matched by any student-read helper |
| **superadmin** | **ALL schools** | **ALL schools** | **YES** | the 5 captured `Superadmin select all …` policies |
| service_role / internal | all (BYPASSRLS) | all (BYPASSRLS) | n/a | trusted internal, not a browser identity |

**Only `superadmin` has cross-school student read.** PF-007 is a **superadmin-only** surface on exactly **5 tables**.

---

## 3. Sensitive-table inventory (in scope)

| Table | Data class | Sensitivity | Superadmin cross-school policy | Current read audit |
|---|---|---|---|---|
| `profiles` | student PII (name, email, grade, school) | High (minors' PII) | `Superadmin select all profiles` | **none** |
| `assessments` | RIASEC / Skills / EQ results | High (psychometric) | `Superadmin select all assessments` | **none** |
| `big_five_assessments` | Big Five results | High | `Superadmin select all big_five` | **none** |
| `caas_assessments` | Career-adaptability results | High | `Superadmin select all caas` | **none** |
| `work_values_assessments` | Work-values results | High | `Superadmin select all work_values` | **none** |

**Deliberately excluded** (no superadmin global SELECT policy → **not** a cross-school superadmin surface today; do not broaden): `reflections`, `student_goals`, `student_skill_snapshots`, `skills_gap_analyses`, `counselor_notes`, `ai_reports` / `ai_report_counselor_notes`, `ai_processing_consent`. Their SELECT policies are self/parent/counselor/school-scoped (e.g. `ai_reports`: `can_access_student_assessment` / `is_assigned_counselor`, `20260616120000:31,52`) — superadmin has no global read on them. If a future feature adds superadmin global reads to any of these, PF-007 scope must be revisited.

---

## 4. Exact application read paths (superadmin, cross-school)

```
Superadmin UI → supabase-js (browser, authenticated JWT) → PostgREST → table (RLS: the 5 policies) → sensitive rows
```

| # | File / caller | Read | Table(s) | Access mode | Sensitivity |
|---|---|---|---|---|---|
| P1 | `src/components/superadmin/StudentRoster.tsx:39-40` | `.from("profiles").select("id, full_name, email, grade, school_id, created_at, is_archived")` (all schools) | profiles | **list/search** | High (bulk PII) |
| P2 | `src/pages/SuperAdminStudentDetail.tsx:21-25` | `.from("profiles").select(...).eq(id).single()` | profiles | **detail** | High (PII) |
| P3 | `src/components/assessment/ComprehensiveReportView.tsx:153-159` (rendered by P2) | `.from("assessments"/"big_five_assessments"/"caas_assessments"/"work_values_assessments").select("*").eq(studentId)` + profile cycle | 4 assessment tables + profiles | **detail (full report)** | **Highest** (full psychometric payload) |
| P4 | `src/pages/SuperAdminDashboard.tsx:26-28` | `.select("id",{count:'exact'})` on schools/profiles/assessments | profiles, assessments (counts) | **aggregate count** | Low (non-PII counts) |
| P5 | `src/components/superadmin/AdminAssignment.tsx:24-25` | `.from("profiles").select("id, full_name, school_id")` (all schools) | profiles | **list (provisioning)** | Medium (names) |

**Key complication:** P3's `ComprehensiveReportView` is a **shared** component used in both **counselor** mode (school-scoped, legitimately allowed via `can_access_student_assessment`) and **superadmin** mode (cross-school). It fetches assessment tables **directly** by `studentId`. Any remediation that removes the superadmin direct-SELECT policies must supply the superadmin path an alternate (audited) data source **without breaking the counselor path**.

Search/filter (P1) and export: there is **no** dedicated bulk-export path today; P1 roster is the closest bulk read. No superadmin Edge Function / server action / view for these reads exists — all are **direct browser PostgREST**.

---

## 5. Existing audit infrastructure

`public.audit_logs` (`20260417230000:6-14`):

| Column | Meaning |
|---|---|
| `id uuid` PK | event id |
| `admin_id uuid NOT NULL → auth.users(id)` | **actor** |
| `action text` | event type (`DELETE_USER`, `BULK_IMPORT`, `ROLE_CHANGE`, …) |
| `target_type text` | resource class (`profile`, `assessment`, …) |
| `target_id text` | affected resource id |
| `details jsonb` | flexible metadata |
| `created_at timestamptz` | when |

- **RLS:** enabled; **only** `Admins can view audit logs` `FOR SELECT USING has_role(auth.uid(),'admin')` (`:19-22`) → admin **and** superadmin can read. **No** INSERT/UPDATE/DELETE policy → **no client** can write, alter, or erase; only `SECURITY DEFINER` RPCs write server-side. **Immutable to clients by construction.**
- **Write pattern already in the codebase:** `delete_user` verifies role, performs the action, then `INSERT INTO audit_logs (...)` in the same transaction (`:34-53`). PF-007 can reuse this exact pattern for reads.
- **Retention/immutability:** no retention job; no explicit append-only trigger (deletion is already impossible for clients; a service-role/owner could delete — out of client threat model).

**Conclusion: `audit_logs` can support privileged-READ events with NO schema redesign.** `admin_id` = actor (a slight naming legacy; holds any actor uuid), `action` = read-event type, `target_type`/`target_id` = resource, `details` = role/school/mode/filters/count/reason. (Optional, non-blocking: composite index on `(admin_id, created_at)` and `(action, created_at)` for query performance as volume grows.)

---

## 6. SELECT-auditing constraint

PostgreSQL **cannot fire a row trigger on `SELECT`** — there is no per-row `SELECT` trigger, so the PF-012-style trigger approach is impossible here. Realistic enforcement points in *this* repo:

- **RLS policies** decide *whether* a role may read, but cannot *record* that a read happened.
- **`SECURITY DEFINER` functions** can both authorize **and** write an audit row **and** return data in one transaction — the mechanism already proven by `delete_user`.
- **Statement/`pgAudit` logging** (Option C) would need Supabase-side configuration (`log_statement`, `pgaudit`) that this repo cannot set from a migration and that writes to Postgres logs, **not** to the queryable, RLS-protected, client-immutable `audit_logs` table — so it does not satisfy "the reader cannot erase it and staff can review it in-app."

**Therefore the only in-repo mechanism that reliably records a privileged read is a `SECURITY DEFINER` RPC boundary** — provided the direct-SELECT path is removed (see §7).

---

## 7. Bypass analysis — CRITICAL

> Can a superadmin skip the audited pathway and still `.select()` cross-school directly through PostgREST?

**With the 5 policies in place: YES.** Any RPC/gateway we add is bypassable — the superadmin JWT still satisfies `Superadmin select all …`, so `supabase.from('profiles').select('*')` (or the 4 assessment tables) returns data with **no** audit row. An additive RPC alone does **not** remediate PF-007.

**A valid architecture must remove the direct privileged SELECT** (drop the 5 policies) so the **only** path to cross-school data is the audited `SECURITY DEFINER` RPC. After removal, a superadmin's direct `.from(...).select(...)` on these 5 tables returns **0 rows** (no policy grants them SELECT; `SECURITY DEFINER` RPCs read as the function **owner**, unaffected by RLS). This both closes the bypass and preserves legitimate superadmin functionality through the logged boundary.

*(School-scoped counselor/school-admin reads are **not** removed — they remain governed by their existing scoped policies; PF-007 is the cross-school superadmin surface only.)*

---

## 8. Options considered

| Option | Closes bypass? | Uses existing infra? | Service-role exposure | Frontend cost | Verdict |
|---|---|---|---|---|---|
| **A — Audited `SECURITY DEFINER` RPCs + remove the 5 SELECT policies** | **Yes** (direct path removed; RPC is the only door) | Yes (`audit_logs` + the `delete_user` write pattern) | **None** (DEFINER runs as owner) | Medium (4 screens + 1 shared component) | **RECOMMENDED** |
| B — Server/Edge-Function gateway | Yes, only if policies also removed | Adds a new server boundary | **Introduces** service-role key handling | Medium-High (new fetch layer) | Rejected — more infra + secret-handling for no gain over A |
| C — DB statement/`pgAudit` logging | Partially (logs statements, not to `audit_logs`) | No (needs Supabase config not settable via migration) | n/a | n/a | Rejected — not in-repo controllable; not client-reviewable/immutable-in-app; noisy |
| D — Client-side audit event | **No** (trivially bypassable via direct API) | — | — | Low | Rejected — a direct/malicious API caller skips it entirely |

---

## 9. Recommended architecture

### Recommended design — **Option A: audited `SECURITY DEFINER` read RPCs; remove the 5 direct superadmin SELECT policies.**

Phase 2D.2 will (design, not built here):
1. **DROP** the five `Superadmin select all …` policies (profiles + 4 assessment tables).
2. **CREATE** narrow `SECURITY DEFINER` RPCs, each: (a) `IF NOT has_role(auth.uid(),'superadmin') THEN RAISE`, (b) `INSERT INTO audit_logs(...)`, (c) `RETURN` the authorized data — all in one transaction:
   - `admin_list_students(p_filters, p_limit, p_offset)` → roster rows (P1, P5).
   - `admin_get_student_profile(p_student_id, p_reason)` → profile header (P2).
   - `admin_get_student_report_bundle(p_student_id, p_reason)` → JSON `{ profile_cycle, assessments[], big_five[], caas[], work_values[] }` (P3).
   - `admin_platform_counts()` → `{ schools, students, assessments }` aggregate (P4).
3. `GRANT EXECUTE … TO authenticated` (each RPC self-authorizes via the superadmin check; anon/others get an exception, not data).

### Why preferred
Only A **closes the bypass** using **existing, client-immutable** `audit_logs` and the **already-proven** DEFINER write pattern, with **no service-role exposure** and no new infrastructure. Audit write + data read are **atomic** (one transaction) → reliable, fail-closed logging.

### Direct-read bypass prevention
Removing the 5 policies leaves superadmin with **no** RLS SELECT grant on these tables → direct PostgREST reads return empty; the audited RPCs (reading as owner) become the sole cross-school door.

### Required database changes
One migration: DROP 5 policies; CREATE 3–4 RPCs (superadmin-gated, audit-writing); GRANT EXECUTE. **No `audit_logs` schema change** (optional indexes only). No change to counselor/school-admin/self policies. (Optional defense-in-depth, deferrable: a restrictive `USING(false)` DELETE deny on `audit_logs`, mirroring PF-012 — not required since no client DELETE policy exists.)

### Required application changes
See §12 (4 screens + the shared `ComprehensiveReportView` gains an optional pre-loaded-bundle prop).

### Audit schema changes
None (reuse existing columns; see §10).

### Required tests
See §14.

### Rollback strategy
See §16.

### Production verification
See §15.

### Why the alternatives are weaker here
B doubles infrastructure and **introduces** a service-role key path (a new exposure risk this project explicitly avoids) for no benefit over A. C cannot be driven from the repo, does not write to the reviewable/immutable `audit_logs`, and is noisy. D is not a security boundary at all (bypassable by any direct API call).

---

## 10. Audit event model (minimum)

Reuse `audit_logs`. Per privileged read write exactly:

| Field | Value |
|---|---|
| `admin_id` | `auth.uid()` (the superadmin actor) |
| `action` | `READ_STUDENT_LIST` · `READ_STUDENT` · `READ_STUDENT_REPORT` · `READ_PLATFORM_COUNTS` |
| `target_type` | `profile` · `student_report` · `platform` |
| `target_id` | `student_id` (detail/report); `NULL` (list/counts) |
| `details jsonb` | `{ actor_role:'superadmin', target_school_id, access_mode:'list'|'detail'|'report', resource_class, filters, result_count, reason }` (only the keys relevant to the event) |
| `created_at` | `now()` |

**Never store** assessment answers, raw responses, scores, report/AI text, prompts, or unnecessary PII — record **that** access occurred and to **whose** record, not copies of the sensitive payload.

**Granularity (§13):** list/search = **one** event per query (filters + school scope + `result_count`), **not** one row per returned student; detail = one event (target student); report = one **higher-sensitivity** event (target student + assessment categories present); counts = non-PII aggregate → coarse `READ_PLATFORM_COUNTS` or omitted to avoid dashboard-reload noise.

**Reason/purpose (§14):** at pilot stage, an **optional** structured `p_reason` param on the **detail** and **report** RPCs (stored in `details.reason`); **not** a mandatory gate and **not** an approval workflow. Recommendation: revisit making `reason` **mandatory** for cross-school **report** reads before wider (post-pilot) rollout.

---

## 11. Audit integrity requirements

- **INSERT:** only the `SECURITY DEFINER` RPCs (run as owner) — no client INSERT policy exists; keep it that way.
- **SELECT:** `has_role(admin)` → admin + superadmin may review (existing).
- **UPDATE/DELETE:** no policy → **no client** can modify/erase, **including the superadmin who generated the events** (RLS denies; only owner/service-role could, which is outside the client threat model).
- **Property satisfied:** privileged actors **cause** audit events but **cannot** alter/delete them via ordinary client access.
- **No service role required** (DEFINER runs as owner). Do **not** redesign the audit subsystem in 2D.2.

---

## 12. Application change surface (Phase 2D.2)

| File | Change | Size |
|---|---|---|
| `src/components/superadmin/StudentRoster.tsx` | profiles list → `rpc('admin_list_students', …)` | **S** |
| `src/pages/SuperAdminDashboard.tsx` | 3 count reads → `rpc('admin_platform_counts')` | **S** |
| `src/components/superadmin/AdminAssignment.tsx` | profiles list → `rpc('admin_list_students')` (or a lighter list RPC) | **S** |
| `src/pages/SuperAdminStudentDetail.tsx` | profile header → `rpc('admin_get_student_profile')`; fetch `rpc('admin_get_student_report_bundle')`; pass bundle into the report component | **M** |
| `src/components/assessment/ComprehensiveReportView.tsx` | add optional `preloadedBundle` prop; when present, **skip** the internal `.from(...)` assessment reads (`:153-159`) and render the injected data. **Counselor path unchanged** (no prop → existing school-scoped direct reads) | **M** (shared component; guard existing query with `enabled: !preloadedBundle`) |

**Overall app scope: Medium.** No other superadmin screen reads cross-school student data (SchoolManagement reads only `schools`, non-PII → unchanged).

---

## 13. Database change surface (Phase 2D.2)

- **One migration:** DROP the 5 `Superadmin select all …` policies; CREATE the 3–4 superadmin-gated, audit-writing `SECURITY DEFINER` RPCs; `GRANT EXECUTE … TO authenticated`. Pin `search_path`, schema-qualify all objects (mirror `delete_user`).
- **No** `audit_logs` schema change (optional: `(admin_id, created_at)` / `(action, created_at)` indexes).
- **No** change to any self/parent/counselor/school-admin policy, to `has_role`, to `user_roles`, to scoring, or to PF-011/PF-012 objects.
- **Migration DB scope: Small-Medium** (policy drops + a handful of functions; no table/column/data change).

---

## 14. Runtime test plan (Phase 2D.2, disposable DB + synthetic users)

**Structural (CI, dependency-free):** migration drops exactly the 5 named policies; creates each RPC with a `has_role('superadmin')` gate + an `audit_logs` INSERT; grants EXECUTE; touches no self/counselor/school-admin policy, no scoring, no PF-011/PF-012 object; superadmin screens no longer call `.from("profiles"|assessment tables)` directly (except the counselor-path report reads).

**Runtime matrix (synthetic superadmin SA, counselor C, student S, anon):**
1. SA **direct** `select from profiles/assessments/...` cross-school → **0 rows** (policies removed).
2. SA `rpc('admin_get_student_profile', S)` → returns profile **and** writes **exactly one** `audit_logs` row (`action=READ_STUDENT`, `target_id=S`, `details.actor_role='superadmin'`).
3. SA `rpc('admin_get_student_report_bundle', S)` → returns the 4 arrays + writes one `READ_STUDENT_REPORT` row; **no** answers/scores in `details`.
4. SA `rpc('admin_list_students', filters)` → returns list + **one** `READ_STUDENT_LIST` row with `result_count` (not one per student).
5. Non-superadmin (C/S/anon) calling any `admin_*` RPC → **denied** (exception), **no** data, **no** audit row (or a failure row without payload).
6. Counselor C reads their assigned student's report **directly** (unchanged path) → still works (school-scoped policies intact); superadmin removal did not affect C.
7. SA attempts `delete/update` on `audit_logs` for their own event → **denied** (RLS).
8. **Fail-closed:** simulate audit INSERT failure inside an RPC → function raises, **no** student data returned.
9. Regression: student login/profile/assessment submission; PF-011 field protection; PF-012 delete denial — all unaffected.

---

## 15. Production verification strategy

Read-only, after apply (exact SQL in the 2D.2 checklist):
- `pg_policies`: the 5 `Superadmin select all …` rows are **gone**; no new permissive superadmin SELECT policy exists.
- `pg_proc` / `routine_privileges`: the `admin_*` RPCs exist, `prosecdef=true`, `search_path=public`, EXECUTE granted to `authenticated`.
- Synthetic superadmin: direct cross-school `select` → empty; each `admin_*` RPC call → data **and** a matching `audit_logs` row (count before/after differs by exactly one).
- `audit_logs`: superadmin cannot DELETE their own event.
- Smoke: superadmin roster + open one student report → renders via RPC; two audit rows recorded.

---

## 16. Rollback approach

- **Forward-fix preferred.** If an RPC misbehaves, fix the RPC — do **not** restore the direct policies.
- **Technical rollback** (emergency only, re-opens PF-007): re-create the 5 `Superadmin select all …` policies (definitions preserved in `20260723120000`) to restore direct superadmin read, and drop the RPCs. This **re-opens the unlogged-read vulnerability** and must be distinguished from a legitimate forward-fix — use only if the RPC path breaks superadmin operations in production and cannot be hotfixed.
- RPC creation is additive/reversible; policy drop is reversible from the captured definitions.

---

## 17. Phase 2D.2 exact scope

**In:** the **5 PF-006 tables** and the **superadmin cross-school read screens** (P1–P5) — remove the 5 direct SELECT policies, add the audited RPCs, migrate the 4 screens + inject the bundle into `ComprehensiveReportView`. Audit event model + integrity per §10–§11. Optional `reason` (non-blocking).

**Out (later phases / not now):** school-admin & counselor **in-tenant** read logging (lower risk — same-school, not cross-school); cross-school reads of `reflections`/`goals`/`notes`/`ai_reports`/consent (superadmin has **no** global policy there today); mandatory-reason approval workflow; retention jobs; repository-wide observability/statement-audit platform; `audit_logs` restrictive-DELETE hardening (optional defense-in-depth).

---

## 18. Open limitations

- **Postgres-superuser / owner / service_role** can still read tables and (in principle) alter `audit_logs` outside RLS — this is **outside the client/product threat model**; PF-007 concerns the **superadmin application role**, which after 2D.2 has no direct SELECT and no audit-erase path.
- **`pgAudit`/statement logging is not available** from the repo, so truly ad-hoc SQL by a DB superuser is not captured in `audit_logs`; mitigated because the **product** superadmin role is not a Postgres superuser and loses direct SELECT.
- **Counts audit** is coarse/omitted (non-PII) — a deliberate noise trade-off.
- **`reason` optional at pilot** — accountability of *why* is weaker than *that/who* until (recommended) mandatory reason on report reads post-pilot.
- **Shared-component refactor risk:** `ComprehensiveReportView` is large; the injected-bundle change must be verified to not regress the counselor path (covered by test #6).
- Runtime behavior (RLS emptiness after policy removal, RPC audit writes, fail-closed) requires a disposable Postgres — deferred to 2D.2 (no local DB here).

---

## Confirmation

Discovery & design only. **No** migration, RLS, function, Edge Function, application source, `audit_logs`, config, secret, or dependency was created or changed; nothing was applied or deployed. Exactly **one** documentation file was produced. PF-006 (the 5 captured policies), PF-011, and PF-012 were read for context and **not** modified. No implementation was started.
