// =========================================================================
// STATE.json governance validator — Phase O2 (spec §8). Node stdlib only.
// Deterministic. No network, no mutation. Fails CLOSED on any violation.
// Run:  node docs/professional-audit/state-validator.mjs [path-to-STATE.json]
// Exit: 0 = valid governance state · non-zero = invalid (errors printed).
// =========================================================================
// Governance model (NOT identity authentication):
//   - STATE.json is workflow governance + evidence tracking. An `actor_role`
//     value is NOT proof a human authorized a transition (spec §1.4/§8).
//   - Implementer-context automation may advance a finding at most to IMPLEMENTED.
//   - Transition INTO REVIEWED requires actor_role reviewer|owner.
//   - Transition INTO PREVIEW_VERIFIED requires E3+ evidence and reviewer|owner.
//   - Transition INTO PRODUCTION_VERIFIED / CLOSED requires actor_role owner AND
//     production evidence (E4-C or E4-B). These remain owner-controlled.
//   - Missing evidence cannot be converted into certainty; malformed data fails closed.
// =========================================================================
import { readFileSync } from "node:fs";

export const STATES = ["OPEN", "ARCHITECTURE_APPROVED", "IMPLEMENTED", "REVIEWED", "PREVIEW_VERIFIED", "PRODUCTION_VERIFIED", "CLOSED"];
const ORDER = Object.fromEntries(STATES.map((s, i) => [s, i]));
export const EVIDENCE = ["E0", "E1", "E2", "E3", "E4-C", "E4-B"];
const TIER = { E0: 0, E1: 1, E2: 2, E3: 3, "E4-C": 4, "E4-B": 4 };
export const ROLES = ["implementer", "reviewer", "owner"];
const SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"];
const OWNER_ONLY = new Set(["PRODUCTION_VERIFIED", "CLOSED"]);
const IMPLEMENTER_MAX = ORDER["IMPLEMENTED"];

// Lifecycle adjacency allow-list (O2-S1-R10). Monotonicity alone permits skips
// like OPEN -> PRODUCTION_VERIFIED; the approved lifecycle (spec §8) forbids them.
// OPEN -> IMPLEMENTED is allowed (L1 direct, no GATE 1); REVIEWED -> PRODUCTION_VERIFIED
// is allowed for config-only findings whose closure set omits E3 preview (spec §7).
const ALLOWED_TRANSITIONS = {
  OPEN: ["ARCHITECTURE_APPROVED", "IMPLEMENTED"],
  ARCHITECTURE_APPROVED: ["IMPLEMENTED"],
  IMPLEMENTED: ["REVIEWED"],
  REVIEWED: ["PREVIEW_VERIFIED", "PRODUCTION_VERIFIED"],
  PREVIEW_VERIFIED: ["PRODUCTION_VERIFIED"],
  PRODUCTION_VERIFIED: ["CLOSED"],
  CLOSED: [],
};

