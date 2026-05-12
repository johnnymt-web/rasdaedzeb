-- ==========================================================
-- PII ENCRYPTION (COUNSELOR NOTES)
-- ==========================================================

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Modify counselor_notes to support encryption
-- We will store a hash of the content for searching if needed, 
-- but the primary content will be encrypted.
ALTER TABLE public.counselor_notes 
  ALTER COLUMN content SET DATA TYPE BYTEA USING (content::bytea);

-- 3. Utility functions for encryption/decryption
-- IMPORTANT: In a real production environment, 'your-secret-key' should be 
-- managed via Supabase Vault or a Postgres config variable.
CREATE OR REPLACE FUNCTION public.encrypt_note(content TEXT, secret TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(content, secret);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrypt_note(encrypted_content BYTEA, secret TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_content, secret);
END;
$$ LANGUAGE plpgsql;
