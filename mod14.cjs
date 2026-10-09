const fs = require('fs');

// 1. domain.ts
let domain = fs.readFileSync('src/types/domain.ts', 'utf8');
domain = domain.replace(/active: boolean\n  hideInRoleta2: boolean\n  hideInRoleta2: boolean/g, 'active: boolean\n  hideInRoleta2: boolean');
if (!domain.includes('hideInRoleta2?: boolean')) {
  domain = domain.replace('active: boolean\n  forcedAtSpin', 'active: boolean\n  hideInRoleta2?: boolean\n  forcedAtSpin');
}
fs.writeFileSync('src/types/domain.ts', domain);

// 2. api.ts
let api = fs.readFileSync('src/services/api.ts', 'utf8');
api = api.replace('isRoleta2,\n    prizeName', 'prizeName');
api = api.replace('hide_in_roleta_2: input.hideInRoleta2,', 'hide_in_roleta_2: input.hideInRoleta2 ?? false,');
fs.writeFileSync('src/services/api.ts', api);

// 3. mappers.ts
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
mappers = mappers.replace('active: Boolean(row.active),', 'active: Boolean(row.active),\n    hideInRoleta2: Boolean(row.hide_in_roleta_2),');
mappers = mappers.replace('wheelSubfooterText: string(row.wheel_subfooter_text, DEFAULT_SETTINGS.wheelSubfooterText),', 'wheelSubfooterText: string(row.wheel_subfooter_text, DEFAULT_SETTINGS.wheelSubfooterText),\n    wheelHighlightText2: string(row.wheel_highlight_text_2, DEFAULT_SETTINGS.wheelHighlightText2),\n    wheelFooterText2: string(row.wheel_footer_text_2, DEFAULT_SETTINGS.wheelFooterText2),\n    wheelSubfooterText2: string(row.wheel_subfooter_text_2, DEFAULT_SETTINGS.wheelSubfooterText2),');
fs.writeFileSync('src/services/mappers.ts', mappers);

// 4. use-spin-controller.ts
let useSpinController = fs.readFileSync('src/features/wheel/hooks/use-spin-controller.ts', 'utf8');
useSpinController = useSpinController.replace('const data = await api.spinOnline(clientSpinId)', 'const data = await api.spinOnline(clientSpinId, isRoleta2)');
fs.writeFileSync('src/features/wheel/hooks/use-spin-controller.ts', useSpinController);

// 5. PrizeFormDialog.tsx
let prizeForm = fs.readFileSync('src/features/prizes/PrizeFormDialog.tsx', 'utf8');
prizeForm = prizeForm.replace('active, ...forcedRule', 'active, hideInRoleta2, ...forcedRule');
fs.writeFileSync('src/features/prizes/PrizeFormDialog.tsx', prizeForm);

