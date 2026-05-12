-- ============================================================
-- PATHFINDER PLATFORM — UNIFIED UPGRADES
-- Features: Big Five (IPIP-NEO-50), CAAS, Skills Gap, Gatsby
-- ============================================================

-- ─────────────────────────────────────────
-- FEATURE 1: BIG FIVE PERSONALITY (IPIP-NEO-50)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.big_five_assessments (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_responses    JSONB       NOT NULL DEFAULT '{}',
  openness          NUMERIC(5,2) CHECK (openness BETWEEN 0 AND 100),
  conscientiousness NUMERIC(5,2) CHECK (conscientiousness BETWEEN 0 AND 100),
  extraversion      NUMERIC(5,2) CHECK (extraversion BETWEEN 0 AND 100),
  agreeableness     NUMERIC(5,2) CHECK (agreeableness BETWEEN 0 AND 100),
  neuroticism       NUMERIC(5,2) CHECK (neuroticism BETWEEN 0 AND 100),
  facet_scores      JSONB       NOT NULL DEFAULT '{}',
  version           TEXT        NOT NULL DEFAULT 'IPIP-NEO-50-v1',
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_secs   INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_big_five_student_latest ON public.big_five_assessments (student_id, completed_at DESC);

ALTER TABLE public.big_five_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own Big Five results"
  ON public.big_five_assessments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own Big Five assessments"
  ON public.big_five_assessments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Counselors can read student Big Five results"
  ON public.big_five_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p_counselor
      JOIN public.profiles p_student ON p_student.school_id = p_counselor.school_id
      WHERE p_counselor.id = auth.uid()
        AND p_student.id = big_five_assessments.student_id
        AND public.has_role(auth.uid(), 'counselor')
    )
  );

CREATE TRIGGER update_big_five_updated_at
  BEFORE UPDATE ON public.big_five_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────
-- FEATURE 2: CAAS — CAREER ADAPT-ABILITIES SCALE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.caas_assessments (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_responses JSONB       NOT NULL DEFAULT '{}',
  concern        NUMERIC(4,2) CHECK (concern BETWEEN 1 AND 5),
  control        NUMERIC(4,2) CHECK (control BETWEEN 1 AND 5),
  curiosity      NUMERIC(4,2) CHECK (curiosity BETWEEN 1 AND 5),
  confidence     NUMERIC(4,2) CHECK (confidence BETWEEN 1 AND 5),
  total_score    NUMERIC(4,2) CHECK (total_score BETWEEN 1 AND 5),
  percentile     INTEGER      CHECK (percentile BETWEEN 0 AND 100),
  version        TEXT         NOT NULL DEFAULT 'CAAS-International-v1',
  completed_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  time_taken_secs INTEGER,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_caas_student_latest ON public.caas_assessments (student_id, completed_at DESC);

ALTER TABLE public.caas_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own CAAS results"
  ON public.caas_assessments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own CAAS assessments"
  ON public.caas_assessments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Counselors can read student CAAS results"
  ON public.caas_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p_counselor
      JOIN public.profiles p_student ON p_student.school_id = p_counselor.school_id
      WHERE p_counselor.id = auth.uid()
        AND p_student.id = caas_assessments.student_id
        AND public.has_role(auth.uid(), 'counselor')
    )
  );

CREATE TRIGGER update_caas_updated_at
  BEFORE UPDATE ON public.caas_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────
-- FEATURE 3: SKILLS GAP ANALYSIS
-- ─────────────────────────────────────────

ALTER TABLE public.onet_cache
  ADD COLUMN IF NOT EXISTS cache_type TEXT NOT NULL DEFAULT 'career_profile',
  ADD COLUMN IF NOT EXISTS occupation_code TEXT;

CREATE INDEX IF NOT EXISTS idx_onet_cache_type ON public.onet_cache (cache_type, occupation_code);

CREATE TABLE IF NOT EXISTS public.student_skill_snapshots (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skills       JSONB       NOT NULL DEFAULT '[]',
  snapshot_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  source       TEXT        NOT NULL DEFAULT 'skills_check',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_snapshots_student ON public.student_skill_snapshots (student_id, snapshot_at DESC);

ALTER TABLE public.student_skill_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own skill snapshots"
  ON public.student_skill_snapshots FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.skills_gap_analyses (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occupation_code TEXT        NOT NULL,
  occupation_title TEXT       NOT NULL,
  gap_results     JSONB       NOT NULL DEFAULT '[]',
  overall_readiness NUMERIC(5,2),
  skills_matched  INTEGER,
  skills_to_develop INTEGER,
  analysed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_gap_student ON public.skills_gap_analyses (student_id, analysed_at DESC);

ALTER TABLE public.skills_gap_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own gap analyses"
  ON public.skills_gap_analyses FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students insert own gap analyses"
  ON public.skills_gap_analyses FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Counselors read student gap analyses"
  ON public.skills_gap_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p_counselor
      JOIN public.profiles p_student ON p_student.school_id = p_counselor.school_id
      WHERE p_counselor.id = auth.uid()
        AND p_student.id = skills_gap_analyses.student_id
        AND public.has_role(auth.uid(), 'counselor')
    )
  );


