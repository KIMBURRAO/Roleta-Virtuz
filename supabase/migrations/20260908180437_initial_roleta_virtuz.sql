create extension if not exists pgcrypto with schema extensions;

create table public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Evento',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  is_current boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  constraint event_sessions_end_after_start check (ended_at is null or ended_at >= started_at)
);

create unique index event_sessions_one_current_idx on public.event_sessions (is_current) where is_current;

create table public.app_settings (
  id smallint primary key default 1,
  event_name text not null default 'Virtuz',
  wheel_title text not null default 'Roda da sorte',
  wheel_subtitle text not null default 'Gire a roleta e descubra seu prêmio!',
  logo_url text,
  primary_color text not null default '#08C900',
  secondary_color text not null default '#064F25',
  background_color text not null default '#043F1E',
  button_color text not null default '#0BE000',
  text_color text not null default '#FFFFFF',
  background_image_url text,
  sound_enabled boolean not null default false,
  confetti_enabled boolean not null default true,
  show_images boolean not null default true,
  show_names boolean not null default true,
  stock_control_enabled boolean not null default true,
  weighted_draw_enabled boolean not null default true,
  fullscreen_button_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1),
  constraint app_settings_primary_color check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint app_settings_secondary_color check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint app_settings_background_color check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint app_settings_button_color check (button_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint app_settings_text_color check (text_color ~ '^#[0-9A-Fa-f]{6}$')
);

create table public.prizes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  color text not null default '#08C900',
  initial_stock integer not null default 0,
  current_stock integer not null default 0,
  weight numeric(12, 4) not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prizes_name_length check (char_length(btrim(name)) between 2 and 80),
  constraint prizes_description_length check (description is null or char_length(description) <= 240),
  constraint prizes_color check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint prizes_initial_stock_nonnegative check (initial_stock >= 0),
  constraint prizes_current_stock_nonnegative check (current_stock >= 0),
  constraint prizes_weight_positive check (weight > 0 and weight <= 10000)
);

create index prizes_public_eligible_idx on public.prizes (created_at, id) where active;

create table public.spins (
  id uuid primary key default gen_random_uuid(),
  client_spin_id uuid not null unique,
  event_session_id uuid not null references public.event_sessions(id) on delete restrict,
  prize_id uuid references public.prizes(id) on delete set null,
  prize_name_snapshot text not null,
  prize_image_url_snapshot text,
  prize_color_snapshot text not null,
  stock_after_spin integer not null,
  source text not null default 'online',
  sync_status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  constraint spins_source check (source in ('online', 'offline')),
  constraint spins_sync_status check (sync_status in ('confirmed', 'pending', 'conflict')),
  constraint spins_stock_nonnegative check (stock_after_spin >= 0)
);

create index spins_session_created_idx on public.spins (event_session_id, created_at desc);
create index spins_prize_created_idx on public.spins (prize_id, created_at desc);

create table public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  prize_id uuid not null references public.prizes(id) on delete cascade,
  event_session_id uuid references public.event_sessions(id) on delete set null,
  quantity integer not null,
  stock_before integer not null,
  stock_after integer not null,
  reason text not null default 'replenishment',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint stock_adjustments_quantity_positive check (quantity > 0),
  constraint stock_adjustments_stocks_nonnegative check (stock_before >= 0 and stock_after >= 0)
);

create index stock_adjustments_prize_created_idx on public.stock_adjustments (prize_id, created_at desc);

insert into public.event_sessions (name) values ('Evento inicial');
insert into public.app_settings (id) values (1);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prizes_set_updated_at before update on public.prizes for each row execute function public.set_updated_at();
create trigger app_settings_set_updated_at before update on public.app_settings for each row execute function public.set_updated_at();

alter table public.event_sessions enable row level security;
alter table public.app_settings enable row level security;
alter table public.prizes enable row level security;
alter table public.spins enable row level security;
alter table public.stock_adjustments enable row level security;

