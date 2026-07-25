// =========================================================================
// Guard test harness (Phase O2 Segment 1 / 1R) — dependency-free (Node stdlib).
// Exercises the guard as a PURE decision function with SYNTHETIC inputs.
// NO real git push / send-pack / deploy / SQL / network / secret op is performed.
// Run: node .claude/hooks/guard.test.mjs
//
// Coverage is organized by ADVERSARIAL CLASS (not optimized for raw count).
// Segment-1R additions target independent-review vectors O2-S1-R01..R06/R12.
// =========================================================================
import { evaluateToolCall } from "./guard.mjs";

const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });
const ps = (command) => ({ tool_name: "PowerShell", tool_input: { command } });
const write = (file_path) => ({ tool_name: "Write", tool_input: { file_path } });
const edit = (file_path) => ({ tool_name: "Edit", tool_input: { file_path } });
const read = (file_path) => ({ tool_name: "Read", tool_input: { file_path } });
const mcp = (tool_name) => ({ tool_name, tool_input: {} });
const encPush = Buffer.from("git push", "utf16le").toString("base64");

// [label, category, call, expected]
const MUST_BLOCK = [
  // --- git remote mutation (literal + wrappers) ---
  ["git push", "git", bash("git push"), "deny"],
  ["git push origin main", "git", bash("git push origin main"), "deny"],
  ["git push -u feature", "git", bash("git push -u origin fix/x"), "deny"],
  ["git force push", "git", bash("git push --force origin main"), "deny"],
  ["git push -f", "git", bash("git push -f"), "deny"],
  ["git -C other push", "git", bash("git -C ../clone push"), "deny"],
  ["full quoted path push", "git", bash('"C:\\Program Files\\Git\\cmd\\git.exe" push origin main'), "deny"],
  ["powershell -Command git push", "git", ps('powershell -Command "git push origin main"'), "deny"],
  ["pwsh -c git push", "git", ps('pwsh -c "git push"'), "deny"],
  ["cmd /c git push", "git", bash('cmd /c "git push origin main"'), "deny"],
  ["chained push after status", "git", bash("git status; git push origin main"), "deny"],
  ["push via && chain", "git", bash("git commit -m x && git push"), "deny"],
  ["git send-pack (R01)", "git", bash("git send-pack origin HEAD:main"), "deny"],
  ["full-path send-pack (R01)", "git", bash('"C:\\Program Files\\Git\\cmd\\git.exe" send-pack origin main'), "deny"],
  ["git add .", "git", bash("git add ."), "deny"],
  ["git add -A", "git", bash("git add -A"), "deny"],
  ["git add --all", "git", bash("git add --all"), "deny"],
  ["git reset --hard", "git", bash("git reset --hard origin/main"), "deny"],
  ["git clean -fdx", "git", bash("git clean -fdx"), "deny"],

  // --- POSIX shell wrappers (O2-S1R-R01) ---
  ["bash -c git push", "posix", bash('bash -c "git push origin main"'), "deny"],
  ["bash -lc force push", "posix", bash('bash -lc "git push --force origin main"'), "deny"],
  ["sh -c git push", "posix", bash('sh -c "git push"'), "deny"],
  ["sh -c send-pack", "posix", bash('sh -c "git send-pack origin refs/heads/main"'), "deny"],
  ["dash -c git push", "posix", bash('dash -c "git push"'), "deny"],
  ["zsh -c git push", "posix", bash('zsh -c "git push"'), "deny"],
  ["bash -c nested cmd /c push", "posix", bash('bash -c "cmd /c git push"'), "deny"],
  ["sh -c nested powershell push", "posix", bash(`sh -c "powershell -Command 'git push'"`), "deny"],

  // --- inline git alias mutation (O2-S1R-R03) ---
  ["git -c alias.p=push", "git-alias", bash("git -c alias.p=push p origin main"), "deny"],
  ["git -c alias.x=send-pack", "git-alias", bash("git -c alias.x=send-pack x origin main"), "deny"],
  ["git -c alias bang git push", "git-alias", bash(`git -c "alias.d=!git push" d`), "deny"],

  // --- simple wrappers (O2-S1R-R04) ---
  ["xargs git push", "wrapper", bash("echo main | xargs git push origin"), "deny"],
  ["xargs -n1 git push", "wrapper", bash("echo main | xargs -n1 git push"), "deny"],
  ["xargs -I {} git push", "wrapper", bash("echo x | xargs -I {} git push origin {}"), "deny"],
  ["env -S git push", "wrapper", bash('env -S "git push origin main"'), "deny"],
  ["env -u FOO git push", "wrapper", bash("env -u FOO git push"), "deny"],
  ["env VAR=1 git push", "wrapper", bash("env FOO=1 git push"), "deny"],

  // --- package-runner indirection (R03) ---
  ["npx vercel deploy", "pkg-runner", bash("npx vercel deploy --prod"), "deny"],
  ["npx -y supabase db push", "pkg-runner", bash("npx -y supabase db push"), "deny"],
  ["npx -c call vercel deploy", "pkg-runner", bash('npx -c "vercel deploy --prod"'), "deny"],
  ["npm exec -- vercel deploy", "pkg-runner", bash("npm exec -- vercel deploy --prod"), "deny"],
  ["pnpm dlx supabase db push", "pkg-runner", bash("pnpm dlx supabase db push"), "deny"],
  ["pnpm exec supabase functions deploy", "pkg-runner", bash("pnpm exec supabase functions deploy fn"), "deny"],
  ["yarn dlx vercel --prod", "pkg-runner", bash("yarn dlx vercel --prod"), "deny"],
  ["bunx supabase functions deploy", "pkg-runner", bash("bunx supabase functions deploy fn"), "deny"],
  ["bun x vercel deploy", "pkg-runner", bash("bun x vercel deploy"), "deny"],
  ["npx wraps git push", "pkg-runner", bash('npx -c "git push origin main"'), "deny"],

  // --- interpreter indirection (R01/R02) ---
  ["node -e", "interp", bash(`node -e "require('child_process').execSync('git push')"`), "deny"],
  ["node --eval", "interp", bash(`node --eval "fetch('https://api.github.com/x',{method:'POST'})"`), "deny"],
  ["node -p", "interp", bash(`node -p "process.env.SECRET"`), "deny"],
  ["python -c", "interp", bash(`python -c "import os; os.system('x')"`), "deny"],
  ["python3 -c", "interp", bash(`python3 -c "import urllib.request"`), "deny"],
  ["ruby -e", "interp", bash(`ruby -e "system('x')"`), "deny"],
  ["perl -e", "interp", bash(`perl -e 'system("x")'`), "deny"],
  ["deno eval", "interp", bash('deno eval "Deno.run()"'), "deny"],
  ["node -e via env prefix", "interp", bash(`FOO=1 node -e "x"`), "deny"],

  // --- supabase / vercel / psql / gh / network ---
  ["supabase db push", "infra", bash("supabase db push"), "deny"],
  ["supabase functions deploy", "infra", bash("supabase functions deploy submit-assessment"), "deny"],
  ["supabase migration up", "infra", bash("supabase migration up"), "deny"],
  ["supabase db reset", "infra", bash("supabase db reset"), "deny"],
  ["supabase secrets set", "infra", bash("supabase secrets set K=V"), "deny"],
  ["vercel deploy --prod", "infra", bash("vercel deploy --prod"), "deny"],
  ["bare vercel", "infra", bash("vercel"), "deny"],
  ["psql prod", "infra", bash("psql postgres://u:p@db.supabase.co:5432/postgres -c 'drop table x'"), "deny"],
  ["gh pr merge", "infra", bash("gh pr merge 34 --merge"), "deny"],
  ["gh workflow run", "infra", bash("gh workflow run deploy.yml"), "deny"],
  ["gh release create", "infra", bash("gh release create v1"), "deny"],
  ["gh api PUT merges", "infra", bash("gh api -X PUT repos/o/r/pulls/1/merge"), "deny"],
  ["curl POST github", "net", bash('curl -X POST https://api.github.com/repos/o/r/merges -d @body.json'), "deny"],
  ["curl body github no -X", "net", bash('curl https://api.github.com/repos/o/r/merges -d @body.json'), "deny"],
  ["Invoke-RestMethod POST", "net", ps('Invoke-RestMethod -Method Post -Uri https://api.supabase.co/x -Body $b'), "deny"],
  ["wget --method POST body", "net", ps("wget --method POST --body-data=x https://x.supabase.co/y"), "deny"],

  // --- AI enablement ---
  ["enable AI env", "ai", bash("export AI_FEATURES_ENABLED=true"), "deny"],
  ["enable AI setx", "ai", ps("setx AI_FEATURES_ENABLED true"), "deny"],
  ["enable AI $env", "ai", ps('$env:AI_FEATURES_ENABLED = "true"'), "deny"],

  // --- PowerShell dangerous forms (R01/R06) ---
  ["Start-Process git push", "ps", ps("Start-Process git -ArgumentList 'push','origin','main'"), "deny"],
  ["Start-Process -FilePath git.exe push", "ps", ps("Start-Process -FilePath 'C:\\Program Files\\Git\\cmd\\git.exe' -ArgumentList 'push'"), "deny"],
  ["saps git push", "ps", ps("saps git -ArgumentList 'push'"), "deny"],
  ["powershell -EncodedCommand", "ps", ps(`powershell -EncodedCommand ${encPush}`), "deny"],
  ["powershell -enc", "ps", ps(`powershell -enc ${encPush}`), "deny"],
  ["dynamic iex $var", "ps", ps('iex $cmd'), "deny"],
  ["dynamic iex subexpr", "ps", ps('iex (Get-Content payload.txt)'), "deny"],
  ["literal iex git push", "ps", ps('iex "git push"'), "deny"],

  // --- protected-config move/copy/rename (R06/R12) ---
  ["Move-Item onto settings.json", "protected", ps("Move-Item evil.json .claude/settings.json -Force"), "deny"],
  ["Copy-Item onto guard.mjs", "protected", ps("Copy-Item evil.mjs .claude/hooks/guard.mjs -Force"), "deny"],
  ["Rename-Item settings.json", "protected", ps("Rename-Item .claude/settings.json .claude/settings.bak"), "deny"],
  ["cp onto .mcp.json", "protected", bash("cp evil.json .mcp.json"), "deny"],
  ["New-Item over STATE.json", "protected", ps("New-Item -Path docs/professional-audit/STATE.json -ItemType File -Force"), "deny"],
  ["Move-Item onto candidate (R12)", "protected", ps("Move-Item evil.json .claude/settings.candidate.json -Force"), "deny"],

  // --- protected-config direct writes ---
  ["Write settings.json", "protected", write(".claude/settings.json"), "deny"],
  ["Edit guard.mjs", "protected", edit(".claude/hooks/guard.mjs"), "deny"],
  ["Edit STATE.json", "protected", edit("docs/professional-audit/STATE.json"), "deny"],
  ["Edit state-validator", "protected", edit("docs/professional-audit/state-validator.mjs"), "deny"],
  ["Edit .mcp.json", "protected", edit(".mcp.json"), "deny"],
  ["Write candidate settings (R12)", "protected", write(".claude/settings.candidate.json"), "deny"],
  ["abs path settings.json", "protected", write("c:/Users/johnn/OneDrive/Desktop/Super Riasec/.claude/settings.json"), "deny"],
  ["redirect into settings.json", "protected", bash('echo "{}" > .claude/settings.json'), "deny"],
  ["Out-File pipe into settings", "protected", ps('"{}" | Out-File .claude/settings.json'), "deny"],
  ["sed -i on guard", "protected", bash("sed -i 's/deny/allow/' .claude/hooks/guard.mjs"), "deny"],

  // --- secret handling ---
  ["Read .env", "secret", read(".env"), "deny"],
  ["Read .env.production", "secret", read(".env.production"), "deny"],
  ["Read .env.local", "secret", read(".env.local"), "deny"],
  ["cat .env.local", "secret", bash("cat .env.local"), "deny"],
  ["gc secret alias", "secret", ps("gc .env.production"), "deny"],
  ["Copy-Item .env exfil (R06)", "secret", ps("Copy-Item .env C:\\Temp\\x"), "deny"],
  ["write private key", "secret", write("secrets/id_rsa"), "deny"],
  ["Read id_rsa", "secret", read(".ssh/id_rsa"), "deny"],
  ["cp env secret", "secret", bash("cp config/.env /tmp/x"), "deny"],
  ["Read cert.pem", "secret", read("certs/server.pem"), "deny"],

  // --- MCP defense-in-depth (R05) ---
  ["mcp apply_migration", "mcp", mcp("mcp__supabase__apply_migration"), "deny"],
  ["mcp execute_sql (R05)", "mcp", mcp("mcp__supabase__execute_sql"), "deny"],
  ["mcp execute_ddl", "mcp", mcp("mcp__supabase__execute_ddl"), "deny"],
  ["mcp deploy_edge_function", "mcp", mcp("mcp__supabase__deploy_edge_function"), "deny"],
  ["mcp create_branch", "mcp", mcp("mcp__supabase__create_branch"), "deny"],
];

