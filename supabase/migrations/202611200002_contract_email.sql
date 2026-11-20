begin;
-- Verified backend events insert one immutable notification per logical event.
-- Each recipient, subject and body is a snapshot. Use expiring links for documents.
create table public.contract_email_queue (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.contract_projects,
  event_key text not null,
  kind text not null check (kind in ('signing_request','signature_reminder','deposit_receipt','installment_receipt','balance_request','payment_recovery','final_receipt')),
  recipient text not null,
  subject text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending','sending','accepted','failed','needs_review','canceled')),
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  attempts int not null default 0,
  provider_message_id text,
  last_error text,
  unique(project_id,event_key)
);
alter table public.contract_email_queue enable row level security;
revoke all on public.contract_email_queue from public,anon,authenticated;
grant select(id, project_id, kind, status, provider_message_id, last_error) on public.contract_email_queue to authenticated;
create policy email_staff_read on public.contract_email_queue for select to authenticated using (public.is_admin());
grant select, insert, update on public.contract_email_queue to service_role;

create function public.claim_contract_email()
returns setof public.contract_email_queue language plpgsql set search_path = '' as $$
begin
  -- An interrupted request may already have reached Brevo. Reconcile before resending.
  update public.contract_email_queue set status='needs_review',last_error='Delivery attempt interrupted'
    where status='sending' and claimed_at < now()-interval '5 minutes';
  return query
  with next_email as (
    select id from public.contract_email_queue where status='pending' and available_at<=now()
    order by available_at,id limit 1 for update skip locked
  )
  update public.contract_email_queue q set status='sending',attempts=attempts+1,claimed_at=now()
  from next_email where q.id=next_email.id returning q.*;
end $$;
revoke all on function public.claim_contract_email() from public,anon,authenticated;
grant execute on function public.claim_contract_email() to service_role;
commit;
