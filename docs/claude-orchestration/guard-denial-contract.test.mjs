#!/usr/bin/env node
// Structural regression test for the Guard-Denial Response Contract.
// Dependency-free: Node built-ins only; no test runner required.
//
// Verifies the operative contract (CLAUDE.md 3.1) and its controlling
// authority (architecture 20.7) are present and not silently removed
// or weakened. This is a PRESENCE / STRUCTURE check only: it does NOT
// prove agent behavior (that requires live E3 evidence).
//
// Run: node docs/claude-orchestration/guard-denial-contract.test.mjs
// Exit 0 = all checks pass; exit 1 = one or more checks failed.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");

const archName = "01-approved-orchestration-architecture.md";
const claudePath = join(repoRoot, "CLAUDE.md");
const archPath = join(here, archName);

const claude = readFileSync(claudePath, "utf8");
const arch = readFileSync(archPath, "utf8");

// Whitespace-normalized, lowercased views for tolerant prose checks.
// This avoids depending on exact line numbers or full paragraphs.
const nClaude = claude.replace(/\s+/g, " ").toLowerCase();
const nArch = arch.replace(/\s+/g, " ").toLowerCase();

let total = 0;
const failures = [];

function check(cond, msg) {
  total++;
  if (!cond) failures.push(msg);
}

// Tolerant prose check: whitespace- and case-insensitive substring.
function hasText(norm, phrase, msg) {
  const needle = phrase.replace(/\s+/g, " ").toLowerCase();
  check(norm.includes(needle), msg);
}

// Packet-field check: label (spaces flexible) followed by a colon.
function hasField(text, label, msg) {
  const re = new RegExp(label.replace(/ /g, "\\s+") + "\\s*:");
  check(re.test(text), msg);
}

// ---- A. CLAUDE.md operative contract (3.1) -------------------------
hasText(nClaude, "Guard-Denial Response Contract",
  "CLAUDE.md: missing contract heading");
hasText(nClaude, "ends the current autonomous turn",
  "CLAUDE.md: missing immediate-turn-termination rule");
hasText(nClaude, "Case A",
  "CLAUDE.md: missing Case A");
hasText(nClaude, "Case B",
  "CLAUDE.md: missing Case B");
hasText(nClaude, "Case C",
  "CLAUDE.md: missing Case C");
hasText(nClaude, "retry",
  "CLAUDE.md: missing retry prohibition");
hasText(nClaude, "reword",
  "CLAUDE.md: missing rewording prohibition");
hasText(nClaude, "re-wrap",
  "CLAUDE.md: missing re-wrapping prohibition");
hasText(nClaude, "equivalent outcome",
  "CLAUDE.md: missing equivalent-outcome prohibition");
hasText(nClaude, "another tool or interpreter",
  "CLAUDE.md: missing alternate tool/interpreter rule");
hasText(nClaude, "route around the guard",
  "CLAUDE.md: missing route-around-the-guard prohibition");
hasText(nClaude, "owner-authorized continuation",
  "CLAUDE.md: missing owner-authorized continuation rule");
hasText(nClaude, "GUARD-DENIAL DECISION",
  "CLAUDE.md: missing GUARD-DENIAL DECISION packet");

const fields = ["CASE", "RULE", "REASON", "ATTEMPTED", "GATE",
  "OWNER DECISION REQUIRED", "NEXT SAFE ACTION", "RETRY"];
for (const f of fields) {
  hasField(claude, f, `CLAUDE.md: missing packet field '${f}'`);
}

// Packet sanitization / raw-command prohibition.
hasText(nClaude, "never include raw commands",
  "CLAUDE.md: missing raw-command prohibition");
hasText(nClaude, "secrets",
  "CLAUDE.md: missing 'secrets' in sanitization rule");
hasText(nClaude, "credentials",
  "CLAUDE.md: missing 'credentials' in sanitization rule");
hasText(nClaude, "tokens",
  "CLAUDE.md: missing 'tokens' in sanitization rule");
hasText(nClaude, "sensitive",
  "CLAUDE.md: missing 'sensitive paths' in sanitization rule");

// ---- B. Architecture controlling authority (20.7) ------------------
hasText(nArch, "PreToolUse guard denial",
  "arch: missing PreToolUse guard-denial rule");
hasText(nArch, "stops immediately",
  "arch: missing immediate-stop semantics");
hasText(nArch, "GUARD-DENIAL DECISION packet",
  "arch: missing sanitized decision-packet reference");
hasText(nArch, "retry",
  "arch: missing retry prohibition");
hasText(nArch, "rewording",
  "arch: missing rewording prohibition");
hasText(nArch, "re-wrapping",
  "arch: missing re-wrapping prohibition");
hasText(nArch, "equivalent-outcome rerouting",
  "arch: missing equivalent-outcome rerouting rule");
hasText(nArch, "prohibited",
  "arch: missing explicit prohibition wording");
hasText(nArch, "claude.md",
  "arch: missing reference to CLAUDE.md");
hasText(nArch, "3.1",
  "arch: missing reference to CLAUDE.md 3.1");

// ---- C. Result -----------------------------------------------------
if (failures.length) {
  console.error("guard-denial-contract: FAIL");
  for (const m of failures) console.error("  - " + m);
  console.error(
    `\n${failures.length} of ${total} checks failed.`);
  process.exit(1);
}

console.log(`guard-denial-contract: PASS (${total} checks).`);
