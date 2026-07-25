<!--
  finding-index.md — Phase O2 artifact P8 (per docs/claude-orchestration/01-approved-orchestration-architecture.md §4, §18)
  PURPOSE: compact canonical routing index that feeds /rz-prime WITHOUT a repo re-scan.
  NOT an audit narrative and NOT a duplicate of the STATE register — routing fields only.
  AUTHORITY (do not redesign): CLAUDE.md · 01-approved-orchestration-architecture.md · STATE.json
  This file changes NO finding lifecycle state. STATE.json remains the canonical state register.
-->

# Finding Routing Index (P8)

- **Source of record:** `docs/professional-audit/STATE.json` (canonical; do not duplicate here).
- **Approved architecture:** `docs/claude-orchestration/01-approved-orchestration-architecture.md` (§4 router packet, §5 reviewer routing, §7 evidence, §2 autonomy).
- **Finding count:** **33** (equals STATE.json; `state-validator.mjs` reports `33 findings`).
- **Validation status of this index:** repository-routing paths were established by direct search of the current tracked WSL repository; every path asserted below was checked to exist on the current branch and to be materially relevant to its finding. Unsupported fields are written `NOT MAPPED` / `UNKNOWN`, never inferred.

## Repository-evidence caveats (honesty notes)
- **STATE.json may cite audit documents absent from this tracked WSL branch.** `08-master-findings-register.md` and `09-remediation-roadmap.md` are **not present** in `docs/professional-audit/` here, although STATE.json references them (`source_register`, OPEN-finding `evidence_locations`, `next_action`). **Their absence does NOT prevent repository-routing paths from being established** — the routing paths below were derived by direct search of the current tracked repository (implementation / RLS-function-config / migration / test / tracked-remediation loci), not from the absent register. Do not treat the register/roadmap as existing files until they are added.
- **Routing ≠ lifecycle evidence.** Mapping a repository path here is a navigation aid only; it does **NOT** constitute lifecycle evidence and does **NOT** advance any finding's `state` or `evidence_level`. STATE.json remains the canonical state register. OPEN findings therefore keep their OPEN state while still carrying validated repository code paths.
- **Verification standard:** every path asserted below was confirmed to exist on the current tracked branch and to be materially relevant to the specific finding. Weak, generic, or decorative paths were deliberately omitted; a finding with no strong material locus is left `NOT MAPPED` rather than force-fitted.
- **ID-collision (authoritative, from STATE.json `register_notes`):** canonical **PF-013 = "Reports/AI syntheses not reproducible"**; the self-deletion / function-grant remediation historically mislabeled "PF-013" is now canonical **PF-033**. Where the approved architecture text says *"Function grant hardening (PF-013)"* (§7) and lists *"PF-013"* as an L2 example (§2), that refers to **canonical PF-033**, not canonical PF-013.

## Field legend
- **AUT (autonomy, §2):** `L0` read · `L1` local-reversible · `L2` high-impact local (RLS/SECURITY DEFINER/scoring/AI-authz/psychometric interpretation/consent/safeguarding/cross-school ACL/migration) · `L3` external/production (HUMAN-ONLY). Classifier is **fail-up**. `L3`/GATE 2 (merge, deploy, prod SQL, any `git push`, AI enablement) applies at closure for **every** finding and is not repeated per row.
- **STATE / E:** current lifecycle state and `evidence_level` copied from STATE.json (not advanced here). `PRODUCTION_VERIFIED`/`CLOSED` are HUMAN-ONLY; implementer max = `IMPLEMENTED`.
- **REVIEWER (§5 routing):** `SEC` security-db-reviewer · `PRIV` privacy-safeguarding reviewer · `SCI` career-science reviewer · `AIGATE` mandatory human AI-governance gate (§16) · `SELF` self + evidence (L1) · `ENG` engineering. Merge/deploy = HUMAN GATE 2 (implicit).
- **E→CLOSE (§7 templates):** `RLS` = E1+E2+E3+E4-C (+E4-B if a runtime event is observable) · `FNGRANT` = E1+E2+E4-C (E4-B optional; denial is config-provable) · `SCORING` = E1+E2+E3 (+E4-B if stored outputs change) · `AIAUTHZ` = E1+E2+E3+E4-C+E4-B · `L1` = E1+E2 · `NOT MAPPED` = no §7 template fits this finding type (owner/reviewer to set).
- **Tags:** `✅` = explicitly named in the approved architecture · `ⓘ` = derived by finding-type from an approved template/rule (not a lifecycle change).

## Routing table (all 33 findings)

