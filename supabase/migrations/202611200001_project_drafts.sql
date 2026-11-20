begin;

create table public.contract_customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null
);

create table public.contract_projects (
  id uuid primary key,
  customer_id uuid not null references public.contract_customers,
  customer_name text not null,
  customer_email text not null,
  title text not null,
  scope text not null,
  items jsonb not null,
  subtotal_cents integer not null,
  discount_cents integer not null check (discount_cents between 0 and subtotal_cents),
  tax_cents integer check (tax_cents >= 0),
  installment_count integer not null check (installment_count between 2 and 4),
  autopay_required boolean generated always as (installment_count > 2) stored,
  created_at timestamptz not null default now(),
  created_by uuid not null,
  draft_input jsonb not null
);

create table public.contract_installments (
  project_id uuid not null references public.contract_projects,
  sequence integer not null,
  due_date date,
  pretax_cents integer not null check (pretax_cents >= 50),
  primary key (project_id, sequence),
  check ((sequence = 1) = (due_date is null))
);

alter table public.contract_customers enable row level security;
alter table public.contract_projects enable row level security;
alter table public.contract_installments enable row level security;
revoke all on public.contract_customers, public.contract_projects, public.contract_installments from public, anon, authenticated;
grant select on public.contract_projects, public.contract_installments to authenticated;
create policy project_staff_read on public.contract_projects for select to authenticated using (public.is_admin());
create policy schedule_staff_read on public.contract_installments for select to authenticated using (public.is_admin());

-- Only the admin RPC can create a draft. Normal checkout cannot collect against it.
create function public.create_contract_draft(p_id uuid, p_input jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  email_address text := lower(btrim(p_input->>'email'));
  full_name text := btrim(p_input->>'name');
  title text := btrim(p_input->>'title');
  scope text := btrim(p_input->>'scope');
  dates jsonb := p_input->'dates';
  count_payments int := jsonb_array_length(dates) + 1;
  snapshot jsonb := '[]';
  item jsonb;
  product_name text;
  price int;
  qty int;
  subtotal int := 0;
  discount int := (p_input->>'discount_cents')::int;
  expected int;
  customer uuid;
  previous date;
  due date;
  saved public.contract_projects%rowtype;
begin
  if auth.uid() is null or public.is_admin() is not true then raise insufficient_privilege; end if;
  if p_id is null then raise exception 'Missing project identifier'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into saved from public.contract_projects where id = p_id;
  if found then
    if saved.created_by = auth.uid() and saved.draft_input = p_input then return p_id; end if;
    raise exception 'This identifier already belongs to a different draft';
  end if;
  if coalesce(email_address,'') !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     or length(email_address)>254 or coalesce(length(full_name),0) not between 1 and 160
     or coalesce(length(title),0) not between 1 and 200 or coalesce(length(scope),0) not between 1 and 4000
     or coalesce(count_payments,0) not between 2 and 4
     or coalesce(jsonb_array_length(p_input->'items'),0) not between 1 and 3 then
    raise exception 'Invalid customer, project or schedule';
  end if;
  for item in select value from jsonb_array_elements(p_input->'items') loop
    select c.name,c.cents into product_name,price from (values
      ('foundation','Foundation',99900),('business-hub','Business Hub',189900),
      ('operations','Operations',249900)) c(id,name,cents) where c.id=item->>'id';
    qty := (item->>'quantity')::int;
    if price is null or coalesce(qty,0) not between 1 and 50
       or snapshot @> jsonb_build_array(jsonb_build_object('id',item->>'id')) then
      raise exception 'Invalid POS product or quantity';
    end if;
    subtotal := subtotal + price*qty;
    snapshot := snapshot || jsonb_build_array(jsonb_build_object('id',item->>'id','name',product_name,'price',price,'quantity',qty));
  end loop;
  if discount is null or discount < 0 or subtotal-discount < 50*count_payments then
    raise exception 'Discount leaves too little for the payment schedule';
  end if;
  insert into public.contract_customers(email,name) values(email_address,full_name)
    on conflict(email) do update set name=excluded.name returning id into customer;
  insert into public.contract_projects(id,customer_id,customer_name,customer_email,title,scope,items,
    subtotal_cents,discount_cents,installment_count,created_by,draft_input)
    values(p_id,customer,full_name,email_address,title,scope,snapshot,subtotal,discount,count_payments,auth.uid(),p_input);
  expected := (subtotal-discount)/count_payments;
  for n in 1..count_payments loop
    due := case when n>1 then (dates->>(n-2))::date end;
    if n>1 and (due is null or due < current_date or due <= previous) then
      raise exception 'Choose upcoming dates in increasing order';
    end if;
    insert into public.contract_installments values(p_id,n,due,
      case when n=count_payments then subtotal-discount-expected*(n-1) else expected end);
    previous := due;
  end loop;
  return p_id;
end $$;
revoke all on function public.create_contract_draft(uuid,jsonb) from public,anon;
grant execute on function public.create_contract_draft(uuid,jsonb) to authenticated;

create function public.search_contract_drafts(p_query text, p_offset integer)
returns setof jsonb language sql stable security invoker set search_path = '' as $$
  select (to_jsonb(p) - 'draft_input' - 'created_by') || jsonb_build_object('schedule', (
    select jsonb_agg(to_jsonb(i) order by i.sequence) from public.contract_installments i where i.project_id=p.id))
  from public.contract_projects p
  where strpos(lower(concat_ws(' ', p.id,p.title,p.customer_name,p.customer_email)), lower(coalesce(p_query,''))) > 0
  order by p.created_at desc, p.id limit 26 offset greatest(p_offset,0);
$$;
revoke all on function public.search_contract_drafts(text,integer) from public, anon;
grant execute on function public.search_contract_drafts(text,integer) to authenticated;
commit;
