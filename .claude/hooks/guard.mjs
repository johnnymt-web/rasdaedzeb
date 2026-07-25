// =========================================================================
// Orchestration safety guard — CANDIDATE (Phase O2 Segment 1 / 1R). NOT ARMED.
// =========================================================================
// Controlling spec: docs/claude-orchestration/01-approved-orchestration-architecture.md
// (§10 all-push prohibition, §12 multi-surface guard, §13 config tamper protection).
//
// DETERMINISTIC decision function for a Claude Code PreToolUse hook. It makes NO
// LLM judgment. Default is ALLOW; only explicit deny rules block, so ordinary
// local development is unaffected.
//
// BOOTSTRAP STATE: candidate awaiting independent re-review + HUMAN GATE
// activation. NOT registered in .claude/settings.json by this segment, so it does
// not yet intercept anything. Do not treat it as an active boundary.
//
// SAFETY PHILOSOPHY (spec §13 ranking): capability/credential absence > OS
// isolation > permissions > hooks > project instructions > human gates. This hook
// is layer 4 (policy inside tool execution) — NOT a sandbox. It cannot parse
// arbitrary obfuscated programs; where deterministic classification is not
// reliable for a HIGH-risk generic-execution form, it DENIES conservatively
// (inline interpreter eval, encoded PowerShell, dynamic Invoke-Expression) rather
// than pretend to interpret. Normal script/test/build execution stays allowed.
//
// Segment 1R hardening (independent review O2-S1-R01..R06/R12):
//   - git push AND send-pack (remote-write primitives)
//   - interpreter indirection: node -e/--eval/-p, python[3] -c, ruby/perl -e, deno eval
//   - package-runner indirection: npx / npm exec / pnpm dlx|exec / yarn dlx|exec / bunx / bun x
//   - PowerShell: Start-Process/saps, -EncodedCommand (deny), dynamic iex (deny),
//     Move-Item/Copy-Item/Rename-Item/New-Item (+aliases) onto protected/secret paths
//   - secret-path precision: no blanket keys/ dir; allow .env.example/.sample/.template
//   - MCP defense-in-depth: default-deny SQL/mutation-class MCP tool names
//   - protected control plane now includes candidate safety config
// =========================================================================

const deny = (rule, reason) => ({ decision: "deny", rule, reason });
const allow = (rule = "none") => ({ decision: "allow", rule, reason: "" });

// ---- path helpers --------------------------------------------------------
const norm = (p) => String(p == null ? "" : p).replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();

const PROTECTED_FILES = [
  ".claude/settings.json",
  ".claude/settings.local.json",
  ".claude/settings.candidate.json",       // O2-S1-R12: candidate safety config
  ".claude/settings.local.candidate.json", // O2-S1-R12: reserved candidate-local artifact
  ".mcp.json",
  "docs/professional-audit/state.json",
  "docs/professional-audit/state-validator.mjs",
];

export function isProtectedPath(p) {
  const n = norm(p);
  if (!n) return false;
  if (n.includes(".claude/hooks/")) return true; // guard + any hook file
  return PROTECTED_FILES.some((s) => n === s || n.endsWith("/" + s));
}

// Secret-path detection (O2-S1-R04): precise, not directory-name-blanket.
export function isSecretPath(p) {
  const n = norm(p);
  if (!n) return false;
  const baseName = n.split("/").pop();

  // .env family — secret EXCEPT recognized non-secret templates.
  if (/^\.env(\.[a-z0-9_.-]+)?$/.test(baseName)) {
    if (/^\.env\.(example|sample|template|dist|defaults|schema)$/.test(baseName)) return false;
    return true;
  }
  // key / certificate / keystore material by extension.
  if (/\.(pem|key|p12|pfx|jks|keystore|asc|ppk)$/.test(baseName)) return true;
  // well-known private-key / credential filenames.
  if (["id_rsa", "id_dsa", "id_ecdsa", "id_ed25519", ".netrc", ".pgpass", ".htpasswd"].includes(baseName)) return true;
  // explicit secret directories (NOT a blanket "keys/" — that hits i18n/keyboard/object keys).
  if (/(^|\/)(secrets|\.secrets|\.ssh|\.gnupg)\//.test("/" + n)) return true;
  return false;
}

// ---- quote-aware tokenizer & segment splitter ----------------------------
export function tokenize(s) {
  const tokens = [];
  let cur = "", inTok = false, q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q) q = null;
      else cur += c;
      inTok = true;
    } else if (c === '"' || c === "'" || c === "`") {
      q = c; inTok = true;
    } else if (/\s/.test(c)) {
      if (inTok) { tokens.push(cur); cur = ""; inTok = false; }
    } else {
      cur += c; inTok = true;
    }
  }
  if (inTok) tokens.push(cur);
  return tokens;
}

