# RGKB Professional Execution Architecture v1.0

- Program: RGKB — Canonical Knowledge Database Architecture
- Artifact type: Execution-control architecture
- Version: v1.0
- Status: ADOPTED — CONTROL LAYER ONLY
- Date: 2026-08-20
- Production status: NOT AUTHORIZED FOR PRODUCTION

## 1. Purpose

This document defines how RGKB work is planned,
executed, validated, and gated.

It is an execution-management layer. It creates no
scientific, governance, schema, or production
authority of its own.

## 2. Scope

Applies to RGKB Phase 7.1 and subsequent RGKB work
carried out in an authorized feature worktree.

It does not apply to production systems, and it does
not authorize any action listed in section 19.

## 3. Operating Principles

1. Evidence before closure.
2. Fail closed on ambiguity.
3. Source fidelity over convenience.
4. Smallest sufficient authority.
5. Reversibility preferred; irreversibility gated.
6. Scientific and safeguarding invariants are never
   traded for throughput.
7. Efficiency is achieved by right-sizing the control
   unit while preserving required controls.

## 4. Execution Hierarchy

PROGRAM to PHASE to STEP to WORK PACKAGE to
DELIVERABLE to VALIDATION to GATE.

The normal execution unit is the WORK PACKAGE, not a
paragraph, a shell command, or a micro-chunk.

## 5. Roles and Responsibilities

OWNER
- scope ownership;
- policy/adjudication;
- scientific/business decisions requiring authority;
- RED Owner Gates.

CHATGPT
- architecture;
- scientific/governance supervision;
- sequencing;
- Work Package definition;
- checkpoint review;
- cross-package integration;
- framing Owner decisions.

CLAUDE OPUS
- bounded local implementation executor;
- source inspection;
- authorized authoring;
- deterministic validation;
- tests/evidence;
- repository-scope validation;
- checkpoint reporting;
- fail-closed escalation.

ChatGPT does not obtain direct autonomous
control of the local terminal through this
architecture.

## 6. Work Package Model

A Work Package is the normal unit of
execution and declares:
- identifier;
- purpose;
- authorized scope;
- source authorities;
- deliverables;
- validation requirements;
- entry criteria;
- exit criteria;
- required gates.

Work outside declared scope is unauthorized.

## 7. Deliverable Model

A deliverable is a named output or
artifact of the active Work Package.

A deliverable must be verifiable.

Closure requires the required
validations to pass.

The identity and evidence of a
deliverable are recorded where the
Work Package requires.

## 8. Evidence and Source-of-Truth Model

Source precedence:
1. explicit current Owner adjudication;
2. approved Owner Gate / controlled
   decision record;
3. controlling canonical architecture;
4. approved controlled specification;
5. approved existing orchestration
   architecture where applicable;
6. Work Package execution packet;
7. validator/audit wording.

Validator/audit wording is
NON-NORMATIVE unless traceable to an
approved source.

There is no silent source
reconciliation. A conflict is reported,
never resolved for convenience.

## 9. Validation Architecture

Every deliverable receives the
validations applicable to its artifact
type and active Work Package.

File identity controls such as byte
count and SHA-256 are used where
applicable.

For governed textual artifacts,
applicable checks include:
- UTF-8;
- LF-only;
- terminal LF;
- required headings / sections;
- structural integrity.

Cross-deliverable validation checks:
- internal consistency;
- source fidelity;
- consistency between Current State and
  the Work Package Register, where
  applicable;
- that no finding was silently closed;
- that no unauthorized authority or
  production claim was introduced.

Validation produces evidence for a
gate. Validation itself MUST NOT be
treated as authorization.

## 10. Risk / Permission Classes

GREEN — autonomous within an authorized
Work Package:
- read-only source inspection;
- hashes;
- byte/LF checks;
- git status;
- git diff;
- git diff --check;
- git diff --cached --check;
- tests;
- typecheck;
- lint;
- /tmp scratch work;
- deterministic non-destructive
  validation;
- evidence collection.

AMBER — only when explicitly included
in the active Work Package:
- creation of authorized worktree
  files;
- editing explicitly named
  deliverables;
- validated candidate to authorized
  canonical worktree write;
- narrowly scoped approved refactor.

AMBER never authorizes
scientific/governance reinterpretation
or scope expansion.

RED — explicit Owner Gate required:
- scientific/governance policy change;
- assessment meaning change;
- scope expansion;
- SQL/DDL authorization;
- migrations;
- Supabase schema/security changes;
- secrets, keys, Vault;
- production operations;
- commit;
- push;
- PR;
- merge;
- deployment;
- destructive reset/restore;
- git clean;
- recursive deletion;
- branch deletion;
- production data operations.

Relationship to L0/L1/L2/L3.

The approved L0/L1/L2/L3 orchestration
model remains in force.

GREEN/AMBER/RED is an additional
execution-risk dimension. It does not
replace, supersede, remap, or redesign
L0/L1/L2/L3.

