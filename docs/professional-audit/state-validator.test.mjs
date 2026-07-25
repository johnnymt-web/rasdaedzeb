// =========================================================================
// state-validator tests (Phase O2 Segment 1) — dependency-free (Node stdlib).
// Proves the governance rules ACCEPT valid state and REJECT violations.
// Run: node docs/professional-audit/state-validator.test.mjs
// =========================================================================
import { readFileSync } from "node:fs";
import { validateState } from "./state-validator.mjs";

const TS = "2026-07-24T00:00:00Z";
let pass = 0, fail = 0;
const check = (label, cond) => { cond ? pass++ : (fail++, console.log("FAIL:", label)); };

// minimal helpers
const hist = (...states) => states.map(([state, ev, role, extra]) => ({ state, evidence_level: ev, actor_role: role, timestamp: TS, ...(extra || {}) }));
const finding = (over = {}) => ({
  id: "PF-X", severity: "High", title: "t", risk_class: ["security"],
  state: "OPEN", evidence_level: "E0", evidence_locations: ["docs/x.md"],
  actor_role: "implementer", timestamp: TS,
  history: [{ state: "OPEN", evidence_level: "E0", actor_role: "implementer", timestamp: TS }],
  ...over,
});
const root = (findings) => ({ findings });
const errsInclude = (r, sub) => r.errors.some((e) => e.includes(sub));