function splitSegments(s) {
  const segs = [];
  let cur = "", q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i], n = s[i + 1];
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; cur += c; continue; }
    if (c === ";" || c === "\n") { segs.push(cur); cur = ""; continue; }
    if ((c === "&" && n === "&") || (c === "|" && n === "|")) { segs.push(cur); cur = ""; i++; continue; }
    if (c === "|" || c === "&") { segs.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur) segs.push(cur);
  return segs.map((x) => x.trim()).filter(Boolean);
}

const base = (tok) => String(tok).toLowerCase().replace(/\.exe$/, "").split(/[\\/]/).pop();

const PS_ENCODED = /^-e(c|nc|n|ncod(?:ed)?(?:command)?)?$/i; // -e -ec -en -enc -encoded -encodedcommand
const PKG_RUNNER_VALUE_FLAGS = new Set(["-p", "--package", "--userconfig", "--cache", "--node-arg", "--node-options"]);

// npx flag stripping: return {inner, callString}. callString set for `npx -c "<cmd>"`.
function stripNpxFlags(rest) {
  let i = 0, callString = null;
  while (i < rest.length) {
    const t = rest[i], tl = String(t).toLowerCase();
    if (tl === "--") { i++; break; }
    if (tl === "-c" || tl === "--call") { callString = rest[i + 1]; i += 2; continue; }
    if (PKG_RUNNER_VALUE_FLAGS.has(tl)) { i += 2; continue; }
    if (tl.startsWith("-")) { i++; continue; }
    break;
  }
  return { inner: rest.slice(i), callString };
}

