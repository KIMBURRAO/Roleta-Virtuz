const fs = require('fs');

const pages = [
  'src/pages/admin/DashboardPage.tsx',
  'src/pages/admin/PrizesPage.tsx',
  'src/pages/admin/AppearancePage.tsx',
  'src/pages/admin/SettingsPage.tsx',
  'src/pages/admin/HistoryPage.tsx'
];

for (const page of pages) {
  let content = fs.readFileSync(page, 'utf8');
  if (!content.includes('useAdminCampaign')) {
    content = content.replace('import {', 'import { useAdminCampaign } from \'../../features/campaigns/CampaignContext\'\nimport {');
    
    // Insert useAdminCampaign at the beginning of the component
    content = content.replace(/export function \w+\(\) {/, match => `${match}\n  const { campaignSlug } = useAdminCampaign()`);
    
    // Add campaignSlug to useQuery queryKey
    content = content.replace(/queryKey: \['(prizes|settings|history|dashboard)'\]/g, 'queryKey: [\'$1\', campaignSlug]');
    
    // Add campaignSlug to useQuery queryFn
    content = content.replace(/queryFn: \(\) => api\.fetch(AllPrizes|Settings|History|DashboardMetrics)\(\)/g, 'queryFn: () => api.fetch$1(campaignSlug)');
    content = content.replace(/queryFn: \(\) => api\.fetchHistory\(\{/g, 'queryFn: () => api.fetchHistory(campaignSlug, {');
    
    // Add campaignSlug to saveSettings / startNewEvent
    content = content.replace(/api\.saveSettings\(([^)]+)\)/g, 'api.saveSettings({ ...$1, campaignSlug })');
    content = content.replace(/api\.startNewEvent\(([^)]+)\)/g, 'api.startNewEvent($1, campaignSlug)');
    
    // In PrizesPage, we need to pass campaignSlug to PrizeFormDialog
    if (page.includes('PrizesPage')) {
      content = content.replace(/<PrizeFormDialog/, '<PrizeFormDialog campaignSlug={campaignSlug} ');
    }
    
    fs.writeFileSync(page, content);
  }
}

// Update PrizeFormDialog to accept and pass campaignSlug
let dialog = fs.readFileSync('src/features/prizes/PrizeFormDialog.tsx', 'utf8');
if (!dialog.includes('campaignSlug?: string')) {
  dialog = dialog.replace(/export function PrizeFormDialog\(\{ prize, onClose, onSave \}: \{ prize\?: Prize; onClose: \(\) => void; onSave: \(input: PrizeInput, existing\?: Prize\) => Promise<void> \}\) \{/, 'export function PrizeFormDialog({ prize, onClose, onSave, campaignSlug = \'default\' }: { prize?: Prize; onClose: () => void; onSave: (input: PrizeInput, existing?: Prize) => Promise<void>; campaignSlug?: string }) {');
  dialog = dialog.replace(/const parsed = prizeInputSchema.safeParse\(\{ name, description, color, quantity, weight, active, hideInRoleta2, \.\.\.forcedRule \}\)/, 'const parsed = prizeInputSchema.safeParse({ name, description, color, quantity, weight, active, campaignSlug, ...forcedRule })');
  dialog = dialog.replace(/<label className="switch-row" style={{marginTop:"8px"}}><input type="checkbox" checked=\{hideInRoleta2\} onChange=\{\(event\) => setHideInRoleta2\(event.target.checked\)\} \/><span\>Esconder na Roleta 2<\/span><\/label>/, '');
  dialog = dialog.replace(/const \[hideInRoleta2, setHideInRoleta2\] = useState\(prize\?\.hideInRoleta2 \?\? false\)\n/, '');
  fs.writeFileSync('src/features/prizes/PrizeFormDialog.tsx', dialog);
}