No L0/L1/L2/L3 ↔ GREEN/AMBER/RED mapping
may be inferred unless explicitly
grounded in an approved source.

Where a conflict exists, the approved
orchestration architecture and
CLAUDE.md remain controlling within
their applicable scope.

Existing conservative fail-up behavior
remains in force where already
established by the approved
orchestration model.

## 11. Gate Architecture

A gate is an explicit Owner
authorization required before a
specified action.

Every RED action requires an explicit
Owner Gate.

Gate authorization is scope-bound.
Approval in one context does not extend
to another.

An implementer may report at most
IMPLEMENTED.

PRODUCTION_VERIFIED and CLOSED state
transitions require an Owner-controlled
action backed by the required E4
evidence.

## 12. Stop Conditions

Execution stops and reports, without
auto-fixing, on:
- a guard denial;
- failure of a baseline or identity
  check required by the active Work
  Package;
- an unexpected source conflict;
- ambiguity outside the authorized
  resolution space;
- a required action that is RED;
- repeated transport corruption.

A guard denial ends the current
autonomous turn. It is not retried,
reworded, or routed around.

## 13. Repository Control Model

Repository mutation occurs only within
a Work Package that names it.

Staging is by explicit path. Never
git add . and never git add -A.

Commit, push, PR, merge, and deploy are
RED and require an Owner Gate.

Existing untracked and owner-controlled
files are protected. Broad cleanup,
git clean, destructive reset, and
restore of owner work require explicit
RED authorization.

Global Git configuration is not changed
to bypass repository safety.

## 14. Scientific and Governance Control

Scientific, safeguarding, and governance
invariants constrain every Work Package
and deliverable. They are never traded
for throughput.

Assessment allocation, item wording,
scoring rules, factor membership,
reverse keys, norms, or shared
interpretation rules MUST NOT be changed
without the applicable controlled
authorization.

Scientific or governance meaning is
never silently reinterpreted.

A conflict or required reinterpretation
outside authorized scope is escalated
through the applicable governance or
Owner Gate.

The detailed controlling invariant set
is maintained in the Claude Controlled
Execution Contract. Artifact A does not
duplicate the full list in a way that
can drift.

## 15. Checkpoint Package Standard

Every completed Work Package checkpoint
includes:
- WORK_PACKAGE
- STATUS
- PURPOSE
- AUTHORIZED_SCOPE
- SOURCE_AUTHORITIES
- FILES_CHANGED
- FILES_UNCHANGED_EXPECTED
- BEFORE_IDENTITY
- AFTER_IDENTITY
- VALIDATION_RESULTS
- SCIENTIFIC_GOVERNANCE_CHECK
- REPOSITORY_SCOPE_CHECK
- OPEN_FINDINGS
- OWNER_DECISIONS_REQUIRED
- RED_GATES_NOT_EXECUTED
- NEXT_WORK_PACKAGE

## 16. State Management

Operational execution state for this
control layer is maintained through:
- RGKB Current State;
- RGKB Work Package Register.

State is updated as part of the Work
Package checkpoint / state-update step.

RGKB Current State records the current
operational position and the verified
identities required by the active state
specification.

RGKB Work Package Register records Work
Package status, scope, entry / exit
criteria, and applicable gates.

Completed/open status must reflect
validated evidence and applicable
authorization.

A finding must not be silently recorded
as closed.

## 17. Handoff Protocol

A handoff carries the active execution
context and evidence needed for
controlled continuation.

A handoff states the active Work
Package, the identities verified under
it, open findings, Owner decisions
required, and the next action.

Completed changes move from the
autonomous environment into the
owner-controlled Git workflow through
an explicit human-controlled handoff.
Autonomous push is NOT an authorized
transfer mechanism.

## 18. Change Control

Changes to this adopted architecture
require an Owner-authorized Work
Package that names the amendment.

An amendment records what changed and
why and creates a new version.

A superseded version is retained as
evidence and is not rewritten in place.

Changes to orchestration safety
configuration remain human-only under
the approved orchestration architecture
and CLAUDE.md.

## 19. Explicit Non-Authorization

This architecture authorizes none of
the following:
- SQL;
- DDL;
- migrations;
- Supabase schema/security changes;
- production;
- ingestion;
- embeddings;
- RAG;
- RGIM production implementation;
- agents;
- student data;
- commit;
- push;
- PR;
- merge;
- deploy.

Any such action requires explicit Owner
authorization at its applicable gate.

## 20. Adoption / Effective State

Status: ADOPTED — CONTROL LAYER ONLY.

This document operates as an additional
control layer for RGKB execution
management from its adoption date.

It applies within its defined scope and
source-precedence rules. It does not
replace or supersede the approved
orchestration architecture or CLAUDE.md.

It confers no scientific, governance,
schema, or production authority.

It is NOT AUTHORIZED FOR PRODUCTION.