| ID | Short issue | Sev | risk_class (STATE) | AUT | STATE | E | REVIEWER | E→CLOSE |
|---|---|---|---|---|---|---|---|---|
| PF-001 | Minors' psychometric data to 3rd-party AI, no live consent | Critical | ai, privacy, minors, consent | L2 ⓘ | OPEN | E0 | SEC+PRIV+SCI+AIGATE | NOT MAPPED (AI lane §16 + human gate) |
| PF-002 | Unauthenticated AI edge functions; no rate limiting | Critical | ai, security, authz | L2 ✅ | OPEN | E0 | SEC+PRIV+SCI+AIGATE | AIAUTHZ ✅ |
| PF-003 | Client-side scoring + client INSERT (tamperable) | Critical | data-integrity, scoring, security, rls | L2 ✅ | OPEN | E0 | SEC+SCI | SCORING ✅ |
| PF-004 | Cross-tenant link mgmt via global has_role(admin) | High | security, authz, rls, tenancy | L2 ⓘ | OPEN | E0 | SEC | RLS ⓘ |
| PF-005 | Two competing counselor-student linkage tables | High | security, authz, db, rls | L2 ⓘ | OPEN | E0 | SEC | RLS ⓘ |
| PF-006 | Out-of-band prod schema/RLS; 5 superadmin SELECT policies uncaptured | High | db, migration, rls, security | L2 ⓘ | IMPLEMENTED | E1 | SEC | RLS ⓘ |
| PF-007 | Superadmin global read of minors' data, no access audit | High | privacy, safeguarding, rls, authz, minors | L2 ✅ | IMPLEMENTED | E2 | SEC+PRIV | RLS ✅ |
| PF-008 | CAAS/Work Values/EQ item text hard-coded English | High | psychometric, localization, minors | L2 ⓘ | OPEN | E0 | SCI+PRIV | NOT MAPPED |
| PF-009 | No authz/RLS/integration tests (placeholder suite) | High | testing, security | L1 ⓘ | OPEN | E0 | SEC | L1 ⓘ |
| PF-010 | work_values readable by any same-school counselor | High | rls, authz, security | L2 ⓘ | OPEN | E0 | SEC | RLS ⓘ |
| PF-011 | Students can UPDATE own grade/current_assessment_cycle | High | data-integrity, rls, authz, security | L2 ✅ | IMPLEMENTED | E2 | SEC | RLS ⓘ |
| PF-012 | Students can DELETE own assessment rows | High | data-integrity, rls, safeguarding, minors | L2 ✅ | IMPLEMENTED | E2 | SEC+PRIV | RLS ✅ |
| PF-013 | Reports/AI syntheses not reproducible (unversioned prompts/thresholds) | High | ai, reproducibility, psychometric | L2 ⓘ | OPEN | E0 | SEC+PRIV+SCI+AIGATE | NOT MAPPED (see collision note) |
| PF-014 | Free-text prompts + user.id logged to ai_logs; retention undefined | Medium | privacy, ai, logging | L2 ⓘ | OPEN | E0 | PRIV+SEC | NOT MAPPED |
| PF-015 | Skills 1-item-per-construct shown as %-scores | Medium | psychometric, minors | L2 ⓘ | OPEN | E0 | SCI | NOT MAPPED |
| PF-016 | 12-item EQ brevity vs reporting weight | Medium | psychometric | L2 ⓘ | OPEN | E0 | SCI | NOT MAPPED |
| PF-017 | Signup role self-selection via user_metadata.role | Medium | security, authz | L2 ⓘ | OPEN | E0 | SEC | NOT MAPPED |
| PF-018 | Self-registered students orphaned (school_id NULL) | Medium | safeguarding, product, minors | L2 ⓘ | OPEN | E0 | PRIV | NOT MAPPED |
| PF-019 | Migrations folder not rebuildable (legacy SQL/scripts) | Medium | db, migration, reproducibility | L2 ⓘ | OPEN | E0 | SEC | NOT MAPPED |
| PF-020 | Generated types.ts hand-patched; pervasive as-any | Medium | code-quality | L1 ⓘ | OPEN | E0 | SELF | L1 ⓘ |
| PF-021 | onet-proxy 500 in prod; endpoint unauthenticated | Medium | reliability, security | L2 ⓘ | OPEN | E0 | SEC | NOT MAPPED |
| PF-022 | Cloud-sync-timeout false-negative toast race | Medium | ux, reliability | L1 ⓘ | OPEN | E0 | SELF | L1 ⓘ |
| PF-024 | Analytics without small-group suppression (n<5 re-identify) | Medium | privacy, minors | L2 ⓘ | OPEN | E0 | PRIV | NOT MAPPED |
| PF-026 | No in-product DSAR/export/correction/deletion; retention undefined | Medium | privacy, legal, dsar | L2 ⓘ | OPEN | E0 | PRIV | NOT MAPPED |
| PF-027 | Report headings/dialogs hard-coded English | Medium | localization, ux | L1 ⓘ | OPEN | E0 | SELF (SCI if wording changes meaning) | L1 ⓘ |
| PF-023 | PWA disabled via selfDestroying — no offline/install | Low | ux | L1 ⓘ | OPEN | E0 | SELF | L1 ⓘ |
| PF-025 | No a11y conformance (unlabeled buttons, charts, contrast) | Low | accessibility, ux | L1 ⓘ | OPEN | E0 | ENG (SCI if student-facing meaning) | L1 ⓘ |
| PF-028 | Client fallback RIASEC bank rejected by 48-item validation | Low | dead-code | L1 ⓘ | OPEN | E0 | SELF | L1 ⓘ |
| PF-029 | Client-written audit_logs (spoofable); dead ai_usage_stats | Low | security, data-integrity | L2 ⓘ | OPEN | E0 | SEC | NOT MAPPED |
| PF-031 | Duplicated scorer kept in sync by hand | Low | code-quality | L2 ⓘ (scoring surface, fail-up) | OPEN | E0 | SEC+SCI | SCORING ⓘ |
| PF-030 | Stack is Vite/React SPA, not Next.js | Informational | informational | L1 ⓘ | OPEN | E0 | SELF | L1 ⓘ |
| PF-032 | Server-only pg package in frontend deps (unused) | Informational | informational | L1 ⓘ | OPEN | E0 | SELF | L1 ⓘ |
| PF-033 | Self-deletion / account-erasure RPC governance (privilege hardening) | High | security, authz, privacy, minors, safeguarding | L2 ✅ | IMPLEMENTED | E2 | SEC+PRIV | FNGRANT ✅ |

