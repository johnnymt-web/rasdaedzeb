
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments"
ON public.assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON public.assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.assessments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Counselors can view all assessments"
ON public.assessments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'counselor'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
