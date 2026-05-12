-- ==========================================================
-- AI INTERACTION LOGGING
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL, -- 'career-coach', 'parent-coach', 'admin-insights'
    prompt_summary TEXT, -- Optional summary or first few chars
    response_content TEXT,
    tokens_estimated INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Only admins can view logs; users cannot see logs (even their own for security/simplicity)
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all AI logs" 
    ON public.ai_logs FOR SELECT 
    TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));
