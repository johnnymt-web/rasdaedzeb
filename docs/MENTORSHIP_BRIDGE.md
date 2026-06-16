# Mentorship Bridge — Professional-Grade Design (#9)

> Status: **MVP shipped** (discovery + grade-aware multi-instrument matching + connection request).
> This document is the blueprint for the production-grade system.
>
> ⚠️ **This product connects adult mentors with school students (minors).** Every
> decision must pass through a child-safeguarding and data-protection lens. The
> "Trust & Safety" pillar below is **not optional** before real adult↔student matching.

---

## 1. Current state vs target

| Area | MVP (now) | Professional target |
|---|---|---|
| Matching | **Grade-aware, multi-instrument** (RIASEC + Skills + CAAS/EQ + Work Values + Big Five), explainable | + capacity/availability/consent filters, server-side `match-mentors` edge fn, feedback-tuned weights |
| Mentor identity | Trusted/demo | **Application → verification → background check → admin approval** |
| Minors | No gate | **Parental consent gate (enforced in DB)** |
| Communication | Request + status | **In-platform moderated messaging** (PII-safe) |
| Moderation | None | **AI screening + report/block + human review + audit** |
| Mentor side | No UI | **Mentor portal** (inbox, profile, availability) |
| Ops | None | **Approval queue, moderation dashboard, analytics** |
| Compliance | — | **Consent records, audit log, retention, GDPR export/delete** |

---

## 2. Matching engine (the moat) — grade-aware, multi-instrument

The matching's competitive advantage is that it uses **the assessments appropriate to
the student's grade band**, and the *meaning* of each result — not Holland code alone.

### 2.1 Which instruments apply per grade band
Driven by `getRecommendedAssessmentsForGradeBand(gradeBand)`:

| Grade band | Instruments → matching factors |
|---|---|
| discovery (6–8) | interests (RIASEC), skill gaps (Skills) |
| exploration (9–10) | + work values, Big Five rapport |
| planning / transition (11–13) | + CAAS needs, EQ needs/style → **all six** |

### 2.2 Two axes
- **FIT** — *who suits the student*: interests (RIASEC), values (Work Values), personality (Big Five).
- **NEED → SPECIALTY** — *what help the student needs*: low CAAS/EQ scores and skill gaps
  map to a mentor's specialties. This is the differentiated axis MVP-era competitors lack.

### 2.3 NEED → specialty mapping
| Low score | Need | Mentor specialty |
|---|---|---|
| CAAS confidence ↓ | self-belief | `confidence-building` |
| CAAS concern ↓ | future planning | `future-planning` |
| CAAS curiosity ↓ | exploration | `exploration` |
| CAAS control ↓ | ownership | `ownership` |
| EQ self-management ↓ | resilience | `resilience` |
| EQ social/relationship ↓ | interpersonal | `interpersonal-support` |
| Skills (any) < 50% | skill growth | matching `coachable_skills` |

### 2.4 Scoring (already implemented — `src/services/mentorService.ts`)
`buildStudentMatchProfile(normData, gradeBand)` derives `{ hollandCode, skillGaps, needs,
topValues, styleTags, availableFactors }` from **only** the grade-appropriate, completed
tests. `scoreMentor` renormalizes weights across the factors the student actually has and
returns explainable `reasons[]`.

```
base weights: interest .25 | skill .20 | need .25 | values .15 | style .15
score = Σ (weight_f / Σ present weights) × overlap_f      (f ∈ availableFactors)
```

### 2.5 Production hardening (target)
- Move scoring to an edge function **`match-mentors`** that takes the student id, loads the
  normalized profile server-side, and applies filters the client must not: mentor `status =
  verified`, `active`, **capacity not full**, not previously `declined`/blocked, language &
  grade-band fit, and (for minors) **valid parental consent exists**.
- Persist match snapshots for analytics and to tune weights from outcome feedback.

---

## 3. Trust & Safety (mandatory before real matching)

1. **Mentor vetting pipeline**: `pending → under_review → verified → (suspended/retired)`.
   Identity check, background-check status, signed code of conduct. **Only `verified`
   mentors are discoverable.**
2. **Parental consent gate**: under-18 students cannot enter an active mentorship until a
   guardian grants consent. Enforced by DB trigger (see §5), not UI alone.
3. **In-platform messaging only**: external contact details (phone/email/socials/URLs) are
   detected and redacted/blocked.
4. **Moderation**: every message is screened (AI + heuristics) for abuse / grooming
   signals / PII; users can report & block; flagged content goes to a human safeguarding
   reviewer.
5. **Immutable audit log** of every action (who, when, what).
6. **Anti-abuse**: rate limits, mentor capacity caps, blocklist.

---

## 4. Data model (target additions beyond MVP)

