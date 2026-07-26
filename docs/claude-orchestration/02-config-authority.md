# Config-Authority Note (P10)

```text
Status: NORMATIVE NOTE (implements P10 of the approved Phase O2 artifact specification)
Role: Canonicalization policy — NOT an architecture specification
Controlling architecture: docs/claude-orchestration/01-approved-orchestration-architecture.md
Applies to: Claude Code orchestration configuration for Pathfinder / "Super Riasec"

This note declares which configuration surfaces are authoritative. It does not
redesign, extend, or compete with the approved orchestration architecture. On any
conflict of substance, the approved architecture and CLAUDE.md govern; this note
only resolves *which files carry active policy*.
```

## 1. Purpose

Establish **one unambiguous policy authority model** for Claude Code configuration in
this repository, so that active orchestration policy has a single canonical home and
legacy/compatibility surfaces can never silently redefine it. This note answers:

- What is canonical? — §2
- What is legacy/non-canonical? — §3
- What wins on conflict? — §4 (authority hierarchy)
- How are exports handled? — §5
- What must never be manually synchronized? — §5–§6
- Which artifacts govern lifecycle and finding routing? — §7
- Who controls protected / environment-specific config? — §8

## 2. Canonical surfaces (authoritative, active)

`.claude/*` is the **canonical namespace for active Claude Code runtime / orchestration
artifacts** in this project. The active runtime artifacts live here and nowhere else:

- `.claude/hooks/*` — canonical for active hooks (deterministic tool policy).
- `.claude/skills/*` — canonical for active project skills.
- `.claude/agents/*` — canonical for active project reviewer / subagent definitions.
- `.claude/settings.json` — canonical **and** environment-sensitive/protected; see §8.

`.claude/*` being canonical for *runtime artifacts* does not make it the sole source of
policy. **Project-level policy is also authoritatively defined** by the approved
orchestration architecture and by `CLAUDE.md`, which sit **above** `.claude/*` in the
authority hierarchy (§4). The rule is narrower: for any **active Claude Code runtime /
orchestration artifact** (a hook, skill, agent, or settings file), its canonical
definition is a `.claude/*` artifact, and there is no second authoritative copy of that
artifact.

**Canonical authority ≠ Git tracking status.** `.claude/*` is the canonical namespace
because it is where active runtime artifacts live, independent of whether any given file
is committed. Environment-local files — notably `.claude/settings.json` and
`settings.local.json` — may be **intentionally untracked** and still be the canonical,
authoritative configuration for their environment. Tracking status is a version-control
concern, not an authority concern; an untracked canonical file is still canonical, and a
tracked legacy file is still non-authoritative.

## 3. Legacy / non-canonical surfaces (reference only)

`.agents/`, `.codex/`, and `AGENTS.md` are **legacy/non-canonical compatibility and
reference surfaces only**. They are:

- **not** authoritative for any active policy or runtime artifact;
- **not** a place active policy or runtime artifacts are defined, edited, or maintained;
- retained (where present) only as legacy/compatibility material.

**Legacy surfaces must never override, compete with, or silently redefine `.claude/*`
policy.** They are not migrated, deleted, or promoted by this note; they are simply
non-authoritative. Where a legacy surface disagrees with a canonical `.claude/*`
artifact, the legacy surface is wrong by definition and the canonical artifact wins.

## 4. Authority hierarchy (what wins on conflict)

From strongest to weakest, for questions of orchestration policy:

1. **Approved orchestration architecture** — `docs/claude-orchestration/01-approved-orchestration-architecture.md` (controlling specification).
2. **CLAUDE.md** — project constitution / instructions.
3. **Canonical `.claude/*` runtime artifacts** — hooks, skills, agents, `settings.json` (active policy as implemented).
4. **`STATE.json` and `finding-index.md`** — authoritative only within their respective governance functions (§7).
5. **Legacy / non-canonical compatibility surfaces** — `.agents/`, `.codex/`, `AGENTS.md` (reference only; never authoritative).

Higher entries govern lower ones on conflict. A lower surface never overrides a higher
one, and a legacy surface (level 5) never overrides a canonical one (level 3).

**Policy authority vs. runtime/environment-local settings.** This hierarchy ranks
*policy authority* — what the rules are. It is distinct from *runtime/environment-local
settings* — machine- or environment-specific values (paths, local toggles, host
specifics) that configure how a given environment executes that policy. Environment-local
settings never elevate to policy authority: an environment-specific value does not
become a project-wide rule. See §8.

