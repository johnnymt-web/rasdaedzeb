-- ==========================================================
-- SCHEMA RECOVERY SCRIPT
-- Restores missing tables from Phase 2 and Phase 3
-- ==========================================================

-- 1. Ensure Enums exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_category') THEN
        CREATE TYPE public.skill_category AS ENUM ('resume', 'interview', 'networking', 'financial_lit');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_status') THEN
        CREATE TYPE public.skill_status AS ENUM ('not_started', 'in_progress', 'verified');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'target_role_enum') THEN
        CREATE TYPE public.target_role_enum AS ENUM ('student', 'parent', 'counselor', 'all');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_status') THEN
        CREATE TYPE public.goal_status AS ENUM ('not_started', 'in_progress', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saved_item_type') THEN
        CREATE TYPE public.saved_item_type AS ENUM ('subject', 'pathway', 'profession', 'career_family');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_status') THEN
        CREATE TYPE public.meeting_status AS ENUM ('scheduled', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'follow_up_status') THEN
        CREATE TYPE public.follow_up_status AS ENUM ('pending', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE public.event_type AS ENUM ('webinar', 'workshop', 'deadline', 'notice');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_audience') THEN
        CREATE TYPE public.event_audience AS ENUM ('all', 'students', 'parents');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_type') THEN
        CREATE TYPE public.opportunity_type AS ENUM ('internship', 'shadowing', 'career_fair', 'mentorship');
    END IF;
END $$;

-- 2. Create Missing Tables
-- Employability Skills
CREATE TABLE IF NOT EXISTS public.employability_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_category public.skill_category NOT NULL,
    status public.skill_status NOT NULL DEFAULT 'not_started',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, skill_category)
);

-- Counselor Follow-ups
CREATE TABLE IF NOT EXISTS public.counselor_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status public.follow_up_status NOT NULL DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    type public.opportunity_type NOT NULL,
    description TEXT,
    application_url TEXT,
    deadline DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge Resources
CREATE TABLE IF NOT EXISTS public.knowledge_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    target_role public.target_role_enum NOT NULL DEFAULT 'all',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Goals (in case missing)
CREATE TABLE IF NOT EXISTS public.student_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status public.goal_status NOT NULL DEFAULT 'not_started',
    target_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Counselor Meetings
CREATE TABLE IF NOT EXISTS public.counselor_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_mins INTEGER DEFAULT 30,
    status public.meeting_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS and Policies
ALTER TABLE public.employability_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_meetings ENABLE ROW LEVEL SECURITY;

-- Policies for employability_skills
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage own skills') THEN
        CREATE POLICY "Students can manage own skills" ON public.employability_skills FOR ALL TO authenticated USING (auth.uid() = student_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Counselors can view and verify skills') THEN
        CREATE POLICY "Counselors can view and verify skills" ON public.employability_skills FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'counselor'));
    END IF;
END $$;

-- Policies for counselor_follow_ups
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Counselors can manage follow_ups') THEN
        CREATE POLICY "Counselors can manage follow_ups" ON public.counselor_follow_ups FOR ALL TO authenticated USING (auth.uid() = counselor_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can view and update their follow_ups') THEN
        CREATE POLICY "Students can view and update their follow_ups" ON public.counselor_follow_ups FOR SELECT TO authenticated USING (auth.uid() = student_id);
    END IF;
END $$;

-- 4. Triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_employability_skills_last_updated') THEN
        CREATE TRIGGER update_employability_skills_last_updated BEFORE UPDATE ON public.employability_skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_counselor_follow_ups_updated_at') THEN
        CREATE TRIGGER update_counselor_follow_ups_updated_at BEFORE UPDATE ON public.counselor_follow_ups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Reload schema for PostgREST
NOTIFY pgrst, 'reload schema';
