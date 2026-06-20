# Data Retention Schedule — Draft

> **DRAFT — requires review by qualified legal counsel before use.** Not legal advice.
> Proposes options only. The School (controller) + counsel must set the actual periods and triggers.
> All periods are `[[PLACEHOLDER]]` pending **⚖️ legal/school decision**.

## 1. Principles
- Retain the **minimum** necessary for the stated purpose (career guidance).
- Define a clear end-of-life (delete or anonymize) for every data category.
- Free-text / AI logs should have the **shortest** practical retention.

## 2. Proposed options (ⓘ for decision — not set)
| Data category | Option A (conservative) | Option B (developmental continuity) | Decision |
|---|---|---|---|
| Identity/PII | Delete `[[PLACEHOLDER]]` after withdrawal/graduation | Retain while enrolled + `[[PLACEHOLDER]]` | **⚖️** |
| Assessment answers/results | Anonymize on graduation | Retain (pseudonymized) for longitudinal growth view | **⚖️** |
| AI-generated content | Delete with account | Retain while enrolled | **⚖️** |
| `ai_logs` / free-text | Short window `[[PLACEHOLDER: e.g. N days]]` | Same | **⚖️** (shortest preferred) |
| Consent/audit records | Retain per legal record-keeping `[[PLACEHOLDER]]` | Same | **⚖️** |

## 3. Delete / anonymize triggers
- **Graduation** / end of enrolment.
- **Withdrawal from the platform.**
- **Consent withdrawal** → stop AI processing immediately; `[[PLACEHOLDER: effect on stored AI outputs]]`.
- **Account deletion** (DSAR) → see `DSAR_EXPORT_DELETE_PROCEDURE_DRAFT.md`.
- **End of School contract** → return/delete per DPA §7.

## 4. Technical implementation (later, gated)
ⓘ Today: delete hooks exist (`delete_user_rpc`, `gdpr_self_delete`); **no scheduled retention/purge
or anonymization job** → follow-up `chore/retention-automation`. No retention automation should be
built until periods/triggers are decided.
