# PRM-WP03 — Evidence & Provenance Runtime Foundation — Implementation Evidence — v0.1

- Work package: PRM-WP03 — Evidence & Provenance Runtime Foundation (Step 2).
- Authorization: **Owner PRM-WP03 Human Gate, 2026-08-25**, scoped to Step 2
  and the M-1 fail-closed boundary.
- Status: **IMPLEMENTED — READY FOR OWNER REVIEW.** WP02 CLOSED. **M-1 OPEN /
  FAIL-CLOSED. F-04 OPEN. F-07 OPEN.** P1–P16 unchanged. WP04 NOT AUTHORIZED.
- Baseline: `origin/main` `7255bc18692411a9b6d72af14a0ce325796d491d`.
- Branch: `remediation/rgkb-wp03-evidence-provenance-runtime-v0.1`.
- Date: 2026-08-25.

## 1. Controlling sources and precedence

Applied in the precedence the authorization fixes:

1. **Step 1** — identity / version / lifecycle / referential mechanics.
2. **Step 2** — knowledge / evidence / source / derivation / provenance /
   citation semantics.
3. **Owner-accepted Controlled Subject-Type Catalog Specification** — family
   Pattern assignment.
4. Accepted Master Plan PRM-WP03; merged WP02 Tier 1 + Tier 2 migrations and
   tests.

**No controlling-source contradiction was found**, so no Genuine Exception
arises. Where Step 2 defers a vocabulary, it is left unconstrained rather than
reconciled by implementation choice.

## 2. Artifacts

| Artifact | Purpose |
|---|---|
| `supabase/migrations/20260825210000_rgkb_wp03_evidence_provenance_runtime.sql` | The entire WP03 substrate — one narrow, additive migration |
| `src/test/rgkbWp03EvidenceProvenanceRuntime.test.ts` | WP03 structural regression evidence |
| `src/test/rgkbWp02Tier1Substrate.test.ts` | **One** whole-repository assertion made forward-compatible — §16 |
| this document | implementation evidence |

No existing migration was edited. **WP02 Tier 1 and Tier 2 migrations are
byte-unchanged.**

## 3. Physical model

**New tables (4).** Three enduring source-hierarchy identity levels
(`source_identity`, `source_expression_identity`,
`source_manifestation_identity`) and one normalized dependent structure
(`derivation_record_input`).

**Altered WP02 family shells (7),** all already Owner-admitted catalog
families: `knowledge_unit_version`, `localized_governed_text_version`,
`evidence_anchor`, `rights_document_anchor`, `typed_evidence_link`,
`knowledge_unit_relation`, `derivation_record`.

**New functions (17):** four immutability / editorial-boundary guards, ten
deferred cross-row invariant checks, three traversal functions. All
`SECURITY INVOKER` with `SET search_path = ''`.

**No new governed family. No catalog write.** `subject_type_catalog` is not
referenced anywhere in the migration, and there is no `INSERT` of any kind.

## 4. Step 2 traceability

