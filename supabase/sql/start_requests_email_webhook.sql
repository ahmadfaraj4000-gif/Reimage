-- NOT USED FOR THE CURRENT SETUP.
--
-- Your current setup uses Supabase Dashboard -> Database -> Webhooks.
-- Do not run this SQL unless you intentionally want to replace the Dashboard
-- webhook with a manual database trigger.
--
-- Optional SQL setup if you prefer a database trigger over the Dashboard Webhooks UI.
-- The Dashboard Webhooks setup in supabase/functions/send-start-request-email/README.md is simpler.
--
-- Before using this SQL:
-- 1. Enable the pg_net extension in Supabase.
-- 2. Confirm the project ref below matches your Supabase project.
-- 3. Replace YOUR_EMAIL_WEBHOOK_SECRET with the same value as your Edge Function secret.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_start_request_email()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://uybcjtigyujoyrunecto.supabase.co/functions/v1/send-start-request-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-reimage-webhook-secret', 'YOUR_EMAIL_WEBHOOK_SECRET'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(NEW),
      'old_record', null
    )
  );

  return NEW;
end;
$$;

drop trigger if exists start_requests_send_email on public.start_requests;

create trigger start_requests_send_email
after insert on public.start_requests
for each row
execute function public.notify_start_request_email();
