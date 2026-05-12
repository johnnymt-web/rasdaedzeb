-- Add preferred_language to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';

-- Update pre_boarding to include preferred_language
ALTER TABLE public.pre_boarding
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
