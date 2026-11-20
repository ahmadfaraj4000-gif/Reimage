begin;

create table public.project_agreements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.contract_projects,
  recipient text not null,
  version text not null,
  terms text not null,
  document_text text not null,
  created_by uuid not null,
  issued_at timestamptz not null default now(),
  signed_by uuid,
  signed_at timestamptz,
  signer_name text,
  signature_png text,
  check ((signed_at is null and signed_by is null and signer_name is null and signature_png is null)
      or (signed_at is not null and signed_by is not null and signer_name is not null and signature_png is not null))
);
alter table public.project_agreements enable row level security;
revoke all on public.project_agreements from public, anon, authenticated;
grant select(id,project_id,signed_at) on public.project_agreements to authenticated;
create policy agreement_admin_summary on public.project_agreements for select to authenticated using (public.is_admin());

-- The exact displayed document is assembled once and preserved alongside the signature.
create function public.issue_project_agreement(p_project uuid,p_version text,p_terms text,p_preview boolean default true)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  p public.contract_projects;
  a public.project_agreements;
  doc text;
  total int;
  installment int;
  link text;
begin
  if auth.uid() is null or public.is_admin() is not true then raise insufficient_privilege; end if;
  select * into strict p from public.contract_projects where id=p_project for update;
  select * into a from public.project_agreements where project_id=p_project;
  if found then
    if a.version is distinct from btrim(p_version) or a.terms is distinct from btrim(p_terms) then
      raise exception 'An agreement has already been issued for this project';
    end if;
    return jsonb_build_object('id',a.id,'document',a.document_text);
  end if;
  if coalesce(length(btrim(p_version)),0) not between 1 and 120 or coalesce(length(btrim(p_terms)),0) not between 1 and 80000 then
    raise exception 'Enter the approved terms and version';
  end if;
  total := p.subtotal_cents-p.discount_cents+p.tax_cents;
  installment := total/p.installment_count;
  doc := concat_ws(E'\n', 'RE IMAGE Business Solutions · Project agreement',p.title,'Project '||p.id,
    'Customer: '||p.customer_name||' · '||p.customer_email,'Version: '||btrim(p_version),'',p.scope,'',
    (select string_agg(format('%s × %s at $%s', (i->>'quantity'),i->>'name',((i->>'price')::numeric/100)::numeric(12,2)),E'\n') from jsonb_array_elements(p.items) i),
    'Subtotal: $'||(p.subtotal_cents::numeric/100)::numeric(12,2),
    'Discount: $'||(p.discount_cents::numeric/100)::numeric(12,2),
    'Tax: '||coalesce('$'||(p.tax_cents::numeric/100)::numeric(12,2),'pending'),
    'Total: '||coalesce('$'||(total::numeric/100)::numeric(12,2),'pending tax'),
    (select string_agg(format('Payment %s · %s · %s',sequence,coalesce(due_date::text,'At signing'),
      coalesce('$'||((case when sequence=p.installment_count then total-installment*(sequence-1) else installment end)::numeric/100)::numeric(12,2),'pending tax')),E'\n' order by sequence)
      from public.contract_installments where project_id=p.id),
    case when p.autopay_required then 'Enrollment in this plan requires separate authorization for automatic card payments.' end,'',btrim(p_terms));
  if p_preview is true then return jsonb_build_object('document',doc); end if;
  if p.tax_cents is null then raise exception 'Finalize project tax before sending the agreement'; end if;
  insert into public.project_agreements(project_id,recipient,version,terms,document_text,created_by)
    values(p.id,p.customer_email,btrim(p_version),btrim(p_terms),doc,auth.uid()) returning * into a;
  link := 'https://login.reimagebs.com/?agreement='||a.id;
  insert into public.contract_email_queue(project_id,event_key,kind,recipient,subject,body)
    values(p.id,'agreement:'||a.id,'signing_request',a.recipient,'Review and sign your RE IMAGE project agreement',
    'Sign in with this email address to review and sign the agreement for '||p.title||E'.\n\n'||link);
  return jsonb_build_object('id',a.id,'document',doc);
end $$;

create function public.read_project_agreement(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.project_agreements;
begin
  select * into a from public.project_agreements where id=p_id and auth.uid() is not null and
    (public.is_admin() or signed_by=auth.uid() or (signed_at is null and exists(
      select from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and lower(u.email)=recipient)));
  if not found then raise insufficient_privilege; end if;
  return jsonb_build_object('id',a.id,'document',a.document_text,'signed_at',a.signed_at,'signer_name',a.signer_name,'signature_png',a.signature_png,
    'can_sign',a.signed_at is null and exists(select from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and lower(u.email)=a.recipient));
end $$;

create function public.sign_project_agreement(p_id uuid,p_name text,p_png text,p_consent boolean)
returns void language plpgsql security definer set search_path='' as $$
declare a public.project_agreements;
  bytes bytea;
begin
  select * into a from public.project_agreements where id=p_id for update;
  if not found or auth.uid() is null or not exists(select from auth.users u
    where u.id=auth.uid() and u.email_confirmed_at is not null and lower(u.email)=a.recipient)
    then raise insufficient_privilege; end if;
  if a.signed_at is not null then
    if a.signed_by=auth.uid() and a.signer_name=btrim(p_name) and a.signature_png=p_png and p_consent is true then return; end if;
    raise exception 'This agreement is already signed';
  end if;
  if p_consent is not true or coalesce(length(btrim(p_name)),0) not between 1 and 160
    or coalesce(length(p_png),0) not between 120 and 250000 or p_png !~ '^data:image/png;base64,[A-Za-z0-9+/]+=*$' then
    raise exception 'Provide your name, drawn signature and electronic signature consent';
  end if;
  bytes := decode(substr(p_png,23),'base64');
  if encode(substr(bytes,1,24),'hex') <> '89504e470d0a1a0a0000000d49484452000002d0000000dc'
    or encode(substr(bytes,length(bytes)-11),'hex') <> '0000000049454e44ae426082' then raise exception 'Invalid signature image'; end if;
  update public.project_agreements set signed_by=auth.uid(),signed_at=now(),signer_name=btrim(p_name),signature_png=p_png where id=a.id;
  update public.contract_email_queue set status='canceled' where project_id=a.project_id and kind='signature_reminder' and status='pending';
end $$;
revoke all on function public.issue_project_agreement(uuid,text,text,boolean),public.read_project_agreement(uuid),public.sign_project_agreement(uuid,text,text,boolean) from public, anon;
grant execute on function public.issue_project_agreement(uuid,text,text,boolean),public.read_project_agreement(uuid),public.sign_project_agreement(uuid,text,text,boolean) to authenticated;
create or replace function public.search_contract_drafts(p_query text, p_offset integer)
returns setof jsonb language sql stable security invoker set search_path = '' as $$
  select (to_jsonb(p) - 'draft_input' - 'created_by') || jsonb_build_object('agreement', (select jsonb_build_object('id',a.id,'signed_at',a.signed_at) from public.project_agreements a where a.project_id=p.id), 'schedule', (
    select jsonb_agg(to_jsonb(i) order by i.sequence) from public.contract_installments i where i.project_id=p.id))
  from public.contract_projects p
  where strpos(lower(concat_ws(' ', p.id,p.title,p.customer_name,p.customer_email)), lower(coalesce(p_query,''))) > 0
  order by p.created_at desc, p.id limit 26 offset greatest(p_offset,0);
$$;
commit;
