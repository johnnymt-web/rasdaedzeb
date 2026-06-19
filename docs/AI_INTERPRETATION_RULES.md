# AI Interpretation Rules (Safety)

> Competency 6 (AI integration safety). Tags: ✅ verified · ⓘ inferred · ❓ unknown.

## 1. Providers & what each receives ✅
| Function | Provider | Data sent (minimized) | Identifiers |
|---|---|---|---|
| `generate-synthesis` | **Anthropic** | psychometric scores + grade **band** | none (no name/email/school/exact grade) |
| `generate-parent-insight` | **OpenAI** | assessment types + scores | name **withheld** (fix on consent branch; ⓘ verify live state) |
| `career-coach` | **OpenAI** | pseudonymous report context + student's own chat | none |
| `localize-careers` | **OpenAI** | occupation title strings | none |
| `counselor/parent/admin coaches` | **Lovable AI gateway** | staff-typed chat (free-text) | ⚠️ whatever staff type — guidance: use initials |
| `onet-proxy` | O*NET | occupation queries | none |

Three AI sub-processors (Anthropic, OpenAI, Lovable) → each needs a **DPA** (owner action).
The data-processing register lives on `feat/ai-consent-privacy` as `docs/DATA-PROCESSING-REGISTER.md` (not on main).

## 2. Child-safety prompt rules (preserve these) ✅
- Non-diagnostic, age-appropriate; "your responses suggest…" not "you should become…".
- Encourage discussion with counselor/parent; no clinical/psychometric jargon to students.
- Strengths-based; developmental-stage anchored.
These are encoded in the function system prompts — do not remove them.

## 3. Data minimization
- Send the **minimum**: scores + grade band; never names/email/school/exact DOB where avoidable.
- Reports passed to AI must be **pseudonymous**.
- Persist as little free-text as possible; `ai_logs.prompt_summary` should be redacted (done on consent branch).

## 4. Consent gating (design — not yet live ⚠️)
Default-deny: no student data goes to a third-party AI until parental/guardian consent is recorded
(`ai_processing_consent` + `has_ai_consent()`), enforced server-side in the AI functions and gated
in the UI (`AiConsentGate`). **This system is built on `feat/ai-consent-privacy` but NOT merged/live.**
Until then, **the consent/DPA gap is a CRITICAL risk** (see `CURRENT_PROJECT_STATUS.md`).

## 5. Cost-abuse / rate-limiting
- `generate-synthesis` is rate-limited (40/day) + cached. ✅
- `career-coach`, `localize-careers`, `generate-parent-insight` lack per-user rate limiting (auth
  cost-abuse risk). Partly hardened on the consent branch (auth added). ⓘ verify before relying.

## Related rules
`SECURITY_PRIVACY_RULES.md` · `DOMAIN_CAREER_DEVELOPMENT.md` · `LOCALIZATION_GEORGIAN.md` · `CURRENT_PROJECT_STATUS.md`
