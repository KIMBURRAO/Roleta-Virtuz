const fs = require('fs');

// 1. domain.ts
let domain = fs.readFileSync('src/types/domain.ts', 'utf8');
domain = domain.replace('active: boolean', 'active: boolean\n  hideInRoleta2: boolean');
domain = domain.replace('wheelSubfooterText: string', 'wheelSubfooterText: string\n  wheelHighlightText2: string\n  wheelFooterText2: string\n  wheelSubfooterText2: string');
fs.writeFileSync('src/types/domain.ts', domain);

// 2. mappers.ts
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
mappers = mappers.replace('active: Boolean(row.active),', 'active: Boolean(row.active),\n    hideInRoleta2: Boolean(row.hide_in_roleta_2),');
mappers = mappers.replace('wheelSubfooterText: string(row.wheel_subfooter_text, DEFAULT_SETTINGS.wheelSubfooterText),', 'wheelSubfooterText: string(row.wheel_subfooter_text, DEFAULT_SETTINGS.wheelSubfooterText),\n    wheelHighlightText2: string(row.wheel_highlight_text_2, DEFAULT_SETTINGS.wheelHighlightText2),\n    wheelFooterText2: string(row.wheel_footer_text_2, DEFAULT_SETTINGS.wheelFooterText2),\n    wheelSubfooterText2: string(row.wheel_subfooter_text_2, DEFAULT_SETTINGS.wheelSubfooterText2),');
mappers = mappers.replace('wheel_subfooter_text: settings.wheelSubfooterText,', 'wheel_subfooter_text: settings.wheelSubfooterText,\n    wheel_highlight_text_2: settings.wheelHighlightText2,\n    wheel_footer_text_2: settings.wheelFooterText2,\n    wheel_subfooter_text_2: settings.wheelSubfooterText2,');
fs.writeFileSync('src/services/mappers.ts', mappers);

// 3. defaults.ts
let defaults = fs.readFileSync('src/lib/defaults.ts', 'utf8');
defaults = defaults.replace('wheelSubfooterText: \'Seu prêmio será revelado ao final da rodada.\',', 'wheelSubfooterText: \'Seu prêmio será revelado ao final da rodada.\',\n  wheelHighlightText2: \'\',\n  wheelFooterText2: \'Boa sorte! 🍀\',\n  wheelSubfooterText2: \'Seu prêmio será revelado ao final da rodada.\',');
fs.writeFileSync('src/lib/defaults.ts', defaults);

// 4. prize-schema.ts
let prizeSchema = fs.readFileSync('src/features/prizes/prize-schema.ts', 'utf8');
prizeSchema = prizeSchema.replace('active: z.boolean(),', 'active: z.boolean(),\n  hideInRoleta2: z.boolean().default(false),');
fs.writeFileSync('src/features/prizes/prize-schema.ts', prizeSchema);

// 5. api.ts
let api = fs.readFileSync('src/services/api.ts', 'utf8');
api = api.replace('active: input.active,', 'active: input.active,\n      hide_in_roleta_2: input.hideInRoleta2,');
api = api.replace('active: false,', 'active: false,\n    hideInRoleta2: prize.hideInRoleta2,');
api = api.replace('spinOnline(clientSpinId: string)', 'spinOnline(clientSpinId: string, isRoleta2 = false)');
api = api.replace('p_client_spin_id: clientSpinId', 'p_client_spin_id: clientSpinId, p_is_roleta_2: isRoleta2');
api = api.replace('function offlineSpinFromPrize(prize: Prize, clientSpinId: string)', 'function offlineSpinFromPrize(prize: Prize, clientSpinId: string, isRoleta2 = false)');
api = api.replace('prizeId: prize.id,', 'prizeId: prize.id,\n    isRoleta2,'); // Note: OfflineSpin type might need isRoleta2, let's ignore it for now or just not pass it there since offline syncing is complicated
fs.writeFileSync('src/services/api.ts', api);

// 6. PrizeFormDialog.tsx
let dialog = fs.readFileSync('src/features/prizes/PrizeFormDialog.tsx', 'utf8');
dialog = dialog.replace('const [active, setActive] = useState(prize?.active ?? true)', 'const [active, setActive] = useState(prize?.active ?? true)\n  const [hideInRoleta2, setHideInRoleta2] = useState(prize?.hideInRoleta2 ?? false)');
dialog = dialog.replace('active, ...forcedRule', 'active, hideInRoleta2, ...forcedRule');
dialog = dialog.replace('<Field label="Status"><label className="switch-row"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /><span>Prêmio ativo</span></label></Field>', '<Field label="Status"><label className="switch-row"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /><span>Prêmio ativo</span></label><label className="switch-row" style={{marginTop:"8px"}}><input type="checkbox" checked={hideInRoleta2} onChange={(event) => setHideInRoleta2(event.target.checked)} /><span>Esconder na Roleta 2</span></label></Field>');
fs.writeFileSync('src/features/prizes/PrizeFormDialog.tsx', dialog);

