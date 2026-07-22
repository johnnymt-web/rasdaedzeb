-- Capture-only migration: these columns were already applied live in production
-- (Supabase SQL Editor, 2026-07-22) ahead of this repo commit — see
-- docs/CURRENT_PROJECT_STATUS.md for the verification trail. This migration makes
-- that live state reproducible/tracked, matching the project's existing practice
-- of capturing manually-applied changes (PR #5, PR #11). IF NOT EXISTS guards make
-- it a no-op against the already-patched production DB.
--
-- current_assessment_cycle tracks which "assessment cycle" a student is currently
-- on; cycle_number tags each test result row with the cycle it was taken in, so a
-- forced retake can start a fresh cycle without losing/mixing prior results.

alter table public.profiles
  add column if not exists current_assessment_cycle integer default 1;

alter table public.assessments
  add column if not exists cycle_number integer default 1;

alter table public.big_five_assessments
  add column if not exists cycle_number integer default 1;

alter table public.caas_assessments
  add column if not exists cycle_number integer default 1;

alter table public.work_values_assessments
  add column if not exists cycle_number integer default 1;
