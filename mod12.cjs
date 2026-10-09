const fs = require('fs');

// 1. WheelPage.tsx (fix my previous mistake)
let wheelPage = fs.readFileSync('src/pages/public/WheelPage.tsx', 'utf8');
wheelPage = wheelPage.replace('const spin = useSpinController(prizes, settings, online)', 'const prizesFiltered = prizes.filter(p => !isRoleta2 || !p.hideInRoleta2);\n  const spin = useSpinController(prizesFiltered, settings, online, isRoleta2)');
wheelPage = wheelPage.replace('{settings.wheelHighlightText}', '{isRoleta2 ? settings.wheelHighlightText2 : settings.wheelHighlightText}');
wheelPage = wheelPage.replace('{settings.wheelFooterText}', '{isRoleta2 ? settings.wheelFooterText2 : settings.wheelFooterText}');
wheelPage = wheelPage.replace('{settings.wheelSubfooterText}', '{isRoleta2 ? settings.wheelSubfooterText2 : settings.wheelSubfooterText}');
// if wheelHighlightText2 is empty, it shouldn't render the badge
wheelPage = wheelPage.replace('{settings.wheelHighlightText && <div className="highlight-badge">{isRoleta2 ? settings.wheelHighlightText2 : settings.wheelHighlightText}</div>}', '{(isRoleta2 ? settings.wheelHighlightText2 : settings.wheelHighlightText) && <div className="highlight-badge">{isRoleta2 ? settings.wheelHighlightText2 : settings.wheelHighlightText}</div>}');
wheelPage = wheelPage.replace('{settings.wheelFooterText && <p className="footer-line1">{isRoleta2 ? settings.wheelFooterText2 : settings.wheelFooterText}</p>}', '{(isRoleta2 ? settings.wheelFooterText2 : settings.wheelFooterText) && <p className="footer-line1">{isRoleta2 ? settings.wheelFooterText2 : settings.wheelFooterText}</p>}');
wheelPage = wheelPage.replace('{settings.wheelSubfooterText && <p className="footer-line2">{isRoleta2 ? settings.wheelSubfooterText2 : settings.wheelSubfooterText}</p>}', '{(isRoleta2 ? settings.wheelSubfooterText2 : settings.wheelSubfooterText) && <p className="footer-line2">{isRoleta2 ? settings.wheelSubfooterText2 : settings.wheelSubfooterText}</p>}');
fs.writeFileSync('src/pages/public/WheelPage.tsx', wheelPage);

// 2. use-spin-controller.ts
let useSpinController = fs.readFileSync('src/features/wheel/hooks/use-spin-controller.ts', 'utf8');
useSpinController = useSpinController.replace('export function useSpinController(prizes: Prize[], settings: AppSettings, online: boolean) {', 'export function useSpinController(prizes: Prize[], settings: AppSettings, online: boolean, isRoleta2 = false) {');
useSpinController = useSpinController.replace('const data = await api.spinOnline(clientSpinId)', 'const data = await api.spinOnline(clientSpinId, isRoleta2)');
fs.writeFileSync('src/features/wheel/hooks/use-spin-controller.ts', useSpinController);

// 3. Fix TS errors in domain.ts / mappers.ts / etc.
// In mappers.ts, wait! hideInRoleta2 is missing in wheel-domain.test.ts
let test1 = fs.readFileSync('src/features/wheel/domain/wheel-domain.test.ts', 'utf8');
test1 = test1.replace('active: true,', 'active: true,\n      hideInRoleta2: false,');
fs.writeFileSync('src/features/wheel/domain/wheel-domain.test.ts', test1);

let test2 = fs.readFileSync('src/features/wheel/domain/wheel-session.test.ts', 'utf8');
test2 = test2.replace('active: true,', 'active: true,\n  hideInRoleta2: false,');
fs.writeFileSync('src/features/wheel/domain/wheel-session.test.ts', test2);

// mappers.ts AppSettings error
// Type '{ ... }' is missing the following properties from type 'AppSettings': wheelHighlightText2, wheelFooterText2, wheelSubfooterText2
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
// wait, we added it to `mapSettings`. Where is the error? Ah, maybe `mapSettings` has a mocked object in tests?
// Let's check `api.ts` error first.
let api = fs.readFileSync('src/services/api.ts', 'utf8');
// `PrizeInput` does not exist hideInRoleta2. I added it to `Prize` in domain, but did I add it to `PrizeInput`?
let domain = fs.readFileSync('src/types/domain.ts', 'utf8');
if (!domain.includes('hideInRoleta2: boolean\n}')) { // naive check
    domain = domain.replace('active: boolean\n}', 'active: boolean\n  hideInRoleta2: boolean\n}');
    domain = domain.replace('wheelSubfooterText: string\n}', 'wheelSubfooterText: string\n  wheelHighlightText2: string\n  wheelFooterText2: string\n  wheelSubfooterText2: string\n}');
}
// wait, domain.ts had TWO `active: boolean` - one in Prize, one in PrizeInput!
// My previous script replaced ONLY the first one.
domain = domain.replace(/active: boolean/g, 'active: boolean\n  hideInRoleta2: boolean');
fs.writeFileSync('src/types/domain.ts', domain);

// api.ts offlineSpinFromPrize
// 'isRoleta2' does not exist in type 'OfflineSpin'.
// Offline spins don't need isRoleta2 in their row, because they just send the prizeId.
// Oh wait, `api.ts` line 248: `isRoleta2,` inside `offlineSpinFromPrize` return.
api = api.replace('isRoleta2,\n', '');
fs.writeFileSync('src/services/api.ts', api);