```sql
-- Mentor lifecycle + verification (extend existing mentors table)
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','under_review','verified','suspended','retired')),
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS background_check text NOT NULL DEFAULT 'not_started'
    CHECK (background_check IN ('not_started','submitted','cleared','flagged')),
  ADD COLUMN IF NOT EXISTS capacity int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['ka'],
  ADD COLUMN IF NOT EXISTS grade_bands text[],
  ADD COLUMN IF NOT EXISTS safeguarding_ack_at timestamptz;
-- (coachable_skills / specialties / role_values / style_tags already added for matching)

CREATE TABLE public.parental_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'mentorship',
  granted boolean NOT NULL DEFAULT false,
  granted_at timestamptz, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_consent UNIQUE (student_id, parent_id, scope)
);

CREATE TABLE public.mentorship_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id  uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  started_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz, ended_reason text,
  CONSTRAINT uq_relationship UNIQUE (student_id, mentor_id)
);

CREATE TABLE public.mentor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid NOT NULL REFERENCES public.mentorship_relationships(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  body text NOT NULL,
  moderation text NOT NULL DEFAULT 'pending' CHECK (moderation IN ('pending','approved','blocked')),
  flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.message_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.mentor_messages(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id), reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mentorship_audit (
  id bigserial PRIMARY KEY, actor_id uuid, action text NOT NULL,
  entity text NOT NULL, entity_id uuid, meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 5. RLS + consent gate (enforced in the database)

```sql
-- Only verified, active mentors are discoverable.
DROP POLICY IF EXISTS "Read active mentors" ON public.mentors;
CREATE POLICY "Read verified mentors" ON public.mentors
  FOR SELECT USING (active = true AND status = 'verified');

-- Messages: read approved messages in your own relationship; never see 'blocked'.
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own conversation" ON public.mentor_messages FOR SELECT USING (
  moderation <> 'blocked' AND EXISTS (
    SELECT 1 FROM public.mentorship_relationships r
    WHERE r.id = relationship_id
      AND (public.is_self(r.student_id)
           OR EXISTS (SELECT 1 FROM public.mentors m WHERE m.id = r.mentor_id AND m.user_id = auth.uid()))
  )
);

-- A request cannot be accepted for a minor without a valid parental consent.
CREATE OR REPLACE FUNCTION public.enforce_parental_consent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_age int;
BEGIN
  IF NEW.status = 'accepted' THEN
    SELECT date_part('year', age(p.birth_date))::int INTO v_age FROM public.profiles p WHERE p.id = NEW.student_id;
    IF v_age IS NULL OR v_age < 18 THEN
      IF NOT EXISTS (SELECT 1 FROM public.parental_consents c
        WHERE c.student_id = NEW.student_id AND c.scope = 'mentorship'
          AND c.granted = true AND c.revoked_at IS NULL) THEN
        RAISE EXCEPTION 'Parental consent required before connecting a minor to a mentor';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER tr_consent_gate BEFORE UPDATE ON public.mentor_requests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_parental_consent();
```

---

## 6. Message moderation (edge function `moderate-message`)

```
1. Trigger on message insert (status 'pending').
2. Heuristics: regex for phone / email / @handles / URLs → redact or block (no external contact).
3. AI safety classification (Claude/OpenAI):
   system: "You are a child-safety moderator for a mentorship app between adults and
   school students. Return SAFE | NEEDS_REVIEW | BLOCK with a short reason."
4. Update mentor_messages.moderation + flagged. On BLOCK → write audit + alert safeguarding lead.
```

---

## 7. Lifecycle / state machine

```
request(pending) ──mentor accepts──▶ [consent gate for minors] ──▶ relationship(active)
       │                                                              │
   declined                                          messages (moderated) / sessions
                                                                      │
                                                       relationship(ended) + feedback
```

---

## 8. Interfaces

- **Mentor portal** (`/mentor/*`, new role `mentor`): application/onboarding capturing the
  **structured matching profile** (holland_code, fields, coachable_skills, specialties,
  role_values, style_tags, languages, grade_bands, capacity), availability, **inbox**
  (accept/decline + consent status), conversations, safeguarding training acknowledgment.
- **Student**: matched mentors with explainable reasons (built), request → consent flow,
  conversation, **report/block**, feedback.
- **Parent**: grant/revoke consent, visibility into who their child connects with.
- **Admin/Ops**: mentor **approval queue**, verification, **moderation dashboard**
  (flagged messages), analytics, suspend/remove.

---

## 9. Compliance, observability, scale

- **Compliance**: consent records, data-retention policy, GDPR export/delete, encryption
  at rest (Supabase default). Georgian minors' data → legal review required.
- **Observability**: `mentorship_audit` + Sentry (already integrated) + moderation metrics.
- **Scale**: matching via edge fn/RPC + indexes; messaging via Supabase Realtime; pagination.

---

## 10. Phased rollout

| Phase | Scope |
|---|---|
| ✅ MVP | Grade-aware multi-instrument matching + connection request (shipped) |
| **A. Safety** | Verification pipeline, parental consent gate, audit, code of conduct |
| **B. Portal + messaging** | Mentor role/UI, inbox, in-platform moderated messaging |
| **C. Matching + notifications** | `match-mentors` edge fn (filters), email/in-app notifications |
| **D. Scale + quality** | Scheduling/sessions, reviews/feedback, admin moderation dashboard, analytics |

---

## 11. Honest effort estimate

This is **2–4 months of team work** plus **legal/safeguarding consultation** (minors +
personal data under Georgian law). The MVP is fine for a demo with seeded mentors, but
**Phase A (verification + consent + moderation) is mandatory before connecting real adults
to real students** — it is the difference between a feature and a safe product.
