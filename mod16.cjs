const fs = require('fs');

// 1. domain.ts
let domain = fs.readFileSync('src/types/domain.ts', 'utf8');
if (!domain.includes('hideInRoleta2: boolean\n  forcedAtSpin')) {
  domain = domain.replace(/active: boolean\n  forcedAtSpin/g, 'active: boolean\n  hideInRoleta2: boolean\n  forcedAtSpin');
}
fs.writeFileSync('src/types/domain.ts', domain);

// 2. wheel-domain.test.ts
let t1 = fs.readFileSync('src/features/wheel/domain/wheel-domain.test.ts', 'utf8');
t1 = t1.replace(/active: true,/g, 'active: true, hideInRoleta2: false,');
fs.writeFileSync('src/features/wheel/domain/wheel-domain.test.ts', t1);

// 3. wheel-session.test.ts
let t2 = fs.readFileSync('src/features/wheel/domain/wheel-session.test.ts', 'utf8');
t2 = t2.replace(/active: true,/g, 'active: true, hideInRoleta2: false,');
fs.writeFileSync('src/features/wheel/domain/wheel-session.test.ts', t2);

// 4. mappers.ts
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
if (!mappers.includes('hideInRoleta2: boolean(row.hide_in_roleta_2, false)')) {
  mappers = mappers.replace('active: boolean(row.active, true),', 'active: boolean(row.active, true),\n    hideInRoleta2: boolean(row.hide_in_roleta_2, false),');
}
if (!mappers.includes('wheelHighlightText2: nullableString(row.wheel_highlight_text_2) ?? DEFAULT_SETTINGS.wheelHighlightText2')) {
  mappers = mappers.replace('wheelSubfooterText: nullableString(row.wheel_subfooter_text) ?? DEFAULT_SETTINGS.wheelSubfooterText,', 'wheelSubfooterText: nullableString(row.wheel_subfooter_text) ?? DEFAULT_SETTINGS.wheelSubfooterText,\n    wheelHighlightText2: nullableString(row.wheel_highlight_text_2) ?? DEFAULT_SETTINGS.wheelHighlightText2,\n    wheelFooterText2: nullableString(row.wheel_footer_text_2) ?? DEFAULT_SETTINGS.wheelFooterText2,\n    wheelSubfooterText2: nullableString(row.wheel_subfooter_text_2) ?? DEFAULT_SETTINGS.wheelSubfooterText2,');
}
fs.writeFileSync('src/services/mappers.ts', mappers);

// 5. api.ts
let api = fs.readFileSync('src/services/api.ts', 'utf8');
api = api.replace(/isRoleta2,\n    prizeName: prize\.name,/g, 'prizeName: prize.name,');
fs.writeFileSync('src/services/api.ts', api);