const MUST_ALLOW = [
  // --- git read-only / explicit local ---
  ["git status", "git", bash("git status --short"), "allow"],
  ["git diff", "git", bash("git diff --check"), "allow"],
  ["git log", "git", bash("git log --oneline -5"), "allow"],
  ["git show", "git", bash("git show HEAD"), "allow"],
  ["git add explicit file", "git", bash("git add src/services/onetService.ts"), "allow"],
  ["git add two explicit files", "git", bash("git add src/a.ts src/b.ts"), "allow"],
  ["git commit", "git", bash('git commit -m "fix: push handling bug"'), "allow"],
  ["git commit mentioning push", "git", bash('git commit -m "improve push UX copy"'), "allow"],
  ["git branch", "git", bash("git branch --show-current"), "allow"],
  ["git checkout -b", "git", bash("git checkout -b feature/x"), "allow"],
  ["git fetch", "git", bash("git fetch origin"), "allow"],
  ["echo mentions git push", "git", bash("echo 'remember to ask owner to git push'"), "allow"],

  // --- POSIX wrappers: benign ---
  ["bash -c echo", "posix", bash('bash -c "echo hello"'), "allow"],
  ["sh -c pwd", "posix", bash('sh -c "pwd"'), "allow"],
  ["bash -lc git status", "posix", bash('bash -lc "git status"'), "allow"],
  ["bash script.sh (content unseen)", "posix", bash("bash scripts/run.sh"), "allow"],
  ["xargs echo benign", "wrapper", bash("echo x | xargs echo"), "allow"],
  ["env VAR=1 node script", "wrapper", bash("env FOO=1 node scripts/x.mjs"), "allow"],
  ["git -c alias.st=status", "git-alias", bash("git -c alias.st=status st"), "allow"],
  ["git -c core.editor", "git-alias", bash('git -c core.editor=vim commit -m x'), "allow"],
  ["git -c alias.lg=log", "git-alias", bash("git -c alias.lg=log lg"), "allow"],

  // --- package runners: benign ---
  ["npx tsc", "pkg-runner", bash("npx tsc --noEmit -p tsconfig.app.json"), "allow"],
  ["npx vitest", "pkg-runner", bash("npx vitest run src/test/foo.test.ts"), "allow"],
  ["npx eslint", "pkg-runner", bash("npx eslint ."), "allow"],
  ["pnpm exec vitest", "pkg-runner", bash("pnpm exec vitest run"), "allow"],
  ["yarn dlx prettier", "pkg-runner", bash("yarn dlx prettier --check ."), "allow"],
  ["npm exec eslint", "pkg-runner", bash("npm exec -- eslint src"), "allow"],
  ["npm run build", "pkg-runner", bash("npm run build"), "allow"],

  // --- interpreters: normal script execution ---
  ["node script file", "interp", bash("node .claude/hooks/guard.test.mjs"), "allow"],
  ["node validator", "interp", bash("node docs/professional-audit/state-validator.mjs docs/professional-audit/STATE.json"), "allow"],
  ["python script file", "interp", bash("python3 scripts/gen.py"), "allow"],

  // --- build / search / read-only ---
  ["curl GET github", "net", bash('curl -s "https://api.github.com/repos/o/r/commits"'), "allow"],
  ["curl GET -o file", "net", bash('curl -s "https://api.github.com/x" -o /tmp/x.json'), "allow"],
  ["grep search", "misc", bash('grep -rn "foo" src'), "allow"],
  ["ls", "misc", bash("ls -la"), "allow"],
  ["cat normal file", "misc", bash("cat src/App.tsx"), "allow"],
  ["Get-ChildItem", "ps", ps("Get-ChildItem -Recurse src"), "allow"],
  ["powershell Get-Content", "ps", ps('powershell -Command "Get-Content package.json"'), "allow"],
  ["Move-Item benign", "ps", ps("Move-Item src/a.ts src/b.ts"), "allow"],
  ["Copy-Item benign", "ps", ps("Copy-Item src/a.ts src/b.ts"), "allow"],

  // --- Write/Edit/Read normal ---
  ["write normal source", "fs", write("src/components/Foo.tsx"), "allow"],
  ["edit normal doc", "fs", edit("docs/professional-audit/09-remediation-roadmap.md"), "allow"],
  ["edit CLAUDE.md", "fs", edit("CLAUDE.md"), "allow"],
  ["read normal source", "fs", read("src/services/aiService.ts"), "allow"],

  // --- secret-path precision: templates + keys/ dir now ALLOWED (R04) ---
  ["read .env.example", "secret-fp", read(".env.example"), "allow"],
  ["read .env.sample", "secret-fp", read(".env.sample"), "allow"],
  ["read .env.template", "secret-fp", read(".env.template"), "allow"],
  ["read src/keys dir file", "secret-fp", read("src/keys/index.ts"), "allow"],
  ["read i18n keys dir", "secret-fp", read("src/i18n/keys/en.ts"), "allow"],
  ["write keyboard keys util", "secret-fp", write("src/utils/keys/shortcuts.ts"), "allow"],

  // --- MCP read-only discovery ---
  ["mcp list_tables", "mcp", mcp("mcp__supabase__list_tables"), "allow"],
  ["mcp list_migrations", "mcp", mcp("mcp__supabase__list_migrations"), "allow"],
  ["mcp get_logs", "mcp", mcp("mcp__supabase__get_logs"), "allow"],
  ["mcp search_docs", "mcp", mcp("mcp__supabase__search_docs"), "allow"],
];

