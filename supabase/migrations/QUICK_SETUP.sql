-- CREATE BASE ENUM ROLES
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'counselor', 'admin');

-- CREATE PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  grade TEXT,
  school_class TEXT,
  school_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'::app_role));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CREATE RIASEC ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CREATE BIG FIVE TABLE
CREATE TABLE IF NOT EXISTS public.big_five_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_responses JSONB NOT NULL DEFAULT '{}',
  openness NUMERIC(5,2) CHECK (openness BETWEEN 0 AND 100),
  conscientiousness NUMERIC(5,2) CHECK (conscientiousness BETWEEN 0 AND 100),
  extraversion NUMERIC(5,2) CHECK (extraversion BETWEEN 0 AND 100),
  agreeableness NUMERIC(5,2) CHECK (agreeableness BETWEEN 0 AND 100),
  neuroticism NUMERIC(5,2) CHECK (neuroticism BETWEEN 0 AND 100),
  facet_scores JSONB NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT 'IPIP-NEO-50-v1',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_secs INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CREATE CAAS TABLE
CREATE TABLE IF NOT EXISTS public.caas_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_responses JSONB NOT NULL DEFAULT '{}',
  concern NUMERIC(4,2),
  control NUMERIC(4,2),
  curiosity NUMERIC(4,2),
  confidence NUMERIC(4,2),
  total_score NUMERIC(4,2),
  percentile INTEGER,
  version TEXT NOT NULL DEFAULT 'CAAS-International-v1',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_secs INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CREATE WORK VALUES TABLE
CREATE TABLE IF NOT EXISTS public.work_values_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_responses JSONB NOT NULL DEFAULT '{}',
  achievement NUMERIC(5,2),
  independence NUMERIC(5,2),
  recognition NUMERIC(5,2),
  relationships NUMERIC(5,2),
  support NUMERIC(5,2),
  working_conditions NUMERIC(5,2),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
