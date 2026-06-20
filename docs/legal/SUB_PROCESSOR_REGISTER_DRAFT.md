# Sub-processor Register — Draft

> **DRAFT — requires review by qualified legal counsel before use.** Not legal advice.
> Extends the engineering register (`docs/DATA-PROCESSING-REGISTER.md`, on the consent branch) with
> DPA/transfer status. DPA signatures + transfer mechanisms are **⚖️ legal/owner actions**.

## Register
| Sub-processor | Role / function | Student PII sent? | Data minimized | DPA status | Transfer mechanism |
|---|---|---|---|---|---|
| **Supabase** | Database, Auth, Edge Functions (stores all data) | Yes — hosts all data | n/a (primary store) | **⚖️ `[[needed]]`** | **⚖️ `[[region/mechanism]]`** |
| **Vercel** | Frontend hosting | Minimal (app shell; no DB) | n/a | **⚖️ `[[needed]]`** | **⚖️ `[[mechanism]]`** |
| **OpenAI** | `generate-parent-insight`, `career-coach`, `localize-careers` | Minimized; **name withheld**; pseudonymous report context; occupation strings | Yes | **⚖️ `[[needed]]`** | **⚖️ `[[US transfer]]`** |
| **Anthropic** | `generate-synthesis` (deep report) | Minimized — scores + grade **band**; no identifiers | Yes | **⚖️ `[[needed]]`** | **⚖️ `[[US transfer]]`** |
| **Lovable AI gateway** | staff copilots (`counselor-coach`, `parent-coach`, `admin-insights`) | Staff-typed free-text (⚠️ may reference students) | Mitigated by UI guidance only (not enforced) | **⚖️ `[[clarify provider + needed]]`** | **⚖️ `[[mechanism]]`** |
| **O*NET (onet-proxy)** | Occupation reference data | None (occupation queries only) | n/a | **⚖️ `[[confirm none needed]]`** | n/a |

## Notes & decisions
- ⓘ Data-minimization status reflects current code: synthesis pseudonymous; parent-insight name
  withheld; `ai_logs` free-text redaction (C4); **staff copilots gated by UI guidance only** —
  **⚖️ decision needed** on whether they require a consent gate / further minimization.
- **⚖️ LEGAL DECISION:** sign DPAs with each sub-processor; confirm international-transfer mechanism
  for any sub-processor outside `[[PLACEHOLDER: jurisdiction]]`.
- Change-management: any **new** sub-processor requires register update + School notification per DPA §4.
