# RGKB Controlled Schema Specification — Step 6: Privacy, Safeguarding & Consequential Decision Governance — v0.1

- Phase: 7.1 — Controlled Schema Specification
- Step: 6 — Privacy, Safeguarding & Consequential Decision Governance
- Artifact type: Logical governance specification
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-24
- Controlling architecture: RGKB_Canonical_Entity_Model_v0.2.1
- Controlling foundation: Step 1 — Governed Object / Versioning / Referential / Lifecycle Substrate v0.1
- Controlling foundation: Step 2 — Knowledge Object / Evidence / Provenance / Citation Substrate v0.1
- Controlling foundation: Step 3 — Scientific Knowledge Governance v0.1
- Controlling foundation: Step 4 — Interpretation & Synthesis Governance v0.1
- Controlling foundation: Step 5 — Agent & Orchestration Integration v0.1
- Gate authority: Owner Gate 0 adjudication; Owner closure of Step 5 (merge commit
  `343e21ceb6784962a575400d78262e1b6a037393`); Owner authorization of Phase 6
  artifact development (MACRO AUTHORIZATION PACKAGE v0.1, 2026-08-24)
- Production status: NOT AUTHORIZED FOR PRODUCTION

This document is subordinate to the approved canonical entity model, to the owner
adjudications recorded in the Owner Gate 0 Adjudication Record, and to the accepted
Step 1–5 substrates. It specifies logical governance semantics only. It creates no
SQL, DDL, migration, Supabase, RLS, authentication, agent runtime, orchestration
runtime, external-system, or production authorization. Later physical implementation
MAY realize these semantics. It MUST NOT weaken, reinterpret, or bypass the
governance constraints stated here or in any document it is subordinate to.

## 1. Scope and Authority

### 1.1 What this document is

This document is an implementation-ready LOGICAL governance specification. It
specifies the Step 6 privacy, safeguarding, and consequential-decision governance
substrate that governs every already-governed layer Steps 1–5 establish: data-domain
classification; purpose and data-use authorization; the access/action/recipient
separation; minors' safeguards; data minimization, disclosure and retention; the
safeguarding-disclosure human-routing boundary; the general consequentiality
classification contract; meaningful human review and reviewer authority; the
consequential-use/human-decision boundary; the agent/tool/external-propagation
privacy boundary; auditability and authorization-change semantics; and the
failure/escalation/abstention contract that unifies all of the above with the
accepted Step 5 disposition set.

It is subordinate to `RGKB_Canonical_Entity_Model_v0.2.1`, and to the accepted Step
1–5 specifications, which remain controlling for their own layers.

Within that subordination, this document is authoritative for later Step 6 physical
realization unless superseded by a later controlled specification version.

### 1.2 What this document is not

This document is NOT:

- an authentication system, an authorization/RBAC/ABAC implementation, an IAM
  provider integration, or RLS policy code;
- a consent-storage schema, a safeguarding case-management tool, or a privacy-notice
  text;
- a database, migration, or Supabase configuration of any kind;
- an agent, an orchestration runtime, a tool integration, or an API contract;
- a legal or compliance determination for any jurisdiction; it invents no law and
  claims no jurisdiction-specific legal basis (§1.7);
- scientific, psychometric, rights, contextual, translation-fidelity, or safeguarding
  clearance evidence;
- production authorization for any of the above.

### 1.3 Specification is governance architecture, not compliance or clearance

The existence of this specification does NOT establish that any privacy control,
safeguarding process, consent mechanism, or consequential-decision process has been
built, is lawful, or is safe to run. It specifies how such acts are bounded,
classified, traced, and failed closed, if they are ever implemented. It authorizes
none of it.

Documentation completeness is not evidence completeness, and it is not legal or
compliance completeness (Step 3 §1.3, Step 4 §1.3, Step 5 §1.3, extended here to
privacy/safeguarding/legal compliance explicitly — §17 invariant 31).

### 1.4 Non-authorization boundary

This document grants no authorization for SQL, DDL, migrations, Supabase changes,
authentication, consent-storage mechanics, safeguarding-case-management software,
agent or orchestration runtime, tool integration, APIs, external side effects,
notification systems, scoring or assessment changes, production activation,
deployment, or student-data processing. The full list is stated in §21.

### 1.5 Relationship to the Step 1–5 substrates

Step 1 governs identity, versioning, and lifecycle. Step 2 governs knowledge,
evidence, and provenance. Step 3 governs scientific validation. Step 4 governs
interpretation and synthesis. Step 5 governs the agent/orchestration layer that
invokes all of the above.

Step 6 governs a materially different, cross-cutting question: irrespective of
whether a candidate act is scientifically valid, correctly interpreted, or correctly
orchestrated, is it a **privacy-authorized**, **safeguarding-compliant**, and
**non-consequential (or properly human-reviewed consequential)** act? Step 6 does not
re-derive scientific meaning, interpretation, or orchestration authority. It governs
the purpose, authorization, access, minors, safeguarding, and consequentiality
boundary that constrains every act Steps 1–5 already permit.

Step 6 introduces no second identity authority, no second versioning authority, no
second lifecycle authority, no second provenance authority, no second validation
truth store, no second claim taxonomy, and no second orchestration disposition
vocabulary. Where Step 6 relies on a governed instance, a claim, a role, a tier, or a
disposition, it carries the identity or classification Steps 1–5 already assign it
(§16).

Where this document and a controlling document appear to conflict, the conflict MUST
be reported and adjudicated, and MUST NOT be silently reconciled (§1.6).

### 1.6 Conflict and legal-authority discipline

Where a genuine conflict between this specification and Step 1–5 or the Canonical
Entity Model is discovered, it is reported here as OWNER ADJUDICATION REQUIRED
(§19.5) rather than silently reconciled. No such conflict was found in the
controlling sources during authoring of this version (§17.5 self-audit).

This document does NOT invent jurisdiction-specific legal obligations from general
knowledge. Scientific validity, privacy/data-use authority, legal rights, safeguarding
clearance, reviewer competence, and consequential-decision authority are six
distinct concepts (§3.3, §4.5) and none may be inferred from another. Where a
legal/compliance determination would be required and the controlling substrate
supplies none, that requirement is registered as a gap and the dependent path FAILS
CLOSED or is DEFERRED (§17 invariant 33; §20).

### 1.7 Normative language

The Step 1 §1.4 vocabulary applies unchanged, as carried by Step 2 §1.5, Step 3
§1.6, Step 4 §1.6 and Step 5 §1.6, with the additions required by Step 6 scope.

- **MUST / MUST NOT / SHOULD / MAY / FAIL CLOSED / ABSTAIN / ESCALATE** — as fixed by
  Step 5 §1.6, unchanged.
- **PURPOSE**, **DATA SCOPE**, **AUTHORIZED USE** — defined in §4.
- **BASE CONTENT DOMAIN** — exactly one of the seven base domains fixed in §3.1.1.
- **ORTHOGONAL CONTENT ATTRIBUTE** — zero or more of the applicable attributes fixed
  in §3.1.2 (identity-linked, safeguarding-relevant). A base content domain and its
  attributes are independent properties and MUST NOT be flattened into one combined
  domain vocabulary (§3.1).
- **CONSEQUENTIALITY CLASS** — the controlled classification a candidate output or
  use resolves to under the general contract of §9.
- **PRIVACY/SAFEGUARDING DETERMINATION DIMENSIONS** — the six independent,
  orthogonal controlled classifications defined in §14.2, each carrying its own
  privacy/safeguarding-specific outcome, kept separate from the Step 5 Governed
  Orchestration Disposition set and from one another.
- **SAFEGUARDING ROUTING CONDITION** — the governed trigger defined in §8.2 that
  requires routing to the responsible human safeguarding process.

No additional lifecycle, identity, evidence, validation, claim-taxonomy, or
orchestration-disposition vocabulary is defined in this document. That vocabulary
remains governed by Step 1–5.

## 2. Privacy / Safeguarding / Consequentiality Boundary

### 2.1 What Step 6 governs

Step 6 governs the boundary conditions that apply BEFORE any Step 1–5 act may
proceed to affect a real student, and the boundary that applies BEFORE any output
that pipeline produces may be put to consequential use.

It answers, for any proposed act: what data domain is being acted upon; for what
purpose; what kind of action is proposed; who/what may perform it; under what
authority; whether read/use/share/write/external-action permissions are distinct;
what additional minors' safeguards apply; how safeguarding-relevant disclosures are
routed without AI investigation; how consequentiality is classified; when meaningful
human review is mandatory and what it may and may not cure; what provenance must
survive; and what remains unauthorized.

### 2.2 What Step 6 does not govern

Step 6 does NOT govern:

- what any Step 4 interpretation or synthesis claim scientifically means (Step 4
  governs this unchanged);
- which agent role or orchestration stage produced a candidate (Step 5 governs this
  unchanged);
- the physical mechanics of authentication, consent capture, or safeguarding-case
  management (explicitly out of scope, §21);
- specific retention durations, jurisdiction-specific legal bases, or privacy-notice
  text (§1.6, §21).

### 2.3 The governing premise

A technically possible act is not an authorized act. Interpretive usefulness,
scientific validity, and orchestration eligibility are not privacy or data-use
authority. An agent, a platform role, or a human's convenience does not create
authorization that a governed determination has not established. Every section below
applies this premise to one facet of the privacy/safeguarding/consequentiality
boundary.

## 3. Data-Domain Classification and Boundary (R6.1)

### 3.1 Base content domain and orthogonal attributes

A content classification has two independent parts: a BASE content domain (§3.1.1),
which is exactly one of a fixed set of materially different record/content types,
and zero or more ORTHOGONAL content attributes (§3.1.2), which may apply to a base-
domain instance in combination. These two properties MUST NOT be flattened into one
"exactly one of N" list: a single piece of content routinely carries both a base
domain and one or more attributes at once (§3.1.2 gives a worked example).

#### 3.1.1 Base content domain

Every object or content an act touches belongs to exactly one of the following base
domains. None may be inferred from, substituted for, or silently promoted into
another.

