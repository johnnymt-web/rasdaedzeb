# PRM-WP02 — Governed Object / Version Runtime Architecture Proposal — v0.1

- Work package: PRM-WP02 — Governed Object / Version Runtime Foundation
- Authorization level: **PART I (§1–§17) — DISCOVERY + ARCHITECTURE ONLY**,
  as accepted; unchanged by the Tier 1 implementation. **PART II — TIER 1
  IMPLEMENTATION EVIDENCE**, added under the Owner's PRM-WP02 Tier 1 Human
  Gate 1 authorization.
- Controlling sources: Step 1 (Governed Object / Versioning / Referential /
  Lifecycle Substrate v0.1); accepted Master Plan PRM-WP02; PRM-WP02 Tier 1
  Human Gate 1 authorization (Owner, 2026-08-25).
- Status: **PART I ACCEPTED (architecture, unchanged). PART II — TIER 1
  IMPLEMENTED, RC1 APPLIED, MERGED. PART III — TIER 2 IMPLEMENTED, READY FOR
  OWNER REVIEW.** F-04 OPEN. F-07 OPEN. M-1 OPEN. **WP02 NOT CLOSED.** NO
  P-GATE CHANGED.
- Date: 2026-08-24 (proposal); 2026-08-25 (Tier 1 implementation evidence;
  RC1 correction after Owner review).

## 1. Purpose

This document is the architecture discovery and proposal Step 1's runtime
substrate requires before any implementation. It does not implement
anything. Per CLAUDE.md §7's L2 model, this class of work is
discovery/architecture → **Human Gate 1** → implement → independent review →
stop; this document performs only the first step and stops.

## 2. Current-state repository map (relevant to WP02)

