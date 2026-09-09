alter table public.prizes add column if not exists forced_at_spin integer;
alter table public.prizes add column if not exists forced_every_spins integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'prizes_forced_at_spin_positive') then
    alter table public.prizes add constraint prizes_forced_at_spin_positive check (forced_at_spin is null or forced_at_spin > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'prizes_forced_every_spins_positive') then
    alter table public.prizes add constraint prizes_forced_every_spins_positive check (forced_every_spins is null or forced_every_spins > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'prizes_single_forced_rule') then
    alter table public.prizes add constraint prizes_single_forced_rule check (forced_at_spin is null or forced_every_spins is null);
  end if;
end $$;

alter table public.spins add column if not exists spin_number integer;

with numbered as (
  select
    id,
    row_number() over (partition by event_session_id order by created_at, id)::integer as next_spin_number
  from public.spins
  where spin_number is null
)
update public.spins s
set spin_number = numbered.next_spin_number
from numbered
where s.id = numbered.id;

alter table public.spins alter column spin_number set not null;
create unique index if not exists spins_session_spin_number_idx on public.spins (event_session_id, spin_number);

create index if not exists prizes_forced_rules_idx
on public.prizes (forced_at_spin, forced_every_spins, created_at)
where active and (forced_at_spin is not null or forced_every_spins is not null);

revoke select on public.prizes from anon;
grant select (id, name, description, image_url, color, initial_stock, current_stock, weight, active, created_at, updated_at) on public.prizes to anon;

drop function if exists public.spin_wheel(uuid);

create or replace function public.spin_wheel(p_client_spin_id uuid default gen_random_uuid())
returns table (
  spin_id uuid,
  client_spin_id uuid,
  prize_id uuid,
  prize_name text,
  prize_image_url text,
  prize_color text,
  stock_after_spin integer,
  spin_number integer,
  created_at timestamptz,
  source text,
  sync_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prize public.prizes%rowtype;
  v_settings public.app_settings%rowtype;
  v_session_id uuid;
  v_spin public.spins%rowtype;
  v_spin_number integer;
begin
  select * into v_spin from public.spins s where s.client_spin_id = p_client_spin_id;
  if found then
    return query select v_spin.id, v_spin.client_spin_id, v_spin.prize_id, v_spin.prize_name_snapshot,
      v_spin.prize_image_url_snapshot, v_spin.prize_color_snapshot, v_spin.stock_after_spin,
      v_spin.spin_number, v_spin.created_at, v_spin.source, v_spin.sync_status;
    return;
  end if;

  select * into strict v_settings from public.app_settings where id = 1;
  select id into strict v_session_id from public.event_sessions where is_current;

  perform pg_advisory_xact_lock(hashtextextended(v_session_id::text, 0));

  select * into v_spin from public.spins s where s.client_spin_id = p_client_spin_id;
  if found then
    return query select v_spin.id, v_spin.client_spin_id, v_spin.prize_id, v_spin.prize_name_snapshot,
      v_spin.prize_image_url_snapshot, v_spin.prize_color_snapshot, v_spin.stock_after_spin,
      v_spin.spin_number, v_spin.created_at, v_spin.source, v_spin.sync_status;
    return;
  end if;

  select coalesce(max(s.spin_number), 0) + 1
  into v_spin_number
  from public.spins s
  where s.event_session_id = v_session_id;

  select p.* into v_prize
  from public.prizes p
  where p.active
    and (not v_settings.stock_control_enabled or p.current_stock > 0)
    and (
      p.forced_at_spin = v_spin_number
      or (p.forced_every_spins is not null and v_spin_number % p.forced_every_spins = 0)
    )
  order by
    case when p.forced_at_spin = v_spin_number then 0 else 1 end,
    p.created_at,
    p.id
  for update of p skip locked
  limit 1;

  if not found then
    select p.* into v_prize
    from public.prizes p
    where p.active and (not v_settings.stock_control_enabled or p.current_stock > 0)
    order by (-ln(greatest(random(), 0.000000000001))) /
      (case when v_settings.weighted_draw_enabled then p.weight else 1 end)
    for update of p skip locked
    limit 1;
  end if;

  if not found then raise exception using message = 'NO_PRIZES_AVAILABLE', errcode = 'P0001'; end if;

  if v_settings.stock_control_enabled then
    update public.prizes set current_stock = current_stock - 1 where id = v_prize.id and current_stock > 0 returning * into v_prize;
    if not found then raise exception using message = 'PRIZE_UNAVAILABLE', errcode = 'P0001'; end if;
  end if;

  insert into public.spins (client_spin_id, event_session_id, prize_id, prize_name_snapshot, prize_image_url_snapshot, prize_color_snapshot, stock_after_spin, spin_number, source, sync_status)
  values (p_client_spin_id, v_session_id, v_prize.id, v_prize.name, v_prize.image_url, v_prize.color, v_prize.current_stock, v_spin_number, 'online', 'confirmed')
  returning * into v_spin;

  return query select v_spin.id, v_spin.client_spin_id, v_spin.prize_id, v_spin.prize_name_snapshot,
    v_spin.prize_image_url_snapshot, v_spin.prize_color_snapshot, v_spin.stock_after_spin,
    v_spin.spin_number, v_spin.created_at, v_spin.source, v_spin.sync_status;
end;
$$;

create or replace function public.record_offline_spin(p_client_spin_id uuid, p_prize_id uuid, p_created_at timestamptz)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prize public.prizes%rowtype;
  v_session_id uuid;
  v_existing uuid;
  v_spin_id uuid;
  v_spin_number integer;
begin
  select id into v_existing from public.spins where client_spin_id = p_client_spin_id;
  if found then return v_existing; end if;
  if (select stock_control_enabled from public.app_settings where id = 1) then
    raise exception using message = 'OFFLINE_DISABLED_WHILE_STOCK_CONTROL_IS_ON', errcode = 'P0001';
  end if;
  select * into v_prize from public.prizes where id = p_prize_id and active;
  if not found then raise exception using message = 'PRIZE_UNAVAILABLE', errcode = 'P0001'; end if;
  select id into strict v_session_id from public.event_sessions where is_current;
  perform pg_advisory_xact_lock(hashtextextended(v_session_id::text, 0));
  select coalesce(max(s.spin_number), 0) + 1 into v_spin_number from public.spins s where s.event_session_id = v_session_id;
  insert into public.spins (client_spin_id, event_session_id, prize_id, prize_name_snapshot, prize_image_url_snapshot, prize_color_snapshot, stock_after_spin, spin_number, source, sync_status, created_at)
  values (p_client_spin_id, v_session_id, v_prize.id, v_prize.name, v_prize.image_url, v_prize.color, v_prize.current_stock, v_spin_number, 'offline', 'confirmed', least(p_created_at, now()))
  returning id into v_spin_id;
  return v_spin_id;
end;
$$;

revoke execute on function public.spin_wheel(uuid) from public;
revoke execute on function public.record_offline_spin(uuid, uuid, timestamptz) from public;
grant execute on function public.spin_wheel(uuid), public.record_offline_spin(uuid, uuid, timestamptz) to anon, authenticated;