| Base domain | What it is | Canonical? |
|---|---|---|
| **Canonical RGKB knowledge** | A governed instance under Step 1–3 | The only base domain that is canonical |
| **Operational assessment result** | A student's scored instrument result (Step 4 §3.2, Canonical Entity Model §3.3) | Never canonical (Canonical Entity Model invariant 9) |
| **Student/profile/context data** | Session, demographic, school-context, or other student-linked operational fact | Never canonical |
| **Generated student-specific output** | A Step 4 claim produced for a specific student — interpretation, synthesis, guidance, or recommendation (Step 4 §3.2, §6.2) | Never canonical (the invoked rule is canonical; the student-specific output is not) |
| **Human-review record** | An attributable review/decision event (Step 3 §3.1–§3.2) | Canonical only where it is itself a governed determination on a canonical subject (Step 3 §5); a review of student-specific output is operational |
| **Orchestration/runtime provenance** | The Step 5 Orchestration Event Record (Step 5 §5.2) | Never canonical (Step 5 §19.2) |
| **External/untrusted content** | Retrieved, uploaded, or externally supplied content not itself a governed instance (Step 5 §13.1) | Never canonical unless and until it becomes a properly governed knowledge object through the ordinary curation boundary (Canonical Entity Model §19), which this document does not authorize |

#### 3.1.2 Orthogonal content attributes

Independently of its base domain, content MAY carry either or both of the following
attributes. An attribute is a flag, not a base domain; it never substitutes for
base-domain classification and is never itself treated as an additional base domain.

- **Identity-linked.** The content is, or contains, a value that identifies or could
  reasonably identify a specific student. This attribute may apply to content in any
  non-canonical base domain.
- **Safeguarding-relevant.** The content indicates a possible safeguarding concern
  about a real, identifiable person. This attribute governs regardless of which base
  domain the content otherwise belongs to (§3.1.3).

Worked example: a student's own safeguarding disclosure, entered as free text,
simultaneously has base domain "student/profile/context data," carries the
identity-linked attribute, and carries the safeguarding-relevant attribute. All
three facts hold at once; none displaces another, and none is inferred from another.

#### 3.1.3 General safeguarding knowledge versus person-specific safeguarding content

The safeguarding-relevant attribute governs the CANONICAL-ELIGIBILITY consequence
differently depending on what it is attached to, and the distinction is load-bearing:

- **General governed safeguarding knowledge.** A guardrail, a scientific knowledge
  object, or a policy rule whose subject matter concerns safeguarding in the
  abstract — for example, a governed rule about how to phrase a safeguarding-adjacent
  explanation, or scientific literature about recognizing risk indicators — has base
  domain "Canonical RGKB knowledge." Its subject matter being safeguarding-related
  does NOT itself bar it from the ordinary controlled curation process (Canonical
  Entity Model §19). This document does not prohibit governed safeguarding-domain
  knowledge, guardrails, or scientific material from being canonical.
- **Person-specific safeguarding disclosure or case/runtime content.** Content
  carrying the safeguarding-relevant attribute AND concerning a real, identifiable
  person's actual situation MUST NOT become canonical RGKB knowledge under any
  circumstance, regardless of its base domain (§8.4).

The distinction is between what a rule is ABOUT (safeguarding as a subject —
permissibly canonical) and whose SITUATION it discloses (a real person's — never
canonical). Conflating the two is the specific failure mode §18.V analyzes.

### 3.2 No base domain becomes canonical merely by processing

None of the six non-canonical base domains becomes canonical RGKB knowledge merely
because it is processed, stored, retrieved, reviewed, cited, or output by an AI
system, an agent, or a human reviewer acting within this substrate. Canonical status
is conferred only through the bounded, authenticated, audited curation boundary of
Canonical Entity Model §19 — never as a side effect of use (§17 invariant 15, 16).

### 3.3 Six distinct authorities, restated