Read-only discovery performed against the accepted baseline
(`origin/main` at the time of this session's Wave 0 work):

- **No table or structure matching `governed_instance`, `instance_id`,
  `object_id`, `domain_code`, or `version_sequence` was found** anywhere in
  `supabase/migrations/`. A targeted grep for `governed_instance`,
  `instance_id`, `version_id`, `stable_id` across all migration files
  returned no matches.
- **The closest existing analog** is `assessments.question_set_version`
  (added in `20260618130000_add_grade_band_and_question_set_version_to_assessments.sql`),
  a free-text column recording "the exact question bank / scoring structure
  that was administered." This is narrowly scoped to one table
  (`assessments`), has no registry, no allocation-at-creation enforcement, no
  immutability boundary, no `instance_id`/`object_id` distinction, and no
  current-version resolution predicate. It solves a real, adjacent problem
  (which question-bank version scored a given assessment) but does not
  implement, and was not designed to implement, Step 1's governed-instance
  model.
- **`assessments.grade_band`** (same migration) is a comparable pattern:
  server-computed, written only by the `submit-assessment` edge function,
  immutable in practice by convention — but not by an enforced Step 1-style
  draft-exit or first-governance-use boundary.
- No subject-type catalog, no Pattern A/B classification mechanism, and no
  fail-closed current-version resolution logic were found anywhere in the
  codebase.

## 3. Reusable existing components

- **UUID primary keys via `gen_random_uuid()`** — used consistently across
  the schema (`audit_logs`, `ai_logs`, `ai_processing_consent`, etc.). This
  is directly reusable as the storage mechanism for an opaque `instance_id`
  (Step 1 §2.1/§3.2 requires opacity; a random UUID satisfies that
  requirement structurally, though opacity is a property of *usage*, not
  just of the generator, and would still need to be enforced in application
  code and RLS policy design, not merely in the column type).
- **The `has_role(auth.uid(), 'admin'::public.app_role)` RLS pattern** —
  directly reusable for whatever access-control layer a `governed_instance`
  registry needs, consistent with the existing role model.
- **JSONB metadata columns** (e.g. `audit_logs.details`) — a plausible
  storage pattern for `governed_instance`'s logical attributes if a flexible
  schema is preferred over one column per attribute, though Step 1 §2.1's
  fixed logical-attribute set (`instance_id`, `subject_type`, `pattern`) is
  small and stable enough that dedicated typed columns are also a reasonable
  design choice — this is a genuine, open engineering decision, not
  something Step 1 itself mandates either way.
- **The existing migration-file convention** (additive-only, explicit
  rollback comments, narrow single-purpose files) — directly reusable as the
  implementation pattern for any future `governed_instance` migration.

## 4. Missing components

Everything Step 1 §2–§11 requires beyond the above is absent:

- A `governed_instance` registry table enforcing: `instance_id` allocated
  atomically with the concrete governed instance's creation (§2.1, "the
  registry entry and the concrete governed instance MUST come into existence
  together" — no delayed allocation at draft exit or any later boundary);
  no lifecycle/approval/validation/runtime/retirement/readiness/"master
  status" field stored in the registry (§2.1, explicit prohibition).
- A `pattern` classification that is *derived* from a controlled
  subject-type catalog, never independently writable, with a fault raised
  (not silently corrected) on any mismatch (§2.1, "Pattern classification
  authority").
- Distinct, non-conflated identifier families: `instance_id` (opaque,
  registry-allocated), `object_id` (stable conceptual identity, Pattern A
  only, never a governance-act target), `domain_code` (semantics-free
  human-readable handle, immutable once allocated, never a governance-act
  target), `version_sequence` (ordering only within one stable identity, no
  scientific/approval/precedence meaning, never a tie-break mechanism) (§3).
- The current-version resolution contract as a **derived, non-stored,
  non-independently-settable, conjunctive predicate** (§9.2) — explicitly
  NOT a boolean column, explicitly not weighted/scored/averaged.
- The three fail-closed cardinality rules (§10.1–§10.3): zero eligible
  versions fails closed; more than one eligible version is a governance
  fault that fails closed and is raised as an event, never silently
  tie-broken by recency/priority/`version_sequence` (§9.4, explicit
  prohibition on exactly this kind of heuristic); an unresolvable exact
  governed instance fails closed.
- The subject-type catalog itself and its Pattern A/B assignment mechanism
  (§2.5) — Step 1 explicitly defers the catalog's concrete membership to a
  later controlled specification; this proposal does not invent one.

## 5. Proposed minimum implementation architecture (proposal only — not authorized for implementation by this document)

Step 1 §2.1 ("Pattern classification authority") requires `pattern` to
"equal the fixed assignment of `subject_type` in the controlled subject-type
catalog." No such catalog currently exists — its concrete membership is
explicitly deferred by Step 1 itself (§14.5, "the concrete membership of the
subject-type catalog... DEFERRED to later controlled steps"). This proposal
does not invent catalog membership. It instead splits the architecture into
two tiers with different readiness, so the catalog dependency is explicit
rather than glossed over.

### 5.1 Tier 1 — catalog-independent (architecture only; not blocked on the catalog)

1. **`governed_instance` table, `instance_id` column only** — the opaque,
   registry-allocated primary identity (§2.1, §3.2), with its
   allocated-atomically-at-creation constraint. This column's mechanics do
   not depend on catalog content — an `instance_id` can be structurally
   defined and its allocation-timing invariant enforced without knowing
   what subject types will ever exist.
2. **The minimal catalog SUBSTRATE shape** — not catalog membership. Step 1
   §2.1 itself establishes that a conforming catalog must be able to answer
   exactly one question per subject type: "is this subject type Pattern A or
   Pattern B?" The minimum substrate satisfying that is a two-column
   structure — `subject_type` (identifier) → `pattern` (fixed A/B
   assignment) — with **zero rows populated**. This is a *shape*, derivable
   directly from Step 1 §2.1's own text without inventing any concrete
   subject type; it is not the catalog itself, which remains a separate,
   later, controlled artifact per §14.5.
3. **A resolution function or view, not a stored column**, implementing
   §9.2's derived conjunctive predicate, deliberately left unable to
   evaluate for a consequential path until §9.3's pending applicability
   inputs are fixed by a later controlled specification (matching F-07's
   genuinely still-open scope, reflected as an explicit fail-closed
   condition in the function itself, not worked around).
4. **Database-level fault-raising** (e.g. a `RAISE EXCEPTION` on multiple-
   eligible-version detection, or an equivalent application-layer check
   enforced consistently) for §10.2's governance-fault case, rather than a
   silent application-layer filter that could be bypassed or forgotten in a
   future code path.

### 5.2 Tier 2 — BLOCKED pending the controlled subject-type catalog

The following components cannot be meaningfully implemented — not merely
"not designed here," but structurally **BLOCKED** — until a controlled
specification populates the catalog substrate (§5.1 item 2) with actual
subject types and their fixed Pattern A/B assignment:

1. **`governed_instance.subject_type` and `governed_instance.pattern`** —
   `subject_type` has nothing real to reference, and `pattern`'s derivation
   rule (§2.1) has nothing to derive from, until the catalog has at least
   one populated row. Implementing these columns against an empty catalog
   would force a choice (fabricate a placeholder subject type, or leave the
   columns nullable in a way that weakens the "exactly one `subject_type`
   value" invariant, §4 of Step 1) that this proposal does not make and that
   this document is not authorized to make.
2. **Pattern A version tables and Pattern B record tables** for any concrete
   governed family — there is no concrete family to build a table for until
   the catalog names one.
3. **`object_id`, `domain_code`, `version_sequence`** on Pattern A tables
   specifically — these attach to Pattern A tables (item 2), which are
   themselves blocked.

BLOCKED here means: no implementation work on these specific components may
proceed, by any authorization, until the controlled subject-type catalog
specification exists and is accepted. This is a structural precondition
this proposal identifies, not a target this proposal or a future WP02
implementation may work around by inventing catalog content.

This is a proposal (Tier 1) and a blocked-item list (Tier 2) for later,
separately authorized implementation. No part of either tier is built by
this document.

## 6. F-04 treatment (dependency re-binding workflow) — remains OPEN

Step 1 §14.1 states F-04's remaining scope precisely: "the triggers requiring
re-binding, the authority required to perform it, the identification of
affected dependents, and the fail-closed maintenance of unresolved
consequential paths until resolution — remains unspecified." This proposal
does not resolve any of those four items. In particular, this proposal's
architecture (§5) does not assume any specific re-binding trigger or
authority model — a future implementation must fail closed on any dependency
re-binding scenario until F-04's workflow is separately specified by a
controlled document, not by this WP02 proposal or its eventual
implementation.

## 7. F-07 treatment (current-version resolution and cardinality) — remains OPEN

Step 1 §9.1 is explicit that its own resolution contract is "a logical
resolution CONTRACT / SKELETON only" and "MUST NOT be presented as closing"
F-07. This proposal's §5.4 above deliberately mirrors that discipline: the
proposed resolution function implements the skeleton (the derived-predicate
shape, the fail-closed cardinality rules) but explicitly does NOT invent the
pending applicability inputs §9.3 lists (developmental/grade scope,
validation applicability, rights-permitted-act semantics, resolution-scope
vocabulary) — those remain F-10/F-13-dependent and out of this proposal's
scope. Any future implementation attempting to make the predicate evaluable
for a consequential path before those inputs are fixed by a controlled
specification would itself violate §9.3 and must fail closed instead.

## 8. Explicit fail-closed behavior this architecture must preserve

- Zero eligible versions → fail closed, never an implicit fallback to any
  other version (§10.1).
- Multiple eligible versions → fail closed, raised as a governance fault
  event, never silently tie-broken (§10.2, §9.4).
- Unresolvable exact governed instance → fail closed, including all six
  sub-cases §10.3 lists (unresolvable stable-identity reference; unestablished
  required immutability; unestablished pattern assignment; `pattern` ≠
  catalog assignment; unestablished binding-family classification; the
  resolution predicate not evaluable per §9.3).
- Absence of evidence is never permission (§1.3, restated at §10.3).

## 9. Proposed future implementation scope (not authorized now)

**Tier 1 (§5.1, catalog-independent):**
- The `governed_instance.instance_id` column and its allocation-at-creation
  trigger/constraint.
- The catalog substrate shape (`subject_type` → `pattern`, zero rows).
- The non-stored resolution function/view and its fail-closed cardinality
  enforcement.
- RLS policies for the registry and its member tables, following the
  existing `has_role`-based pattern, scoped to whatever access model a later
  Step 6-aligned authorization decision specifies (not decided here).

**Tier 2 (§5.2, BLOCKED pending the controlled subject-type catalog):**
- `governed_instance.subject_type` and `governed_instance.pattern`.
- Pattern A version tables and Pattern B record tables for whichever
  concrete subject families a later controlled subject-type catalog defines
  (none are defined by this proposal).
- The `object_id`/`domain_code`/`version_sequence` attributes on Pattern A
  tables specifically.

## 10. Explicit non-scope

- No subject-type catalog membership (deferred by Step 1 itself, §14.5).
- No F-04 workflow (triggers, authority, dependent identification).
- No F-07 applicability inputs (grade/developmental scope, validation
  applicability, rights-permitted-act semantics, resolution-scope
  vocabulary).
- No Pattern B concrete record families beyond Step 1 §2.4's contract.
- No RLS/auth policy content (structure only, per §9 above).
- No migration is written, run, or proposed as ready-to-apply SQL — this
  document contains no DDL.

## 11. Expected tests (for the later, separately authorized implementation)

- Positive: a concrete governed instance's `instance_id` is allocated
  atomically with its creation, never before or after.
- Negative: an attempt to write a `pattern` value that mismatches the
  subject-type catalog's fixed assignment is rejected as a fault, not
  silently corrected.
- Negative: zero eligible versions within one stable identity/scope fails
  closed (no fallback).
- Negative: multiple eligible versions fails closed and raises a fault event
  (no recency/priority/`version_sequence` tie-break).
- Negative: `version_sequence` cannot be used as a governance-act target or
  substituted for `instance_id`.
- Negative: `domain_code`/`object_id` cannot be used as a governance-act
  target (only `instance_id` may be cited, per §11.1's exact-instance
  citation rule).

## 12. Expected migration/schema impact (forecast only)

Additive: one new registry table, one or more Pattern A/B member tables (family
count depends on the not-yet-defined subject-type catalog), new columns on
Pattern A tables for `object_id`/`domain_code`/`version_sequence`. No existing
table's existing columns require modification based on current discovery. No
destructive change is anticipated. This is a forecast, not a migration.

## 13. Expected RLS/auth impact (forecast only)

New RLS policies for the registry and member tables, expected to follow the
existing `has_role` pattern. Per CLAUDE.md §3, any actual RLS change is L2
work requiring explain → propose → Owner approval → stage, regardless of this
forecast — this document does not perform or shortcut that requirement.

## 14. Rollback / containment considerations (forecast only)

Additive-only migration design (matching the existing repository convention)
means a future implementation could in principle be rolled back by dropping
the new tables without affecting existing tables — but this is a forecast for
a later implementer to verify at actual migration-design time, not a
commitment made here.

## 15. Unresolved Owner decisions genuinely required for Human Gate 1

None are required to *approve proceeding to implementation design* at this
level of abstraction — the architecture above is derivable entirely from
Step 1's own text and existing repository patterns, without any Owner
policy choice. The genuine Owner-facing decision is the Human Gate 1
authorization itself: whether to authorize PRM-WP02 implementation to
proceed at all, and on what timeline relative to the other Wave 0/1 work.
That decision is recorded in the Owner Decision Queue (§13.C of the
consolidated Wave 0 Result Package), not invented here.

## 16. Human Gate 1 recommendation

This proposal recommends Human Gate 1 be considered in two parts, matching
§5's tiers:

- **Tier 1 (§5.1):** Human Gate 1 may be granted once the Owner separately
  confirms an implementer will preserve F-04/F-07's OPEN status exactly as
  this proposal does, and will implement the catalog *substrate shape*
  (§5.1 item 2) with zero rows populated, inventing no subject type.
- **Tier 2 (§5.2):** Human Gate 1 cannot meaningfully be granted for these
  components at all yet — they are structurally BLOCKED on a controlled
  subject-type catalog specification that does not exist. Granting
  implementation authorization for Tier 2 now would not accelerate anything;
  it would only invite exactly the kind of catalog-content invention this
  proposal declines to perform. The Owner decision recorded in the Owner
  Decision Queue is therefore scoped to Tier 1 only, with Tier 2 explicitly
  deferred pending a separate, later controlled catalog specification.

This is a recommendation only; Human Gate 1 itself is an Owner act, not
performed here.

## 17. Explicit confirmation

**NO IMPLEMENTATION** — no code, schema, migration, RLS, or auth change was
performed in the production of this document. All statements above are
proposal and forecast, not committed design or executed work.

---
---

# PART II — PRM-WP02 TIER 1 IMPLEMENTATION EVIDENCE

> **Boundary between the two parts.** Everything above (§1–§17) is the
> **ACCEPTED ARCHITECTURE PROPOSAL**. Its semantics are not rewritten,
> reinterpreted, or softened by anything below; where Part I and Part II
> appear to differ, **Part I governs the architecture** and Part II is
> defective and must be corrected. Everything below records only **what was
> actually built** for Tier 1, what was deliberately not built, and how that
> was validated.
>
> Part II changes no P-gate, closes no finding, unblocks no Tier 2 component,
> and closes neither WP02 nor F-04/F-07.

## P1. Authorization and scope actually exercised

- Authorized by: Owner **PRM-WP02 Tier 1 Human Gate 1** (2026-08-25), scoped
  to §5.1 (catalog-independent Tier 1) only.
- Baseline: `origin/main` `a3cbd61c1a650f2499198644e53abc7477679cd3`.
- Implementation branch: `remediation/rgkb-wp02-tier1-runtime-v0.1`.
- Not exercised: Tier 2 (§5.2), F-04 workflow (§6), F-07 applicability inputs
  (§7), any RLS/auth access model (§13), any remote/production execution.

## P2. Artifacts produced

| Artifact | Purpose |
|---|---|
| `supabase/migrations/20260825120000_rgkb_wp02_tier1_governed_instance_substrate.sql` | The entire Tier 1 substrate — one narrow, additive, single-purpose migration |
| `src/test/rgkbWp02Tier1Substrate.test.ts` | Structural regression evidence (positive + negative + DEFERRED-BY-DESIGN) |

No other file was created or modified by the implementation. No existing
migration was edited.

## P3. What was implemented (Tier 1)

**Containment schema `rgkb`.** The substrate is created in a dedicated schema
outside `public`, because `public` is PostgREST-exposed and Supabase's default
privileges hand new `public` tables to `anon`/`authenticated`. This is an
*intended containment layer*, not an access model, and its live API-exposure
effect is **NOT VERIFIED** — see P7 for what is and is not evidenced.

**`rgkb.governed_instance` — the registry (Step 1 §2.1, §3.2).**

```
instance_id  uuid  PRIMARY KEY  DEFAULT gen_random_uuid()
```

That is the entire table. It carries:

- no `subject_type`, no `pattern` — Tier 2 (§5.2.1 above);
- no `object_id`, `domain_code`, `version_sequence` — Tier 2 (§5.2.3 above);
- no lifecycle, approval, validation, runtime, retirement, readiness or
  master-status field — prohibited by Step 1 §2.1;
- no `created_at` — deliberately omitted, because Step 1 §9.4 forbids recency
  as a tie-break and this table must not offer one.

`gen_random_uuid()` is the repository's established UUID mechanism (§3 above),
reused here as the opaque, registry-allocated `instance_id` (Step 1 §3.2).

**`rgkb.subject_type_catalog` — the catalog SUBSTRATE SHAPE (Step 1 §2.5).**

```
subject_type  text  PRIMARY KEY
pattern       text  NOT NULL  CHECK (pattern IN ('A','B'))
```

**Zero rows.** No subject type is invented, inferred, seeded, or defaulted.
None of RIASEC, Big Five, CAAS, EQ, Employability Skills, Work Values,
reports, or evidence is classified — nor named — anywhere in the migration.

**`rgkb.resolve_current_version() RETURNS uuid`** — the §9 resolution skeleton
as a function, never a stored column (Step 1 §9.2). It takes **no arguments**
and always fails closed as not-evaluable. See P5.

**Two fail-closed write guards** — see P6.

## P4. Requirements implemented, and the exact Step 1 traceability

| # | Tier 1 requirement | Step 1 source | Realization |
|---|---|---|---|
| 1 | Registry exists, exact-instance identity | §2.1, §3.2 | `rgkb.governed_instance` |
| 2 | `instance_id` opaque, registry-allocated | §2.1, §3.2 | `uuid` PK, `DEFAULT gen_random_uuid()` |
| 3 | No lifecycle/approval/master-status in registry | §2.1 | single-column table; asserted by test |
| 4 | Registry entry never removed | §5.3 | `RG012` DELETE guard |
| 5 | `instance_id` never reused/reallocated/transferred | §3.2, §11.2 | `RG011` UPDATE guard |
| 6 | Registry + concrete instance created together | §11.5 | `RG010` INSERT guard (see P6) |
| 7 | Catalog answers exactly one A/B question per family | §2.1, §2.5 | `subject_type` → `pattern`, `CHECK IN ('A','B')` |
| 8 | Family with unfixed pattern must not be admitted | §2.5 | `RG020` INSERT guard |
| 9 | No in-place reclassification of a family | §2.5 | `RG021` UPDATE guard |
| 10 | Resolution is DERIVED, not a stored boolean | §9.2 | function, not column; no `is_current` anywhere |
| 11 | Predicate not evaluable → fail closed | §9.3, §10.3 | `RG003`, the function's only outcome |
| 12 | No heuristic tie-break exists | §9.4 | no ordering/recency/priority/`version_sequence` anywhere in the resolver; nothing to tie-break |
| 13 | Absence of evidence is never permission | §1.3, §10.3 | the function has **no `RETURN` statement**; no path yields a value |

Deliberately **not** claimed as implemented: runtime enforcement of §10.1
(zero eligible) and §10.2 (multiple eligible). See P5.

## P5. The resolver, precisely — and the RC1 correction

### P5.1 The defect that Owner review caught

The first implementation accepted a caller-supplied `uuid[]` and reported its
length as the §10.1 / §10.2 outcome: `0` → "zero eligible versions",
`>1` → "multiple eligible versions". **That was a semantic overclaim.**

Step 1 §9.4 fixes cardinality **within one stable identity, within one
resolution scope, over eligible versions**. An arbitrary caller-supplied array
establishes none of those three properties, so counting it could not prove
§9.4 / §10.1 / §10.2. Fail-closed safety was never at risk — every path still
raised — but the *evidence claim* was stronger than what was built, and
accepting the argument could have led a caller to believe the substrate had
validated a set it had not.

### P5.2 Why no safe derivation is available at Tier 1

Deriving the eligible-version set honestly would require all three of:

| Needed to evaluate | Status at Tier 1 |
|---|---|
| "within one stable identity" | **absent** — `governed_object` and Pattern A version tables are Tier 2 (§5.2.2 above) |
| "within one resolution scope" | **absent** — resolution-scope vocabulary is DEFERRED (Step 1 §14.5) |
| "eligible versions" | **absent** — F-10 developmental/grade scope, F-13 validation applicability, and rights-permitted-act semantics are unspecified (§9.3) |

None can be supplied without inventing Tier 2 or F-07 semantics, which this
package is not authorized to do. No alternative safe representation was found.

### P5.3 The corrected resolver

```sql
rgkb.resolve_current_version() RETURNS uuid
```

**No arguments.** One outcome: `RG003` — the resolution predicate is not
evaluable (§9.3 / §10.3), because the identity/scope/eligibility substrate
needed even to *pose* the cardinality question does not exist. The error text
names each missing input explicitly and states that no caller-supplied
candidate set may stand in for the §9.4 eligible-version set.

Preserved: resolution stays **derived and non-stored** (a function, never a
column — §9.2); it **fails closed**; it contains **no** ordering, recency,
priority or `version_sequence` construct; it has **no `RETURN` statement**, so
no path yields a value (returning `NULL` could be read as "nothing blocks
you" — §1.3).

No Tier 2 identifier (`object_id`, `domain_code`, `version_sequence`) exists
to be substituted as a governance-act target, at Tier 1 or in this function's
contract (Step 1 §11.1).

**F-07 is NOT closed by this function**, and the function's own `COMMENT` says
so.

### P5.4 Step 1's fixed logical rules — recorded, not runtime-claimed

These rules are fixed by Step 1 **now**, and nothing here weakens them. They
are locked as documented requirements (and asserted as such by the test
suite), **not** manufactured into executable evidence from unverified caller
input:

1. zero eligible versions → fail closed (§10.1);
2. exactly one eligible version is the only potentially resolvable cardinality
   (§9.4);
3. more than one eligible version → governance fault (§10.2);
4. no recency, priority, ordering or `version_sequence` tie-break is ever
   authorized (§9.4).

Their **runtime enforcement is DEFERRED-BY-DESIGN** until the
identity/scope/eligibility substrate exists. Error codes `RG001` and `RG002`
were removed from the migration entirely and are **not** emitted anywhere.

## P6. Fail-closed behaviour and the atomicity invariant

Step 1 §11.5 requires that "a registry entry MUST NOT exist without its
concrete governed instance." At Tier 1 there is **no concrete governed member
table at all** — Tier 2 is blocked — so any row insertable today would
necessarily be an orphan registry entry, i.e. a direct violation of §11.5.

The implementation therefore **holds the registry structurally
non-operational** (`RG010` on INSERT) rather than weakening the invariant or
claiming it is satisfied. The same reasoning applies to Step 1 §4's "each
`governed_instance` MUST carry exactly one `subject_type` value": that column
is Tier 2, so the honest realization is a registry that admits no rows, not a
registry admitting rows that would violate §4.

The full atomic registry-plus-concrete-instance invariant is therefore
**NOT operationally completed**, and this document does not claim otherwise.
It becomes implementable when Tier 2 introduces the first concrete governed
family, under its own separate authorization, which is where the `RG010`
guard is replaced by real atomic-creation enforcement.

| Code | Condition | Step 1 |
|---|---|---|
| `RG003` | resolution predicate not evaluable | §9.3, §10.3 |
| `RG010` | registry INSERT without a concrete governed instance | §11.5 |
| `RG011` | registry UPDATE (identity reuse/transfer) | §3.2, §11.2 |
| `RG012` | registry DELETE (entry removal) | §5.3 |
| `RG020` | catalog admission with no controlled catalog specification | §2.5 |
| `RG021` | in-place reclassification of a family | §2.5 |
| `RG022` | catalog membership removal | §2.5 |

`RG001` / `RG002` are **not allocated and not emitted** — see P5.4.

**No audit/event schema or semantics was invented.** Every fault above
surfaces as an explicit database exception. Routing the §10.2 governance fault
into a governed event chain is DEFERRED together with the fault detection
itself, to a later separately authorized package, once a governed event shape
exists (Step 1 §8.3, §11.4).

## P7. RLS / auth containment status — no access model was invented

Per §13 above and CLAUDE.md §3, the substrate's actual access model is
separate, later, gated L2 work. It is **not** decided here. What was done is
containment only, so the substrate's safest state — non-exposed and
fail-closed — holds until that decision exists:

**Locally evidenced enforcement controls:**

1. **`REVOKE ALL`** on the schema, both tables, and the resolver, from
   `PUBLIC`, `anon`, and `authenticated`. No `GRANT` appears anywhere in the
   migration.
2. **RLS enabled (and forced) with ZERO policies** on both tables — a deny-all
   posture that expresses no opinion about who may eventually read or write.

**Intended containment layer, effect NOT VERIFIED:**

3. **Dedicated `rgkb` schema**, outside `public`. `public` is PostgREST-exposed
   and Supabase's default privileges grant new `public` tables to
   `anon`/`authenticated`, so placing the substrate elsewhere is an intended
   containment layer.

   **❓ The live Supabase exposed-schema configuration was NOT checked, and no
   remote check is authorized.** This document therefore does **not** state as
   fact that `rgkb` is unreachable through the API. That `supabase/config.toml`
   declares no schema override is repository-evidenced; what the live project
   actually exposes is **unknown here**. Controls 1 and 2 are the enforcement
   this package can evidence; control 3 is an additional intended layer whose
   effect is unconfirmed. Verifying it is recorded as DEFERRED-BY-DESIGN (P8).

What was deliberately **not** done: no `CREATE POLICY`, no admin/counselor/
student/parent rule, no `has_role` predicate, no `SECURITY DEFINER`, no change
to any existing role, policy, grant, table, or column. Nothing in `public` is
touched at all. No remote Supabase operation of any kind was performed.

## P8. Explicitly deferred — Tier 2, F-04, F-07

**Tier 2 — structurally BLOCKED** pending a separately accepted controlled
subject-type catalog specification (§5.2 above; Step 1 §14.5). Not
implemented, not prepared, not worked around:

- `governed_instance.subject_type`, `governed_instance.pattern`;
- concrete Pattern A version tables and Pattern B record tables;
- `object_id`, `domain_code`, `version_sequence`;
- any subject-type catalog membership.

**F-04 — OPEN.** No re-binding trigger, authority model, affected-dependent
discovery rule, or re-binding workflow was implemented or implied. Any future
dependency re-binding scenario must fail closed until F-04 is separately
specified.

**F-07 — OPEN.** The Tier 1 resolver implements the §9 skeleton and the §9.4
cardinality rule only. It invents none of the deferred applicability inputs
and does not close F-07.

**Tests that cannot yet be truthfully executed** are recorded in the test file
as `DEFERRED-BY-DESIGN` (vitest `todo`, so they report as outstanding rather
than passing), each with its exact dependency:

1. positive — `instance_id` allocated atomically with its concrete governed
   instance → requires a Tier 2 concrete member table;
2. negative — a `pattern` mismatching the catalog assignment is rejected as a
   fault → requires `governed_instance.pattern` (Tier 2) and a populated
   catalog (Step 1 §14.5);
3. negative — a stale/superseded exact-instance reference is rejected (the
   Master Plan's PRM-WP02 negative evidence) → requires Tier 2 Pattern A
   version tables;
4. runtime — that `RG003` and both write guards actually raise in PostgreSQL →
   requires a disposable Postgres; no production or remote Supabase execution
   is authorized;
5. negative — zero eligible versions within one stable identity and one
   resolution scope fails closed (§10.1) → requires the Pattern A
   stable-identity runtime substrate (Tier 2), the resolution-scope vocabulary
   (Step 1 §14.5) and the eligibility predicate (F-10 / F-13 / rights); a
   caller-supplied `uuid[]` is not evidence of that set (P5);
6. negative — more than one eligible version raises a governance fault with no
   tie-break (§10.2 / §9.4) → same identity/scope/eligibility dependency;
7. verification — the live Supabase API-exposed schema list excludes `rgkb` →
   requires a remote Supabase check, which is not authorized (P7).

No fixture was manufactured to make any of these appear to pass.

## P9. Validation performed

Counts below are the **actual RC1 results**, read from the runs performed
after the RC1 correction — not carried forward from an earlier run.

| Command | Result |
|---|---|
| `npx vitest run src/test/rgkbWp02Tier1Substrate.test.ts` | **42 passed, 7 todo (DEFERRED-BY-DESIGN), 0 failed** — 49 total |
| `npm run test` (full regression, 9 files) | **171 passed, 7 todo, 0 failed** — 178 total |
| `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`) | **exit 0** |

**Evidence level: E1/E2-class local verification only.** These are
dependency-free structural assertions over migration text plus the
repository's existing suites. They are **not** production proof and **not**
proof of runtime database behaviour. The migration has not been executed
against any database.

### P9.1 Self-audit corrections performed

1. **Newline-continued SQL string literals (pre-review).** No other migration
   in this repository uses them, a `RAISE` format argument must be a literal,
   and no database was available to prove the continuation parses — a parse
   failure would have surfaced only at apply time. Every literal was rewritten
   to a single line, and a regression test locks that convention.
2. **Resolver semantic overclaim (RC1, Owner-identified).** See P5 — the
   `uuid[]` parameter and the `RG001`/`RG002` cardinality claims were removed.
3. **API-exposure wording (RC1, Owner-identified).** See P7 — schema placement
   is now stated as an intended containment layer with live exposure status
   NOT VERIFIED, rather than as a verified fact.
4. **Evidence-count drift (RC1, Owner-identified).** The pre-RC1 artifact
   reported the focused suite as 35 passed / 4 todo, a figure taken from a run
   made *before* the final test was added. The table above is re-derived from
   the post-correction runs, and an assertion-on-prose defect found while
   re-running RC1 was fixed in the test itself (a forbidden-identifier check
   was matching the `RAISE` message text instead of the SQL code).

## P10. Explicit non-authorization and state preservation

This Part II records implementation evidence only. It does not authorize,
perform, or imply any of the following, none of which occurred:

- no push, PR, merge, deployment;
- no production SQL, no migration execution anywhere, no remote Supabase
  operation, no Supabase MCP;
- no real data, no real participants, no pilot execution;
- no external AI/tool enablement and no external transmission;
- no Tier 2 work, no WP03+ work, no WP13, no Phase 9.

State preserved and unchanged: **F-04 OPEN** · **F-07 OPEN** · **WP02 Tier 2
BLOCKED** · **WP02 NOT CLOSED** · **P1–P16 unchanged** (only PRM-WP18 may
change a P-gate) · **PR8-1/PR8-2/PR8-3 unchanged** · **Pilot NOT AUTHORIZED**
· **Real data NOT AUTHORIZED** · **Phase 9 NOT AUTHORIZED**.

*(Part II is historical Tier 1 evidence and is not revised by Part III. The
"WP02 Tier 2 BLOCKED" statement above records the state that held while Tier 1
was authored; the block was lifted by the Owner's Tier 2 Human Gate on
2026-08-25 — see Part III §T1.)*

---
---

# PART III — PRM-WP02 TIER 2 IMPLEMENTATION EVIDENCE

> **Boundary between the parts.** **Part I (§1–§17) is the accepted
> architecture authority** and is not rewritten, reinterpreted or softened by
> anything below. **Part II is historical Tier 1 implementation evidence** and
> is not revised. **Part III records Tier 2 only.** Where Part III and Part I
> appear to differ, **Part I governs** and Part III is defective.
>
> Part III changes no P-gate, closes no finding, and does not close WP02.

## T1. Authorization and scope actually exercised

- Authorized by: **Owner PRM-WP02 Tier 2 Human Gate, 2026-08-25** — the separate
  gate required after acceptance and merge of the Controlled Subject-Type
  Catalog Specification. Scope: Tier 2 within the **accepted 19-family
  catalog**.
- Baseline: `origin/main` `0aecc9cfe7cc9e121fc866ca8cbe529b620660f0` (PR #55
  merged, post-merge proof PASS).
- Implementation branch: `remediation/rgkb-wp02-tier2-runtime-v0.1`.
- Catalog authority: the Owner-accepted Controlled Subject-Type Catalog
  Specification v0.1 (merged, SHA-256 `a38ee545…f7097c388e`) — 11 Pattern A,
  8 Pattern B, 19 Owner-approved `subject_type` codes.
- **Not exercised:** F-04 workflow, F-07 applicability inputs, any RLS/auth
  access model, any Step 2–7 domain semantics, WP03, any remote or production
  act.

## T2. Artifacts produced

| Artifact | Purpose |
|---|---|
| `supabase/migrations/20260825190000_rgkb_wp02_tier2_governed_family_substrate.sql` | The entire Tier 2 substrate — one narrow, additive migration |
| `src/test/rgkbWp02Tier2Runtime.test.ts` | Tier 2 structural regression evidence |
| `src/test/rgkbWp02Tier1Substrate.test.ts` | **One** assertion adapted — see T12 |
| this Part III | implementation evidence |

**The Tier 1 migration was not edited.** Where a Tier 1 guard is superseded, the
replacement is made additively in the Tier 2 migration, and the reason is stated
at the replacement site.

## T3. Catalog population — exactly 19 rows

One `INSERT`, 19 rows, in catalog order:

**Pattern A (11):** `knowledge_unit`, `guardrail`, `interpretation_rule`,
`construct_definition`, `rights_decision`, `instrument`,
`localized_governed_text`, `validation_derivation_rule`,
`validation_applicability_matrix`, `integrated_profile_architecture`,
`instrument_scale`.

**Pattern B (8):** `evidence_anchor`, `knowledge_unit_relation`,
`review_decision_event`, `governance_audit_event`, `governance_binding`,
`rights_document_anchor`, `typed_evidence_link`, `derivation_record`.

No twentieth family, no alias, no `_version` subject type, and **none of the
nine unresolved families** (T9).

**Why the Tier 1 `RG020` admission guard was replaced.** Step 1 §2.5 makes
admission of a family whose pattern assignment is not fixed a governance/schema
fault. At Tier 1 no controlled catalog specification existed, so *every*
admission was an unresolved-family admission and the guard refused all of them.
That premise no longer holds. This is the exact and only reason the guard is
superseded.

**The catalog is refrozen, not merely seeded.** A new guard refuses further
admission (`RG030`), in-place reclassification (`RG031`, Step 1 §2.5 change
control) and removal of accepted membership (`RG032`). Membership is controlled;
changing it requires a new controlled specification version and a new migration.

**Seed visibility.** Tier 1 left the catalog under `FORCE ROW LEVEL SECURITY`
with zero policies, which denies DML to the table *owner* as well. A role
without `BYPASSRLS` could not seed at all, and that attribute cannot be verified
from the repository. `FORCE` is therefore lifted for exactly the seeding
statement and **restored immediately in the same migration**; the end state is
identical to Tier 1's.

## T4. `governed_instance.subject_type` and DERIVED `pattern`

Both added as `NOT NULL`.

**The catalog is the actual derivation authority** (RC1 correction). A `BEFORE
INSERT` trigger reads the catalog assignment for the row's `subject_type` and:

| Caller input | Behaviour |
|---|---|
| `pattern` omitted (NULL) | **derived** from the catalog — `NEW.pattern := v_catalog_pattern` |
| `pattern` contradicts the catalog | **`RG081` — fail closed.** Rejected as a governance/schema fault, **never silently corrected** |
| `subject_type` has no catalog assignment | **`RG080` — fail closed.** This is also how an unknown, unresolved or excluded subject type is refused |

```sql
SELECT c.pattern INTO v_catalog_pattern
  FROM rgkb.subject_type_catalog AS c
 WHERE c.subject_type = NEW.subject_type;
```

- The **19 assignments are not duplicated** into `CASE` logic, an enum,
  constants or another table — asserted by test. There is exactly **one**
  family-to-pattern truth source, and it is frozen (T3).
- Assignment to `NEW.pattern` occurs **exactly once**, in the derivation branch;
  the contradiction branch raises rather than assigns — asserted by test.
- Under zero-policy RLS an invisible catalog row yields `RG080`: **fail closed,
  never open.**

The composite foreign key

```sql
FOREIGN KEY (subject_type, pattern)
  REFERENCES rgkb.subject_type_catalog (subject_type, pattern)
```

**remains as defence in depth**: even if the derivation trigger were bypassed,
divergence stays structurally impossible.

- **No second pattern truth store** exists: no member table declares a `pattern`
  column.
- `subject_type` is **not transferable after allocation** — the registry write
  guard refuses `UPDATE` (`RG011`, Step 1 §3.2/§11.2). Registry rows remain
  non-deletable (`RG012`, §5.3).

## T5. Pattern A structural implementation (11 families)

Two strictly distinct identity levels per family:

| Table | Role |
|---|---|
| `rgkb.<family>` | **Stable conceptual identity** — `object_id uuid PK DEFAULT gen_random_uuid()`, `domain_code text NOT NULL UNIQUE`. Carries **no** `instance_id` and **no** `version_sequence`. It is **not** a `governed_instance` and **never** a governance-act target (Step 1 §2.1, §2.2, §11.1). |
| `rgkb.<family>_version` | **Governed version instance** — `instance_id uuid PRIMARY KEY` (the registry identity is its own identity, §3.2 — no second duplicating identity), `object_id` FK to exactly one stable identity (§4), `version_sequence integer NOT NULL` with `UNIQUE (object_id, version_sequence)`, and `previous_sequence` carrying monotonicity. |

`version_sequence` is **ordering only**: it is not part of any primary key, is
never a governance-act target, and **nothing in the migration orders, compares,
maximises or limits by it** — so it cannot act as a current-version tie-break
(§3.4, §9.4).

### T5.1 Monotonicity — enforced structurally, with no reads (RC1 correction)

Step 1 §2.3/§3.4 require `version_sequence` to be **monotonic within its owning
stable identity**, with gaps permitted. Four mechanisms per family, all
declarative:

| Mechanism | Effect |
|---|---|
| `previous_sequence integer` | names the version this one was authored after; `NULL` on the first version only |
| `CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence)` | the step is **strictly increasing** |
| `FOREIGN KEY (object_id, previous_sequence) → (object_id, version_sequence)` (self) | the named predecessor **must exist**, for this same stable identity |
| `UNIQUE (object_id, previous_sequence)` | each version has **at most one successor** — the chain cannot branch |
| partial `UNIQUE INDEX (object_id) WHERE previous_sequence IS NULL` | **exactly one first version** per stable identity |

Together these force the versions of one stable identity into a **single linear
chain extendable only at its tail**, so every newly created version necessarily
carries a `version_sequence` strictly greater than every version created before
it. **That is monotonic creation order.**

**Gaps remain permitted:** only the *direction* of the step is constrained,
never its size — 1 → 5 → 17 is valid. Asserted by test (no `previous_sequence +
1`, no equality constraint).

**No reads are involved.** The mechanism is `CHECK` + `FOREIGN KEY` + `UNIQUE` +
a partial index. It therefore does **not** depend on row visibility, and cannot
fail open under `FORCE ROW LEVEL SECURITY` — which is precisely why the pre-RC1
deferral was wrong rather than merely conservative.

**This is not a currency mechanism.** The chain records authoring order and
nothing else: no scientific, approval, validation, runtime, precedence or
currency meaning, never a governance-act target, and it **must not** be read as
"the current version". Resolution remains F-07's open question and the resolver
remains fail-closed (T8).

### T5.2 Stable identity must own ≥ 1 version (RC1 correction)

Step 1 §4: one `governed_object` **MUST** own one or more version instances; a
stable identity holding none asserts no governed meaning. The schema previously
enforced only *version → exactly one object*, not the reverse.

Each of the 11 stable-identity tables now carries a `DEFERRABLE INITIALLY
DEFERRED` constraint trigger that refuses, **at COMMIT**, a stable identity with
zero versions (`RG070`). Deferral is exactly what allows the first identity and
its first version to be created in one transaction, while subsequent versions
remain permitted.

**No placeholder version is fabricated** — the migration contains exactly one
`INSERT`, the catalog seed. Under zero-policy RLS a caller who cannot see the
version row cannot establish the invariant and is **refused: fail closed, never
open.**

`domain_code` carries **no invented allocation format or policy**: Step 1 §3.3
defers the format, the allocation authority and the collision-prevention
mechanism. Only the parts Step 1 *does* fix are enforced — uniqueness, and
immutability via a guard refusing `UPDATE` (`RG040`) and `DELETE` (`RG041`).

**No domain payload column** was added to any of the 22 tables.

## T6. Pattern B structural implementation (8 families)

One record table per family: `instance_id uuid PRIMARY KEY`, plus the pinned
`subject_type` used for typed enforcement (T7).

- The **exact record identity is the governed instance identity** (Step 1 §2.4).
- **No artificial stable-identity/version family** is imposed — no
  `<family>_version` table exists for any Pattern B family, and no `object_id`,
  `version_sequence` or `domain_code` column appears.
- **No second independently writable identity** duplicates `instance_id`.
- **Correction is append-only**: the guard refuses `UPDATE` (`RG050`) and
  `DELETE` (`RG051`), so the only correction path is a new record, and the
  superseded record stays resolvable (§2.4, §5.3).
- **No family-specific payload field is invented.** WP02 makes no claim to
  implement later domain-specific semantic immutability for payload that does
  not yet exist; the governed relationship between a superseded record and its
  correcting record belongs to later controlled specifications.

## T7. Atomic registry ↔ concrete-instance creation

Step 1 §11.5 requires both to come into existence together. Tier 1 satisfied it
by refusing every registry `INSERT` (`RG010`) because no concrete family
existed. That premise no longer holds; `RG010` is superseded here, and `RG011` /
`RG012` are preserved unchanged.

The replacement is **structural, in two halves**:

**(a) No concrete instance without its registry row — immediate.** Every member
table carries

```sql
subject_type text NOT NULL DEFAULT '<family>'
CHECK (subject_type = '<family>')
FOREIGN KEY (instance_id, subject_type)
  REFERENCES rgkb.governed_instance (instance_id, subject_type)
```

against `UNIQUE (instance_id, subject_type)` on the registry. Because
`instance_id` is the registry primary key, its `subject_type` is unique — so
this composite key makes it **structurally impossible** for one `instance_id` to
appear in two family tables, and **forces the concrete family to agree with the
registry's `subject_type`**, and therefore (through T4's catalog key) with its
`pattern`.

**(b) No orphan registry row — at COMMIT.** A `DEFERRABLE INITIALLY DEFERRED`
constraint trigger requires exactly one member row for the registry row, in the
member table its own `subject_type` and `pattern` determine (`<subject_type>` for
Pattern B, `<subject_type>_version` for Pattern A). Creation is atomic, or it
fails entirely (`RG060`).

**Statement order (RC1 wording correction).** The member table's foreign key
into the registry is **immediate**, so within the transaction the **registry row
is written first and the member row second**. The pre-RC1 wording claimed the
two could be written "in either order"; that was wrong. Deferral does not make
the order arbitrary — it moves the **orphan test** to commit rather than to the
registry `INSERT`, which is what allows the two writes to be separate statements
of one transaction at all. Step 1 §11.5 requires them to come into existence in
the **same committed transaction**, not in an arbitrary statement order, so this
satisfies it. The immediate member → registry key is deliberately **not**
weakened to make a broader prose claim true.

**This is not a general registry INSERT path.** A bare registry `INSERT` is
accepted by the statement and then **refused at commit**, so the only
transaction that can succeed is one that creates both halves.

**Fail-closed note.** The deferred check reads the member table. Under `FORCE
ROW LEVEL SECURITY` with zero policies, a caller who cannot see the member row
cannot establish the invariant, and creation is refused. That is deliberate and
is the correct direction: while no access model is authorized, an unprovable
invariant must fail closed, never open.

**No unconstrained polymorphism.** There is no `subject_id` column anywhere;
family membership is structurally typed (Step 1 §11.3). A governance subject
remains the exact `instance_id` — `object_id`, `domain_code` and
`version_sequence` are referenced by no constraint that would let them stand in
for it (§11.1).

## T8. F-04 and F-07 remain OPEN

**F-07 — OPEN.** `rgkb.resolve_current_version()` is **not modified**: the
string does not appear in the Tier 2 migration. It remains argument-free and
fails closed with `RG003`. No change was mechanically required, so none was
made. No recency fallback, priority fallback, `version_sequence` tie-break,
default version, "latest wins" semantics or guessed applicability was
introduced — asserted by test (`ORDER BY`, `LIMIT`, `DESC`, `MAX(`, `GREATEST`,
`is_current`, `latest`, `current_version`, `default_version`, `most_recent` are
all absent from executable code).

**F-04 — OPEN.** No re-binding trigger, authority model, affected-dependent
discovery, automatic re-pointing or dependency repair exists. The
`governance_binding` family receives **only its Pattern B structural shell**
(`instance_id`, `subject_type`) because it is an accepted catalog family. **That
is not an F-04 implementation and must not be represented as one.**

## T9. The nine unresolved families — negative proof

None of the following is admitted to the catalog, and none has a member table:
construct ↔ scale mapping; cross-source participating position;
source-descriptor; identity-determination; external-identifier-attachment;
cross-source validation exercise; KU-version ↔ construct mapping; reviewer
identity; contributor.

They remain fail-closed outside the catalog. The seeded set is exactly the 19
accepted codes, and the migration creates exactly 30 tables — 11 stable
identities + 11 version tables + 8 record tables — with no others, asserted by
an exact set comparison in the test suite. **M-1 remains OPEN.**

## T10. Access / RLS containment

No functional access model was invented. Containment is at least as strict as
Tier 1:

- everything in the dedicated `rgkb` schema — **no object in `public`**;
- **RLS enabled and forced** on all 30 new tables;
- **zero policies** — no `CREATE POLICY` anywhere;
- **`REVOKE ALL`** from `PUBLIC`, `anon` and `authenticated` on all 30 tables
  and all 4 new functions;
- **no `GRANT`** of any kind;
- **no `SECURITY DEFINER`** — all 5 functions are `SECURITY INVOKER` with
  `SET search_path = ''`;
- no direct client API authorization; no counselor/admin/reviewer/user rule.

**❓ The live Supabase exposed-schema configuration is NOT verified**, and no
remote Supabase access was performed or is authorized.

## T11. No WP03 or later-Step domain semantics

Across all 30 tables the complete column set is exactly six identifiers:
`object_id`, `domain_code`, `instance_id`, `subject_type`, `version_sequence`
and `previous_sequence` — the Step 1 identity/version attributes and nothing
else. (`previous_sequence` is the structural realization of §2.3/§3.4
monotonicity, an ordering attribute, not domain payload — T5.1.) No
evidence-location,
locator, excerpt, fingerprint, epistemic, claim-taxonomy, disposition,
orchestration, consent, safeguarding, purpose, assent, uncertainty or
discrepancy vocabulary appears in executable code. No Step 2/3/4/5/6/7 semantics
are implemented.

## T12. The one adapted Tier 1 assertion

`src/test/rgkbWp02Tier1Substrate.test.ts` contained
`"is a single narrow migration and no other migration references rgkb"`, which
asserted `touching === migrationFiles` — i.e. Tier 1 was the **only** migration
referencing `rgkb`. That assertion runs against the whole repository, not
against the Tier 1 file, and it was true and worth locking **while Tier 2 was
BLOCKED**. Tier 2 is now Owner-authorized and legitimately references `rgkb`, so
the assertion is **factually obsolete**.

Smallest traceable change, with the reasoning recorded in the test file itself:
Tier 1 is still exactly one migration, and the set of migrations touching `rgkb`
is still **closed** — only the two authorized WP02 migrations, nothing else. No
Tier 1 implementation history is rewritten, no other Tier 1 assertion is
weakened, and the Tier 1 migration file is byte-unchanged.

## T13. Validation performed

| Command | Result |
|---|---|
| `npx vitest run src/test/rgkbWp02Tier2Runtime.test.ts` | see T15 |
| `npx vitest run src/test/rgkbWp02Tier1Substrate.test.ts` | see T15 |
| `npm run test` (full suite) | see T15 |
| `npm run typecheck` | see T15 |
| structural SQL lint (offline) | balanced parens; even `$$` and quote counts; no newline-continued literals; 30 tables; 33 triggers; 5 functions; 1 `INSERT` with 19 rows; 0 `SECURITY DEFINER`; 0 `CREATE POLICY`; 0 `GRANT`; 0 `public.`; longest identifier 58 chars (< 63) |

**Evidence level: E1/E2-class local verification only.** These are
dependency-free structural assertions plus an offline SQL lint. **The migration
has not been executed against any database**, so this is **not** proof of
runtime database behaviour and **not** production proof. Full SQL parse
validation was not possible offline: no PostgreSQL parser is available and
adding one would modify `package.json`, which is out of scope.

## T14. DEFERRED-BY-DESIGN

Recorded as vitest `todo` (reported as outstanding, never as passing). **Every
remaining item is runtime-only or remote-only** — no structural Tier 2 invariant
is deferred after RC1:

1. **Runtime raising** of `RG030/031/032`, `RG040/041`, `RG050/051`,
   `RG011/012`, `RG080/081` and the deferred `RG060` / `RG070` checks — requires
   a disposable Postgres; no production or remote Supabase execution is
   authorized.
2. **Deferred-constraint semantics** — that a bare registry `INSERT` is accepted
   by the statement and refused at `COMMIT`, and that a stable identity with no
   version is refused at `COMMIT`, can only be observed in a live transaction.
3. **`domain_code` never reused across a family's lifetime** — uniqueness plus
   non-deletion prevents reuse while rows persist, but a retired-code ledger
   would require the allocation authority Step 1 §3.3 defers. Cross-family
   global uniqueness is likewise not fixed by any controlling source and was not
   invented.
4. **Live Supabase API-exposed schema list excludes `rgkb`** — requires a remote
   check, which is not authorized.

**Removed by RC1:** the pre-RC1 draft deferred *strict monotonicity of
`version_sequence`*, reasoning that enforcing ordering required reading rows,
which `FORCE ROW LEVEL SECURITY` makes unreliable. That reasoning was wrong: the
constraint is expressible **declaratively**, with no reads at all (T5.1). It is
now implemented, and the deferral is withdrawn rather than reworded.

No fixture was manufactured to make any deferred item appear to pass.

## T16. RC1 corrections (Owner-identified)

| # | Defect | Disposition |
|---|---|---|
| A | `version_sequence` monotonicity was deferred, with only `UNIQUE (object_id, version_sequence)` enforced | **CORRECTED** — declarative chain: `previous_sequence` + strict-increase `CHECK` + self `FOREIGN KEY` + `UNIQUE (object_id, previous_sequence)` + partial unique first-version index, on all 11 Pattern A families. No reads, gaps preserved, no currency semantics (T5.1) |
| B | Stable identity could commit with zero versions (Step 1 §4 reverse cardinality unenforced) | **CORRECTED** — `DEFERRABLE INITIALLY DEFERRED` constraint trigger on all 11 stable-identity tables, `RG070`, fail-closed under RLS, no placeholder version (T5.2) |
| C | `pattern` was only *validated* by composite FK, which is not evidence that it is DERIVED | **CORRECTED** — `BEFORE INSERT` derivation from the catalog: omitted → derived; contradictory → `RG081` fail closed, never corrected; unresolvable `subject_type` → `RG080`. Catalog remains the sole authority; assignments not duplicated. FK retained as defence in depth (T4) |
| D | Evidence claimed the two rows could be written "in either order" | **CORRECTED** — the member → registry FK is immediate, so registry is written first; deferral moves the orphan *test* to commit, not the ordering. The FK was not weakened (T7) |

All three structural defects (A, B, C) are **implemented**, not reworded. No new
Owner policy decision was required, so no Genuine Exception arises.

## T15. Non-authorization

No push, PR, merge, deployment. No production SQL, **no migration execution
anywhere**, no remote Supabase operation, no Supabase MCP. No real data, no real
participants, no pilot. No external AI/tool enablement. No WP03, no WP13, no
Phase 9. No existing migration edited; no `public`-schema object altered; no
destructive change.

State preserved: **F-04 OPEN** · **F-07 OPEN** · **M-1 OPEN** · **WP02 NOT
CLOSED** (pending Owner acceptance/review) · **P1–P16 unchanged** (only
PRM-WP18 may change a P-gate) · **PR8-1/PR8-2/PR8-3 unchanged** · **Pilot NOT
AUTHORIZED** · **Real data NOT AUTHORIZED** · **Phase 9 NOT AUTHORIZED**.
