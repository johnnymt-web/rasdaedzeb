
CREATE TABLE public.counselor_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  counselor_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.counselor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can view their own notes"
ON public.counselor_notes FOR SELECT
TO authenticated
USING (auth.uid() = counselor_id);

CREATE POLICY "Counselors can create notes"
ON public.counselor_notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = counselor_id AND public.has_role(auth.uid(), 'counselor'));

CREATE POLICY "Counselors can update their own notes"
ON public.counselor_notes FOR UPDATE
TO authenticated
USING (auth.uid() = counselor_id);

CREATE POLICY "Counselors can delete their own notes"
ON public.counselor_notes FOR DELETE
TO authenticated
USING (auth.uid() = counselor_id);

CREATE TRIGGER update_counselor_notes_updated_at
BEFORE UPDATE ON public.counselor_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