revoke all on public.event_sessions, public.app_settings, public.prizes, public.spins, public.stock_adjustments from anon, authenticated;
grant select on public.event_sessions, public.app_settings, public.prizes to anon;
grant select on public.event_sessions, public.app_settings, public.prizes, public.spins, public.stock_adjustments to authenticated;
grant insert, update, delete on public.prizes to authenticated;
grant insert, update on public.app_settings to authenticated;

create policy "public reads current event" on public.event_sessions for select to anon, authenticated using (is_current);
create policy "admins read all events" on public.event_sessions for select to authenticated using (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);

create policy "public reads settings" on public.app_settings for select to anon, authenticated using (id = 1);
create policy "admins insert settings" on public.app_settings for insert to authenticated with check (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin' and id = 1
);
create policy "admins update settings" on public.app_settings for update to authenticated using (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
) with check (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin' and id = 1
);

create policy "public reads active prizes" on public.prizes for select to anon, authenticated using (active);
create policy "admins read all prizes" on public.prizes for select to authenticated using (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
create policy "admins insert prizes" on public.prizes for insert to authenticated with check (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
create policy "admins update prizes" on public.prizes for update to authenticated using (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
) with check (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
create policy "admins delete prizes" on public.prizes for delete to authenticated using (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);

create policy "admins read spins" on public.spins for select to authenticated using (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
create policy "admins read stock adjustments" on public.stock_adjustments for select to authenticated using (
  (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);

create or replace function public.spin_wheel(p_client_spin_id uuid default gen_random_uuid())
returns table (
  spin_id uuid,
  client_spin_id uuid,
  prize_id uuid,
  prize_name text,
  prize_image_url text,
  prize_color text,
  stock_after_spin integer,
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
begin
  select * into v_spin from public.spins s where s.client_spin_id = p_client_spin_id;
  if found then
    return query select v_spin.id, v_spin.client_spin_id, v_spin.prize_id, v_spin.prize_name_snapshot,
      v_spin.prize_image_url_snapshot, v_spin.prize_color_snapshot, v_spin.stock_after_spin,
      v_spin.created_at, v_spin.source, v_spin.sync_status;
    return;
  end if;

  select * into strict v_settings from public.app_settings where id = 1;
  select id into strict v_session_id from public.event_sessions where is_current;

  select p.* into v_prize
  from public.prizes p
  where p.active and (not v_settings.stock_control_enabled or p.current_stock > 0)
  order by (-ln(greatest(random(), 0.000000000001))) /
    (case when v_settings.weighted_draw_enabled then p.weight else 1 end)
  for update of p skip locked
  limit 1;

  if not found then raise exception using message = 'NO_PRIZES_AVAILABLE', errcode = 'P0001'; end if;

  if v_settings.stock_control_enabled then
    update public.prizes set current_stock = current_stock - 1 where id = v_prize.id and current_stock > 0 returning * into v_prize;
    if not found then raise exception using message = 'PRIZE_UNAVAILABLE', errcode = 'P0001'; end if;
  end if;

  insert into public.spins (client_spin_id, event_session_id, prize_id, prize_name_snapshot, prize_image_url_snapshot, prize_color_snapshot, stock_after_spin, source, sync_status)
  values (p_client_spin_id, v_session_id, v_prize.id, v_prize.name, v_prize.image_url, v_prize.color, v_prize.current_stock, 'online', 'confirmed')
  returning * into v_spin;

  return query select v_spin.id, v_spin.client_spin_id, v_spin.prize_id, v_spin.prize_name_snapshot,
    v_spin.prize_image_url_snapshot, v_spin.prize_color_snapshot, v_spin.stock_after_spin,
    v_spin.created_at, v_spin.source, v_spin.sync_status;
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
begin
  select id into v_existing from public.spins where client_spin_id = p_client_spin_id;
  if found then return v_existing; end if;
  if (select stock_control_enabled from public.app_settings where id = 1) then
    raise exception using message = 'OFFLINE_DISABLED_WHILE_STOCK_CONTROL_IS_ON', errcode = 'P0001';
  end if;
  select * into v_prize from public.prizes where id = p_prize_id and active;
  if not found then raise exception using message = 'PRIZE_UNAVAILABLE', errcode = 'P0001'; end if;
  select id into strict v_session_id from public.event_sessions where is_current;
  insert into public.spins (client_spin_id, event_session_id, prize_id, prize_name_snapshot, prize_image_url_snapshot, prize_color_snapshot, stock_after_spin, source, sync_status, created_at)
  values (p_client_spin_id, v_session_id, v_prize.id, v_prize.name, v_prize.image_url, v_prize.color, v_prize.current_stock, 'offline', 'confirmed', least(p_created_at, now()))
  returning id into v_spin_id;
  return v_spin_id;
end;
$$;

create or replace function public.adjust_prize_stock(p_prize_id uuid, p_quantity integer)
returns public.prizes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before integer;
  v_after public.prizes%rowtype;
  v_session_id uuid;
begin
  if (select auth.uid()) is null or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception using message = 'ADMIN_REQUIRED', errcode = '42501';
  end if;
  if p_quantity <= 0 then raise exception using message = 'INVALID_QUANTITY', errcode = '22023'; end if;
  select current_stock into v_before from public.prizes where id = p_prize_id for update;
  if not found then raise exception using message = 'PRIZE_NOT_FOUND', errcode = 'P0002'; end if;
  update public.prizes set current_stock = current_stock + p_quantity where id = p_prize_id returning * into v_after;
  select id into v_session_id from public.event_sessions where is_current;
  insert into public.stock_adjustments (prize_id, event_session_id, quantity, stock_before, stock_after, created_by)
  values (p_prize_id, v_session_id, p_quantity, v_before, v_after.current_stock, (select auth.uid()));
  return v_after;
end;
$$;

create or replace function public.start_new_event(p_restore_stock boolean default false)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_session_id uuid;
begin
  if (select auth.uid()) is null or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception using message = 'ADMIN_REQUIRED', errcode = '42501';
  end if;
  update public.event_sessions set is_current = false, ended_at = now() where is_current;
  if p_restore_stock then update public.prizes set current_stock = initial_stock; end if;
  insert into public.event_sessions (name, created_by) values ((select event_name from public.app_settings where id = 1), (select auth.uid())) returning id into v_session_id;
  return v_session_id;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.spin_wheel(uuid) from public;
revoke execute on function public.record_offline_spin(uuid, uuid, timestamptz) from public;
revoke execute on function public.adjust_prize_stock(uuid, integer) from public;
revoke execute on function public.start_new_event(boolean) from public;
grant execute on function public.spin_wheel(uuid), public.record_offline_spin(uuid, uuid, timestamptz) to anon, authenticated;
grant execute on function public.adjust_prize_stock(uuid, integer), public.start_new_event(boolean) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('virtuz-assets', 'virtuz-assets', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads virtuz assets" on storage.objects for select to anon, authenticated using (bucket_id = 'virtuz-assets');
create policy "admins insert virtuz assets" on storage.objects for insert to authenticated with check (
  bucket_id = 'virtuz-assets' and (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
create policy "admins update virtuz assets" on storage.objects for update to authenticated using (
  bucket_id = 'virtuz-assets' and (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
) with check (
  bucket_id = 'virtuz-assets' and (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);
create policy "admins delete virtuz assets" on storage.objects for delete to authenticated using (
  bucket_id = 'virtuz-assets' and (select auth.uid()) is not null and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'prizes') then
    alter publication supabase_realtime add table public.prizes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_settings') then
    alter publication supabase_realtime add table public.app_settings;
  end if;
end $$;