let pass = 0, fail = 0;
const rows = [];
const run = (cases) => {
  for (const [label, category, call, expected] of cases) {
    const res = evaluateToolCall(call);
    const ok = res.decision === expected;
    ok ? pass++ : fail++;
    rows.push({ label, category, expected, actual: res.decision, rule: res.rule, ok });
    if (!ok) console.log(`FAIL: [${category}] ${label} — expected ${expected}, got ${res.decision} (${res.rule})`);
  }
};
run(MUST_BLOCK);
run(MUST_ALLOW);

// category coverage summary (policy coverage, not just a total count)
const cats = {};
for (const r of rows) {
  const k = `${r.category}/${r.expected}`;
  cats[k] = (cats[k] || 0) + 1;
}
console.log("\n=== GUARD DECISION MATRIX (by category) ===");
for (const r of rows) console.log(`${r.ok ? "ok " : "XX "}| ${r.category.padEnd(10)} | ${r.expected.padEnd(5)} -> ${String(r.actual).padEnd(5)} | ${String(r.rule).padEnd(22)} | ${r.label}`);
console.log("\n=== CATEGORY COVERAGE ===");
for (const k of Object.keys(cats).sort()) console.log(`  ${k.padEnd(20)} ${cats[k]}`);
console.log(`\nRESULT: ${pass} passed, ${fail} failed  (block=${MUST_BLOCK.length}, allow=${MUST_ALLOW.length})`);
process.exit(fail ? 1 : 0);
