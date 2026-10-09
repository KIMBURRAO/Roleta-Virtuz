const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('CampaignProvider')) {
    app = app.replace('import { AuthProvider }', 'import { CampaignProvider } from \'./features/campaigns/CampaignContext\'\nimport { AuthProvider }');
    app = app.replace('<AuthProvider>', '<AuthProvider>\n          <CampaignProvider>');
    app = app.replace('</AuthProvider>', '</CampaignProvider>\n        </AuthProvider>');
}
fs.writeFileSync('src/App.tsx', app);

let adminLayout = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');
if (!adminLayout.includes('useAdminCampaign')) {
    adminLayout = adminLayout.replace('import { LogOut, Menu, User, X } from \'lucide-react\'', 'import { LogOut, Menu, User, X } from \'lucide-react\'\nimport { useAdminCampaign } from \'../features/campaigns/CampaignContext\'');
    adminLayout = adminLayout.replace('export function AdminLayout() {', 'export function AdminLayout() {\n  const { campaignSlug, setCampaignSlug } = useAdminCampaign()');
    adminLayout = adminLayout.replace('<div className="admin-header-title">', '<div className="admin-header-title" style={{ display: \'flex\', alignItems: \'center\', gap: \'16px\' }}>');
    adminLayout = adminLayout.replace('<h1>Painel Administrativo</h1>', '<h1>Painel Administrativo</h1>\n            <select value={campaignSlug} onChange={e => setCampaignSlug(e.target.value)} style={{ padding: \'4px 8px\', borderRadius: \'4px\', border: \'1px solid var(--border)\', background: \'var(--card)\', color: \'var(--foreground)\' }}>\n              <option value="default">Roleta Principal</option>\n              <option value="ar-condicionado">Roleta Ar Condicionado</option>\n            </select>');
}
fs.writeFileSync('src/layouts/AdminLayout.tsx', adminLayout);