## Path map (validated repository routing paths)

Routing paths per finding, established by direct search of the current tracked repository and ordered by the §5 preference: **(a)** direct implementation locus → **(b)** security/RLS/function/config locus → **(c)** directly relevant migration → **(d)** directly relevant automated test → **(e)** directly relevant tracked remediation evidence. Each path was verified to exist on the current branch and to be materially relevant to the specific finding. Paths are routing aids only and change no lifecycle state (see caveats). The empty `supabase/migrations/20260723140000_harden_assessment_cycle_rpc_grants.sql` is intentionally **not** listed (no material content on this branch).

| ID | Relevant repository routing paths |
|---|---|
| PF-001 | `supabase/functions/generate-synthesis/index.ts` · `supabase/functions/generate-parent-insight/index.ts` · `supabase/functions/_shared/aiFeatureFlag.ts` · `supabase/migrations/20260618150000_ai_processing_consent.sql` · `docs/professional-audit/remediation-phase-1a/` |
| PF-002 | `supabase/config.toml` · `supabase/functions/career-coach/index.ts` · `supabase/functions/generate-parent-insight/index.ts` · `supabase/functions/_shared/aiFeatureFlag.ts` · `src/test/aiFeatureFlag.test.ts` |
| PF-003 | `src/services/assessmentService.ts` · `src/pages/WorkValuesAssessment.tsx` · `supabase/functions/submit-assessment/scoring.ts` · `supabase/migrations/20260618120000_g5_server_side_rescoring.sql` · `supabase/migrations/20260618140000_g5_phaseb_assessments_rls_lockdown.sql` |
| PF-004 | `supabase/migrations/20260414080000_bulk_management.sql` · `supabase/migrations/20260605210211_phase1a_security_rls.sql` · `supabase/migrations/20260419100000_critical_security_fixes.sql` |
| PF-005 | `supabase/migrations/20260414080000_bulk_management.sql` · `supabase/migrations/20260419100000_critical_security_fixes.sql` · `supabase/migrations/20260605210211_phase1a_security_rls.sql` |
| PF-006 | `supabase/migrations/20260723120000_capture_superadmin_select_policies.sql` · `docs/professional-audit/remediation-phase-1c/` (test = NOT MAPPED: E1 policy-capture migration, no behavioral test) |
| PF-007 | `supabase/migrations/20260723170000_audited_superadmin_read_boundary.sql` · `src/test/privilegedReadAudit.test.ts` · `docs/professional-audit/remediation-phase-2d/` |
| PF-008 | `src/pages/CaasAssessment.tsx` · `src/pages/WorkValuesAssessment.tsx` · `src/pages/EqAssessment.tsx` |
| PF-009 | `src/test/example.test.ts` · `src/test/setup.ts` · `supabase/functions/submit-assessment/scoring.test.ts` |
| PF-010 | `supabase/migrations/20260508180000_work_values.sql` (policy "Counselors can read student Work Values results" — role- not assignment-scoped) |
| PF-011 | `supabase/migrations/20260723130000_protect_controlled_profile_fields.sql` · `src/test/profileFieldProtection.test.ts` · `docs/professional-audit/remediation-phase-2a/` |
| PF-012 | `supabase/migrations/20260723150000_block_assessment_history_deletion.sql` · `src/test/assessmentDeletionProtection.test.ts` · `docs/professional-audit/remediation-phase-2b/` |
| PF-013 | `supabase/functions/generate-synthesis/index.ts` · `src/services/aiService.ts` · `supabase/migrations/20260616120000_ai_reports_cache.sql` |
| PF-014 | `supabase/migrations/20260417236000_ai_logging.sql` · `supabase/functions/admin-insights/index.ts` · `supabase/functions/counselor-coach/index.ts` · `supabase/functions/parent-coach/index.ts` |
| PF-015 | `src/pages/StudentSkills.tsx` · `src/components/assessment/SkillsGapAnalysis.tsx` |
| PF-016 | `src/pages/EqAssessment.tsx` · `src/components/assessment/EqResultCard.tsx` |
| PF-017 | `src/pages/AuthPage.tsx` · `supabase/migrations/20260617160000_s1_secure_provisioning.sql` · `supabase/migrations/20260426160000_fix_signup_grade.sql` |
| PF-018 | `supabase/migrations/20260617160000_s1_secure_provisioning.sql` · `src/pages/AuthPage.tsx` |
| PF-019 | `supabase/migrations/CONSOLIDATED_GUIDANCE_SETUP.sql` · `supabase/migrations/DB_HEALTH_RECOVERY.sql` · `supabase/migrations/QUICK_SETUP.sql` · `supabase/migrations/SCHEMA_FIX.sql` |
| PF-020 | `src/integrations/supabase/types.ts` |
| PF-021 | `supabase/functions/onet-proxy/index.ts` · `supabase/config.toml` (onet-proxy carries no `verify_jwt`) |
| PF-022 | `src/pages/AssessmentPage.tsx` · `src/integrations/supabase/client.ts` |
| PF-023 | `vite.config.ts` (VitePWA `selfDestroying: true`) |
| PF-024 | `src/pages/SchoolAnalytics.tsx` · `src/pages/AdminInsights.tsx` · `supabase/functions/admin-insights/index.ts` |
| PF-025 | NOT MAPPED (a11y is cross-cutting across UI components; no single strong material locus) |
| PF-026 | `src/components/student/PortfolioExportButton.tsx` · `supabase/migrations/20260417233000_gdpr_self_delete.sql` · `docs/legal/DSAR_EXPORT_DELETE_PROCEDURE_DRAFT.md` |
| PF-027 | `src/pages/StudentReport.tsx` · `src/components/assessment/ComprehensiveReportView.tsx` |
| PF-028 | `src/data/riasecQuestions.ts` · `src/utils/riasec.ts` · `supabase/functions/submit-assessment/index.ts` (48-item server validation) |
| PF-029 | `src/components/admin/BulkTools.tsx` (client `audit_logs` INSERT) · `supabase/migrations/20260417230000_audit_logging.sql` · `supabase/migrations/20260417232000_usage_tracking.sql` (dead `ai_usage_stats`) |
| PF-030 | `vite.config.ts` · `package.json` |
| PF-031 | `supabase/functions/submit-assessment/scoring.ts` · `supabase/functions/submit-assessment/index.ts` (inlined scorer copy) · `supabase/functions/submit-assessment/scoring.test.ts` |
| PF-032 | `package.json` (`pg` server-only dependency) |
| PF-033 | `supabase/migrations/20260723160000_govern_self_deletion_rpc.sql` · `src/test/selfDeletionGovernance.test.ts` · `docs/professional-audit/remediation-phase-2c/` |

## UNKNOWN / NOT MAPPED summary (for rz-prime routing gaps)
- **RELEVANT PATHS mapped from repository evidence: 32 of 33 findings** (all except PF-025). These are routing aids only and advance no lifecycle state (see caveats).
- **RELEVANT PATHS = NOT MAPPED: 1 finding — PF-025** (a11y is cross-cutting across UI components; no single strong material locus, so no mapping is forced).
- **E→CLOSE = NOT MAPPED** (no §7 template fits — a separate concept from repository routing, unchanged by the path search): PF-001, PF-008, PF-013, PF-014, PF-015, PF-016, PF-017, PF-018, PF-019, PF-021, PF-024, PF-026, PF-029.
- **PF-006 test path = NOT MAPPED** (E1 policy-capture migration; no automated behavioral test tracked, per STATE.json).
- **Autonomy is derived (`ⓘ`) for all findings except** PF-002/003/007/011/012 (named L2 in §2) and PF-033 (named as historical "PF-013" in §2/§7). STATE.json does not store an autonomy field.