| Step 2 | Requirement | Realization |
|---|---|---|
| §2.1 | exactly one CONTENT ORIGIN, mandatory | `knowledge_unit_version.content_origin text NOT NULL` + `CHECK IN (3 fixed classes)`, **no default** |
| §2.2 | direct source evidence resolves to an anchor | deferred `RG100` check at COMMIT |
| §2.3 | derived interpretation records its derivation | `CHECK (content_origin <> 'derived_interpretation' OR origin_derivation_instance_id IS NOT NULL)` |
| §2.5 | never inferred, never multi-valued, never defaulted | single constrained column, no default, no trigger assigns it |
| §3.1 | three non-conflated source levels | three separate identity tables |
| §3.2 | scientific claims bind to the **expression** | `evidence_anchor.expression_id NOT NULL`; manifestation nullable |
| §3.3/§3.4 | identity is a curated determination, not a mechanical attribute | no descriptor/metadata/fingerprint/external-identifier column on any source level; no cross-level FK |
| §3.5/§7.6 | source levels are enduring identities, not governed instances | no `instance_id`, not registered, never a governance-act target |
| §4.1 | anchor carries expression, manifestation, locator, offsets, integrity, excerpt, extraction provenance | the nine `evidence_anchor` columns |
| §4.2 | Pattern B, no artificial version family | no `evidence_anchor_version` table; WP02 guard already refuses UPDATE/DELETE |
| §4.3 | rights anchors are not scholarly | separate family carrying **no** source-expression/manifestation reference at all — no scholarly-source surrogate (RC1-2) |
| §2.1 | localized text is content-bearing | it carries its **own** mandatory CONTENT ORIGIN (RC1-1) |
| §7.2 | a declared derivation must have produced *this* instance | `RG120` deferred checks on 4 sites (RC1-3) |
| §4.1 | retained excerpt only where rights permit | retention **fails closed** — WP03 has no authority to permit it (RC1-4) |
| §5.2 | knowledge version attributes | 9 added columns |
| §5.3 | explicit language, wording on the version | `language_code NOT NULL` + non-blank CHECK, no default; `governed_wording NOT NULL` |
| §5.4 | epistemic characterization is not a number | **fails closed** — `CHECK (epistemic_characterization IS NULL)` until a controlled vocabulary is authorized (RC2-4); no aggregation anywhere |
| §5.5 | relation binds version to version | both endpoints FK to `knowledge_unit_version(instance_id)` |
| §6.1 | typed link is the only authoritative pointer | both endpoints are exact governed instances |
| §6.2 | four distinctions expressible, vocabulary deferred | `evidence_role_class CHECK IN (supports, corroborates, contradicts, context)` and nothing more |
| §6.3 | support characterization non-arithmetic | **fails closed** — `CHECK (support_characterization IS NULL)` until a controlled vocabulary is authorized (RC2-4); never aggregated |
| §6.4 | free text is never the pointer | `commentary` nullable, no constraint depends on it |
| §6.5 | one coherent linking concept | `supported_instance_id` references the registry, so any admitted family uses the same mechanism |
| §7.2 | derivation names output, every exact input, type, actor, time, machine process | 7 columns + `derivation_record_input` + deferred `RG110`/`RG111` |
| §7.3 | provenance survives derivation | inputs immutable (`RG092`/`RG093`); nothing copies origin/epistemic/validation/approval/runtime to the output |
| §12.1/§12.2 | deterministic forward + backward traversal | three exact-key-join functions; no string/label/nearest/recency/latest construct |
| §12.3 | citation is a rendering, not the foundation | **no citation rendering implemented at all** |

## 5. Source domain and M-1 treatment

Step 2 §3.5 and §7.6 are decisive and were followed literally.

**What was implemented:** the three levels exist as **enduring conceptual
identities**. Each table has exactly one column — its own identity — and is
not registered in `rgkb.governed_instance`. Reaching one is a stable-identity
reference; the traversal functions name those columns
`enduring_expression_identity` / `enduring_manifestation_identity` precisely so
a caller cannot report them as a resolved governed instance (§7.6).

**What was deliberately NOT implemented, and why.** The source-descriptor,
identity-determination and external-identifier-attachment families are
**M-1-unresolved**. They are not created, not admitted to the catalog, and not
assigned a Pattern.

Consequently **no cross-level foreign key exists** between the three levels.
The determination that a manifestation is an instance of an expression, or an
expression a form of a work, is *exactly* the curated governance subject §3.3
identifies and §3.5 leaves unresolved. Expressing it as a mechanical FK would
have resolved M-1 by schema convenience, which the authorization forbids. Any
path requiring that determination therefore **fails closed** (§14.4).

No title, filename, supplied metadata, external identifier or fingerprint is
stored on a source level, because §3.3/§3.4 make each such assertion a
governance-bearing determination rather than a mechanical attribute.

**M-1 remains OPEN.**

## 6. CONTENT ORIGIN

Mandatory, single-valued, constrained to the three Step 2-fixed classes, with
**no default** — an unclassified row cannot be inserted at all, which is what
§2.6 requires instead of defaulting to direct source evidence. Nothing infers
it: no trigger assigns `content_origin`, and it is not derived from family,
evidence status or epistemic characterization.

`derived_interpretation` structurally requires a derivation record.
`direct_source_evidence` structurally requires a typed evidence link at COMMIT
(`RG100`). `constructed_content` carries no evidentiary support claim — it
simply may have no link, and the constraint does not demand one.

**No arithmetic, scoring or aggregate epistemic semantics** exist anywhere; the
words *score*, *confidence*, *weight*, *average*, *sum*, *percent* appear
nowhere in executable code.

## 7. Evidence, links, relations, derivation