export function validateState(root) {
  const errors = [];
  const err = (m) => errors.push(m);

  if (root === null || typeof root !== "object" || Array.isArray(root)) {
    return { ok: false, errors: ["root: must be a JSON object"] };
  }
  if (!Array.isArray(root.findings)) {
    return { ok: false, errors: ["root.findings: required array missing"] };
  }

  const seen = new Set();
  root.findings.forEach((f, idx) => {
    const at = (m) => err(`findings[${idx}]${f && f.id ? " (" + f.id + ")" : ""}: ${m}`);
    if (f === null || typeof f !== "object" || Array.isArray(f)) return at("must be an object");

    // required scalar fields
    if (typeof f.id !== "string" || !f.id) at("id: required non-empty string");
    else { if (seen.has(f.id)) at("id: duplicate"); seen.add(f.id); }
    if (!SEVERITIES.includes(f.severity)) at(`severity: invalid (${f.severity})`);
    if (!STATES.includes(f.state)) at(`state: invalid enum (${f.state})`);
    if (!EVIDENCE.includes(f.evidence_level)) at(`evidence_level: invalid enum (${f.evidence_level})`);
    if (!ROLES.includes(f.actor_role)) at(`actor_role: invalid enum (${f.actor_role})`);
    if (typeof f.timestamp !== "string" || !f.timestamp) at("timestamp: required string");
    if (!Array.isArray(f.evidence_locations)) at("evidence_locations: required array");
    // provenance for reconciled identity collisions (O2-S1-R08). Historical/non-canonical
    // labels are recorded here for traceability; the canonical `id` is the machine key,
    // and duplicate canonical ids are rejected above — so evidence cannot cross-attach.
    if (f.historical_labels !== undefined && (!Array.isArray(f.historical_labels) || f.historical_labels.some((x) => typeof x !== "string")))
      at("historical_labels: must be an array of strings when present");
    // supplemental provenance (O2-S1R-R06): marks a post-master-register finding
    // (e.g. PF-033) that is NOT one of the original 32 canonical findings.
    if (f.supplemental !== undefined && typeof f.supplemental !== "boolean")
      at("supplemental: must be a boolean when present");

    // history
    if (!Array.isArray(f.history) || f.history.length === 0) { at("history: required non-empty array"); return; }
    let prevOrder = -1;
    f.history.forEach((h, hi) => {
      const ha = (m) => at(`history[${hi}]: ${m}`);
      if (h === null || typeof h !== "object") return ha("must be an object");
      if (!STATES.includes(h.state)) return ha(`state invalid (${h.state})`);
      if (!EVIDENCE.includes(h.evidence_level)) ha(`evidence_level invalid (${h.evidence_level})`);
      if (!ROLES.includes(h.actor_role)) ha(`actor_role invalid (${h.actor_role})`);
      if (typeof h.timestamp !== "string" || !h.timestamp) ha("timestamp required");

      const o = ORDER[h.state];
      // monotonic unless explicit reopen
      if (o < prevOrder && h.reopen !== true) ha(`non-monotonic transition (${STATES[prevOrder]} -> ${h.state}) without reopen:true`);
      if (h.reopen === true && (typeof h.note !== "string" || !h.note)) ha("reopen requires a note");
      prevOrder = Math.max(prevOrder, o);

      // lifecycle adjacency (O2-S1-R10): forbid skipped transitions even when the
      // destination role/evidence would otherwise satisfy the target state.
      if (hi > 0 && h.reopen !== true) {
        const prev = f.history[hi - 1];
        if (prev && STATES.includes(prev.state) && h.state !== prev.state) {
          const allowedNext = ALLOWED_TRANSITIONS[prev.state] || [];
          if (!allowedNext.includes(h.state)) ha(`illegal transition ${prev.state} -> ${h.state} (skips lifecycle; use reopen:true for a governed regression)`);
        }
      }

      // transition authority (evaluated on the entry that ENTERS the state)
      if (h.state === "ARCHITECTURE_APPROVED" && h.actor_role !== "owner")
        ha("transition into ARCHITECTURE_APPROVED (HUMAN GATE 1) is owner-controlled (actor_role must be owner)");
      if (h.state === "REVIEWED" && !(h.actor_role === "reviewer" || h.actor_role === "owner"))
        ha("transition into REVIEWED requires actor_role reviewer|owner (implementer cannot self-certify)");
      if (h.state === "PREVIEW_VERIFIED") {
        if (!(h.actor_role === "reviewer" || h.actor_role === "owner")) ha("transition into PREVIEW_VERIFIED requires reviewer|owner");
        if ((TIER[h.evidence_level] ?? -1) < 3) ha("PREVIEW_VERIFIED requires evidence_level >= E3");
      }
      if (OWNER_ONLY.has(h.state)) {
        if (h.actor_role !== "owner") ha(`transition into ${h.state} is owner-controlled (actor_role must be owner)`);
        if ((TIER[h.evidence_level] ?? -1) < 4) ha(`transition into ${h.state} requires production evidence (E4-C or E4-B)`);
      }
      if (h.actor_role === "implementer" && o > IMPLEMENTER_MAX)
        ha(`implementer actor cannot assert state beyond IMPLEMENTED (got ${h.state})`);
    });

    // final-state consistency with last history entry
    const last = f.history[f.history.length - 1];
    if (last && last.state && f.state !== last.state) at(`state (${f.state}) must equal last history state (${last.state})`);
    if (last && last.evidence_level && f.evidence_level !== last.evidence_level) at(`evidence_level (${f.evidence_level}) must equal last history evidence_level (${last.evidence_level})`);

    // evidence sufficiency for advanced states
    const so = ORDER[f.state];
    if (so >= ORDER["PREVIEW_VERIFIED"] && Array.isArray(f.evidence_locations) && f.evidence_locations.length === 0)
      at(`state ${f.state} requires non-empty evidence_locations`);
    if (f.state === "CLOSED" && (TIER[f.evidence_level] ?? -1) < 4)
      at("CLOSED requires production evidence (E4-C or E4-B)");
  });

  return { ok: errors.length === 0, errors };
}

// ---- CLI -----------------------------------------------------------------
const RUN_CLI = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("/state-validator.mjs");
if (RUN_CLI) {
  const path = process.argv[2] || new URL("./STATE.json", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  let root;
  try { root = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { process.stderr.write(`state-validator: cannot parse ${path} — failing closed: ${e.message}\n`); process.exit(2); }
  const { ok, errors } = validateState(root);
  if (ok) { process.stdout.write(`STATE.json valid: ${root.findings.length} findings, governance rules satisfied.\n`); process.exit(0); }
  process.stderr.write("STATE.json INVALID:\n" + errors.map((e) => "  - " + e).join("\n") + "\n");
  process.exit(1);
}
