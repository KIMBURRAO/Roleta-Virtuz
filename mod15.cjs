const fs = require('fs');
let c = fs.readFileSync('src/services/mappers.ts', 'utf8');
c = c.replace('active: boolean(row.active, true),', 'active: boolean(row.active, true),\n    hideInRoleta2: boolean(row.hide_in_roleta_2, false),');
c = c.replace('wheelSubfooterText: nullableString(row.wheel_subfooter_text) ?? DEFAULT_SETTINGS.wheelSubfooterText,', 'wheelSubfooterText: nullableString(row.wheel_subfooter_text) ?? DEFAULT_SETTINGS.wheelSubfooterText,\n    wheelHighlightText2: nullableString(row.wheel_highlight_text_2) ?? DEFAULT_SETTINGS.wheelHighlightText2,\n    wheelFooterText2: nullableString(row.wheel_footer_text_2) ?? DEFAULT_SETTINGS.wheelFooterText2,\n    wheelSubfooterText2: nullableString(row.wheel_subfooter_text_2) ?? DEFAULT_SETTINGS.wheelSubfooterText2,');
fs.writeFileSync('src/services/mappers.ts', c);

let api = fs.readFileSync('src/services/api.ts', 'utf8');
if (!api.includes('hideInRoleta2: boolean')) {
  api = api.replace('active: input.active,', 'active: input.active,\n      hide_in_roleta_2: input.hideInRoleta2 ?? false,');
  api = api.replace('active: false,', 'active: false,\n    hideInRoleta2: prize.hideInRoleta2 ?? false,');
}
fs.writeFileSync('src/services/api.ts', api);
