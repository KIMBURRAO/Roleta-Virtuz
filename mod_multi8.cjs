const fs = require('fs');

function fix(file, queryFnSearch, queryFnReplace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(queryFnSearch, queryFnReplace);
  
  // also fix the type parameter for useQuery
  if (content.includes('useQuery<Prize[], Error, Prize[], string[]>')) {
     content = content.replace('useQuery<Prize[], Error, Prize[], string[]>', 'useQuery');
  }
  if (content.includes('useQuery<AppSettings, Error, AppSettings, string[]>')) {
     content = content.replace('useQuery<AppSettings, Error, AppSettings, string[]>', 'useQuery');
  }
  if (content.includes('useQuery<SpinHistoryItem[], Error, SpinHistoryItem[], string[]>')) {
     content = content.replace('useQuery<SpinHistoryItem[], Error, SpinHistoryItem[], string[]>', 'useQuery');
  }
  if (content.includes('useQuery<DashboardMetrics, Error, DashboardMetrics, string[]>')) {
     content = content.replace('useQuery<DashboardMetrics, Error, DashboardMetrics, string[]>', 'useQuery');
  }
  
  // fix ['admin-prizes']
  content = content.replace(/queryKey: \['admin-(prizes|history|settings|dashboard)'\]/g, 'queryKey: [\'admin-$1\', campaignSlug]');
  
  fs.writeFileSync(file, content);
}

fix('src/pages/admin/PrizesPage.tsx', 'queryFn: fetchAllPrizes', 'queryFn: () => fetchAllPrizes(campaignSlug)');
fix('src/pages/admin/SettingsPage.tsx', 'queryFn: fetchSettings', 'queryFn: () => fetchSettings(campaignSlug)');
fix('src/pages/admin/HistoryPage.tsx', 'queryFn: fetchHistory', 'queryFn: () => fetchHistory(campaignSlug)');
fix('src/pages/admin/DashboardPage.tsx', 'queryFn: fetchDashboardMetrics', 'queryFn: () => fetchDashboardMetrics(campaignSlug)');

