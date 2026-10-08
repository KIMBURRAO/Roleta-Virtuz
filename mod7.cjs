const fs = require('fs');

// 1. Update domain.ts
let domain = fs.readFileSync('src/types/domain.ts', 'utf8');
domain = domain.replace('wheelLabelFontSize: number', 'wheelLabelFontSize: number\n  wheelImageSize: number');
fs.writeFileSync('src/types/domain.ts', domain);

// 2. Update mappers.ts
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
mappers = mappers.replace(
  'wheelLabelFontSize: number(row.wheel_label_font_size, DEFAULT_SETTINGS.wheelLabelFontSize),',
  'wheelLabelFontSize: number(row.wheel_label_font_size, DEFAULT_SETTINGS.wheelLabelFontSize),\n    wheelImageSize: number(row.wheel_image_size, DEFAULT_SETTINGS.wheelImageSize),'
);
mappers = mappers.replace(
  'wheel_label_font_size: settings.wheelLabelFontSize,',
  'wheel_label_font_size: settings.wheelLabelFontSize,\n    wheel_image_size: settings.wheelImageSize,'
);
fs.writeFileSync('src/services/mappers.ts', mappers);

// 3. Update defaults.ts
let defaults = fs.readFileSync('src/lib/defaults.ts', 'utf8');
defaults = defaults.replace(
  'wheelLabelFontSize: 14,',
  'wheelLabelFontSize: 14,\n  wheelImageSize: 28,'
);
fs.writeFileSync('src/lib/defaults.ts', defaults);

// 4. Update AppearancePage.tsx
let appearance = fs.readFileSync('src/pages/admin/AppearancePage.tsx', 'utf8');
appearance = appearance.replace(
  '<Field label={`Tamanho dos nomes na roleta: ${settings.wheelLabelFontSize}px`}><input className="range-input" type="range" min="8" max="24" step="1" value={settings.wheelLabelFontSize} onChange={(event) => set(\'wheelLabelFontSize\', Number(event.target.value))} /><small>Em roletas com muitas fatias, o texto se ajusta para caber.</small></Field>',
  '<Field label={`Tamanho dos nomes na roleta: ${settings.wheelLabelFontSize}px`}><input className="range-input" type="range" min="8" max="24" step="1" value={settings.wheelLabelFontSize} onChange={(event) => set(\'wheelLabelFontSize\', Number(event.target.value))} /><small>Em roletas com muitas fatias, o texto se ajusta para caber.</small></Field>\n    <Field label={`Tamanho das imagens na roleta: ${settings.wheelImageSize}px`}><input className="range-input" type="range" min="10" max="60" step="1" value={settings.wheelImageSize} onChange={(event) => set(\'wheelImageSize\', Number(event.target.value))} /></Field>'
);
fs.writeFileSync('src/pages/admin/AppearancePage.tsx', appearance);

// 5. Update Wheel.tsx
let wheel = fs.readFileSync('src/features/wheel/components/Wheel.tsx', 'utf8');
wheel = wheel.replace(
  '<circle cx={imagePoint.x} cy={imagePoint.y} r="17" fill="rgba(255,255,255,.94)" stroke="rgba(0,0,0,.16)" strokeWidth="1" />',
  '<circle cx={imagePoint.x} cy={imagePoint.y} r={(settings.wheelImageSize / 2) + 3} fill="rgba(255,255,255,.94)" stroke="rgba(0,0,0,.16)" strokeWidth="1" />'
);
wheel = wheel.replace(
  '<image href={imageUrl} x={imagePoint.x - 14} y={imagePoint.y - 14} width="28" height="28" preserveAspectRatio="xMidYMid slice" clipPath={`url(#slice-${prize.id})`} />',
  '<image href={imageUrl} x={imagePoint.x - (settings.wheelImageSize / 2)} y={imagePoint.y - (settings.wheelImageSize / 2)} width={settings.wheelImageSize} height={settings.wheelImageSize} preserveAspectRatio="xMidYMid slice" clipPath={`url(#slice-${prize.id})`} />'
);
fs.writeFileSync('src/features/wheel/components/Wheel.tsx', wheel);

// 6. Create SQL migration
const sql = `alter table public.app_settings add column if not exists wheel_image_size integer not null default 28;`;
fs.writeFileSync('supabase/migrations/20261008163500_image_size.sql', sql);
