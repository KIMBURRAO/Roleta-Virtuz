const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('<Route path="/" element={<WheelPage />} />', '<Route path="/" element={<WheelPage campaignSlug="default" />} />');
app = app.replace('<Route path="/roleta-2" element={<WheelPage isRoleta2 />} />', '<Route path="/roleta-2" element={<WheelPage campaignSlug="ar-condicionado" />} />');
app = app.replace('<Route path="*" element={<WheelPage />} />', '<Route path="*" element={<WheelPage campaignSlug="default" />} />');
fs.writeFileSync('src/App.tsx', app);

let wheelPage = fs.readFileSync('src/pages/public/WheelPage.tsx', 'utf8');
wheelPage = wheelPage.replace(/export function WheelPage\(\{ isRoleta2 = false \}: \{ isRoleta2\?: boolean \}\) \{/g, 'export function WheelPage({ campaignSlug = \'default\' }: { campaignSlug?: string }) {');
wheelPage = wheelPage.replace(/const publicData = usePublicData\(\)/g, 'const publicData = usePublicData(campaignSlug)');
wheelPage = wheelPage.replace(/const spin = useSpinController\(prizesFiltered, settings, online, isRoleta2\)/g, 'const spin = useSpinController(prizes, settings, online, campaignSlug)');
wheelPage = wheelPage.replace(/const prizesFiltered = prizes.filter\(p => !isRoleta2 || !p.hideInRoleta2\);\n  /g, '');
wheelPage = wheelPage.replace(/\{\(isRoleta2 \? settings\.wheelHighlightText2 : settings\.wheelHighlightText\) && <div className="highlight-badge">\{isRoleta2 \? settings\.wheelHighlightText2 : settings\.wheelHighlightText\}<\/div>\}/g, '{settings.wheelHighlightText && <div className="highlight-badge">{settings.wheelHighlightText}</div>}');
wheelPage = wheelPage.replace(/\{\(isRoleta2 \? settings\.wheelFooterText2 : settings\.wheelFooterText\) && <p className="footer-line1">\{isRoleta2 \? settings\.wheelFooterText2 : settings\.wheelFooterText\}<\/p>\}/g, '{settings.wheelFooterText && <p className="footer-line1">{settings.wheelFooterText}</p>}');
wheelPage = wheelPage.replace(/\{\(isRoleta2 \? settings\.wheelSubfooterText2 : settings\.wheelSubfooterText\) && <p className="footer-line2">\{isRoleta2 \? settings\.wheelSubfooterText2 : settings\.wheelSubfooterText\}<\/p>\}/g, '{settings.wheelSubfooterText && <p className="footer-line2">{settings.wheelSubfooterText}</p>}');
fs.writeFileSync('src/pages/public/WheelPage.tsx', wheelPage);

let usePublicData = fs.readFileSync('src/features/wheel/hooks/use-public-data.ts', 'utf8');
usePublicData = usePublicData.replace('export function usePublicData() {', 'export function usePublicData(campaignSlug = \'default\') {');
usePublicData = usePublicData.replace(/queryKey: \['public-data'\]/g, 'queryKey: [\'public-data\', campaignSlug]');
usePublicData = usePublicData.replace(/const \[settings, prizes\] = await Promise\.all\(\[api\.fetchSettings\(\), api\.fetchAllPrizes\(\)\]\)/g, 'const [settings, prizes] = await Promise.all([api.fetchSettings(campaignSlug), api.fetchAllPrizes(campaignSlug)])');
fs.writeFileSync('src/features/wheel/hooks/use-public-data.ts', usePublicData);

let useSpinController = fs.readFileSync('src/features/wheel/hooks/use-spin-controller.ts', 'utf8');
useSpinController = useSpinController.replace(/export function useSpinController\(prizes: Prize\[\], settings: AppSettings, online: boolean, isRoleta2 = false\) \{/g, 'export function useSpinController(prizes: Prize[], settings: AppSettings, online: boolean, campaignSlug = \'default\') {');
useSpinController = useSpinController.replace(/const data = await api\.spinOnline\(clientSpinId, isRoleta2\)/g, 'const data = await api.spinOnline(clientSpinId, campaignSlug)');
useSpinController = useSpinController.replace(/offlineSpinFromPrize\(selected, clientSpinId\)/g, 'offlineSpinFromPrize(selected, clientSpinId)'); // wait, offlineSpinFromPrize doesn't need campaignSlug because it takes prize.campaignSlug
fs.writeFileSync('src/features/wheel/hooks/use-spin-controller.ts', useSpinController);

// AppearancePage has texts for Roleta 2 that must be removed.
let appearance = fs.readFileSync('src/pages/admin/AppearancePage.tsx', 'utf8');
appearance = appearance.replace(/<h2>Textos da Roleta Principal<\/h2>/g, '<h2>Textos da Roleta</h2>');
appearance = appearance.replace(/<h2>Textos da Roleta 2<\/h2>[\s\S]*?(?=<\/section>)/g, ''); // Removes Roleta 2 texts
fs.writeFileSync('src/pages/admin/AppearancePage.tsx', appearance);