## 5. Exports (legacy-format material)

Do **not** hand-maintain legacy-format policy. If another tool or ecosystem genuinely
requires legacy-format material, it may receive a **generated export derived from the
canonical `.claude/*` policy**, and only when actually needed.

A generated export:

- must be **clearly labelled generated / non-authoritative**;
- must **never become a reverse source of truth** (canonical → export is one-directional);
- is regenerated from canonical policy, never edited in place to steer canonical policy.

**No generated export is created by this note.** This section states the rule for if/when
one is ever needed.

## 6. Prohibited couplings

- **Do not create symlinks** between canonical (`.claude/*`) and legacy (`.agents/`,
  `.codex/`, `AGENTS.md`) locations. Canonical and legacy remain physically distinct.
- **One canonical copy per runtime artifact.** Each active Claude Code runtime /
  orchestration artifact must have exactly **one canonical hand-maintained copy** (in
  `.claude/*`). Legacy `.agents/`, `.codex/`, and `AGENTS.md` must **never** be maintained
  as parallel hand-edited copies of `.claude/*`; generated legacy exports, if ever needed,
  are **one-way derivatives only** (§5). This is distinct from — and does not constrain —
  the separately authoritative hand-maintained policy documents (the approved architecture
  and `CLAUDE.md`), which are not `.claude/*` runtime artifacts.
- **Do not treat legacy agent memory/config as cross-session state.** Cross-session
  continuity comes from `STATE.json` (§7), not from opaque legacy memory.

## 7. Lifecycle and finding-routing authorities

- **Cross-session workflow / finding state** is governed by
  `docs/professional-audit/STATE.json` (canonical; validated by its state-validator).
  It is **not** governed by legacy agent memory or legacy config.
- **Finding routing** (finding → files / migrations / tests) is governed by
  `docs/professional-audit/finding-index.md`.

These two files are authoritative **only** for their respective governance functions;
they do not define orchestration policy (that is the architecture + CLAUDE.md + `.claude/*`).

## 8. Protected / environment-specific configuration

`.claude/settings.json` (and `settings.local.json`, where present) is
**environment-sensitive/protected and human-controlled** per the approved architecture.
Autonomous edits to orchestration **safety config** — `.claude/settings*.json`,
`.claude/hooks/**`, the guard script, `.mcp.json`, and the STATE **state-validator** — are
**HUMAN-ONLY**.

**STATE.json content is role-gated, not blanket HUMAN-ONLY.** State transitions follow the
approved lifecycle model (architecture §8): an implementer context may advance a finding at
most to **`IMPLEMENTED`**; **`IMPLEMENTED → REVIEWED`** requires a reviewer verdict
artifact/process (no self-certification); **`PRODUCTION_VERIFIED` and `CLOSED` are
HUMAN-ONLY** (owner-controlled action backed by the required E4 evidence). The
**state-validator itself remains protected** (HUMAN-ONLY) so the transition rules cannot be
weakened autonomously.

**Two distinct layers, both in force.** (1) At the **tool/guard enforcement layer**,
`docs/professional-audit/STATE.json` itself is **protected against autonomous Write/Edit** —
the guard blocks direct autonomous modification of the file. (2) **Separately**, **lifecycle
transition authority is role-gated**: an implementer context may advance a finding at most to
**`IMPLEMENTED`**; **`REVIEWED`** requires reviewer evidence/process (no self-certification);
**`PRODUCTION_VERIFIED` and `CLOSED` are HUMAN-ONLY**. These layers do not substitute for one
another: **role-gated lifecycle authority does NOT grant autonomous permission to bypass the
guard or to directly edit the protected `STATE.json` file.** Even where a role would be
permitted the *lifecycle transition*, the actual file mutation still passes through the
human-controlled guard/enforcement path.

This is the practical line between **policy authority** and **runtime/environment-local
settings**: canonical policy declares the rules; protected, environment-specific settings
tune how a particular (human-controlled) environment enforces them. An environment-local
value is never a project-wide policy, and it is never edited autonomously.

## 9. Scope guard

This is a **P10 canonicalization note**. It does **not** create a competing architecture
specification, redefine autonomy levels, human gates, evidence semantics, reviewer
independence, or state-closure authority — all of those remain governed by
`docs/claude-orchestration/01-approved-orchestration-architecture.md` and `CLAUDE.md`.