// 1. real STATE.json is valid
{
  const r = validateState(JSON.parse(readFileSync(new URL("./STATE.json", import.meta.url), "utf8")));
  check("real STATE.json valid", r.ok === true);
}
// 2. valid: implementer -> IMPLEMENTED
{
  const f = finding({ state: "IMPLEMENTED", evidence_level: "E2", history: hist(["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"]) });
  check("implementer->IMPLEMENTED valid", validateState(root([f])).ok);
}
// 3. reject: implementer asserts PRODUCTION_VERIFIED
{
  const f = finding({ state: "PRODUCTION_VERIFIED", evidence_level: "E4-C", evidence_locations: ["x"], history: hist(["OPEN", "E0", "implementer"], ["PRODUCTION_VERIFIED", "E4-C", "implementer"]) });
  const r = validateState(root([f]));
  check("implementer->PRODUCTION_VERIFIED rejected", !r.ok && errsInclude(r, "owner-controlled"));
}
// 4. reject: implementer asserts CLOSED
{
  const f = finding({ state: "CLOSED", evidence_level: "E4-B", evidence_locations: ["x"], history: hist(["OPEN", "E0", "implementer"], ["CLOSED", "E4-B", "implementer"]) });
  check("implementer->CLOSED rejected", !validateState(root([f])).ok);
}
// 5. reject: implementer asserts REVIEWED
{
  const f = finding({ state: "REVIEWED", evidence_level: "E2", history: hist(["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["REVIEWED", "E2", "implementer"]) });
  const r = validateState(root([f]));
  check("implementer->REVIEWED rejected", !r.ok && errsInclude(r, "REVIEWED requires actor_role reviewer|owner"));
}
// 6. valid: reviewer -> REVIEWED
{
  const f = finding({ state: "REVIEWED", evidence_level: "E2", history: hist(["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["REVIEWED", "E2", "reviewer"]) });
  check("reviewer->REVIEWED valid", validateState(root([f])).ok);
}
// 7. reject: owner PRODUCTION_VERIFIED but only E2 evidence
{
  const f = finding({ state: "PRODUCTION_VERIFIED", evidence_level: "E2", evidence_locations: ["x"], history: hist(["OPEN", "E0", "implementer"], ["PRODUCTION_VERIFIED", "E2", "owner"]) });
  const r = validateState(root([f]));
  check("owner PRODUCTION_VERIFIED w/o E4 rejected", !r.ok && errsInclude(r, "production evidence"));
}
// 8. valid: owner CLOSED with E4-C + evidence
{
  const f = finding({ state: "CLOSED", evidence_level: "E4-C", evidence_locations: ["pg_policies.txt"], history: hist(["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["REVIEWED", "E2", "reviewer"], ["PREVIEW_VERIFIED", "E3", "reviewer", { }], ["PRODUCTION_VERIFIED", "E4-C", "owner"], ["CLOSED", "E4-C", "owner"]) });
  const r = validateState(root([{ ...f, evidence_locations: ["pg_policies.txt"] }]));
  check("owner CLOSED with E4-C valid", r.ok);
}
// 9. reject: non-monotonic without reopen
{
  const f = finding({ state: "OPEN", evidence_level: "E0", history: hist(["IMPLEMENTED", "E2", "implementer"], ["OPEN", "E0", "implementer"]) });
  const r = validateState(root([f]));
  check("non-monotonic rejected", !r.ok && errsInclude(r, "non-monotonic"));
}
// 10. valid: reopen with note
{
  const f = finding({ state: "OPEN", evidence_level: "E0", history: hist(["IMPLEMENTED", "E2", "implementer"], ["OPEN", "E0", "owner", { reopen: true, note: "regression" }]) });
  check("reopen with note valid", validateState(root([f])).ok);
}
// 11. reject: reopen without note
{
  const f = finding({ state: "OPEN", evidence_level: "E0", history: hist(["IMPLEMENTED", "E2", "implementer"], ["OPEN", "E0", "owner", { reopen: true }]) });
  check("reopen w/o note rejected", !validateState(root([f])).ok);
}
// 12. reject: duplicate id
{
  const r = validateState(root([finding(), finding()]));
  check("duplicate id rejected", !r.ok && errsInclude(r, "duplicate"));
}
// 13. reject: invalid enum
{
  check("invalid state rejected", !validateState(root([finding({ state: "DONE" })])).ok);
  check("invalid evidence rejected", !validateState(root([finding({ evidence_level: "E9" })])).ok);
  check("invalid role rejected", !validateState(root([finding({ actor_role: "robot" })])).ok);
  check("invalid severity rejected", !validateState(root([finding({ severity: "Huge" })])).ok);
}
// 14. reject: malformed root / missing findings
{
  check("null root rejected", !validateState(null).ok);
  check("array root rejected", !validateState([]).ok);
  check("missing findings rejected", !validateState({}).ok);
}
// 15. reject: final state mismatch with last history
{
  const f = finding({ state: "IMPLEMENTED", evidence_level: "E2", history: hist(["OPEN", "E0", "implementer"]) });
  check("final-state mismatch rejected", !validateState(root([f])).ok);
}
// 16. reject: PREVIEW_VERIFIED with E2
{
  const f = finding({ state: "PREVIEW_VERIFIED", evidence_level: "E2", evidence_locations: ["x"], history: hist(["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["REVIEWED", "E2", "reviewer"], ["PREVIEW_VERIFIED", "E2", "reviewer"]) });
  const r = validateState(root([f]));
  check("PREVIEW_VERIFIED w/ E2 rejected", !r.ok && errsInclude(r, "E3"));
}
// 17. reject: advanced state with empty evidence_locations
{
  const f = finding({ state: "PREVIEW_VERIFIED", evidence_level: "E3", evidence_locations: [], history: hist(["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["REVIEWED", "E2", "reviewer"], ["PREVIEW_VERIFIED", "E3", "reviewer"]) });
  const r = validateState(root([f]));
  check("empty evidence at advanced state rejected", !r.ok && errsInclude(r, "non-empty evidence_locations"));
}

// 18. reject: skipped transition OPEN -> PRODUCTION_VERIFIED even with owner+E4 (R10)
{
  const f = finding({ state: "PRODUCTION_VERIFIED", evidence_level: "E4-C", evidence_locations: ["pg_policies.txt"], history: hist(["OPEN", "E0", "implementer"], ["PRODUCTION_VERIFIED", "E4-C", "owner"]) });
  const r = validateState(root([f]));
  check("skip OPEN->PRODUCTION_VERIFIED rejected", !r.ok && errsInclude(r, "illegal transition"));
}
// 19. reject: skipped IMPLEMENTED -> PRODUCTION_VERIFIED (R10)
{
  const f = finding({ state: "PRODUCTION_VERIFIED", evidence_level: "E4-C", evidence_locations: ["x"], history: hist(["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["PRODUCTION_VERIFIED", "E4-C", "owner"]) });
  const r = validateState(root([f]));
  check("skip IMPLEMENTED->PRODUCTION_VERIFIED rejected", !r.ok && errsInclude(r, "illegal transition"));
}
// 20. valid: full adjacent chain to CLOSED (R10)
{
  const f = finding({ state: "CLOSED", evidence_level: "E4-C", evidence_locations: ["pg_policies.txt"], history: hist(
    ["OPEN", "E0", "implementer"], ["ARCHITECTURE_APPROVED", "E0", "owner"], ["IMPLEMENTED", "E2", "implementer"],
    ["REVIEWED", "E2", "reviewer"], ["PREVIEW_VERIFIED", "E3", "reviewer"], ["PRODUCTION_VERIFIED", "E4-C", "owner"], ["CLOSED", "E4-C", "owner"]) });
  check("full adjacent chain valid", validateState(root([f])).ok);
}
// 21. valid: config-only REVIEWED -> PRODUCTION_VERIFIED (E3 preview omitted per spec §7) (R10)
{
  const f = finding({ state: "PRODUCTION_VERIFIED", evidence_level: "E4-C", evidence_locations: ["proacl.txt"], history: hist(
    ["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["REVIEWED", "E2", "reviewer"], ["PRODUCTION_VERIFIED", "E4-C", "owner"]) });
  check("config-only REVIEWED->PRODUCTION_VERIFIED valid", validateState(root([f])).ok);
}
// 22. reject: implementer asserts ARCHITECTURE_APPROVED / HUMAN GATE 1 (R11)
{
  const f = finding({ state: "ARCHITECTURE_APPROVED", evidence_level: "E0", history: hist(["OPEN", "E0", "implementer"], ["ARCHITECTURE_APPROVED", "E0", "implementer"]) });
  const r = validateState(root([f]));
  check("implementer->ARCHITECTURE_APPROVED rejected", !r.ok && errsInclude(r, "HUMAN GATE 1"));
}
// 23. valid: owner sets ARCHITECTURE_APPROVED (R11)
{
  const f = finding({ state: "ARCHITECTURE_APPROVED", evidence_level: "E0", history: hist(["OPEN", "E0", "implementer"], ["ARCHITECTURE_APPROVED", "E0", "owner"]) });
  check("owner->ARCHITECTURE_APPROVED valid", validateState(root([f])).ok);
}
// 24. reject: duplicate PF-013 collision (R08 collision semantics validator-tested)
{
  const a = finding({ id: "PF-013", title: "Reports/AI syntheses not reproducible" });
  const b = finding({ id: "PF-013", title: "self-deletion governance" });
  const r = validateState(root([a, b]));
  check("duplicate PF-013 collision rejected", !r.ok && errsInclude(r, "duplicate"));
}
// 25. real STATE.json: canonical PF-013 and PF-033 distinct, evidence disjoint (R08)
{
  const real = JSON.parse(readFileSync(new URL("./STATE.json", import.meta.url), "utf8"));
  const pf013 = real.findings.filter((f) => f.id === "PF-013");
  const pf033 = real.findings.find((f) => f.id === "PF-033");
  const selfDelMig = "supabase/migrations/20260723160000_govern_self_deletion_rpc.sql";
  const ok = pf013.length === 1
    && /reproducib/i.test(pf013[0].title)
    && !pf013[0].evidence_locations.includes(selfDelMig)
    && !!pf033 && pf033.evidence_locations.includes(selfDelMig)
    && Array.isArray(pf033.historical_labels) && pf033.historical_labels.join(" ").includes("PF-013");
  check("PF-013 vs PF-033 machine-distinct, evidence disjoint", ok);
}
// 26. reject: malformed historical_labels (R08)
{
  const f = finding({ historical_labels: "PF-013" });
  check("non-array historical_labels rejected", !validateState(root([f])).ok);
}
// 27. valid: governed reopen bypasses adjacency (regression with note) (R10)
{
  const f = finding({ state: "IMPLEMENTED", evidence_level: "E2", history: hist(
    ["OPEN", "E0", "implementer"], ["IMPLEMENTED", "E2", "implementer"], ["REVIEWED", "E2", "reviewer"],
    ["IMPLEMENTED", "E2", "owner", { reopen: true, note: "reviewer found defect; reopened for rework" }]) });
  check("governed reopen (REVIEWED->IMPLEMENTED) valid", validateState(root([f])).ok);
}

// 28. real STATE.json: PF-033 is machine-marked supplemental; canonical findings are not (O2-S1R-R06)
{
  const real = JSON.parse(readFileSync(new URL("./STATE.json", import.meta.url), "utf8"));
  const pf033 = real.findings.find((f) => f.id === "PF-033");
  const pf013 = real.findings.find((f) => f.id === "PF-013");
  const ok = !!pf033 && pf033.supplemental === true && pf013.supplemental !== true;
  check("PF-033 supplemental:true, PF-013 not supplemental", ok);
}
// 29. reject: non-boolean supplemental (O2-S1R-R06)
{
  const f = finding({ supplemental: "yes" });
  check("non-boolean supplemental rejected", !validateState(root([f])).ok);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
