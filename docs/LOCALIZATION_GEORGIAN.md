# Localization — Georgian (ka)

> Competency 7 (Georgian localization). Tags: ✅ verified · ⓘ inferred · ❓ unknown.

## 1. Why this is first-class, not secondary
The platform serves **Georgian-speaking** students (12–18), parents, counselors, and schools.
Career interpretation must be **natural, age-appropriate, and non-deterministic in Georgian** —
a literal/machine translation that sounds clinical or prescriptive harms guidance quality for minors.

## 2. Mechanism ✅
- `react-i18next` with locales **`ka`** (Georgian) and **`en`** (English); `i18next-browser-languagedetector`.
- PWA manifest default `lang: "ka"` ✅.
- A `LanguageSwitcher` component; language preference stored per user (`profiles.preferred_language`, ⓘ).
- RIASEC question banks are **bilingual** (`RIASEC_QUESTIONS_BY_GRADE[band].{en|ka}`) ✅ — same ids/categories, translated text.

## 3. AI-generated Georgian interpretation ✅
- AI functions accept a `lang` param and produce Georgian output when `ka` (e.g. `generate-synthesis`, `career-coach`, `localize-careers`).
- `localize-careers` translates O*NET occupation strings into Georgian (falls back to English on failure, so the UI never breaks).
- **Georgian is token-heavy:** synthesis once truncated mid-JSON at low max-tokens; `MAX_TOKENS` was raised to 8000 to avoid this. When changing AI output size/format, re-check Georgian doesn't truncate.

## 4. Localization rules for Claude Code
- Any new user-facing string must have **both `ka` and `en`** keys; never hardcode user-facing English.
- Career/assessment wording in Georgian must stay **age-appropriate and non-deterministic** ("შენი პასუხები მიანიშნებს…", not "შენ უნდა გახდe…").
- Preserve the child-safety tone (see `AI_INTERPRETATION_RULES.md`) in **both** languages.
- When editing AI prompts, ensure the Georgian instruction + formatting (and token budget) are handled.
- Owner communication is in Georgian by default (see `CLAUDE.md` §5).

## 5. Unknowns
- ❓ Full coverage/quality of every `ka` translation string is not audited here — verify per-screen when touching UI.

## Related
`DOMAIN_CAREER_DEVELOPMENT.md` · `AI_INTERPRETATION_RULES.md`
