# PRM-WP02 — Governed Object / Version Runtime Architecture Proposal — v0.1

- Work package: PRM-WP02 — Governed Object / Version Runtime Foundation
- Authorization level: **DISCOVERY + ARCHITECTURE ONLY.** No code, no schema,
  no migration, no RLS/auth change is performed by this document.
- Controlling sources: Step 1 (Governed Object / Versioning / Referential /
  Lifecycle Substrate v0.1); accepted Master Plan PRM-WP02.
- Status: DRAFT — proposal only, ends at Human Gate 1.
- Date: 2026-08-24.

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