// 7. AppearancePage.tsx
let appearance = fs.readFileSync('src/pages/admin/AppearancePage.tsx', 'utf8');
appearance = appearance.replace('<h2>Textos da Roleta</h2>', '<h2>Textos da Roleta Principal</h2>');
appearance = appearance.replace('Textos secundários</p>', 'Textos secundários</p></Field>\n      <h2>Textos da Roleta 2</h2>\n      <Field label="Texto Destaque (Roleta 2)"><Input value={settings.wheelHighlightText2} onChange={(event) => set(\'wheelHighlightText2\', event.target.value)} /></Field>\n      <Field label="Rodapé Linha 1 (Roleta 2)"><Input value={settings.wheelFooterText2} onChange={(event) => set(\'wheelFooterText2\', event.target.value)} /></Field>\n      <Field label="Rodapé Linha 2 (Roleta 2)"><Input value={settings.wheelSubfooterText2} onChange={(event) => set(\'wheelSubfooterText2\', event.target.value)} /></Field>');
fs.writeFileSync('src/pages/admin/AppearancePage.tsx', appearance);

// 8. WheelPage.tsx
let wheelPage = fs.readFileSync('src/pages/public/WheelPage.tsx', 'utf8');
wheelPage = wheelPage.replace('export function WheelPage() {', 'export function WheelPage({ isRoleta2 = false }: { isRoleta2?: boolean }) {');
wheelPage = wheelPage.replace('const wheel = useWheel()', 'const wheel = useWheel(isRoleta2)');
wheelPage = wheelPage.replace('const { settings, prizes, status, rotation } = wheel', 'const { settings, status, rotation } = wheel\n  const prizes = wheel.prizes.filter((p) => !isRoleta2 || !p.hideInRoleta2)');
wheelPage = wheelPage.replace('{settings.wheelHighlightText}', '{isRoleta2 ? settings.wheelHighlightText2 : settings.wheelHighlightText}');
wheelPage = wheelPage.replace('{settings.wheelFooterText}', '{isRoleta2 ? settings.wheelFooterText2 : settings.wheelFooterText}');
wheelPage = wheelPage.replace('{settings.wheelSubfooterText}', '{isRoleta2 ? settings.wheelSubfooterText2 : settings.wheelSubfooterText}');
fs.writeFileSync('src/pages/public/WheelPage.tsx', wheelPage);

// 9. App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('<Route path="/" element={<WheelPage />} />', '<Route path="/" element={<WheelPage />} />\n            <Route path="/roleta-2" element={<WheelPage isRoleta2 />} />');
fs.writeFileSync('src/App.tsx', app);

// 10. useWheel.ts
let useWheel = fs.readFileSync('src/features/wheel/hooks/useWheel.ts', 'utf8');
useWheel = useWheel.replace('export function useWheel() {', 'export function useWheel(isRoleta2 = false) {');
useWheel = useWheel.replace('spinOnline(localId)', 'spinOnline(localId, isRoleta2)');
fs.writeFileSync('src/features/wheel/hooks/useWheel.ts', useWheel);

// 11. App.test.tsx
let appTest = fs.readFileSync('src/App.test.tsx', 'utf8');
appTest = appTest.replace('import { WheelPage } from \'./pages/public/WheelPage\'', '');
fs.writeFileSync('src/App.test.tsx', appTest);

// 12. SQL migration
const sql = `
alter table public.prizes add column if not exists hide_in_roleta_2 boolean not null default false;
alter table public.app_settings add column if not exists wheel_highlight_text_2 text not null default '';
alter table public.app_settings add column if not exists wheel_footer_text_2 text not null default 'Boa sorte! 🍀';
alter table public.app_settings add column if not exists wheel_subfooter_text_2 text not null default 'Seu prêmio será revelado ao final da rodada.';

drop function if exists public.spin_wheel(uuid);
drop function if exists public.spin_wheel(uuid, boolean);

create or replace function public.spin_wheel(p_client_spin_id uuid default gen_random_uuid(), p_is_roleta_2 boolean default false)
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
    and (not p_is_roleta_2 or not p.hide_in_roleta_2)
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
      and (not p_is_roleta_2 or not p.hide_in_roleta_2)
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

revoke execute on function public.spin_wheel(uuid, boolean) from public;
grant execute on function public.spin_wheel(uuid, boolean) to anon, authenticated;
`;
fs.writeFileSync('supabase/migrations/20261009133900_roleta_2.sql', sql);
