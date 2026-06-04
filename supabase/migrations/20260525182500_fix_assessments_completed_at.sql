-- Fix assessments table completed_at column to use database time
ALTER TABLE public.assessments ALTER COLUMN completed_at SET DEFAULT now();
