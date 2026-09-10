create table public.raffle_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  campaign text not null default 'sorteio-ar-condicionado',
  created_at timestamptz not null default now(),
  constraint raffle_leads_full_name_length check (char_length(btrim(full_name)) between 3 and 120),
  constraint raffle_leads_phone_length check (char_length(regexp_replace(phone, '\D', '', 'g')) between 10 and 13),
  constraint raffle_leads_email_format check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint raffle_leads_email_length check (char_length(email) <= 160),
  constraint raffle_leads_address_length check (char_length(btrim(address)) between 5 and 300),
  constraint raffle_leads_campaign_length check (char_length(btrim(campaign)) between 3 and 80)
);

create index raffle_leads_created_idx on public.raffle_leads (created_at desc);
create index raffle_leads_campaign_created_idx on public.raffle_leads (campaign, created_at desc);
create unique index raffle_leads_campaign_email_unique_idx on public.raffle_leads (campaign, lower(email));
create unique index raffle_leads_campaign_phone_unique_idx on public.raffle_leads (campaign, regexp_replace(phone, '\D', '', 'g'));

alter table public.raffle_leads enable row level security;

revoke all on public.raffle_leads from anon, authenticated;
grant insert on public.raffle_leads to anon, authenticated;
grant select, delete on public.raffle_leads to authenticated;

create policy "public inserts raffle leads" on public.raffle_leads
for insert to anon, authenticated
with check (true);

create policy "admins read raffle leads" on public.raffle_leads
for select to authenticated
using (
  (select auth.uid()) is not null
  and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);

create policy "admins delete raffle leads" on public.raffle_leads
for delete to authenticated
using (
  (select auth.uid()) is not null
  and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
