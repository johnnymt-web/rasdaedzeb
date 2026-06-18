-- =========================================================================
-- Make `superadmin` a REAL role — step 1 of 2: add it to the app_role enum.
-- =========================================================================
-- IMPORTANT: this MUST be its own migration. A newly added enum value cannot be
-- USED (referenced in policies/functions/comparisons) in the same transaction in
-- which it is added. The provisioning rules + RLS that grant superadmin its
-- privileges therefore live in a SEPARATE migration applied AFTER this commits.
--
-- Phase-12: auth enum change. Not applied to production until reviewed/approved.
-- =========================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