**Evidence anchor** — a location, not a claim: it carries no role, support or
predicate column. Locator-type and fingerprint vocabularies are **unconstrained
because Step 2 defers them**; the columns exist because §4.1 fixes that an
anchor carries them.

**Rights/document anchor** — a distinct family sharing the locator shape but
not forced into the scholarly expression binding. **F-09 stays DEFERRED**: no
rights-document identity family is created.

**Typed evidence link** — the only authoritative pointer. Both endpoints are
exact governed instances; no constraint anywhere references `object_id`,
`domain_code`, `version_sequence` or an external identifier (none of those
identifiers appears in WP03 executable code at all). Contradiction is a
first-class role. Commentary is nullable and load-bearing for nothing.

**Knowledge object relation** — version to version, distinct endpoints,
mandatory predicate, **no relation-local validation status**, **no free-text
evidence basis**.

**Derivation** — exact output, exact inputs through a normalized dependent
structure that is explicitly **not** a governed family (no `instance_id` of its
own, not registered, not catalogued). Inputs are immutable and non-removable,
so a historical derivation continues to name exactly what it consumed even
after an input is superseded, withdrawn, retracted or quarantined. Attribution
is typed and mandatory **without** creating reviewer or contributor governance:
**F-12 and F-14 stay DEFERRED**.

**Nothing transfers from input to output** — no trigger, no generated column,
no computed epistemic label.

## 8. Conflict preservation

Contradiction is expressible two ways, both retained and traversable: as an
`evidence_role_class = 'contradicts'` link, and as a governed
`knowledge_unit_relation` between two exact versions. Both sides remain
visible.

**No reconciliation algorithm exists.** There is no averaging, weighting,
majority rule, "newest wins", suppression or deletion path — no `ORDER BY`,
`LIMIT`, `DESC`, `MAX(`, `GREATEST`, `sum(`, `avg(` appears anywhere, and the
Pattern B guards refuse UPDATE and DELETE on links and relations alike.

## 9. Deterministic traversal

Three functions: `anchor_level_evidence_for_instance` (forward),
`instances_referencing_anchor` (backward), `derivation_inputs_for_output`.

Every step is an exact key join. There is **no** string matching, title
matching, label similarity, filename matching, nearest-match, recency
heuristic, ordering heuristic or "latest" fallback. Backward reachability is
**not** proof of support: the role class is returned so the caller cannot read
reachability as endorsement. An unresolvable step yields **no row** — never a
partial chain presented as complete — and a consequential dependent path treats
that as FAIL CLOSED.

## 10. Explicit non-scope

- **Runtime / student provenance:** not implemented. No `student`, `profile_id`,
  `assessment_id`, `school_id`, `session_id`, `parent_id`, `counselor_id`,
  `user_id` or `auth.` reference appears in any canonical table.
- **Citation rendering:** not implemented at all (§12.3 defers it).
- **Ingestion, crawling, extraction pipelines, embeddings, vector search, RAG,
  external AI:** none.
- **Step 3+ semantics:** no validation determination, interpretation taxonomy,
  recommendation logic, scoring or runtime eligibility. `review_decision_event`
  exists as an admitted family but **received no Step 2 columns**, because
  Step 2 defines none for it.
- **F-04:** no re-binding machinery. **F-07:** `resolve_current_version` is not
  referenced; no latest/current heuristic introduced.

## 11. Access / RLS containment

`rgkb` schema only — **no `public.` object**. RLS enabled **and forced** on all
4 new tables, **zero policies**, `REVOKE ALL` from `PUBLIC`/`anon`/
`authenticated` on all 4 tables and **all 17 functions**, **no `GRANT`**, **no
`SECURITY DEFINER`** (17/17 `SECURITY INVOKER`, 17/17 `SET search_path = ''`).

❓ **The live Supabase exposed-schema configuration is NOT verified**, and no
remote Supabase access was performed or is authorized.

## 12. Validation

| Command | Result |
|---|---|
Final RC3 results, as executed:

