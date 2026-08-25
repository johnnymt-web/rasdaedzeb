# PRM-WP15 — Incident / Stop / Non-Resumption Runbook — DRAFT — v0.1

- Work package: PRM-WP15 — Incident / Stop / Non-Resumption Runbook
- Authorization level: **DRAFT STRUCTURE ONLY.**
- Status: **DRAFT / NOT OPERATIONALLY VALIDATED** — this status applies to
  the entire document and is repeated at the end for emphasis.
- Controlling sources: Step 8 §12 (Failure Containment / Stop / Incident /
  Non-Resumption Contract); accepted Master Plan PRM-WP15.
- Date: 2026-08-24.

## 1. Why this is a draft, not a runbook

PRM-WP01 (named human roles), PRM-WP14 (environment architecture), and
PRM-WP16 (full operating model) are not complete. This document cannot be
operationally validated until all three supply concrete, real content. Every
role/environment reference below is an explicit placeholder. No individual
is named. No authority is assigned to Claude at any point.

## 2. The governed chain (Step 8 §12.1, restated exactly)

**STOP PILOT PATH → PRESERVE EVIDENCE → RECORD INCIDENT → HUMAN/OWNER
ESCALATION → NO AUTOMATED RESUMPTION.**

STOP PILOT PATH is not a Step 5 disposition; it is the human operating act
that follows one (typically ESCALATE or FAIL CLOSED). It does not relax,
replace, or compete with the Step 5 disposition vocabulary. This runbook
adds no new disposition logic — only the operating procedure around the
already-governed dispositions.

## 3. Generic response template (applies to every condition in §4)

