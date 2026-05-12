-- Add temp_password column to pre_boarding table
ALTER TABLE public.pre_boarding ADD COLUMN IF NOT EXISTS temp_password TEXT;

-- Update audit logs to include password status if needed
COMMENT ON COLUMN public.pre_boarding.temp_password IS 'Temporary password set by admin during bulk import. This should be handled by a secure creation process.';