Scientific validity (Step 3), privacy/data-use authority (§4), legal rights (outside
this substrate's authority to grant, §1.6), safeguarding clearance (§6, §8), reviewer
competence (§10), and consequential-decision authority (§9, §11) are six distinct
concepts. None establishes another, and a determination on one dimension carries no
weight on any other (§17 invariant 10, 11).

### 3.4 Domain classification is a precondition, not an afterthought

Every act governed by §4 through §14 presupposes that its inputs and outputs have
been placed in exactly one base domain of §3.1.1, and that the orthogonal attributes
of §3.1.2 applicable to that content have been resolved. Where a base domain or an
applicable attribute cannot be established, the dependent act MUST FAIL CLOSED
(§14.4).

## 4. Purpose and Data-Use Authority (R6.2)

### 4.1 The fail-closed purpose contract

Data use depends on an authorized purpose. A proposed act is authorized only where
ALL of the following are established, conjunctively (no element compensates for
another, consistent with the independent-dimension gate pattern of Step 3 §4.3):

- **purpose** — the specific, stated reason the act is proposed;
- **data scope** — exactly which data domains and instances (§3) the act would touch;
- **actor/role** — which Step 5 role (Step 5 §4.2), human role, or platform identity
  is proposing the act;
- **proposed action** — which access/action category of §5.1 the act belongs to;
- **recipient/destination** — where relevant, who or what would receive the output
  of the act;
- **governing authorization state** — whether a governed authorization actually
  covers this purpose, this data scope, this actor, this action, and this recipient,
  together;
- **unresolved prerequisites** — none remain unresolved for the elements above.

### 4.2 A technically possible use is not an authorized use

Restated from §2.3 with operational force: the mere technical ability to read,
retrieve, compute over, or transmit data does not establish that doing so is
authorized. Absence of a governing authorization is not permission (§17 invariant
18, extending Step 1 §1.3 / Step 3 §1.3 / Step 4 §1.3 / Step 5 §8.3 to the purpose
layer).

### 4.3 Scientific validity and interpretive usefulness are not data-use authority

A scientifically valid, well-evidenced, or highly useful interpretation does not
thereby become authorized for any use beyond what its governing purpose actually
covers. Usefulness is not authority (§17 invariant 11).

### 4.4 No silent secondary-use authorization

Where data was accessed or used under one authorized purpose, that authorization
MUST NOT be treated as silently covering a different, later purpose. A new proposed
purpose requires its own governed authorization determination under §4.1, evaluated
independently of whatever purpose most recently authorized access to the same data
(§17 invariant 14; adversarial case C, §18.C).

### 4.5 No jurisdictional compliance claim

This section fixes a logical fail-closed contract for purpose-bound data use. It does
not determine, and does not claim to determine, compliance with any specific privacy
law, education-records law, or data-protection regime. Where such a determination is
required for an actual authorization decision, it is a prerequisite this
specification does not itself supply, and the dependent path FAILS CLOSED pending
it (§1.6, §17 invariant 33).

## 5. Access / Action / Recipient Separation (R6.3)

### 5.1 The action categories, mapped onto the Step 5 Tier model

The following nine action categories are logically distinct. This is a refinement of
the Step 5 §8.1 Tier model, not a competing one and not a redefinition of it: Phase 6
is not authorized to redefine or extend Step 5 Tier semantics (Step 5 §8.1 governs
what each Tier means, unchanged). Each category below is either mapped onto the
existing Step 5 Tier it belongs to, or explicitly identified as not currently mapped
to any existing Tier.

| Action | Step 5 Tier | Distinct authority required |
|---|---|---|
| **Read** | Tier 0 | Eligibility + purpose (§4) for the specific data read |
| **Compute/use** | Tier 0 | Same as read, plus the specific computation's own governance (Step 4 §6, Step 5 §9) |
| **Record operational provenance** | Tier 1 | Exactly what Step 5 §5.2 defines: the append-only Orchestration Event Record obligation; never a substitute for canonical writes, and never generic operational-data write permission |
| **Modify operational data** | Not mapped to an existing Step 5 Tier | A logically distinct action category from Tier 1, which means exactly the append-only recording obligation above and MUST NOT be treated as generic operational-data write permission. Where a later, separately authorized physical mechanism permits operational-data mutation, that mechanism requires its own explicit purpose-scoped authorization under §4 and its own implementation boundary; Phase 6 does not authorize it here (§16.3, §21). Absent a mapped, authorized implementation permission, this action MUST FAIL CLOSED (§14.4) |
| **Share/disclose** | Tier 3 | A distinct authorization from read or use; disclosure to a specific recipient requires that recipient be within the authorized purpose's recipient scope (§4.1) |
| **Export** | Tier 3 | A distinct authorization from share/disclose; export implies the data leaves the governed boundary entirely and requires its own explicit authorization |
| **Communicate** | Tier 3 | Communication "on behalf of" a person requires the same Tier 3 authorization Step 5 §8.1 already fixes, restated here for the privacy-specific case |
| **External-system action** | Tier 3 | Unchanged from Step 5 §8.1–§8.2; not authorized by this document |
| **Canonical-data mutation** | Tier 2 | Unchanged from Step 5 §8.1: never performed by an agent; the bounded curation boundary of Canonical Entity Model §19 only |

### 5.2 The four non-implication rules

Restating and generalizing Step 5 §8.4's read/write rule across the full action set:

- **READ MUST NOT imply WRITE.** Read authorization never confers modify or
  canonical-mutation authorization.
- **READ MUST NOT imply SHARE.** Read authorization never confers disclosure
  authorization.
- **READ MUST NOT imply EXPORT.** Read authorization never confers export
  authorization.
- **USE MUST NOT imply DISCLOSURE.** Authorization to compute over data for one
  purpose never confers authorization to disclose the result, or the data, to a
  recipient outside that purpose's authorized recipient scope.

No role, agent, or process may reinterpret authorization for one action category as
authorization for another, regardless of technical capability (Step 5 §8.4, extended
to the full action set; §17 invariant 12, 13).

### 5.3 Administrative role is not scientific, safeguarding, or consequential authority

An administrative or elevated platform role MUST NOT be treated as automatically
conferring scientific-review authority (Step 3 §8.2), safeguarding authority (§8),
or consequential-decision authority (§11). Each is independently determined; none is
inferred from platform privilege (§17 invariant 20; adversarial case B, §18.B).

### 5.4 What this section does not design

This section fixes logical authority boundaries only. It does not design RLS
policies, authentication mechanics, or any physical access-control implementation
(§21).

## 6. Minors / Guardian Permission / Student Assent / Confidentiality (R6.4)

### 6.1 Carried forward, not redesigned

This section carries forward, without weakening, Step 3 §15, Step 4 §12.6, and Step
5 §12 in full. It adds no new safeguarding mechanism and designs no mechanics for
collecting or storing permission or assent (§21).

### 6.2 Three distinct safeguards

Guardian permission, student assent, and communicated limits of confidentiality are
three logically distinct prerequisites. Restated from Step 4 §12.6 and Step 5 §12.2:

- **Applicable parent or guardian permission.** Where required by governing policy,
  its status is a precondition this specification does not itself establish or
  waive.
- **Applicable student assent.** A separate precondition from guardian permission;
  neither substitutes for the other, and the presence of one MUST NOT be read as
  evidence of the other (§17 invariant 17; adversarial cases D and E, §18.D–E).
- **Communicated limits of confidentiality.** A separate precondition from both of
  the above; its absence is not cured by the presence of guardian permission or
  student assent (adversarial case F, §18.F).

### 6.3 Absence is not permission

Where any of the three safeguards above is applicable and unresolved, its absence is
NOT permission to proceed. The dependent path MUST FAIL CLOSED, or MAY ESCALATE
where a responsible human process can resolve the precondition (§14.4; §17 invariant
18).

### 6.4 A minor's request for absolute confidentiality does not override safeguarding
routing

Where a participant under 18 requests that content be kept absolutely confidential,
and that content independently triggers the safeguarding routing condition of §8.2,
the routing obligation of §8 is NOT waived by the request. The confidentiality
safeguard of §6.2 governs ordinary confidentiality expectations; it does not create an
exception to the safeguarding-routing boundary, which exists precisely to protect the
minor (adversarial case G, §18.G).

### 6.5 What this section does not design

This section defines only the logical prerequisite and its fail-closed consequence.
It does not design consent-collection mechanics, assent-collection UI, or
confidentiality-notice delivery (§21).

## 7. Data Minimization / Disclosure / Retention Boundary (R6.5)

### 7.1 The minimization principle

A process may use only the data necessary for the authorized purpose (§4) and the
specific governed task at hand. This is a conjunctive requirement alongside every
other requirement of this specification, not a substitute for any of them.

### 7.2 What minimization governs

At minimum:

- **Unnecessary whole-profile retrieval.** A task requiring one data element MUST NOT
  retrieve an entire student profile merely because it is retrievable (adversarial
  case Q, §18.Q).
- **Unnecessary cross-student/cross-school access.** Access authorized within one
  school or one student's authorized scope MUST NOT extend to another school or
  student without its own separate authorization (adversarial case S, §18.S).
- **Disclosure to unintended recipients.** Governed by §5.2's disclosure rule; the
  recipient scope of the authorized purpose is the boundary (adversarial case U,
  §18.U).
- **External-tool propagation.** Governed jointly with §12; a tool receiving data
  because it technically can is not thereby authorized (adversarial case T, §18.T).
- **Retention beyond an authorized requirement.** Where no authorized retention rule
  exists, retention is not thereby indefinite; absence of a rule is not authorization
  to retain (§7.3).
- **Copying sensitive runtime information into canonical RGKB.** Absolutely
  prohibited; restated from §3.2 and Canonical Entity Model §22.1 (adversarial case
  V, §18.V).
- **Sensitive content appearing in generated explanations where not necessary.**
  Governed jointly with Step 4 §14 traceability and §13 of this document; an
  explanation MUST NOT include sensitive student or safeguarding content beyond what
  the explanation's own necessary traceability requires (adversarial case U, §18.U).

### 7.3 No invented retention schedule

This specification does NOT invent a jurisdiction-specific retention duration or
schedule. Where no authorized retention rule exists, the correct governed state is
**unresolved**, not indefinite retention and not immediate deletion; a
consequential-adjacent act depending on a resolved retention state MUST FAIL CLOSED
or ESCALATE to the process that can establish one (§17 invariant 33; adversarial
case R, §18.R).

## 8. Safeguarding-Relevant Disclosure and Human Routing (R6.6)

### 8.1 The absolute prohibition, restated without qualification

Restated from Step 3 §15, Step 4 §12.6, and Step 5 §12.2, and preserved here
absolutely: AI systems governed by this substrate MUST NOT:

- investigate suspected abuse;
- determine whether abuse occurred;
- adjudicate credibility of a disclosure;
- substitute for the responsible human safeguarding process.

No orchestration composition, no fluency, no confidence level, and no framing as
"just gathering information" creates an exception to this prohibition (§17 invariant
19; adversarial case H, §18.H).

### 8.2 The safeguarding routing condition

A SAFEGUARDING ROUTING CONDITION is the governed trigger recognized where content
processed by the substrate indicates a possible safeguarding concern about a
participant, under whatever recognition criteria a later, separately governed
specification fixes. This document does not design that recognition mechanism
(§8.5); it fixes only the machine boundary that applies once the condition is
recognized.

### 8.3 The machine boundary

```
DETECT/RECOGNIZE GOVERNED ROUTING CONDITION
  → STOP the ordinary automated path as required (do not continue ordinary
    interpretation/synthesis/guidance processing of the disclosure content as though
    it were routine input)
  → ROUTE / ESCALATE to the responsible human safeguarding process (ESCALATE per
    §14.1; safeguarding-routing dimension `SAFEGUARDING_ROUTE_TRIGGERED`, §14.2–§14.3)
  → DO NOT investigate, determine, or adjudicate the underlying facts (§8.1)
```

This is the entire machine-side obligation. Everything downstream of "route to the
responsible human safeguarding process" is the safeguarding-case workflow itself,
which this document does not design (§8.5).

### 8.4 Person-specific safeguarding content never becomes canonical knowledge

Content that triggers a safeguarding routing condition, or that otherwise discloses
or records a real, identifiable person's specific safeguarding situation, MUST NOT
enter the canonical RGKB substrate in any form — not as an example, not as evidence,
not as a citation, regardless of how scientifically relevant it might appear (§3.1.3,
§17 invariant 16).

This does not bar general governed safeguarding knowledge — guardrails, scientific
knowledge objects, or policy rules whose subject matter concerns safeguarding in the
abstract, with no real person's specific situation attached — from the ordinary
controlled curation process (§3.1.3, Canonical Entity Model §19).

### 8.5 What this section does not design

This section does not design the safeguarding-case workflow, the recognition
mechanism/model for routing conditions, notification mechanics, or any
case-management tooling. It does not make an AI agent the safeguarding officer, and
it does not authorize any of the above for implementation (§21).

## 9. Consequentiality Classification (R6.7)

### 9.1 Purpose

This section fixes a general, extensible logical contract for classifying
consequentiality by EFFECT AND USE, not by wording alone, and not by an enumerated
list treated as exhaustive. It is the central Phase 6 deliverable this specification
is required to treat as a major objective, and its relationship to finding F-11 is
adjudicated explicitly in §20.2.

### 9.2 Two classification dimensions, and the events each applies to

Consequentiality classification is not one flat lookup applied to one kind of act.
This document fixes two classification dimensions, and a candidate is classified
under exactly one of them at a time, according to WHICH KIND OF GOVERNED EVENT is
actually being classified:

- an ANTECEDENT OUTPUT-PRODUCTION event — the production of a Step 4 claim — is
  classified, PRIMARILY and controllingly, by its exact Step 4 §6.2 taxonomy row,
  and only SECONDARILY, where a controlling roll-up mapping exists, under the
  four-way roll-up of §9.3.1;
- a separate, later PROPOSED-USE event — a proposal to use an already-produced,
  permitted output for some purpose — is classified under the USE dimension of
  §9.3.2;
- the CONSEQUENTIAL DECISION itself is neither an output-type nor a use class; it is
  a distinct, always-prohibited determination/act, defined separately at §9.3.3.

"Exactly one class" (§9.3) applies only WITHIN the dimension applicable to the event
being classified, and, for an output-production event, within whichever layer
(primary Step 4 row, or secondary roll-up where one exists) is being consulted. It
does NOT mean a single act picks one class from a flattened list as though every
Step 4 taxonomy row, the roll-up buckets, and the two use classes were mutually
exclusive alternatives for the same event. An antecedent output and its later
proposed use are two distinct governed events, are classified independently, and
MUST NOT be collapsed into one classification (§11.2 restates this for the
consequential-use boundary specifically).

Within each applicable dimension, a candidate is classified by evaluating, together:

- **What the output IS** (output-production event only) — its exact Step 4 §6.2
  taxonomy row, and, where §9.3.1's roll-up resolves for that row, its roll-up
  bucket; or, for a non-Step-4 act, its data-domain and action classification (§3,
  §5);
- **What a proposed use is FOR** (use dimension only) — the purpose (§4.1) the use is
  proposed under;
- **What EFFECT a proposed use would have** (use dimension only) — whether the use
  would materially determine or control a status, opportunity, or outcome for a real
  person.

The effect test is the operative test for the USE dimension. Wording alone (how
cautious, how hedged, how "just information" a statement sounds) does NOT determine a
proposed use's consequentiality class; only the effect the use would actually have
does. This is the governing principle underlying §9.3.2 and the illustrative list of
§9.4.

### 9.3 The classification taxonomy

#### 9.3.1 Output classification (antecedent output-production events)

**Primary classification — the exact Step 4 taxonomy row.** Every antecedent output
produced under Step 4 is classified, first and controllingly, by its exact Step 4
§6.2 claim-taxonomy row: Direct result-derived statement, Construct-level
interpretation (carrying Scientifically supported interpretation as its governed
SUBTYPE, exactly as Step 4 §6.2 fixes it — never a standalone class and never an
informational/descriptive substitute for its parent row), Cross-assessment
synthesis (carrying Integrated profile claim as its governed subtype, Step 4 §11
via §6.2), Contextual inference, Contextual hypothesis, Developmental
interpretation, Inquiry signal, Discrepancy signal, Guidance statement, or
Recommendation. Phase 6 does NOT replace, compress, or redefine this taxonomy, does
NOT introduce a competing one, and does NOT remove or merge any row. "Unsupported
claim" remains, as Step 4 §6.5 fixes, never a producible output.

**Secondary roll-up (non-authoritative, consequentiality-facing convenience only).**
Where R6.7 needs the four coarser distinctions of informational/descriptive output,
interpretive output, bounded guidance, and bounded recommendation, the following is
the complete, explicit, deterministic mapping from every Step 4 row to a roll-up
bucket — or to an explicit non-mapping where no controlling source fixes one. No
row is silently omitted, and no bucket is guessed merely to appear complete:

| Step 4 §6.2 row | Phase 6 roll-up bucket |
|---|---|
| Direct result-derived statement | Informational/descriptive output |
| Construct-level interpretation (incl. Scientifically supported interpretation subtype) | Interpretive output |
| Cross-assessment synthesis (incl. Integrated profile claim subtype) | Interpretive output |
| Guidance statement | Bounded guidance |
| Recommendation | Bounded recommendation |
| Developmental interpretation | **ROLL-UP UNRESOLVED** — no controlling mapping; classify directly under §9.2's effect-and-use test against this exact row |
| Contextual inference | **ROLL-UP UNRESOLVED** — same treatment |
| Contextual hypothesis | **ROLL-UP UNRESOLVED** — same treatment |
| Inquiry signal | **ROLL-UP UNRESOLVED** — same treatment |
| Discrepancy signal | **ROLL-UP UNRESOLVED** — same treatment |
| Unsupported claim | Not applicable — never a producible output (Step 4 §6.5); not classified |

Where the roll-up is UNRESOLVED for a row, that row is NOT thereby ungoverned or
untraceable: it remains fully governed by its own exact Step 4 requirements, and its
consequentiality is determined directly by applying §9.2's effect-and-use test to
that exact row, without the roll-up as an intermediate step. Contextual inference,
Contextual hypothesis, Developmental interpretation, Inquiry signal, and Discrepancy
signal each remain fully traceable under Step 4 §14 regardless of whether the
roll-up resolves for them; the roll-up is a consequentiality-facing convenience
layer only, never a substitute for, and never a narrowing of, Step 4's own
taxonomy or traceability requirement.

Every roll-up-resolved bucket carries the governed treatment: **Informational/
descriptive output** and **Interpretive output** are ordinarily permitted, subject to
every other Step 1–6 requirement (and, for interpretive output, Step 4's own
boundary); **Bounded guidance** is ordinarily permitted subject to Step 4 §12.2's own
bounds; **Bounded recommendation** is permitted only within Step 4 §12.3's explicit
conditions.

#### 9.3.2 Use classification (separate, later proposed-use events)

A proposed use of an already-produced, permitted output resolves to exactly one of
the following two classes. This classification is independent of, and does not
alter, the antecedent output's own §9.3.1 class:

| Class | Definition | Governed treatment |
|---|---|---|
| **Consequential-adjacent use** | A proposed use whose effect on a materially consequential outcome cannot yet be ruled out | ESCALATE; automated consequential use FAILS CLOSED pending classification (§14.4) |
| **Consequential use** | A proposed use that WOULD materially determine or control a status, opportunity, or outcome, using an otherwise-permitted antecedent output | Requires the human-governed process and meaningful review of §11 BEFORE the use; the antecedent output's own eligibility is unaffected — only its consequential USE is gated (§11.2) |

#### 9.3.3 The consequential decision (a separate, always-prohibited act)

The consequential decision itself (Step 4 §3.2, §12.4) is not an output-type class
and not a use class. It is the determination/act a consequential use would
culminate in if performed by this substrate. It is categorically prohibited as
automated output, absolutely, under all circumstances (§11.1) — it is never a
permitted outcome of either classification dimension above.

This taxonomy is a controlled classification, orthogonal to the Step 4 §6.2 claim
taxonomy (which classifies the STATEMENT) and orthogonal to the Step 5 §10.3
disposition set (which classifies the ORCHESTRATION OUTCOME).

### 9.4 Illustrative, non-exhaustive material-effect cases

A use is at minimum a candidate for "consequential use" or "consequential decision"
where it is proposed to materially determine or control:

- admission or rejection;
- educational placement or academic tracking;
- discipline or exclusion;
- employment or dismissal;
- eligibility for a program, service, or benefit;
- access to opportunity;
- access to a resource or service;
- a fixed occupational assignment;
- any other materially consequential status or opportunity outcome for a real
  person.

This list illustrates the EFFECT test of §9.2; it is not the definition, and it does
not limit the definition. A use materially controlling an outcome not on this list is
still consequential use or a consequential decision if it satisfies §9.2's effect
test (§9.6).

### 9.5 Unresolved classification fails closed

Where a candidate's classification under §9.2–§9.3 cannot be resolved, the dependent
path MUST FAIL CLOSED against automated consequential use, and the process MAY
ESCALATE to appropriate human review/classification (§14.4; adversarial case L,
§18.L). The classification is never resolved by defaulting to the least restrictive
class, by majority agreement among agents, or by model confidence (Step 5 §10.2,
extended here).

### 9.6 A general rule, not only a domain list

The requirement of §9.2's effect-and-use test is designed to remain evaluable for a
case not on the §9.4 list: does the proposed use materially determine or control a
status, opportunity, or outcome for a real person? Where that question cannot be
answered from governed facts, §9.5's fail-closed rule applies regardless of whether
the case resembles anything on the illustrative list.

## 10. Meaningful Human Review and Reviewer Authority (R6.8)

### 10.1 Carried forward and unified

This section carries forward Step 3 §8, Step 4 §12.5, and Step 5 §11.2 without
modification, and states the unified minimum requirement that applies across every
review this substrate requires — scientific, interpretive, safeguarding-routing, and
consequential-use review alike.

### 10.2 The five required elements

Meaningful human review requires, conjunctively:

- an identified, attributable human authority (Step 3 §8.3);
- competence appropriate to the specific dimension, claim, or decision at issue —
  never merely a general platform role (Step 3 §8.2, §8.4; §5.3 of this document);
- genuine ability to change, reject, withhold, or request further inquiry — never a
  rubber stamp (Step 4 §12.5; adversarial case N, §18.N);
- a recorded review method/event, not inferred from role or outcome (Step 3 §9.1);
- access to the evidence and provenance actually necessary for the review — a
  reviewer without access to the governed record cannot meaningfully review it
  (extending Step 4 §14.4's reviewer-understanding requirement to this layer).

### 10.3 Absence and simulation

A platform role alone is not reviewer competence (§5.3, restated). A rubber stamp is
not meaningful review (§10.2, restated). Absence of a human response is not approval
(Step 5 §11.5, restated). An automated system MUST NOT be recorded as, or simulate,
the human reviewer for any review this substrate requires (Step 3 §8.5, Step 5 §11.4,
restated absolutely; adversarial case O, §18.O for competence specifically).

## 11. Consequential Use / Human Decision Boundary (R6.9)

### 11.1 The absolute floor, preserved exactly

Preserving the accepted Step 5 §9.5/§11.3 distinction exactly and without
modification:

A machine-produced consequential-decision candidate (§9.3.3) MUST FAIL
CLOSED, absolutely and unconditionally. Human review of that candidate does NOT cure
or authorize it. The surrounding request MAY instead be routed — ESCALATE — to an
independent, human-controlled decision process, which makes its own determination
rather than approving the agent's candidate (Step 5 §11.3, carried unchanged).

### 11.2 Consequential use of a permitted antecedent is a separate, later act

A permitted interpretation, synthesis, guidance, or bounded recommendation MAY later
be contemplated for consequential use (§9.3.2's "consequential use" class). That later
use requires the appropriate human-governed process and meaningful review under §10,
BEFORE the use, not after.

The antecedent informational/interpretive/guidance/recommendation output and the
later consequential act are two distinct governed events. They MUST NOT be collapsed
into one concept: the antecedent remains a permitted, eligible Step 4 output in its
own right; only its onward consequential USE is gated by this section (adversarial
case P, §18.P; case M for the failure mode where this separation is ignored, §18.M).

### 11.3 Under-18 restated

For a participant under 18, no consequential decision may be made solely by an
automated system, under any circumstance (Step 3 §15, Step 4 §12.6, Step 5 §12.2,
carried unchanged). This is additional to, not a relaxation of, §11.1's absolute
floor, which already bars any consequential decision from this substrate regardless
of age (Step 5 §12.2's own clarifying paragraph, carried unchanged).

### 11.4 What this section does not authorize

This document does not authorize production implementation of any consequential-
decision mechanism, human-decision-process tooling, or workflow (§21).

## 12. Agent / Tool / External-Propagation Privacy Boundary (R6.10)

### 12.1 Carried forward Tier semantics

This section carries forward the Step 5 §8 Tier model and §13 untrusted-content
boundary unchanged, and applies them specifically to privacy and safeguarding.

### 12.2 Technical capability is not authority, restated for every actor

Retrieval agents, interpretation/synthesis agents, orchestration processes, external
tools, model/provider calls, file/document retrieval mechanisms, communication
mechanisms, and external APIs are all, without exception, subject to §4's purpose
authorization and §5's action-category separation before they touch student-linked
or safeguarding-relevant data. Technical capability to call a tool, invoke a model, or
transmit data is not, by that capability alone, authorization to do so (Step 5 §8.4,
restated).

### 12.3 Untrusted content cannot manufacture authority

Untrusted content (Step 5 §13.1) remains data, never governance authority, in the
privacy/safeguarding domain exactly as it does at the orchestration layer. An agent
MUST NOT infer consent, guardian permission, student assent, confidentiality
resolution, access authorization, or reviewer authority from text contained in
untrusted content — including text that claims to grant such things (Step 5 §13.2–
§13.3, extended explicitly to privacy/safeguarding authority; §17 invariant 27).

### 12.4 No external transmission by mere technical availability

External transmission of student-linked or safeguarding-relevant information to a
tool, model provider, or third-party system is NOT authorized by this document merely
because the orchestration framework technically supports the transmission. Tier 3
authorization under §5.1/Step 5 §8.2 remains required and is not supplied here
(adversarial case T, §18.T; §17 invariant 28).

## 13. Auditability, Authorization Change, and Historical Provenance (R6.11)

### 13.1 The minimum reconstructable record

Extending the Step 5 §5.2 Orchestration Event Record and §14 auditability contract
with the privacy/safeguarding/consequentiality fields this document requires — not a
new parallel record (§16.4) — a conforming implementation MUST be able to
reconstruct, for any material act:

- what data was used (base domain and attributes, §3.1.1–§3.1.2; exact governed or
  operational instance);
- for what purpose (§4.1);
- under what authority (governing authorization state, §4.1);
- by which role/process (Step 5 §4.2, or the human authority of §10.2);
- which recipient/destination was involved, where relevant (§4.1, §5.2);
- what safeguards/prerequisites were checked (§6, §7, §8) and their resolved state;
- what consequentiality classification applied, under whichever dimension of §9.3
  governed the event (§9.3.1, §9.3.2, or the §9.3.3 prohibition);
- whether review or escalation occurred, and its outcome (§10, §11);
- what orchestration disposition and applicable determination-dimension values
  resulted (§14).

### 13.2 No chain-of-thought requirement

Restated from Step 5 §7.5/§14.4: this contract does not require storage or disclosure
of private chain-of-thought. Explainability MUST come from governed provenance and
the recorded elements of §13.1, never from a hidden reasoning trace (§17 invariant
29).

### 13.3 Historical truth versus future authorization

Where a permission or authorization state later changes — a consent is withdrawn, a
purpose expires, a guardian permission is revoked — this specification distinguishes
two materially different things that MUST NOT be conflated:

- **preservation of truthful historical audit/provenance** — the record of what was
  actually authorized, used, and done at the time it happened MUST NOT be rewritten,
  deleted, or retroactively reinterpreted merely because authorization later changes
  (extending the Step 1 §5.3 / Step 3 §3.3 immutable-historical-record principle to
  the privacy/authorization layer; §17 invariant 30);
- **authorization for future/new use** — a changed authorization state governs only
  acts proposed AFTER the change; it does not retroactively make what already
  happened governed-authorized or governed-unauthorized under this substrate's own
  authorization record, and it does not, by having existed once, authorize continued
  processing after it lapses (adversarial case J, §18.J).

This is a governance-record distinction only. This specification makes no
determination, and claims no authority to determine, whether any past or present
processing was or is lawful under any applicable law — that determination, where
required, remains the external legal/compliance prerequisite of §1.6 and §4.5, which
this document does not itself supply.

### 13.4 No inferred continuity of authorization

That an act was recorded as governed-authorized in the past does not, by itself,
establish that continued processing is currently governed-authorized. Each act is
evaluated against the governed authorization state that actually holds at the time
of that act (§4.4, restated for the temporal dimension). As in §13.3, this is a
statement about this substrate's own authorization record, not a determination of
legal lawfulness (§1.6, §4.5).

## 14. Failure / Escalation / Abstention Contract (R6.12)

### 14.1 Reuse, not a competing vocabulary

This section reuses the accepted Step 5 §10.3 Governed Orchestration Disposition set
in full: PROCEED, QUALIFY, PRESERVE DISCREPANCY, REQUEST INQUIRY, RETAIN MULTIPLE
HYPOTHESES, ESCALATE, ABSTAIN, FAIL CLOSED. Step 6 creates no competing orchestration
disposition vocabulary.

### 14.2 Six independent, orthogonal privacy/safeguarding determination dimensions

Where Step 6 needs privacy/safeguarding-specific classification state, that state is
kept orthogonal to the Step 5 orchestration disposition of §14.1 — and is NOT a
single flat state either. Multiple Phase 6 determinations routinely apply to the
same step simultaneously (a step can be purpose-authorized, within access scope, and
pending consequentiality resolution all at once), so this section fixes SIX
independently named determination dimensions rather than one master vocabulary.
None of these dimensions is a governed family (§19.4); each is a controlled
classification attached to a step.

Each dimension resolves independently to one of its own values. A dimension that
genuinely does not apply to a given step (per the row/purpose-conditioned model of
§15.2) resolves to `NOT_APPLICABLE` — a governed negative determination, never
fabricated merely to complete the set.

**1. Purpose authorization** (§4.1): `PURPOSE_AUTHORIZED` (§4.1's conjunctive test is
satisfied) | `PURPOSE_NOT_AUTHORIZED` (the test has been evaluated and affirmatively
fails) | `PURPOSE_UNRESOLVED` (an element of §4.1 cannot yet be established) |
`NOT_APPLICABLE`. `PURPOSE_NOT_AUTHORIZED` and `PURPOSE_UNRESOLVED` MUST NOT be
collapsed into one value — an affirmative denial and an unresolved status are
materially different facts, consistent with the unknown/unresolved/conflicting
distinctions already fixed at every other layer of this substrate (Step 2 §8.4,
Step 3 §4.4).

**2. Action/access scope** (§5): `ACCESS_WITHIN_SCOPE` | `ACCESS_OUT_OF_SCOPE` (the
action has been evaluated and affirmatively exceeds the authorized purpose's scope)
| `ACCESS_UNRESOLVED` (scope cannot yet be established) | `NOT_APPLICABLE`.

**3. Minors/safeguard prerequisites** (§6): `SAFEGUARD_SATISFIED` | `SAFEGUARD_NOT_
SATISFIED` (an applicable safeguard has been evaluated and is affirmatively absent —
for example, guardian permission was explicitly withheld) | `SAFEGUARD_UNRESOLVED`
(status cannot yet be established) | `NOT_APPLICABLE` (no §6 safeguard applies —
for example, the content is not student-linked at all).

**4. Safeguarding routing condition** (§8.2): `SAFEGUARDING_ROUTE_TRIGGERED` |
`SAFEGUARDING_ROUTE_NOT_TRIGGERED` | `SAFEGUARDING_ROUTE_UNRESOLVED` |
`NOT_APPLICABLE` (the content carries no safeguarding-relevant attribute at all,
§3.1.2). Because under-recognition here is the more dangerous failure mode, an
unresolved determination on this dimension alone is treated as triggering for
routing purposes (§14.3) — the single deliberate exception to this section's
general unresolved-is-not-a-pass rule, justified by the safeguarding-conservatism
principle already fixed at §8 and the minors' invariants of Step 3/4/5.

**5. Consequentiality resolution** (§9): `CONSEQUENTIALITY_RESOLVED` (the applicable
§9.3.1/§9.3.2/§9.3.3 class is established as a separate, additional recorded fact,
never encoded into this dimension's own value) | `CONSEQUENTIALITY_UNRESOLVED` |
`NOT_APPLICABLE` (no consequential use is proposed and no class-level evaluation is
required for this step, §9.6, §15.2).

**6. Human-review sufficiency** (§10): `REVIEW_MEANINGFUL` (the §10.2 five-element
test is satisfied) | `REVIEW_INSUFFICIENT` (a review occurred but fails the test —
for example, a rubber stamp, §18.N) | `REVIEW_NOT_PERFORMED` (no review event exists
yet for a step that requires one) | `NOT_APPLICABLE`.

A step's full governed outcome is the Step 5 orchestration disposition TOGETHER WITH
every applicable dimension's independently resolved value above — never a single
collapsed master state, and never a weighted, aggregate, summary, composite, or
precedence score across the dimensions. Each dimension is evaluated, recorded, and
consulted on its own terms, consistent with the axis-independence principle already
fixed at Step 1 §8.5 and the no-aggregation principle of Step 4 §7.2, both restated
here for the privacy/safeguarding layer.

### 14.3 Minimum binding rules

At minimum, the following bindings hold between a dimension's resolved value and its
required disposition:

- `PURPOSE_NOT_AUTHORIZED` or `PURPOSE_UNRESOLVED`, or `ACCESS_OUT_OF_SCOPE` or
  `ACCESS_UNRESOLVED` → **FAIL CLOSED** on the proposed act;
- an unresolved required authorization that a responsible human process CAN resolve →
  **ESCALATE**; where no such process is available or invoked → **FAIL CLOSED**;
- a prohibited automated consequential-decision candidate (§9.3.3) → **FAIL CLOSED**,
  absolutely, per §11.1 (never merely ESCALATE on the candidate itself, per the Step
  5 §11.1/§11.3 pattern this document carries forward);
- `CONSEQUENTIALITY_UNRESOLVED` → automated consequential use **FAILS CLOSED**, and
  the surrounding request MAY **ESCALATE**;
- `SAFEGUARDING_ROUTE_TRIGGERED`, or `SAFEGUARDING_ROUTE_UNRESOLVED` (treated as
  triggering per §14.2's conservatism exception) → **ESCALATE** to the responsible
  human safeguarding process, never automated investigation (§8.3);
- `REVIEW_INSUFFICIENT` or `REVIEW_NOT_PERFORMED`, where review is required →
  **ESCALATE** or **FAIL CLOSED**, per whether a responsible reviewer can be engaged;
- `SAFEGUARD_NOT_SATISFIED` or `SAFEGUARD_UNRESOLVED` → **FAIL CLOSED** or
  **ESCALATE**, never assumed satisfied.

These bindings apply per dimension. Where more than one dimension resolves to a
FAIL-CLOSED-requiring value simultaneously, the act still simply does not proceed;
no ranking, precedence, or "worst dimension wins" computation is performed or
required — FAIL CLOSED from any one applicable dimension is already sufficient and
final for that act.

### 14.4 The general fail-closed rule

Where any element required by §3 through §13 cannot be established, the dependent act
MUST FAIL CLOSED. FAIL CLOSED carries the same meaning fixed throughout this
substrate: the dependent action does not proceed; nothing is deleted, rewritten, or
retroactively altered; every governed and operational record remains resolvable
exactly as it was (Step 1 §10, Step 5 §10.3).

No majority vote, model confidence, convenience heuristic, administrative privilege,
or "best available" assumption cures a failed prerequisite under this section (Step
5 §10.2, extended; §17, "no invariant may be weakened").

## 15. Logical Reference Architecture

### 15.1 The reference pipeline

```
REQUEST
  → PURPOSE CLASSIFICATION                         (§4)
  → DATA / CONTENT CLASSIFICATION                   (§3)
  → AUTHORITY / ACCESS / USE CHECK                   (§4, §5)
  → MINORS / PRIVACY / SAFEGUARDING PRECONDITIONS     (§6, §7, §8)
  → GOVERNED RETRIEVAL / INTERPRETATION / SYNTHESIS   (Step 4, Step 5, as applicable)
  → CONSEQUENTIALITY CLASSIFICATION                   (§9)
  → GUARDRAIL / SAFETY EVALUATION                     (Canonical Entity Model §16.3)
  → HUMAN REVIEW / SAFEGUARDING ROUTING / ESCALATION  (§8, §10, §11, as required)
  → PERMITTED RENDERED OUTPUT OR FAIL-CLOSED OUTCOME
```

### 15.2 Shorter, purpose-conditioned paths are required

Not every request traverses every stage. A stage is traversed only where it is
applicable to the request's actual purpose, data scope, and content:

- a request with no safeguarding-relevant content does not traverse the safeguarding-
  routing stage (§8) at all — that stage is not forced onto a request where no
  routing condition exists;
- a request proposing no consequential use does not require full consequentiality
  classification beyond what is needed to confirm the use is not consequential —
  classification is performed only to the extent genuinely required to decide
  whether the use is consequential (§9.5), never as a mandatory full-depth
  classification of every request;
- a purely informational, non-student-linked retrieval still performs the minimum
  required data/content classification of §3 (base domain, and whether the
  identity-linked or safeguarding-relevant attributes apply) — that stage is never
  skipped — but, once §3 classification establishes the content is not
  student-linked and carries neither attribute, the request legitimately proceeds
  through only purpose classification and the access check, with no
  minors/safeguarding/consequentiality stage engaged.

Forcing every request through every stage is itself a governance defect: it would
manufacture applicability the row/purpose-conditioned model of this specification and
of Step 4 §3.4/§14.2 explicitly prohibits fabricating.

### 15.3 Provenance propagation

Provenance and every applicable determination dimension's resolved value (§14.2)
propagate through every stage actually traversed, via the same Orchestration Event
Record Step 5 §5.2 already defines, extended per §16.4.

### 15.4 No authorization of implementation

Depicting this pipeline does not authorize building it (§21).

## 16. Step 1–5 Integration Contract

### 16.1 No competing authority

Every Step 6 concept that references a governed instance, a claim, a role, a tier, or
a disposition carries the identity or classification Steps 1–5 already assign it.
Step 6 introduces no second identity authority, versioning authority, lifecycle
authority, provenance authority, validation truth store, claim taxonomy, or
orchestration disposition vocabulary (§1.5, restated).

### 16.2 Step 1–4 semantics inherited unchanged

Pattern A/B semantics, immutability, the four lifecycle axes, the referential
invariants, the validation dimensions and determination substrate, and the full Step
4 claim taxonomy, construct firewall, and guidance/recommendation/consequential-
decision boundary are inherited unchanged. Step 6 defines no additional immutability
boundary and creates no exception to any of them.

### 16.3 Step 5 semantics inherited unchanged

Specifically preserved without modification:

- the Step 5 agent authority boundary (Step 5 §3) remains controlling;
- the Orchestration Event Record remains operational/runtime provenance, never
  canonical RGKB (Step 5 §5.2, §19.2; extended, not replaced, by §13.1 of this
  document);
- Step 5 Tier 0–3 semantics are not silently redefined or extended — §5.1 of this
  document maps each action category onto an existing Tier where one applies, and
  explicitly leaves "modify operational data" unmapped and fail-closed rather than
  stretching Tier 1 to cover it (§5.1);
- untrusted content remains data, never orchestration or privacy/safeguarding
  authority (Step 5 §13, extended by §12.3 of this document);
- no private chain-of-thought requirement is introduced (Step 5 §7.5/§14.4, §13.2 of
  this document);
- multi-agent majority agreement creates no authority (Step 5 §10.2, restated at
  §9.5 for consequentiality specifically);
- machine confidence creates no authority (Step 5 §10.2, restated throughout);
- no orchestration shortcut may produce an output Step 4 or Step 5 forbids (Step 5
  §9.3, unaffected by Step 6);
- candidate-level FAIL CLOSED and request-level ESCALATE remain distinct (Step 5
  §11.1/§11.3, carried forward exactly at §11.1/§14.3 of this document);
- a machine-produced consequential-decision candidate remains absolutely prohibited
  (Step 5 §9.5, §11.1 of this document);
- the responsible human process is independent of, and does not approve, the
  prohibited machine candidate (Step 5 §11.3, §11.1 of this document).

### 16.4 New Step 6 vocabulary is cross-mapped, not competing

Every new controlled classification this document introduces is explicitly cross-
mapped to the Step 5 substrate:

- each action category of §5.1 is mapped onto an existing Step 5 Tier only where the
  accepted Step 5 Tier semantics actually apply (§5.1's table); "modify operational
  data" remains explicitly unmapped to any existing Tier, no new Tier is created, and
  Tier 1 is not extended to cover it — absent a later, separately authorized
  implementation boundary, that action FAILS CLOSED (§5.1, §16.3);
- the six privacy/safeguarding determination dimensions of §14.2 are explicitly
  orthogonal to, and carried alongside (never replacing), the Step 5 §10.3
  disposition, and are independent of one another as well (§14.2);
- the §13.1 auditability field set is an EXTENSION of the existing Step 5 §5.2
  Orchestration Event Record — the same single record, carrying additional required
  fields — not a second, parallel record (§19.3).

### 16.5 Prohibited redefinitions

Step 6 MUST NOT, and does not: redefine governed instance/object/version/record;
alter registry membership, pattern classification, or immutability boundaries; alter
Step 1–5's fail-closed rules; alter the Step 4 claim taxonomy or the Step 5
disposition set; reclassify any family between Pattern A and Pattern B; or close,
downgrade, or reinterpret any finding Steps 3–5 already closed (§20.1). Where a
genuine conflict is discovered, it is reported per §1.6 and not silently reconciled.

## 17. Phase 6 Invariants Preserved

This specification preserves the controlling scientific, governance, and safety
invariants. No invariant may be weakened by user intent, convenience, model
confidence, administrative privilege, or orchestration composition.

| # | Invariant | Enforced by | Upstream source |
|---|---|---|---|
| 1 | Agent-generated output is not canonical knowledge merely because it was generated | §3.2 | Step 5 §3.3, invariant 1 |
| 2 | Agent confidence is not scientific authority | §9.5 | Step 5 invariant 2 |
| 3 | Retrieval is not validation | §12.1 (Step 5 §7.1 carried) | Step 5 invariant 3 |
| 4 | RIASEC interest is not ability, intelligence, competence, or achievement | §16.2 (inherited) | Step 4 §5.2, invariant 1 |
| 5 | No deterministic grade → developmental-stage mapping | §16.2 (inherited) | Step 4 §9.4, invariant 2 |
| 6 | No master validation score, student score, or career-fit composite | §16.2 (inherited) | Step 4 §7.2, invariant 3 |
| 7 | Self-efficacy remains process/intervention/outcome and never a seventh peer channel | §16.2 (inherited) | Step 4 §5.8, invariant 4 |
| 8 | Complementary assessment channels remain non-additive | §16.2 (inherited) | Step 4 §7.3–§7.4, invariant 5 |
| 9 | Discrepancy remains visible and is not averaged away | §16.2 (inherited) | Step 4 §8.5–§8.6, invariant 6 |
| 10 | Scientific validity is distinct from privacy/data-use authority | §3.3, §4.3 | New synthesis at Step 6; grounded in Step 3 §4.2 |
| 11 | Scientific validity does not create legal/data-use rights | §4.3, §4.5 | Step 4 invariant 10; Step 3 §4.2 |
| 12 | Read authority is not write authority | §5.2 | Step 5 invariant 17, generalized |
| 13 | Read authority is not share/export authority | §5.2 | New at Step 6, extending Step 5 invariant 17 |
| 14 | Prior authorized use does not silently authorize a new purpose | §4.4 | New at Step 6 |
| 15 | Student/runtime data do not become canonical knowledge | §3.2 | Step 5 invariant 14 |
| 16 | Person-specific safeguarding content does not become canonical knowledge merely by entering the pipeline; general governed safeguarding knowledge is not barred from ordinary curation on that basis alone | §3.1.3, §8.4 | New at Step 6, grounded in Step 5 §12.2 |
| 17 | Guardian permission and student assent are distinct | §6.2 | Step 4 §12.6, Step 5 §12.2 |
| 18 | Absence of a required safeguard is not permission | §6.3 | Step 4 §12.6, Step 5 §12.2 |
| 19 | AI does not investigate or determine suspected abuse | §8.1 | Step 3 §15, Step 4 §12.6, Step 5 §12.2 |
| 20 | A platform role is not reviewer competence | §5.3, §10.3 | Step 3 §8.2 |
| 21 | Human review must be meaningful, attributable, and non-ceremonial | §10.2 | Step 4 §12.5, Step 5 §11.2 |
| 22 | Machine-produced consequential-decision candidates fail closed absolutely | §11.1 | Step 5 §9.5, §11.3 |
| 23 | Human review does not cure a prohibited machine-produced consequential candidate | §11.1 | Step 5 §11.3 |
| 24 | Later consequential use of otherwise-permitted output is a separate governed act | §11.2 | New at Step 6, extending Step 4 §12.5 |
| 25 | For under-18 participants, no consequential decision is made solely by an automated system | §11.3 | Step 3 §15, Step 4 §12.6, Step 5 §12.2 |
| 26 | Unresolved consequentiality fails closed against automated consequential use | §9.5 | New at Step 6 |
| 27 | Untrusted content cannot elevate itself into privacy, safeguarding, or orchestration authority | §12.3 | Step 5 §13.2–§13.3, extended |
| 28 | Technical tool capability is not data-use authority | §12.2, §12.4 | New at Step 6, extending Step 5 §8.4 |
| 29 | Explainability comes from provenance, not fabricated narrative or chain-of-thought | §13.2 | Step 4 §14.5, Step 5 §14.5 |
| 30 | Historical audit truth is not rewritten when future authorization changes | §13.3 | New at Step 6, extending Step 1 §5.3 |
| 31 | Documentation completeness is not evidence or compliance completeness | §1.3 | Step 4 §1.3, Step 5 §1.3, extended |
| 32 | Georgian contextual relevance remains distinct from translation fidelity | §16.2 (inherited) | Step 4 §13.1–§13.3, invariant 11 |
| 33 | Phase 6 does not itself claim jurisdiction-specific legal compliance | §1.6, §4.5 | New at Step 6 |
| 34 | Phase 6 does not authorize production student-data processing | §1.4, §21 | Step 5 §1.4, extended |
| 35 | Phase 6 does not authorize production consequential-decision execution | §11.4, §21 | Step 5 §1.4, extended |

## 18. Adversarial / Counterexample Analysis

**A. A counselor with read access attempts to export or share a profile externally.**
Violation: §5.2's read≠share/export rule. Controlling rule: §5.1, §5.2. Disposition:
**FAIL CLOSED** on the export/share act. MUST NOT: treat read authorization as
covering export or disclosure.

**B. An administrator is assumed to have scientific reviewer competence solely from
role.**
Violation: §5.3/§10.2's competence-is-not-role rule. Controlling rule: §5.3, §10.2.
Disposition: **FAIL CLOSED** on any review relying on that assumed competence; role
alone never establishes it.

**C. Career-guidance data is reused for an unrelated purpose without new
authorization.**
Violation: §4.4's no-silent-secondary-use rule. Controlling rule: §4.1, §4.4.
Disposition: **FAIL CLOSED** on the new purpose absent its own authorization.

**D. Guardian permission exists; student assent is absent.**
Violation: §6.2's distinctness rule. Controlling rule: §6.2, §6.3. Disposition:
**FAIL CLOSED** or **ESCALATE**; guardian permission does not substitute for assent.

**E. Student assent exists; guardian permission is absent.**
Violation: symmetric to D. Controlling rule: §6.2, §6.3. Disposition: **FAIL CLOSED**
or **ESCALATE**; assent does not substitute for guardian permission.

**F. Required confidentiality limits have not been communicated.**
Violation: §6.2's third distinct safeguard. Controlling rule: §6.2, §6.3.
Disposition: **FAIL CLOSED** or **ESCALATE**.

**G. A minor requests absolute confidentiality over content triggering safeguarding
routing.**
Violation: attempted override of §8's routing obligation via §6.2's confidentiality
safeguard. Controlling rule: §6.4, §8.3. Disposition: **ESCALATE** to the responsible
human safeguarding process regardless of the request; MUST NOT treat the
confidentiality request as a waiver of routing.

**H. An AI agent is asked to investigate whether a suspected-abuse disclosure is
true.**
Violation: §8.1's absolute prohibition. Controlling rule: §8.1, §8.3. Disposition:
**ESCALATE**/route only; **FAIL CLOSED** on the investigation request itself; MUST
NOT perform any investigative or credibility-adjudicating act.

**I. An agent interprets silence/missing authorization as permission.**
Violation: §4.2/§6.3's absence-is-not-permission rule. Controlling rule: §4.2, §6.3,
§14.4. Disposition: **FAIL CLOSED**.

**J. A permission state changes after historical processing; the system tries to
erase history or use the past event as future authority.**
Violation: §13.3's historical-truth/future-authorization separation. Controlling
rule: §13.3, §13.4. Disposition: historical record **preserved unchanged**; new use
**FAIL CLOSED** absent current authorization; MUST NOT rewrite history or infer
continuity.

**K. Pseudonymized-looking data is treated as automatically anonymous/unrestricted.**
Violation: §3.1.2's orthogonal-attribute requirement — the identity-linked attribute
is determined by governed fact, not by appearance. Controlling rule: §3.1.2, §3.4.
Disposition: **FAIL CLOSED** on the assumption; the identity-linked attribute must be
established, not inferred from apparent de-identification.

**L. A candidate output's consequentiality is genuinely ambiguous.**
Violation risk: premature classification. Controlling rule: §9.5. Disposition:
automated consequential use **FAILS CLOSED**; **ESCALATE** for human classification.

**M. A bounded recommendation is used directly as an admission/employment/
discipline/tracking/eligibility decision.**
Violation: §11.2's antecedent/consequential-use separation ignored. Controlling
rule: §9.3, §11.1–§11.2. Disposition: the decision itself **FAILS CLOSED** absolutely
(§11.1); the recommendation's own eligibility is unaffected, but its use here is
prohibited outright, not merely gated.

**N. A human reviewer merely rubber-stamps machine output.**
Violation: §10.2's genuine-ability requirement. Controlling rule: §10.2, §10.3.
Disposition: **REVIEW_INSUFFICIENT**; the review does not satisfy §10, and any
dependent act **FAILS CLOSED**.

**O. A human reviewer lacks competence for the relevant claim/dimension/decision.**
Violation: §10.2's competence element. Controlling rule: §10.2. Disposition:
**REVIEW_INSUFFICIENT**; **ESCALATE** to a competent reviewer or **FAIL CLOSED**.

**P. A permitted interpretation is later used consequentially without the required
process/review.**
Violation: §11.2's requirement that later consequential use be reviewed BEFORE use.
Controlling rule: §11.2. Disposition: the consequential use **FAILS CLOSED** pending
review; the antecedent interpretation remains valid in its own right.

**Q. An agent retrieves an entire profile when one data element suffices.**
Violation: §7.2's minimization rule. Controlling rule: §7.1–§7.2. Disposition: the
over-broad retrieval **FAILS CLOSED**; only the minimal necessary scope is
authorized.

**R. Operational data is retained indefinitely merely because no retention rule
exists.**
Violation: §7.3's no-inferred-indefinite-retention rule. Controlling rule: §7.3.
Disposition: retention state **UNRESOLVED**; a consequential-adjacent act depending on
a resolved state **FAILS CLOSED** or **ESCALATES**.

**S. Access authorized for one school extends to another school's data.**
Violation: §7.2's cross-school scope rule. Controlling rule: §4.1, §7.2. Disposition:
**FAIL CLOSED** on the cross-scope access.

**T. A tool/model/vendor receives student data solely because the framework
technically supports transmission.**
Violation: §12.4's no-transmission-by-mere-availability rule. Controlling rule: §12.2,
§12.4. Disposition: **FAIL CLOSED** on the transmission absent Tier 3 authorization.

**U. A generated explanation unnecessarily exposes sensitive information to a
recipient who does not need it.**
Violation: §7.2's necessity rule for generated content. Controlling rule: §7.2,
§13.2. Disposition: the exposing content **FAILS CLOSED** for rendering as generated;
only the traceability-necessary minimum is permitted.

**V. Safeguarding disclosure content or operational privacy records are copied into
canonical RGKB.**
Violation: §3.1.3/§8.4's absolute non-canonicalization rule for person-specific
safeguarding content. Controlling rule: §3.1.3, §3.2, §8.4. Disposition: **FAIL
CLOSED** on the copy; the content remains non-canonical regardless of apparent
scientific relevance. This is distinct from, and does not prohibit, curating GENERAL
governed safeguarding knowledge that discloses no real person's specific situation
(§3.1.3) — MUST NOT confuse the two.

No majority vote, model confidence, convenience heuristic, or "best available"
assumption cures any of the above (§14.4).

## 19. Family-to-Pattern / Classification Assignment

### 19.1 No new governed family

Step 6 introduces zero new Pattern A or Pattern B governed families. This is recorded
explicitly, in the same register position Step 3 §16, Step 4 §18, and Step 5 §19 use
for their own family-assignment registers.

### 19.2 Every new Step 6 concept classified

| Concept | Classification |
|---|---|
| Base content domain (§3.1.1) and orthogonal content attributes (§3.1.2) | Controlled vocabularies — not a family |
| Purpose/data-use authorization fields (§4.1) | Fields added to the existing Orchestration Event Record (§19.3) — not a family |
| Action category (§5.1) | Controlled vocabulary; mapped to an existing Step 5 Tier only where accepted Step 5 semantics apply; "Modify operational data" remains explicitly unmapped/fail-closed; no new Tier and no Tier extension — not a family |
| Guardian permission / student assent / confidentiality state (§6) | Operational precondition state, referenced not stored as canonical — not a family |
| Safeguarding routing condition (§8.2) | Controlled trigger classification — not a family; its recognition mechanism is DEFERRED (§8.5, §20.4) |
| Consequentiality use classification (§9.3.2), the separate prohibited consequential-decision act (§9.3.3), and the secondary, partial output roll-up (§9.3.1) | Controlled vocabularies; §9.3.2 and §9.3.3 are distinct and MUST NOT be collapsed — §9.3.3 is a prohibited act, not a use class; the §9.3.1 roll-up is explicitly non-authoritative and subordinate to the primary Step 4 §6.2 taxonomy, never a replacement for it; all orthogonal to the Step 5 disposition — not a family |
| Six privacy/safeguarding determination dimensions (§14.2) | Controlled vocabularies, mutually orthogonal and orthogonal to Step 5 disposition — not a family |
| Auditability field set (§13.1) | Extension of the existing Step 5 §5.2 Orchestration Event Record — not a new record, not a family |

### 19.3 The Orchestration Event Record is extended, not duplicated

Every operational field this document requires (§4.1's purpose/authorization
elements, §13.1's audit elements) is an ADDITIONAL required field on the single Step
5 §5.2 Orchestration Event Record, exactly as Step 5 §19.2 already establishes that
record's governance (operational, outside canonical `rgkb`, never a governed
instance). Step 6 does not create a second record.

### 19.4 Controlled vocabularies are not governed families

None of the vocabularies in §19.2 is registered in `governed_instance`. Each is a
controlled classification attached to an act, a step, or a record field, consistent
with the treatment Step 3 §4.1, Step 4 §18.3, and Step 5 §19.4 already give their own
controlled vocabularies. The exact machine-encodable vocabulary beyond the
distinctions fixed here is DEFERRED to a later controlled specification (§20.4).

### 19.5 No genuinely new governed family was found necessary

No concept introduced by this document was found to require a genuinely new governed
family (Pattern A or Pattern B) that the controlling architecture does not already
authorize. Consequently, no OWNER ADJUDICATION REQUIRED item arises from family
assignment in this version. Should a later controlled specification identify one, it
MUST be registered under this heading and MUST NOT be silently added (Step 1 §2.5).

## 20. Carried-Finding Disposition Register

This register records the disposition of carried findings as they stand after Step 6.
No finding is closed by this specification except where explicitly reasoned below.

### 20.1 CLOSED prior to Step 6 — unchanged, not reopened

**F-05, F-06, F-10, F-13 — CLOSED by Step 3, unchanged.** Step 6 relies on the
citation contract, the validation derivation rule, the developmental/grade
separation, and the validation applicability matrix throughout, without altering any
of them.

### 20.2 F-11 — consequentiality classification — explicit reasoning required

**Prior disposition:** OPEN (Step 3, Step 4), OPEN/narrowed for the interpretation
domain only (Step 4 §19.2, Step 5 §20.2).

**What Step 6 supplies.** For the first time in this substrate, §9 supplies a
GENERAL architectural consequentiality-classification principle rather than a
domain-scoped list: classification by the joint effect of WHAT the output is, WHAT
it is used for, and WHAT EFFECT that use would have on a real person's status,
opportunity, or outcome (§9.2). This principle is explicitly designed to remain
evaluable for cases not on the illustrative list (§9.6), and unresolved
classification is bound to a fail-closed default (§9.5) rather than left undefined.

**What Step 6 does NOT supply — the remaining LOGICAL/POLICY gap (this is why F-11
remains open).** The general effect-and-use principle exists (§9.2); the
illustrative list exists (§9.4); unresolved cases fail closed (§9.5). What is
missing is not an implementation of that principle — it is that the BOUNDARY the
principle draws is not yet sufficiently governed or bounded, by any currently
controlling authority, for genuinely novel cases the illustrative list does not
resemble: no controlling source fixes how "materially determine or control" is to be
judged at the margin between consequential-adjacent use and consequential use, or
between consequential-adjacent use and no consequential effect at all, for a case
outside the illustrative pattern. That is an unresolved scientific/policy judgment
this document's controlling sources do not settle (§1.6) — not merely an
unimplemented procedure.

**What Step 6 does NOT supply — separate implementation deferrals (these do NOT bear
on F-11's open/closed status).** Independently of the logical gap above, this
document also does not supply an exact machine-evaluable decision procedure or
algorithm, a controlled machine-encodable sub-vocabulary, or a physical/runtime
classification mechanism. These are ordinary implementation deferrals, correctly out
of Phase 6 scope (§21, §20.8), and their absence is NOT, by itself, evidence that
F-11 remains open — a logical governance finding is not kept open merely because its
executable realization has not been built.

**Disposition: PARTIALLY SPECIFIED / OPEN.** This is a material upgrade from OPEN:
Step 6 supplies the general architectural rule the prior phases' domain-scoped
narrowing explicitly did not attempt. It is NOT CLOSED — but the open portion rests
on the LOGICAL/POLICY gap above (the "materially determine or control" boundary is
not yet sufficiently governed for novel cases), not on the absence of an executable
procedure. The fail-closed-to-human-classification default (§9.5) is a deliberate,
permanent architectural feature, not itself evidence the boundary problem is
unsolved; it is precisely because the boundary is not yet sufficiently governed that
the fail-closed default is the correct standing rule. F-11 is NOT closed by this
document.

### 20.3 OPEN, unchanged — F-04, F-07, M-1

**F-04 — dependency re-binding workflow. OPEN, unchanged.** Not touched by Step 6.

**F-07 — current-version resolution and cardinality. OPEN, unchanged.** Step 6
supplies no new applicability input to the Step 1 §9 resolution predicate.

**M-1 — source-hierarchy and external-identifier pattern assignment. OPEN /
FAIL-CLOSED, unchanged.** Not touched by Step 6; any Step 6 act depending on
unresolved source identity inherits the existing fail-closed consequence unchanged.

### 20.4 PARTIALLY SPECIFIED / OPEN — F-12, M-2

**F-12 — platform-role versus reviewer-authority implementation. PARTIALLY SPECIFIED
/ still OPEN, further specified.** Step 6 §5.3/§10.2 further clarifies the logical
separation between platform role, access authority, reviewer competence,
safeguarding authority, and consequential-decision authority — five distinct
concepts, none inferred from another. Authentication, onboarding, and platform-
permission implementation remain outside Step 6 scope (§21); F-12 is NOT closed.

**M-2 — named scientific review authority for operational correspondence. PARTIALLY
SPECIFIED / still OPEN, further specified.** Step 6 §10.2 extends dimension-specific
competence requirements to safeguarding-routing and consequential-use review
specifically. The original operational-correspondence review-workflow gap M-2 names
is not resolved — no case-management or correspondence workflow is designed (§21).
M-2 is NOT closed.

### 20.5 DEFERRED, unchanged — F-08, F-09, F-14

Untouched by Step 6; not modified merely because Step 6 mentions adjacent concepts.

### 20.6 AFFIRMED CONSTRAINT — L-1, unchanged

**L-1 — immutable binding constraint. AFFIRMED CONSTRAINT, extended without
exception.** Step 6 §13.3 extends L-1's historical-truth-preservation principle to
the authorization/permission-state layer: a changed authorization never rewrites
truthful historical audit/provenance. L-1 is not an independent open work item and
MUST NOT be recorded as DEFERRED.

### 20.7 CONFIRMED STRENGTH / NO ACTION — N-1, unchanged

**N-1. CONFIRMED STRENGTH / NO ACTION, unchanged.** Step 6 produced no contradictory
evidence and does not reopen it. It is not an open defect, requires no corrective
action, and MUST NOT be represented as an unresolved finding requiring remediation.
It MUST NOT be recorded as DEFERRED.

### 20.8 Step 6 boundary deferrals

DEFERRED to later controlled steps or specifications, outside Step 6 scope:

- the LOGICAL/POLICY resolution of the "materially determine or control" boundary
  for genuinely novel consequentiality cases the illustrative list (§9.4) does not
  resemble — this is the substantive reason F-11 remains open, not merely an
  implementation gap (§20.2);
- the exact machine-evaluable consequentiality-classification decision procedure and
  its controlled sub-vocabulary — an implementation deferral, separate from the
  logical gap above, that does not itself bear on F-11's open/closed status (§20.2);
- the safeguarding-routing-condition recognition mechanism/model (§8.2, §8.5);
- authentication, consent-storage mechanics, and safeguarding-case workflow (§21);
- specific retention durations and jurisdiction-specific legal bases (§7.3, §1.6);
- the physical extension of the Orchestration Event Record's schema (§19.3);
- any executable specification language for the classifications this document fixes
  the minimum distinctions for (§19.4).

A deferral is not a decision. No deferred item may be treated as resolved, permitted,
or authorized because it is recorded here.

## 21. Explicit Non-Authorization

This specification authorizes none of the following: SQL or DDL; migrations;
Supabase/RLS/authentication implementation; account provisioning or role-assignment
code; consent-storage mechanics; safeguarding-case-management software; agent or
orchestration runtime implementation; tool integration; APIs; external side effects;
notification systems; scoring or assessment changes; production activation;
deployment; student-data processing; encryption/KMS implementation; token formats;
RBAC/ABAC implementation; API schema design; prompt strings; agent framework or LLM
vendor/model selection; moderation-vendor selection; case-management tool selection;
specific retention durations; jurisdiction-specific legal-basis determinations;
privacy-notice or legal-agreement text; deployment architecture; repository staging,
commit, push, PR creation, merge, branch deletion, or worktree deletion; modification
of Steps 1–5; and Phase 7 architecture or implementation of any kind.

This specification makes no claim of: production readiness; legal or regulatory
compliance in any jurisdiction; safeguarding-process adequacy; scientific validation
of any specific rule; or closure of any carried finding beyond those explicitly
closed by Step 3 and restated unchanged in §20.1.

Describing a behaviour in this model does not authorize implementing it. Later
physical realization MAY realize the semantics specified here and MUST NOT weaken,
reinterpret, or bypass them (§1.4).

## 22. Next Controlled Step

Step 6 defines the privacy, safeguarding, and consequential-decision governance
substrate only. Work that builds on this substrate is not authorized by it.
Continuation requires an integration review against Steps 1–5 and the Canonical
Entity Model, an owner closure decision for Step 6, and separate owner authorization
for any later step, including Phase 7.

Findings recorded as OPEN or PARTIALLY SPECIFIED in §20.2–§20.4 remain open.
Authentication, consent mechanics, safeguarding-case workflow, agent/orchestration
runtime, and any consequential-decision mechanism remain unauthorized and
unspecified. The existence of this specification is a precondition for later work,
not permission to begin it.

Completion of this document does not by itself close any carried finding beyond
F-05/F-06/F-10/F-13 (already closed by Step 3), does not confer an evidence,
legal, or compliance level on prior or future work, and does not convert
documentation completeness into legal, safety, operational, or production-readiness
evidence.