For every condition below, the response consists of these ten elements. Only
the *condition-specific* detail (§4's table) varies; the structure is
constant:

1. **Condition detected** — the automated system recognizes one of §4's
   trigger conditions (via whatever detection mechanism the eventual
   PRM-WP02–WP08 implementation provides — not built by this draft).
2. **Automated/system response** — the dependent automated act stops
   immediately; no further processing of that specific path continues (Step
   8 §12.3).
3. **Evidence-preservation action** — existing evidence/state as of the stop
   point is preserved unmodified; sibling successful states (unrelated to
   the failing path) are explicitly NOT erased (Step 7 §11.4/§12.5).
4. **Human escalation** — routed to: **[PLACEHOLDER: incident/stop authority
   — named by PRM-WP16]**. No automated substitute for this step exists or
   is proposed.
5. **Responsible role placeholder** — **[PLACEHOLDER: role name and holder —
   supplied by PRM-WP01 §4.10 / PRM-WP16]**.
6. **Containment action** — condition-specific (§4); at minimum, the failing
   path does not proceed and no workaround/guessed substitute is applied
   (Step 8 §12.3, "do not guess a substitute; do not silently downgrade the
   requirement").
7. **Communication requirement, where applicable** — **[PLACEHOLDER:
   participant/guardian communication responsibility — supplied by PRM-WP16,
   per Step 8 §13.1]**; applicable only where the condition could affect a
   real participant, which for the current synthetic-only program stage is
   none.
8. **Re-authorization requirement** — the named human authority of Step 8
   §13 (**[PLACEHOLDER — not yet named]**) must explicitly re-authorize
   before the path may resume; no automated retry (Step 8 §12.4, restated
   from Step 7).
9. **Resumption prohibition until authorized** — the path remains stopped
   indefinitely absent that explicit re-authorization; there is no default
   timeout or automatic resumption.
10. **Audit record required** — the stop condition, the disposition it
    mapped to, and (once it occurs) the re-authorization event are all
    recorded (Step 7 §13.1; see also the WP12 Gap Analysis in this same
    Wave 0 package, which finds this recording capability does not yet
    exist in the repository and would need PRM-WP13 if triggered).

## 4. The 17 minimum stop conditions (Step 8 §12.2, exact list)

Each condition maps to its already-governed disposition per Step 8 §12.2
("Each maps to its already-governed disposition... this section adds no new
disposition logic, only the pilot-layer STOP label"). This draft does not
invent new disposition logic; the "Governed disposition" column below cites
Step 8's own mapping basis, not a new determination.

| # | Stop condition | Governed disposition basis | Condition-specific containment note |
|---|---|---|---|
| 1 | Accepted-version mismatch | Step 1 §5.3 / Step 7 §6.3 — FAIL CLOSED | No path may proceed on a superseded canonical instance |
| 2 | Provenance break | Step 2-derived FAIL CLOSED | Evidence/citation chain cannot be completed |
| 3 | Scientific-gate failure | Step 3 FAIL CLOSED | Determination/eligibility gate not satisfied |
| 4 | Construct-semantics-firewall violation | Step 4 FAIL CLOSED (absolute, e.g. adversarial cases E–H) | No RIASEC-as-ability, no self-efficacy-as-seventh-channel, etc. |
| 5 | Attempted unsupported claim | Step 4 §12.4 FAIL CLOSED (absolute) | Never rendered under any circumstance |
| 6 | Privacy-authority failure | Step 6 §4/§5 FAIL CLOSED | Purpose/access not established |
| 7 | Missing required minor safeguard | Step 6 §6.3 FAIL CLOSED | Absence is never treated as permission |
| 8 | Safeguarding-routing trigger | Step 6 §8 ESCALATE (routing act) | Ordinary processing stops; routes to responsible human process; no AI investigation/determination (Step 6 §8.1, absolute) |
| 9 | Unavailable reviewer competence | Step 6 §10 ESCALATE or FAIL CLOSED | Platform role alone never substitutes for competence attestation |
| 10 | Unresolved consequentiality | Step 6 §9.3.2 FAIL CLOSED (automated use); request MAY ESCALATE | Antecedent output's own record stays distinct |
| 11 | Machine consequential-decision candidate | Step 6 §11.1/§11.3 FAIL CLOSED (absolute) | Never routed "for approval"; only the surrounding request may separately escalate |
| 12 | External-tool authority failure | Step 5 §5.1 (Tier 3) FAIL CLOSED | No transmission occurs |
| 13 | Audit/replay failure | Step 7 §13.1 FAIL CLOSED on release | Unreconstructable path is non-releasable |
| 14 | Environment-boundary violation | Step 8 §3.3/§12.2 — STOP PILOT PATH, Genuine-Exception-level severity at the operating layer | See PRM-WP14 packet — no isolated environment currently exists, so this condition is currently the MOST LIKELY to occur if any real-data activity were attempted prematurely |
| 15 | Unauthorized production access | STOP PILOT PATH, operating-layer severity | Immediate halt; incident record; Owner escalation |
| 16 | Unexpected real-data exposure | STOP PILOT PATH, operating-layer severity, absolute priority | Preserve evidence of the exposure itself for later remediation without further exposing the data; Owner escalation is not optional |
| 17 | Unapproved side effect | STOP PILOT PATH | Any Tier 2/3 act that occurred without established authorization |

## 5. Current known heightened-risk conditions for the present program stage

Per the other Wave 0 artifacts in this package: condition 14
(environment-boundary violation) and condition 16 (unexpected real-data
exposure) are the most operationally relevant right now, precisely because
PRM-WP14 confirms no isolated pilot environment currently exists (§3 of that
packet) — meaning any premature real-data or non-synthetic activity would
have no structural boundary to violate before directly touching production.
This is a reason for heightened caution in any future engineering work, not
a reason to accelerate WP15's own completion beyond its authorized DRAFT
scope.

## 6. Explicit non-scope

This draft does not: name any individual; assign authority to Claude; claim
any condition has actually been tested (that is PRM-WP17's job, later);
claim operational readiness; supply the detection mechanism itself (that
depends on PRM-WP02–WP08, not yet implemented); resolve F-11 for condition
11 (the consequential-decision candidate boundary remains PARTIALLY
SPECIFIED / OPEN per Step 8's carried findings, unaffected by this runbook).

## 7. Status

**DRAFT / NOT OPERATIONALLY VALIDATED.** This document becomes eligible for
operational validation only once PRM-WP01 (named roles), PRM-WP14 (decided,
evidenced environment), and PRM-WP16 (complete operating model) each supply
their respective missing content, and PRM-WP17 exercises the resulting
runbook against an actual implementation in rehearsal (scenarios 17 and 18
specifically, per the accepted Master Plan's WP17 dependency model). None of
that has occurred. P14 remains unaffected by this document's existence.