// Expand a raw command string into effective command token-arrays, unwrapping
// benign prefixes, shell wrappers (cmd /c, powershell -Command, iex) and package
// runners (npx / npm exec / pnpm dlx|exec / yarn dlx|exec / bunx / bun x).
export function extractCommands(raw) {
  const out = [];
  const walk = (str, depth) => {
    if (depth > 8) { out.push(["__too_deep__"]); return; }
    for (const seg of splitSegments(str)) {
      let toks = tokenize(seg);
      // strip benign leading prefixes
      let changed = true;
      while (changed && toks.length) {
        changed = false;
        const t0 = base(toks[0]);
        if (["sudo", "command", "exec", "&", ".", "time", "nice"].includes(t0)) { toks = toks.slice(1); changed = true; continue; }
        if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(toks[0])) { toks = toks.slice(1); changed = true; continue; } // VAR=val prefix
      }
      if (!toks.length) continue;
      const c0 = base(toks[0]);

      // shell wrappers
      if (c0 === "cmd" && toks[1] && /^\/(c|k)$/i.test(toks[1])) { walk(toks.slice(2).join(" "), depth + 1); continue; }
      // POSIX shell command-string wrappers (O2-S1R-R01): sh/bash/dash/zsh/ksh with -c|-lc|-ic
      if (["sh", "bash", "dash", "zsh", "ksh"].includes(c0)) {
        const ci = toks.findIndex((t) => /^-[a-z]*c$/i.test(t));
        if (ci >= 0 && toks[ci + 1] != null) { walk(toks.slice(ci + 1).join(" "), depth + 1); continue; }
        out.push(toks); continue; // `bash script.sh` — script content not visible (script indirection; documented residual)
      }
      // env wrapper (O2-S1R-R04): env [-i] [-u NAME] [-C DIR] [VAR=val ...] cmd ; env -S "cmd"
      if (c0 === "env") {
        let i = 1, done = false;
        while (i < toks.length) {
          const tl = String(toks[i]).toLowerCase();
          if (tl === "-i" || tl === "-0" || tl === "--ignore-environment" || tl === "--null") { i++; continue; }
          if (tl === "-u" || tl === "--unset" || tl === "-c" || tl === "--chdir") { i += 2; continue; }
          if (tl === "-s" || tl === "--split-string") { walk(String(toks[i + 1] || ""), depth + 1); done = true; break; }
          if (/^-s./.test(tl)) { walk(String(toks[i]).slice(2), depth + 1); done = true; break; } // -S"cmd" attached
          if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(toks[i])) { i++; continue; }
          break;
        }
        if (done) continue;
        if (i < toks.length) { walk(toks.slice(i).join(" "), depth + 1); continue; }
        out.push(toks); continue;
      }
      // xargs wrapper (O2-S1R-R04): unwrap the command it will invoke
      if (c0 === "xargs") {
        const valFlag = new Set(["-n", "--max-args", "-p", "--max-procs", "-d", "--delimiter", "-s", "--max-chars", "-a", "--arg-file", "-e", "--eof", "-l", "--max-lines", "-i", "--replace"]);
        let i = 1;
        while (i < toks.length) {
          const tl = String(toks[i]).toLowerCase();
          if (tl === "{}") { i++; continue; }
          if (tl.startsWith("-")) { i += valFlag.has(tl) ? 2 : 1; continue; }
          break;
        }
        if (i < toks.length) { walk(toks.slice(i).join(" "), depth + 1); continue; }
        out.push(toks); continue;
      }
      if (c0 === "powershell" || c0 === "pwsh") {
        if (toks.slice(1).some((t) => PS_ENCODED.test(t))) { out.push(["__powershell_encoded__"]); continue; }
        const idx = toks.findIndex((t) => /^-(c|command)$/i.test(t)); // inline code only; -File is a path, not inline
        if (idx >= 0 && toks[idx + 1]) { walk(toks.slice(idx + 1).join(" "), depth + 1); continue; }
        out.push(toks); continue;
      }
      if (c0 === "iex" || c0 === "invoke-expression") {
        const arg = toks[1];
        if (!arg) { out.push(toks); continue; }
        if (/^[$(@&{]/.test(arg)) { out.push(["__dynamic_exec__"]); continue; } // variable/subexpression → cannot classify → deny
        walk(toks.slice(1).join(" "), depth + 1); continue;
      }

      // package-runner indirection → unwrap to the inner command
      if (c0 === "npx" || c0 === "bunx") {
        const { inner, callString } = stripNpxFlags(toks.slice(1));
        if (callString) { walk(String(callString), depth + 1); continue; }
        if (inner.length) { walk(inner.join(" "), depth + 1); continue; }
        out.push(toks); continue;
      }
      if ((c0 === "pnpm" || c0 === "yarn") && /^(dlx|exec)$/i.test(String(toks[1] || ""))) { walk(toks.slice(2).join(" "), depth + 1); continue; }
      if (c0 === "npm" && /^exec$/i.test(String(toks[1] || ""))) { let r = toks.slice(2); if (String(r[0]) === "--") r = r.slice(1); walk(r.join(" "), depth + 1); continue; }
      if (c0 === "bun" && /^x$/i.test(String(toks[1] || ""))) { walk(toks.slice(2).join(" "), depth + 1); continue; }

      out.push(toks);
    }
  };
  walk(String(raw || ""), 0);
  return out;
}

// ---- git subcommand parser (skips global options like -C <path>) ---------
function gitSubcommand(toks) {
  let i = 1;
  while (i < toks.length) {
    const t = toks[i];
    if (t === "-C" || t === "-c" || t === "--namespace") { i += 2; continue; }
    if (/^--(git-dir|work-tree|namespace|exec-path)=/.test(t)) { i++; continue; }
    if (["-P", "--no-pager", "--paginate", "--bare", "--exec-path", "--literal-pathspecs"].includes(t)) { i++; continue; }
    if (t.startsWith("-")) { i++; continue; }
    return { sub: t.toLowerCase(), rest: toks.slice(i + 1) };
  }
  return { sub: null, rest: [] };
}

