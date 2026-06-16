-- =========================================================================
-- Mentorship bridge (Phase 4 #9) — MVP: discovery + connection request
-- Reuses phase1a helpers: public.is_self(uuid), public.can_access_student_record(uuid)
-- =========================================================================

-- A. Mentors (professionals students can be matched with by Holland code)
CREATE TABLE IF NOT EXISTS public.mentors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- optional link to a platform account
  full_name     TEXT NOT NULL,
  profession    TEXT NOT NULL,
  organization  TEXT,
  holland_code  TEXT NOT NULL,         -- e.g. 'SAI'
  bio           TEXT,
  fields        TEXT[],                -- free-text interest/field tags
  contact_email TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON public.mentors(active);
CREATE INDEX IF NOT EXISTS idx_mentors_user ON public.mentors(user_id);

-- B. Connection requests from students to mentors
CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id   UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending | accepted | declined
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_mentor_request UNIQUE (student_id, mentor_id),
  CONSTRAINT chk_mentor_request_status CHECK (status IN ('pending', 'accepted', 'declined'))
);
CREATE INDEX IF NOT EXISTS idx_mreq_student ON public.mentor_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_mreq_mentor ON public.mentor_requests(mentor_id);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

-- C. RLS
-- Mentors: any authenticated user may read ACTIVE mentors. Inserts/updates are
-- done by platform admins via service_role (no client write policy on purpose).
DROP POLICY IF EXISTS "Read active mentors" ON public.mentors;
CREATE POLICY "Read active mentors" ON public.mentors
  FOR SELECT USING (active = true);

-- Requests: student (or their parent/counselor) and the linked mentor may read.
DROP POLICY IF EXISTS "Scoped select mentor_requests" ON public.mentor_requests;
CREATE POLICY "Scoped select mentor_requests" ON public.mentor_requests
  FOR SELECT USING (
    public.can_access_student_record(student_id)
    OR EXISTS (SELECT 1 FROM public.mentors m WHERE m.id = mentor_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Student insert own request" ON public.mentor_requests;
CREATE POLICY "Student insert own request" ON public.mentor_requests
  FOR INSERT WITH CHECK (public.is_self(student_id));

DROP POLICY IF EXISTS "Student update own request" ON public.mentor_requests;
CREATE POLICY "Student update own request" ON public.mentor_requests
  FOR UPDATE USING (public.is_self(student_id)) WITH CHECK (public.is_self(student_id));

-- Linked mentor may update the status of requests addressed to them.
DROP POLICY IF EXISTS "Mentor update incoming request" ON public.mentor_requests;
CREATE POLICY "Mentor update incoming request" ON public.mentor_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.mentors m WHERE m.id = mentor_id AND m.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.mentors m WHERE m.id = mentor_id AND m.user_id = auth.uid())
  );

-- D. Demo mentors (Georgian) so the feature is testable out of the box.
INSERT INTO public.mentors (full_name, profession, organization, holland_code, bio, fields, active)
VALUES
  ('ნინო ბერიძე', 'პროგრამული ინჟინერი', 'TBC', 'IRC', 'სტუდენტებს ვეხმარები ტექნოლოგიების სამყაროში პირველი ნაბიჯების გადადგმაში.', ARRAY['ტექნოლოგია','პროგრამირება'], true),
  ('გიორგი კაპანაძე', 'ექიმი-კარდიოლოგი', 'რესპუბლიკური საავადმყოფო', 'ISR', 'მედიცინისკენ მიმავალ გზაზე გამოცდილებას გავუზიარებ.', ARRAY['მედიცინა','ჯანდაცვა'], true),
  ('თამარ ლომიძე', 'გრაფიკული დიზაინერი', 'Leavingstone', 'AES', 'შემოქმედებითი კარიერა და პორტფოლიოს აწყობა.', ARRAY['დიზაინი','ხელოვნება'], true),
  ('დავით ჯავახიშვილი', 'მეწარმე', 'StartUp Georgia', 'ESC', 'ბიზნესის დაწყება და ლიდერობა ახალგაზრდებისთვის.', ARRAY['ბიზნესი','მეწარმეობა'], true),
  ('ანა მგელაძე', 'ფსიქოლოგი', 'GIPA', 'SAI', 'ადამიანებთან მუშაობა და სოციალური მეცნიერებები.', ARRAY['ფსიქოლოგია','განათლება'], true),
  ('ლევან ცქიტიშვილი', 'ფინანსური ანალიტიკოსი', 'Bank of Georgia', 'CEI', 'ფინანსები, მონაცემები და ანალიტიკური აზროვნება.', ARRAY['ფინანსები','ანალიტიკა'], true)
ON CONFLICT DO NOTHING;
