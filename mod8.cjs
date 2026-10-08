const fs = require('fs');

// 1. Update domain.ts
let domain = fs.readFileSync('src/types/domain.ts', 'utf8');
domain = domain.replace('wheelImageSize: number', 'wheelImageSize: number\n  wheelImageRadius: number');
fs.writeFileSync('src/types/domain.ts', domain);

// 2. Update mappers.ts
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
mappers = mappers.replace(
  'wheelImageSize: number(row.wheel_image_size, DEFAULT_SETTINGS.wheelImageSize),',
  'wheelImageSize: number(row.wheel_image_size, DEFAULT_SETTINGS.wheelImageSize),\n    wheelImageRadius: number(row.wheel_image_radius, DEFAULT_SETTINGS.wheelImageRadius),'
);
mappers = mappers.replace(
  'wheel_image_size: settings.wheelImageSize,',
  'wheel_image_size: settings.wheelImageSize,\n    wheel_image_radius: settings.wheelImageRadius,'
);
fs.writeFileSync('src/services/mappers.ts', mappers);

// 3. Update defaults.ts
let defaults = fs.readFileSync('src/lib/defaults.ts', 'utf8');
defaults = defaults.replace(
  'wheelImageSize: 28,',
  'wheelImageSize: 28,\n  wheelImageRadius: 70,'
);
fs.writeFileSync('src/lib/defaults.ts', defaults);

// 4. Update AppearancePage.tsx
let appearance = fs.readFileSync('src/pages/admin/AppearancePage.tsx', 'utf8');
appearance = appearance.replace(
  '<Field label={`Tamanho das imagens na roleta: ${settings.wheelImageSize}px`}><input className="range-input" type="range" min="10" max="60" step="1" value={settings.wheelImageSize} onChange={(event) => set(\'wheelImageSize\', Number(event.target.value))} /></Field>',
  '<Field label={`Tamanho das imagens na roleta: ${settings.wheelImageSize}px`}><input className="range-input" type="range" min="10" max="80" step="1" value={settings.wheelImageSize} onChange={(event) => set(\'wheelImageSize\', Number(event.target.value))} /></Field>\n    <Field label={`Posição das imagens (distância do centro): ${settings.wheelImageRadius}px`}><input className="range-input" type="range" min="20" max="120" step="1" value={settings.wheelImageRadius} onChange={(event) => set(\'wheelImageRadius\', Number(event.target.value))} /></Field>'
);
fs.writeFileSync('src/pages/admin/AppearancePage.tsx', appearance);

// 5. Update Wheel.tsx
let wheel = fs.readFileSync('src/features/wheel/components/Wheel.tsx', 'utf8');
wheel = wheel.replace(
  'const imagePoint = point(70, center)',
  'const imagePoint = point(settings.wheelImageRadius, center)'
);
fs.writeFileSync('src/features/wheel/components/Wheel.tsx', wheel);

// 6. SQL migration
const sql = `alter table public.app_settings add column if not exists wheel_image_radius integer not null default 70;`;
fs.writeFileSync('supabase/migrations/20261008163900_image_radius.sql', sql);