// ---- shared command sets -------------------------------------------------
const READER_CMDS = ["cat", "type", "less", "more", "head", "tail", "get-content", "gc", "select-string", "sls", "import-csv"];
// writers/movers/removers incl. PowerShell *-Item cmdlets + aliases (O2-S1-R06)
const WRITER_CMDS = [
  "sed", "tee",
  "set-content", "sc", "add-content", "ac", "clear-content", "clc", "out-file",
  "cp", "copy", "copy-item", "cpi",
  "mv", "move", "move-item", "mi",
  "rename-item", "rni", "ren",
  "rm", "remove-item", "ri", "del", "erase", "rd", "rmdir",
  "new-item", "ni",
];
const NETWORK_CMDS = ["curl", "wget", "invoke-restmethod", "irm", "invoke-webrequest", "iwr"];
const MCP_MUTATION = /(apply_migration|execute_ddl|execute_sql|execute|run_sql|create_|delete_|update_|insert|upsert|drop_|deploy|reset_|restore_|set_secret|create_branch|merge|write|alter_|truncate|grant_|revoke_)/i;

// ---- per-command classifier ---------------------------------------------
export function classifyCommand(toks) {
  if (!toks || !toks.length) return null;

  // conservative sentinels from extractCommands
  if (toks[0] === "__powershell_encoded__") return deny("encoded-powershell", "Encoded PowerShell (-EncodedCommand/-enc) is prohibited in autonomous context — cannot be safely classified (spec §12/§13).");
  if (toks[0] === "__dynamic_exec__") return deny("dynamic-exec", "Dynamic Invoke-Expression over a variable/subexpression is prohibited in autonomous context (opaque execution).");
  if (toks[0] === "__too_deep__") return deny("nesting-too-deep", "Command wrapping nested too deeply to classify — failing closed.");

  const cmd = base(toks[0]);
  const low = toks.map((t) => String(t).toLowerCase());

  // PowerShell process launcher → classify the launched program (O2-S1-R01/R06)
  if (cmd === "start-process" || cmd === "saps") {
    let program = null, args = [];
    const t = toks.slice(1);
    for (let i = 0; i < t.length; i++) {
      const tl = String(t[i]).toLowerCase();
      if (/^-(fp|filepath|path|file)$/.test(tl)) { program = t[i + 1]; i++; continue; }
      if (/^-arg/.test(tl)) { args = args.concat(String(t[i + 1] || "").split(",")); i++; continue; }
      if (tl.startsWith("-")) { continue; } // -Wait -NoNewWindow -Verb runas ...
      if (program === null) { program = t[i]; continue; }
    }
    if (program) { const d = classifyCommand([program, ...args.map((a) => a.trim()).filter(Boolean)]); if (d) return d; }
    return null;
  }

  if (cmd === "git") {
    // inline alias mutation (O2-S1R-R03): git -c alias.X=<push|send-pack ...> X
    for (const t of toks) {
      const m = /^alias\.[^=]+=(.+)$/i.exec(String(t));
      if (m) {
        const body = m[1].replace(/^['"!\s]+/, "").replace(/^git\s+/i, "").trim().toLowerCase();
        const fw = body.split(/\s+/)[0];
        if (fw === "push" || fw === "send-pack") return deny("git-push", "git -c alias defining push/send-pack is prohibited (autonomous remote mutation; spec §10).");
      }
    }
    const { sub, rest } = gitSubcommand(toks);
    if (sub === "push" || sub === "send-pack") return deny("git-push", "Autonomous git remote mutation (push / send-pack) is prohibited on every branch (HUMAN-ONLY; spec §10).");
    if (sub === "add" && rest.some((a) => a === "." || a === "-A" || a === "--all")) return deny("git-add-all", "git add . / -A / --all is prohibited; stage explicit paths (spec §10/§11).");
    if (sub === "reset" && rest.some((a) => a === "--hard")) return deny("git-reset-hard", "git reset --hard is prohibited (destructive).");
    if (sub === "clean" && rest.some((a) => /^-[a-z]*f/i.test(a) || a === "--force")) return deny("git-clean-force", "git clean -f is prohibited (destructive).");
    return null;
  }

  // inline interpreter eval — conservative deny of the generic-mutation form (O2-S1-R01/R02)
  if (cmd === "node" || cmd === "nodejs") {
    if (low.slice(1).some((t) => /^(-e|--eval|-p|--print)$/.test(t))) return deny("inline-eval", "Inline node -e/--eval/-p execution is prohibited in autonomous context (arbitrary-mutation bypass; spec §12/§17). Run a script file (node <file>) instead.");
    return null;
  }
  if (cmd === "python" || cmd === "python3" || cmd === "py") {
    if (low.slice(1).includes("-c")) return deny("inline-eval", "Inline python -c execution is prohibited in autonomous context (spec §12/§17).");
    return null;
  }
  if ((cmd === "ruby" || cmd === "perl") && low.slice(1).includes("-e")) return deny("inline-eval", "Inline interpreter -e execution is prohibited in autonomous context.");
  if (cmd === "deno" && low[1] === "eval") return deny("inline-eval", "deno eval is prohibited in autonomous context.");

  if (cmd === "supabase") {
    const j = low.slice(1);
    if ((j[0] === "db" && (j[1] === "push" || j[1] === "reset")) || (j[0] === "migration" && j[1] === "up") || (j[0] === "functions" && j[1] === "deploy") || (j[0] === "secrets" && j[1] === "set"))
      return deny("supabase-mutation", "Supabase production mutation (db push / migration up / functions deploy / secrets set) is HUMAN-ONLY.");
    return null;
  }
  if (cmd === "vercel" || cmd === "vc") {
    if (low.slice(1).some((t) => t === "deploy" || t === "--prod" || t === "deploy:*")) return deny("vercel-deploy", "Vercel deploy is HUMAN-ONLY.");
    if (low.length === 1) return deny("vercel-deploy", "Bare `vercel` deploys the project by default — HUMAN-ONLY.");
    return null;
  }
  if (cmd === "psql") return deny("psql", "Direct psql / production SQL execution is prohibited.");
  if (cmd === "gh") {
    const j = low.slice(1);
    if ((j[0] === "pr" && j[1] === "merge") || (j[0] === "workflow" && j[1] === "run") || (j[0] === "release" && (j[1] === "create" || j[1] === "delete")))
      return deny("gh-mutation", "gh pr merge / workflow run / release mutation is HUMAN-ONLY.");
    if (j[0] === "api") {
      const mut = j.some((t) => /^(post|put|patch|delete)$/.test(t)) || j.includes("-x") || j.includes("--method") || j.some((t) => t.includes("/merges") || t.includes("/dispatches") || /--method=(post|put|patch|delete)/.test(t));
      if (mut) return deny("gh-api-mutation", "gh api mutation request is HUMAN-ONLY.");
    }
    return null;
  }
  if (NETWORK_CMDS.includes(cmd)) {
    const isMethod = (i) => /^(post|put|patch|delete)$/.test(low[i] || "");
    const mutMethod =
      low.some((t, i) => /^(-x|--request|-method|--method)$/i.test(t) && isMethod(i + 1)) ||
      low.some((t) => /^(-x|--request|--method|-method)=(post|put|patch|delete)$/i.test(t));
    const hasBody = low.some((t) => ["-d", "--data", "--data-raw", "--data-binary", "--data-urlencode", "-f", "--form", "-t", "--upload-file", "--post-data", "--post-file", "--body-data", "-body", "--body", "-infile", "--infile"].includes(t));
    const infraHost = toks.some((t) => /(api\.github\.com|supabase\.co|supabase\.com|vercel\.com|vercel\.app)/i.test(t));
    if (mutMethod || (hasBody && infraHost)) return deny("network-mutation", "Network mutation (write method / body to infra endpoint) is prohibited. Read-only GET is allowed.");
    return null;
  }

  // secret access via reader/mover/writer commands with a secret path arg
  if (toks.some((t) => isSecretPath(t))) {
    if (READER_CMDS.includes(cmd) || WRITER_CMDS.includes(cmd) || (cmd === "sed" && low.includes("-i")))
      return deny("secret-access", "Reading/copying/moving/writing secret files (.env* / keys) is prohibited (spec §12).");
  }
  // move/copy/rename/write onto a protected control-plane path (O2-S1-R06)
  if (WRITER_CMDS.includes(cmd) && toks.some((t) => isProtectedPath(t)))
    return deny("protected-config-write", "Autonomous move/copy/rename/write onto protected orchestration config is HUMAN-ONLY (spec §13).");

  return null;
}

// ---- raw-level checks (redirection, AI enablement) -----------------------
function redirectionTargets(raw) {
  const out = [];
  const re = />>?\s*("([^"]+)"|'([^']+)'|([^\s|;&()]+))/g;
  let m;
  while ((m = re.exec(raw))) out.push(m[2] || m[3] || m[4]);
  return out;
}
function hasWriteToPath(raw, match) {
  if (redirectionTargets(raw).some(match)) return true;
  const toks = tokenize(raw);
  const hasWriter = toks.some((t) => WRITER_CMDS.includes(base(t)));
  if (hasWriter && toks.some(match)) return true;
  return false;
}

// ---- top-level decision function -----------------------------------------
export function evaluateToolCall(call) {
  const tool_name = (call && call.tool_name) || "";
  const tool_input = (call && call.tool_input) || {};

  if (/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(tool_name)) {
    const p = tool_input.file_path || tool_input.notebook_path || "";
    if (isProtectedPath(p)) return deny("protected-config-write", "Editing protected orchestration config is HUMAN-ONLY (spec §13): " + p);
    if (isSecretPath(p)) return deny("secret-write", "Writing secret files is prohibited: " + p);
    return allow();
  }
  if (tool_name === "Read") {
    if (isSecretPath(tool_input.file_path || "")) return deny("secret-read", "Reading secret files (.env* / keys) is prohibited: " + (tool_input.file_path || ""));
    return allow();
  }
  if (/^mcp__/i.test(tool_name)) {
    // Defense-in-depth (O2-S1-R05): default-deny SQL/mutation-class MCP tool names.
    // The guard cannot authenticate MCP server read-only capability; a name that
    // could carry a write is denied even though .mcp.json currently pins read_only=true.
    if (MCP_MUTATION.test(tool_name)) return deny("mcp-mutation", "Mutation-class MCP tool blocked (guard cannot prove read-only capability): " + tool_name);
    return allow();
  }
  if (tool_name === "Bash" || tool_name === "PowerShell" || /powershell/i.test(tool_name)) {
    const raw = String(tool_input.command || "");
    if (/\bAI_FEATURES_ENABLED\b/i.test(raw) && /(=\s*("?)(true|1|on)\b|:\s*true|\bsetx\b|\$env:AI_FEATURES_ENABLED|set-item[^\n]*AI_FEATURES_ENABLED|secrets\s+set[^\n]*AI_FEATURES_ENABLED)/i.test(raw))
      return deny("ai-enable", "Enabling AI_FEATURES_ENABLED is HUMAN-ONLY; AI stays disabled (spec §16).");
    if (hasWriteToPath(raw, isProtectedPath)) return deny("protected-config-write", "Autonomous modification of protected orchestration config is HUMAN-ONLY (spec §13).");
    if (hasWriteToPath(raw, isSecretPath)) return deny("secret-write", "Writing secret files is prohibited (spec §12).");
    for (const toks of extractCommands(raw)) {
      const d = classifyCommand(toks);
      if (d) return d;
    }
    return allow();
  }
  return allow();
}

// ---- CLI wrapper (PreToolUse). Only runs when executed directly. ---------
// NOTE: exit-code-2 blocking is the version-supported PreToolUse contract for
// Claude Code 2.1.186 (independently re-verified). This wrapper is inert until
// the hook is registered in settings, which this segment deliberately does NOT do.
const RUN_CLI = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("/guard.mjs");
if (RUN_CLI) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (input += d));
  process.stdin.on("end", () => {
    let payload = {};
    try { payload = JSON.parse(input || "{}"); }
    catch { process.stderr.write("orchestration guard: unparseable hook input — failing closed\n"); process.exit(2); }
    const res = evaluateToolCall({ tool_name: payload.tool_name, tool_input: payload.tool_input });
    if (res.decision === "deny") { process.stderr.write("BLOCKED by orchestration guard [" + res.rule + "]: " + res.reason + "\n"); process.exit(2); }
    process.exit(0);
  });
}
