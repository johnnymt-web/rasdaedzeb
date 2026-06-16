-- =========================================================================
-- Scheduled O*NET cache refresh (Phase 4 #8)
-- Calls the `refresh-onet-cache` Edge Function weekly via pg_cron + pg_net.
--
-- PREREQUISITES (do these in the Supabase project before/with applying):
--   1. Deploy the `refresh-onet-cache` Edge Function.
--   2. Store the service role key in Vault as a secret named 'service_role_key':
--        select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
--   The key is NEVER hardcoded here — it is read from vault.decrypted_secrets.
-- =========================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: drop any previous schedule before recreating it.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'refresh-onet-cache-weekly') then
    perform cron.unschedule('refresh-onet-cache-weekly');
  end if;
end $$;

-- Mondays at 03:00 UTC.
select cron.schedule(
  'refresh-onet-cache-weekly',
  '0 3 * * 1',
  $$
  select net.http_post(
    url := 'https://sxhzxlfxfveidjrepvwe.supabase.co/functions/v1/refresh-onet-cache',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