| `npx vitest run src/test/rgkbWp03EvidenceProvenanceRuntime.test.ts` | **109 passed, 5 todo, 0 failed** (114) |
| WP02 Tier 1 + Tier 2 regression | **100 passed, 11 todo, 0 failed** (111) |
| `npm run test` (full suite, 11 files) | **338 passed, 16 todo, 0 failed** (354) |
| `npm run typecheck` | **exit 0** |
| offline SQL structural lint | balanced parens; even `$$` and quote counts; no newline-continued literals; **4 tables**; **15 `ALTER TABLE`**; **48 `ADD COLUMN`**; **19 triggers, 13 of them `CONSTRAINT TRIGGER`s**; **17 functions**; **0 `INSERT`**; **0 `SECURITY DEFINER`**; **0 `CREATE POLICY`**; **0 `GRANT`**; **0 `public.`**; **0 ordering constructs**; **0 student identifiers** |
| migration identity | SHA-256 `c37cf0aeace4fa25990f79c4296f9cbc05f213a8647105cfb693abe464c6c565` · 79 236 bytes · 1 280 lines |

**Evidence level: E1/E2-class local verification only.** Structural assertions
over migration text plus an offline lint. **The migration has not been executed
against any database.** No disposable PostgreSQL was available without
installing a dependency or changing package files, so runtime behaviour is
recorded as DEFERRED-BY-EXECUTION-EVIDENCE (§13) rather than claimed. Static
SQL-text tests are **not** proof that PostgreSQL executed anything.

## 13. DEFERRED-BY-EXECUTION-EVIDENCE and deferred vocabularies

Recorded as vitest `todo` — reported as outstanding, never as passing:

1. `RG090/091`, `RG092/093`, `RG130/132/133/140` and the deferred
   `RG100`/`RG110`/`RG111`/`RG120`/**`RG150`/`RG160`/`RG170`/`RG180`**
   actually raising in PostgreSQL —
   requires a disposable Postgres. In particular the RC2 editorial boundary
   (draft editable, `content_asserted` refused, draft exit irreversible) and
   the UPDATE-path re-evaluation of `RG100`/`RG120` are runtime behaviours.
2. Deferred-constraint semantics (direct-source-evidence without a link refused
   at COMMIT; derivation without an input refused at COMMIT) — observable only
   in a live transaction.
3. Traversal functions returning exactly the expected rows over seeded
   synthetic governed state — requires a disposable Postgres and fixtures WP03
   is not authorized to create.
4. Vocabularies Step 2 defers — locator type, fingerprint algorithm, evidence
   role beyond the four mandatory distinctions, support characterization,
   epistemic characterization, knowledge type, developmental scope (F-10).
   Constraining them here would pre-empt the controlled specification that owns
   them.
5. **M-1** — source-descriptor / identity-determination /
   external-identifier-attachment Pattern assignment. The cross-level source
   linkage stays unimplemented and fails closed until an Owner decision fixes
   it.

Also still deferred and untouched: **F-04**, **F-07**, **F-09**, **F-12**,
**F-14**.

## 14. Self-audit

| Check | Result |
|---|---|
| No second identity / version / provenance authority | **PASS** — all governed endpoints reference the WP02 registry |
| Only admitted catalog families used; catalog untouched | **PASS** — 0 `subject_type_catalog` references, 0 `INSERT` |
| M-1 families not created, not admitted, not patterned | **PASS** |
| No cross-level source FK | **PASS** |
| CONTENT ORIGIN mandatory, single, undefaulted | **PASS** |
| No arithmetic / master score | **PASS** |
| Explicit language, no default | **PASS** |
| Exact-instance pointers only | **PASS** — `object_id` and `version_sequence` occur **only inside the RC2 editorial guards' `IS DISTINCT FROM` immutability comparisons**; they are never authoritative pointer targets, allocators, identity substitutes or resolution heuristics, and `domain_code` is absent entirely |
| Conflict retained, no reconciliation | **PASS** |
| Provenance survives derivation; nothing transferred | **PASS** |
| Deterministic traversal, no heuristics | **PASS** |
| No runtime/student provenance | **PASS** |
| No Step 3+ semantics, no ingestion/RAG | **PASS** |
| F-04 / F-07 / M-1 preserved | **PASS** |
| Containment at least as strict as WP02 | **PASS** |
| Canonical Steps 1–8 and Master Plan unmodified | **PASS** |

### 14.1 RC1 corrections (Owner source review)

| # | Finding | Disposition |
|---|---|---|
| RC1-1 | localized text lacked its own CONTENT ORIGIN | **CORRECTED** — own mandatory 3-class column, no default, never inherited; derived requires its own derivation whose output is this version; direct source resolves through the **same** canonical link mechanism (`localized_text_direct_evidence_check` reuses the one function) |
| RC1-2 | one linking concept excluded rights anchors | **CORRECTED** — one `typed_evidence_link` family now names an exact `evidence_anchor` **or** an exact `rights_document_anchor`, with a CHECK requiring **exactly one**. No second link family. **F-09 boundary tightened:** the rights anchor now carries **no** `expression_id`/`manifestation_id` at all, so no scholarly-source surrogate exists; rights-side traversal reports `incomplete_f09_unresolved` |
| RC1-3 | a derivation reference could name any derivation | **CORRECTED** — `RG120` deferred checks on knowledge version, localized text, evidence anchor and rights anchor require the referenced derivation's `output_instance_id` to be exactly the referencing instance. Anchor extraction provenance is now **`NOT NULL`**. Machine identity/version are both-or-neither and non-blank when present; no provider taxonomy invented |
| RC1-4 | `retained_excerpt` was freely writable | **CORRECTED** — `CHECK (retained_excerpt IS NULL)` on both anchor families. Retention **fails closed**: WP03 has no authority to establish permission and absence of a rights determination is not permission. No rights flag, no legal decision, F-09/WP09 not closed. Locator and provenance remain usable |
| RC1-5 | traversal could read as a complete canonical chain | **CORRECTED** — renamed `anchor_level_evidence_for_instance`, with a constant `canonical_source_chain_status` of `incomplete_m1_unresolved` / `incomplete_f09_unresolved`. No interface claims complete canonical provenance. **M-1 is not resolved**: still no descriptor/determination family and still no cross-level source FK |
| RC1-6 | stale evidence claims | **CORRECTED** — the WP02 Tier 1 blanket stale/superseded TODO was rewritten to match the Owner-approved Closure Criterion Clarification (historical instances remain resolvable; rejection applies only inside a governed context requiring a current/eligible version, which remains F-07 and fail-closed). The "6 altered shells" count is now **7**, and all function/trigger/test counts are re-derived from the post-RC1 runs |

### 14.3 RC3 corrections (Owner closure review)

| # | Finding | Disposition |
|---|---|---|
| RC3-1 | prohibited CONTENT ORIGIN promotions were possible while draft | **CORRECTED** — **`RG140`** in both editorial guards rejects derived→direct and constructed→derived/direct, evaluated **before** the content_asserted branch so it binds draft rows too. Legitimate draft editing, the cross-row checks and content_asserted immutability all survive; no ranking system, and no trigger rewrites `NEW.content_origin` |
| RC3-2 | a knowledge version could bind a still-mutable localized text | **CORRECTED** — **`RG160`** deferred check requires `assertion_text_instance_id` to reference a `content_asserted` localized-text version. Because `RG130` refuses every update of such a row, bound wording can never change in place. No `is_bound`/`is_immutable` flag invented, no `editorial_class` silently mutated, no review/validation/activation state inferred; an unreadable target fails closed |
| RC3-3 | constructed content could acquire an authoritative evidence pointer | **CORRECTED** — **`RG150`** closes **both** directions: a link targeting constructed content is refused (`typed_evidence_link_target_check`), and reclassifying a draft object to constructed while a link exists is refused (both content families). Commentary stays permitted; the shared `typed_evidence_link` family is preserved and no ad-hoc mechanism added |
| RC3-4 | a relation could exist with zero governed evidence | **CORRECTED** — **`RG170`** deferred check requires at least one `typed_evidence_link` naming that exact relation instance. Deferral lets relation and link be created in one transaction. Free-text evidence basis stays prohibited; no second link family; correction stays append-only |
| RC3-5 | a later INSERT could enlarge a historical derivation input set | **CORRECTED** — the derivation record now declares an immutable `input_count`; `RG110` requires the actual set to **equal** it at COMMIT, and **`RG180`** refuses any later input INSERT that would exceed it. Multi-input initial construction stays possible; update/delete stay refused (`RG092`/`RG093`); correction uses a new derivation record. **No caller-writable locked/finalized/first-governance-use boolean, and no timestamp, recency or ordering used as authority** |
| RC3-6 | stale evidence prose | **CORRECTED** — §4 fail-closed vocabulary rows, the self-audit row on `object_id`/`version_sequence`, the two stale SQL comments, and recomputed counts throughout |

### 14.2 RC2 corrections (Owner final source review)

| # | Finding | Disposition |
|---|---|---|
| RC2-1 | Pattern A editorial immutability unenforced once WP03 added semantic payload | **CORRECTED** — `knowledge_version_editorial_guard` / `localized_text_editorial_guard` replace the WP02 blanket UPDATE block **on those two tables only**, additively. Draft content is editable; **`RG130`** refuses every update of a `content_asserted` row, which also makes draft exit irreversible; **`RG132`** freezes identity and ordering in every state; **`RG133`** refuses deletion. Correction after the boundary requires a new version. **Every WP03 cross-row invariant now fires on `AFTER INSERT OR UPDATE`**, so a draft edit cannot bypass `RG100` or `RG120` |
| RC2-2 | a rights anchor could satisfy the direct-source-evidence invariant | **CORRECTED** — `direct_evidence_has_anchor_check` now counts only links carrying an exact `evidence_anchor_instance_id`. Rights links remain fully valid inside the **same** shared `typed_evidence_link` concept for rights/document determinations; no second link family exists |
| RC2-3 | a "complete" scientific anchor could be unresolvable | **CORRECTED** — `integrity_value` is now `NOT NULL` and non-blank, `locator_type`/`locator_payload` non-blank, `extraction_derivation_instance_id` mandatory and `RG120`-correlated. **No fingerprint algorithm invented** — the constraint requires that an integrity value exists, never how it is computed. Span offsets stay optional; retention stays fail-closed |
| RC2-4 | deferred vocabularies had become free-text authority | **CORRECTED** — `CHECK (epistemic_characterization IS NULL)` and `CHECK (support_characterization IS NULL)`. Arbitrary text cannot be validated and would be an uncontrolled authority, so any value fails closed until a controlled specification authorizes the vocabulary. **No vocabulary value or semantic code invented.** Non-arithmetic, non-additive and no-master-score hold trivially. The four mandatory evidence-role distinctions are unaffected |
| RC2-5 | stale evidence details | **CORRECTED** — function counts made internally consistent (**12/12** everywhere), `RG120` and the RC2 codes added to the runtime TODOs, and the rights-anchor prose no longer implies any nullable scientific expression binding (that column was removed in RC1). WP02 closure state and canonical Steps 1–8 untouched |

**Corrections made autonomously during implementation:** none of substance
before RC1 — the WP03 suite passed on first execution. Outside WP03 the only
adaptations were the single forward-compatible WP02 Tier 1 assertion described
in §16 and the RC1-6 wording fix to one Tier 1 TODO. **No WP02 migration was
touched and WP02 was not reopened.**

## 15. Explicit negatives

No push, PR, merge, deployment. No production SQL, **no migration execution
anywhere**, no remote Supabase operation, no Supabase MCP. No real data, no
real participants, no pilot. No external AI/tool. No ingestion, embeddings or
retrieval. No WP04, no WP13, no Phase 9. No canonical Step 1–8 specification
modified; the Master Plan and the Controlled Subject-Type Catalog Specification
are untouched.

## 16. The one adapted WP02 assertion

`src/test/rgkbWp02Tier1Substrate.test.ts` carried a whole-repository assertion
that only the WP02 migrations may reference `rgkb`. WP03 now legitimately does,
so that form is factually obsolete.

Per the authorization's forward-compatibility instruction, the obsolete
assumption was removed **once** rather than re-expanded to "WP02 + WP03" — a
form every later authorized package would have to edit again. What remains
locked is what the test exists to protect: the Tier 1 artifact is still exactly
one migration and is still present among the `rgkb` migrations. Every
substantive Tier 1 structural assertion is untouched, the Tier 1 migration is
byte-unchanged, and no Tier 1 implementation history is rewritten. The reason
is recorded in the test file itself.

## 17. Governance state

**PRM-WP03: IMPLEMENTED — READY FOR OWNER REVIEW** · **WP02: CLOSED** ·
**M-1: OPEN / FAIL-CLOSED** · **F-04: OPEN** · **F-07: OPEN** ·
**F-09 / F-12 / F-14: DEFERRED** · **P1–P16: UNCHANGED** — **P4 is NOT marked
satisfied**; only PRM-WP18 may change a P-gate state · **Pilot: NOT
AUTHORIZED** · **Real data: NOT AUTHORIZED** · **Phase 9: NOT AUTHORIZED** ·
**WP04: NOT AUTHORIZED**.
