-- =========================================================================
-- RLS hardening (audit findings S2, S5)
-- APPLY on Supabase (SQL Editor or db push). Low risk, but see the S2 note.
-- =========================================================================

-- S2: Remove the world-readable schools policy. Any authenticated user could
-- previously read EVERY school (the broad "USING (true)" policy OR-ed with the
-- scoped one and won). The scoped "Users view own school" (phase1a) plus
-- "Admins can manage schools" (FOR ALL) remain, so:
--   • regular users still see their own school
--   • admins still see/manage all schools
-- ⚠️ VERIFY before/after: no non-admin UI lists other schools (e.g. a public
--    school picker). If one exists, it must be moved behind an admin/RPC path.
DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;

-- S5: gatsby_benchmarks had RLS OFF (reference data, but writable via anon key).
ALTER TABLE public.gatsby_benchmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read gatsby benchmarks" ON public.gatsby_benchmarks;
CREATE POLICY "Read gatsby benchmarks" ON public.gatsby_benchmarks
  FOR SELECT TO authenticated USING (true);
