-- ==========================================================
-- DATABASE HEALTH RECOVERY SCRIPT (FINAL VERSION)
-- Run this in your Supabase SQL Editor if you see "Table not found" errors
-- ==========================================================

-- 1. Ensure Enums exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'counselor', 'admin');
    END IF;
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

-- 2. Create Core Infrastructure
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure default school exists
INSERT INTO public.schools (name, is_default) VALUES ('Default School', true) ON CONFLICT DO NOTHING;

-- 3. Create Missing Feature Tables
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

-- Reflections
CREATE TABLE IF NOT EXISTS public.reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Goals
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

-- Saved Pathways
CREATE TABLE IF NOT EXISTS public.saved_pathways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type public.saved_item_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, title, type)
);

-- Pre-boarding
CREATE TABLE IF NOT EXISTS public.pre_boarding (
    email TEXT PRIMARY KEY,
    assigned_role public.app_role NOT NULL DEFAULT 'student',
    assigned_grade TEXT,
    full_name TEXT,
    target_school_name TEXT,
    assigned_counselor_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Counselor Schools Assignment
CREATE TABLE IF NOT EXISTS public.counselor_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(counselor_id, school_id)
);

-- 4. Enable RLS and Basic Policies
ALTER TABLE public.employability_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_boarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_schools ENABLE ROW LEVEL SECURITY;

-- Shared Policy Creation Helper
DO $$ BEGIN
    -- Employability Skills
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage own skills') THEN
        CREATE POLICY "Students can manage own skills" ON public.employability_skills FOR ALL TO authenticated USING (auth.uid() = student_id);
    END IF;
    
    -- Reflections
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage own reflections') THEN
        CREATE POLICY "Students can manage own reflections" ON public.reflections FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;

    -- Goals
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own goals') THEN
        CREATE POLICY "Users can manage own goals" ON public.student_goals FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;

    -- Saves
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own saves') THEN
        CREATE POLICY "Users can manage own saves" ON public.saved_pathways FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- Reload schema for PostgREST
NOTIFY pgrst, 'reload schema';
