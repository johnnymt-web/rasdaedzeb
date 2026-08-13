-- Migrate scheduled O*NET cache refresh away from the legacy service_role JWT.
-- The dedicated automations secret key is stored in Supabase Vault and is
-- supplied to the Edge Function via the apikey header.

do $$
begin
  if exists (
    select 1
    from cron.job
    where jobname = 'refresh-onet-cache-weekly'
  ) then
    perform cron.unschedule('refresh-onet-cache-weekly');
  end if;
end
$$;

select cron.schedule(
  'refresh-onet-cache-weekly',
  '0 3 * * 1',
  $$
  select net.http_post(
    url := 'https://sxhzxlfxfveidjrepvwe.supabase.co/functions/v1/refresh-onet-cache',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'onet_automations_api_key'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);