-- ─────────────────────────────────────────
-- FEATURE 4: GATSBY BENCHMARKS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gatsby_benchmarks (
  id          SMALLINT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL
);

INSERT INTO public.gatsby_benchmarks (id, title, description, category) VALUES
  (1, 'A Stable Careers Programme', 'Every school and college should have an embedded programme of career education and guidance.', 'programme'),
  (2, 'Learning from Career and Labour Market Information', 'Every student, and their parents, should have access to good quality information about future study options and labour market opportunities.', 'information'),
  (3, 'Addressing the Needs of Each Pupil', 'Students have different career guidance needs at different stages. Opportunities for advice and support need to be tailored to the needs of each student.', 'guidance'),
  (4, 'Linking Curriculum Learning to Careers', 'All teachers should link curriculum learning with careers, even on courses not specifically about careers.', 'curriculum'),
  (5, 'Encounters with Employers and Employees', 'Every student should have multiple opportunities to learn from employers about work, employment and the skills that are valued in the workplace.', 'employer'),
  (6, 'Experiences of Workplaces', 'Every student should have first-hand experiences of the workplace through work visits, work shadowing or work experience.', 'experience'),
  (7, 'Encounters with Further and Higher Education', 'All students should understand the full range of learning opportunities that are available to them.', 'education'),
  (8, 'Personal Guidance', 'Every student should have opportunities for guidance interviews with a careers adviser.', 'guidance')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.school_gatsby_progress (
  id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id      UUID      NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  benchmark_id   SMALLINT  NOT NULL REFERENCES public.gatsby_benchmarks(id),
  academic_year  TEXT      NOT NULL,
  attainment_level SMALLINT NOT NULL DEFAULT 0 CHECK (attainment_level BETWEEN 0 AND 3),
  evidence_notes TEXT,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by    UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, benchmark_id, academic_year)
);

ALTER TABLE public.school_gatsby_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors manage their school Gatsby progress"
  ON public.school_gatsby_progress FOR ALL
  USING (
    public.has_role(auth.uid(), 'counselor') AND 
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.school_id = school_gatsby_progress.school_id
    )
  );

CREATE TRIGGER update_gatsby_progress_updated_at
  BEFORE UPDATE ON public.school_gatsby_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.employer_encounters (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id       UUID        NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  employer_name   TEXT        NOT NULL,
  industry_sector TEXT,
  encounter_type  TEXT        NOT NULL,
  encounter_date  DATE        NOT NULL,
  duration_mins   INTEGER,
  year_groups     TEXT[]      DEFAULT '{}',
  skills_covered  TEXT[]      DEFAULT '{}',
  gatsby_benchmark SMALLINT   DEFAULT 5,
  created_by      UUID        REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.encounter_attendees (
  encounter_id UUID NOT NULL REFERENCES public.employer_encounters(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attended     BOOLEAN NOT NULL DEFAULT true,
  rating       SMALLINT CHECK (rating BETWEEN 1 AND 5),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (encounter_id, student_id)
);

ALTER TABLE public.employer_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounter_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors manage school encounters"
  ON public.employer_encounters FOR ALL
  USING (
    public.has_role(auth.uid(), 'counselor') AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.school_id = employer_encounters.school_id
    )
  );

CREATE POLICY "Students read own encounter records"
  ON public.encounter_attendees FOR SELECT
  USING (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.workplace_experiences (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id        UUID        NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_name    TEXT        NOT NULL,
  industry_sector  TEXT,
  occupation_code  TEXT,
  experience_type  TEXT        NOT NULL,
  start_date       DATE        NOT NULL,
  end_date         DATE        NOT NULL,
  duration_days    INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  student_reflection TEXT,
  skills_developed TEXT[]      DEFAULT '{}',
  employer_sign_off BOOLEAN    DEFAULT false,
  employer_contact  TEXT,
  counselor_approved BOOLEAN   DEFAULT false,
  approved_by       UUID       REFERENCES auth.users(id),
  gatsby_benchmark  SMALLINT   DEFAULT 6,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workplace_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own workplace experiences"
  ON public.workplace_experiences FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Counselors manage school workplace experiences"
  ON public.workplace_experiences FOR ALL
  USING (
    public.has_role(auth.uid(), 'counselor') AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.school_id = workplace_experiences.school_id
    )
  );

CREATE TRIGGER update_workplace_exp_updated_at
  BEFORE UPDATE ON public.workplace_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
