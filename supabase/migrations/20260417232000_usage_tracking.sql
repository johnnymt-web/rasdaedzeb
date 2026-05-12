-- ==========================================================
-- AI RESOURCE PROTECTION (RATE LIMITING)
-- ==========================================================

-- 1. Create Usage Stats Table
CREATE TABLE IF NOT EXISTS public.ai_usage_stats (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    message_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, usage_date)
);

-- 2. RLS for Usage Stats
ALTER TABLE public.ai_usage_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.ai_usage_stats FOR SELECT USING (auth.uid() = user_id);

-- 3. Function to check and increment usage
CREATE OR REPLACE FUNCTION public.check_and_increment_ai_usage(
    _user_id UUID, 
    _daily_limit INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count INT;
BEGIN
    -- Get or create today's record
    INSERT INTO public.ai_usage_stats (user_id, usage_date, message_count)
    VALUES (_user_id, CURRENT_DATE, 0)
    ON CONFLICT (user_id, usage_date) DO NOTHING;

    SELECT message_count INTO current_count 
    FROM public.ai_usage_stats 
    WHERE user_id = _user_id AND usage_date = CURRENT_DATE;

    IF current_count >= _daily_limit THEN
        RETURN FALSE;
    END IF;

    UPDATE public.ai_usage_stats 
    SET message_count = message_count + 1
    WHERE user_id = _user_id AND usage_date = CURRENT_DATE;

    RETURN TRUE;
END;
$$;
