# DSAR / Export / Delete Procedure — Draft

> **DRAFT — requires review by qualified legal counsel before use.** Not legal advice.
> Operational procedure for data-subject access requests (access/export/erasure). Timelines and
> verification standards must be set by counsel. All `[[PLACEHOLDER]]`/`⚖️` require legal input.

## 1. Who can request
- The **student** (where assent-age allows). **⚖️ `[[PLACEHOLDER: age]]`**.
- A **parent/guardian on behalf of the minor** (primary route for minors).
- A **School admin** acting for the controller.

## 2. Parent-on-behalf-of-minor flow
1. Request received via `[[PLACEHOLDER: channel — school/portal/email]]`.
2. Confirm the requester is the **linked** parent/guardian (ⓘ `parent_students`).
3. **⚖️ Identity/authority verification** standard `[[PLACEHOLDER]]`.
4. Fulfil or refuse (with reason) within the response timeline.

## 3. Verification
- **⚖️ LEGAL DECISION:** acceptable verification method(s) to avoid unauthorized disclosure of a
  minor's data. `[[PLACEHOLDER]]`.

## 4. Export scope (access/portability)
- Structured export of the student's: identity/PII, assessment answers + results, AI-generated
  content. ⚠️ **Export feature not yet built** (gap → `feat/dsar-export-delete`).
- `[[PLACEHOLDER: format — e.g. JSON/PDF]]`.

## 5. Deletion
- ⓘ Technical hooks exist (`delete_user_rpc`, `gdpr_self_delete`).
- **Deletion limits:** records that must be retained for legal/record-keeping reasons are exempt —
  **⚖️ `[[PLACEHOLDER: exemptions]]`**.
- Flow-down deletion to sub-processors per DPA §7.

## 6. Timelines
- **⚖️ `[[PLACEHOLDER: DSAR response timeline]]`** (e.g. within N days) · acknowledgment SLA ·
  extension conditions.

## 7. Logging
Every DSAR is logged (requester, type, verification, action, date) for accountability.
