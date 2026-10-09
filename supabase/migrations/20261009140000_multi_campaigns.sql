-- 1. Drops e limpezas
alter table public.prizes drop column if exists hide_in_roleta_2;
alter table public.app_settings drop column if exists wheel_highlight_text_2;
alter table public.app_settings drop column if exists wheel_footer_text_2;
alter table public.app_settings drop column if exists wheel_subfooter_text_2;

-- 2. Add campaign_slug
alter table public.app_settings add column if not exists campaign_slug text not null default 'default';
alter table public.app_settings drop constraint if exists app_settings_campaign_slug_key;
alter table public.app_settings add constraint app_settings_campaign_slug_key unique (campaign_slug);

-- Setup campaign 'default' and 'ar-condicionado'
update public.app_settings set campaign_slug = 'default' where id = 1;

insert into public.app_settings (id, campaign_slug, event_name, wheel_title, wheel_subtitle, wheel_font_family)
values (
  (select coalesce(max(id), 1) + 1 from public.app_settings),
  'ar-condicionado',
  'Sorteio Ar Condicionado',
  'Concorra a um ar-condicionado',
  'Preencha o formulário e gire a roleta!',
  'Inter'
) on conflict (campaign_slug) do nothing;

alter table public.prizes add column if not exists campaign_slug text not null default 'default';

alter table public.event_sessions add column if not exists campaign_slug text not null default 'default';
drop index if exists public.active_session_idx;
create unique index active_session_idx on public.event_sessions (campaign_slug) where is_current = true;

insert into public.event_sessions (campaign_slug, is_current)
values ('ar-condicionado', true)
on conflict do nothing;

-- 3. Functions
drop function if exists public.start_new_event(boolean);
create or replace function public.start_new_event(p_restore_stock boolean default false, p_campaign_slug text default 'default')
returns void
language plpgsql
security definer
as $$
begin
  update public.event_sessions
  set is_current = false, ended_at = now()
  where is_current = true and campaign_slug = p_campaign_slug;

  insert into public.event_sessions (campaign_slug, is_current)
  values (p_campaign_slug, true);

  if p_restore_stock then
    update public.prizes
    set current_stock = initial_stock
    where active = true and campaign_slug = p_campaign_slug;
  end if;
end;
$$;

drop function if exists public.spin_wheel(uuid);
drop function if exists public.spin_wheel(uuid, boolean);
drop function if exists public.spin_wheel(uuid, text);

create or replace function public.spin_wheel(p_client_spin_id uuid default gen_random_uuid(), p_campaign_slug text default 'default')
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

  select * into strict v_settings from public.app_settings where campaign_slug = p_campaign_slug;
  select id into strict v_session_id from public.event_sessions where is_current = true and campaign_slug = p_campaign_slug;

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
    and p.campaign_slug = p_campaign_slug
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
    where p.active 
      and p.campaign_slug = p_campaign_slug
      and (not v_settings.stock_control_enabled or p.current_stock > 0)
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

revoke execute on function public.spin_wheel(uuid, text) from public;
grant execute on function public.spin_wheel(uuid, text) to anon, authenticated;

drop function if exists public.record_offline_spin(uuid, uuid, timestamptz);
drop function if exists public.record_offline_spin(uuid, uuid, timestamptz, text);

create or replace function public.record_offline_spin(p_client_spin_id uuid, p_prize_id uuid, p_created_at timestamptz, p_campaign_slug text default 'default')
returns table (
  spin_id uuid,
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
    return query select v_spin.id, v_spin.sync_status;
    return;
  end if;

  select * into strict v_settings from public.app_settings where campaign_slug = p_campaign_slug;
  select id into strict v_session_id from public.event_sessions where is_current = true and campaign_slug = p_campaign_slug;

  perform pg_advisory_xact_lock(hashtextextended(v_session_id::text, 0));

  select * into v_spin from public.spins s where s.client_spin_id = p_client_spin_id;
  if found then
    return query select v_spin.id, v_spin.sync_status;
    return;
  end if;

  select coalesce(max(s.spin_number), 0) + 1
  into v_spin_number
  from public.spins s
  where s.event_session_id = v_session_id;

  select * into v_prize from public.prizes where id = p_prize_id for update skip locked;

  if not found or not v_prize.active or v_prize.campaign_slug != p_campaign_slug then
    raise exception using message = 'PRIZE_UNAVAILABLE', errcode = 'P0002';
  end if;

  if v_settings.stock_control_enabled then
    if v_prize.current_stock <= 0 then
      raise exception using message = 'PRIZE_UNAVAILABLE', errcode = 'P0002';
    end if;
    update public.prizes set current_stock = current_stock - 1 where id = p_prize_id;
  end if;

  insert into public.spins (
    client_spin_id, event_session_id, prize_id, prize_name_snapshot,
    prize_image_url_snapshot, prize_color_snapshot, stock_after_spin,
    spin_number, created_at, source, sync_status
  )
  values (
    p_client_spin_id, v_session_id, p_prize_id, v_prize.name,
    v_prize.image_url, v_prize.color, greatest(0, v_prize.current_stock - 1),
    v_spin_number, p_created_at, 'offline', 'confirmed'
  )
  returning * into v_spin;

  return query select v_spin.id, v_spin.sync_status;
end;
$$;

revoke execute on function public.record_offline_spin(uuid, uuid, timestamptz, text) from public;
grant execute on function public.record_offline_spin(uuid, uuid, timestamptz, text) to anon, authenticated;
