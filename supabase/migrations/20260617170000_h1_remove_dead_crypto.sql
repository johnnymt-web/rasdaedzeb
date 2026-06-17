-- =========================================================================
-- H1: Counselor-notes encryption — Option B (remove dead/inconsistent crypto)
-- =========================================================================
-- Reality: the app reads/writes counselor_notes.content as PLAIN TEXT (it never
-- calls encrypt_note). The "encryption" was dead infrastructure: a prior migration
-- retyped content to BYTEA via a raw cast (not encryption), and encrypt_note was
-- rewired to need app.encryption_key (never configured). Nothing connected them.
--
-- Posture (documented): counselor notes are protected by Supabase at-rest disk
-- encryption + TLS in transit + counselor-only RLS. No field-level encryption.
-- (If a compliance requirement for field-level encryption arises, implement it
-- properly end-to-end instead of this dead scaffolding.)
--
-- SAFE: counselor_notes currently has 0 rows, so the type normalization cannot
-- lose or corrupt data.
-- =========================================================================

-- Normalize content to plain text (handles the case where it was set to BYTEA).
ALTER TABLE public.counselor_notes
  ALTER COLUMN content TYPE text USING content::text;

-- Remove the dead encryption helpers (both historical signatures).
DROP FUNCTION IF EXISTS public.encrypt_note(text, text);
DROP FUNCTION IF EXISTS public.encrypt_note(text);
DROP FUNCTION IF EXISTS public.decrypt_note(bytea, text);
DROP FUNCTION IF EXISTS public.decrypt_note(bytea);
