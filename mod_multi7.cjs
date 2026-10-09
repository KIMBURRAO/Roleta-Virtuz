const fs = require('fs');

function fixQueryFn(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/queryFn: \(\) => api\.fetch([^()]+)\(campaignSlug\)/g, 'queryFn: () => api.fetch$1(campaignSlug)');
  // wait, the problem is `queryFn: () => api.fetchSettings(campaignSlug)` is correct.
  // The error says: `Type '(campaignSlug?: string) => Promise<Prize[]>' is not assignable to type 'QueryFunction<...>'`.
  // WHY? Oh! Because I used `queryFn: api.fetchAllPrizes` without `() =>` maybe?
  // Let's check PrizesPage.tsx.
  fs.writeFileSync(file, content);
}

['src/pages/admin/SettingsPage.tsx', 'src/pages/admin/PrizesPage.tsx', 'src/pages/admin/HistoryPage.tsx', 'src/pages/admin/DashboardPage.tsx', 'src/features/wheel/hooks/use-public-data.ts'].forEach(fixQueryFn);
