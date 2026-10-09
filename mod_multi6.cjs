const fs = require('fs');

// Fix api.ts
let api = fs.readFileSync('src/services/api.ts', 'utf8');
api = api.replace(/hide_in_roleta_2: input\.hideInRoleta2 \?\? false,/g, 'campaign_slug: input.campaignSlug,');
api = api.replace(/hideInRoleta2: prize\.hideInRoleta2 \?\? false,/g, 'campaignSlug: prize.campaignSlug,');
// and if there are still hideInRoleta2...
api = api.replace(/input\.hideInRoleta2 \?\? false/g, 'input.campaignSlug ?? \'default\'');
api = api.replace(/prize\.hideInRoleta2 \?\? false/g, 'prize.campaignSlug');
// missing campaignSlug parameter
api = api.replace('export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {', 'export async function fetchDashboardMetrics(campaignSlug = \'default\'): Promise<DashboardMetrics> {');
fs.writeFileSync('src/services/api.ts', api);

// Fix mappers.ts
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
mappers = mappers.replace(/hideInRoleta2: boolean\(row\.hide_in_roleta_2, false\),/g, ''); // remove hideInRoleta2 entirely from mapPrize if it exists
mappers = mappers.replace(/campaignSlug: string\(row\.campaign_slug, 'default'\),/g, ''); // maybe I added it to mapSettings but AppSettings doesn't have it? Wait, I did add it to AppSettings. Let me check.
if (!mappers.includes('campaignSlug: string(row.campaign_slug, \'default\'),') && mappers.includes('eventName: string(row.event_name, DEFAULT_SETTINGS.eventName),')) {
  mappers = mappers.replace('eventName: string(row.event_name, DEFAULT_SETTINGS.eventName),', 'campaignSlug: string(row.campaign_slug, \'default\'),\n    eventName: string(row.event_name, DEFAULT_SETTINGS.eventName),');
}
fs.writeFileSync('src/services/mappers.ts', mappers);

// Fix WheelPage.tsx
let wheelPage = fs.readFileSync('src/pages/public/WheelPage.tsx', 'utf8');
wheelPage = wheelPage.replace(/\{\(isRoleta2 \? settings\.wheelHighlightText2 : settings\.wheelHighlightText\)[\s\S]*?<\/div>\}/g, '{settings.wheelHighlightText && <div className="highlight-badge">{settings.wheelHighlightText}</div>}');
wheelPage = wheelPage.replace(/\{\(isRoleta2 \? settings\.wheelFooterText2 : settings\.wheelFooterText\)[\s\S]*?<\/p>\}/g, '{settings.wheelFooterText && <p className="footer-line1">{settings.wheelFooterText}</p>}');
wheelPage = wheelPage.replace(/\{\(isRoleta2 \? settings\.wheelSubfooterText2 : settings\.wheelSubfooterText\)[\s\S]*?<\/p>\}/g, '{settings.wheelSubfooterText && <p className="footer-line2">{settings.wheelSubfooterText}</p>}');
fs.writeFileSync('src/pages/public/WheelPage.tsx', wheelPage);

// Fix SettingsPage.tsx
let settingsPage = fs.readFileSync('src/pages/admin/SettingsPage.tsx', 'utf8');
settingsPage = settingsPage.replace('const { data, isLoading } = useQuery<AppSettings>({', 'const { data, isLoading } = useQuery<AppSettings, Error, AppSettings, string[]>({');
fs.writeFileSync('src/pages/admin/SettingsPage.tsx', settingsPage);

// Fix PrizesPage.tsx
let prizesPage = fs.readFileSync('src/pages/admin/PrizesPage.tsx', 'utf8');
prizesPage = prizesPage.replace('const { data: prizes = [], isLoading } = useQuery<Prize[]>({', 'const { data: prizes = [], isLoading } = useQuery<Prize[], Error, Prize[], string[]>({');
prizesPage = prizesPage.replace('prizesFiltered.length === 0', 'prizes.length === 0');
prizesPage = prizesPage.replace('prizesFiltered.map(', 'prizes.map(');
fs.writeFileSync('src/pages/admin/PrizesPage.tsx', prizesPage);

// Fix HistoryPage.tsx
let historyPage = fs.readFileSync('src/pages/admin/HistoryPage.tsx', 'utf8');
historyPage = historyPage.replace('const { data: history = [], isLoading } = useQuery<SpinHistoryItem[]>({', 'const { data: history = [], isLoading } = useQuery<SpinHistoryItem[], Error, SpinHistoryItem[], string[]>({');
historyPage = historyPage.replace('historyFiltered.map(', 'history.map(');
fs.writeFileSync('src/pages/admin/HistoryPage.tsx', historyPage);

// Fix DashboardPage.tsx
let dashboardPage = fs.readFileSync('src/pages/admin/DashboardPage.tsx', 'utf8');
dashboardPage = dashboardPage.replace('const { data: metrics, isLoading } = useQuery<DashboardMetrics>({', 'const { data: metrics, isLoading } = useQuery<DashboardMetrics, Error, DashboardMetrics, string[]>({');
fs.writeFileSync('src/pages/admin/DashboardPage.tsx', dashboardPage);

// Fix csv test
let csv = fs.readFileSync('src/utils/csv.test.ts', 'utf8');
csv = csv.replace('eventSessionId: \'test\'', 'eventSessionId: \'test\', campaignSlug: \'default\'');
fs.writeFileSync('src/utils/csv.test.ts', csv);
