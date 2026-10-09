const fs = require('fs');

let api = fs.readFileSync('src/services/api.ts', 'utf8');

// fetchAllPrizes -> fetchAllPrizes(campaignSlug: string)
api = api.replace('export async function fetchAllPrizes(): Promise<Prize[]> {', 'export async function fetchAllPrizes(campaignSlug = \'default\'): Promise<Prize[]> {');
api = api.replace(/from\('prizes'\)\.select\('\*'\)\.order/g, 'from(\'prizes\').select(\'*\').eq(\'campaign_slug\', campaignSlug).order');

// savePrize -> use campaignSlug from input
api = api.replace(/hide_in_roleta_2: input.hideInRoleta2 \?\? false,/g, 'campaign_slug: input.campaignSlug,');

// duplicatePrize -> pass campaignSlug
api = api.replace(/hideInRoleta2: prize.hideInRoleta2 \?\? false,/g, 'campaignSlug: prize.campaignSlug,');

// spinOnline
api = api.replace('export async function spinOnline(clientSpinId: string, isRoleta2 = false): Promise<SpinResult> {', 'export async function spinOnline(clientSpinId: string, campaignSlug = \'default\'): Promise<SpinResult> {');
api = api.replace(/rpc\('spin_wheel', { p_client_spin_id: clientSpinId, p_is_roleta_2: isRoleta2 }\)/g, 'rpc(\'spin_wheel\', { p_client_spin_id: clientSpinId, p_campaign_slug: campaignSlug })');

// fetchSettings
api = api.replace('export async function fetchSettings(): Promise<AppSettings> {', 'export async function fetchSettings(campaignSlug = \'default\'): Promise<AppSettings> {');
api = api.replace(/from\('app_settings'\)\.select\('\*'\)\.eq\('id', 1\)\.single\(\)/g, 'from(\'app_settings\').select(\'*\').eq(\'campaign_slug\', campaignSlug).single()');

// saveSettings - it already upserts based on `id`, but we're changing id?
// No, id is mapped correctly, so upsert should work. (campaign_slug is also passed)

// fetchHistory
api = api.replace('export async function fetchHistory(filter: { today?: boolean; prizeId?: string } = {}): Promise<SpinHistoryItem[]> {', 'export async function fetchHistory(campaignSlug = \'default\', filter: { today?: boolean; prizeId?: string } = {}): Promise<SpinHistoryItem[]> {');
api = api.replace(/eq\('is_current', true\)/g, 'eq(\'is_current\', true).eq(\'campaign_slug\', campaignSlug)');

// fetchDashboardMetrics
api = api.replace('export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {', 'export async function fetchDashboardMetrics(campaignSlug = \'default\'): Promise<DashboardMetrics> {');
api = api.replace(/fetchHistory\(\{ today: true \}\)/g, 'fetchHistory(campaignSlug, { today: true })');
api = api.replace(/fetchAllPrizes\(\)/g, 'fetchAllPrizes(campaignSlug)');

// startNewEvent
api = api.replace('export async function startNewEvent(restoreStock: boolean): Promise<void> {', 'export async function startNewEvent(restoreStock: boolean, campaignSlug = \'default\'): Promise<void> {');
api = api.replace(/rpc\('start_new_event', { p_restore_stock: restoreStock }\)/g, 'rpc(\'start_new_event\', { p_restore_stock: restoreStock, p_campaign_slug: campaignSlug })');

// reconcilePendingSpins
api = api.replace(/rpc\('record_offline_spin', {([^}]+)}\)/g, 'rpc(\'record_offline_spin\', {$1, p_campaign_slug: spin.campaignSlug})');

// subscribeToPublicChanges -> already takes onChange. We could filter by campaign on the client.

// offlineSpinFromPrize
api = api.replace('export function offlineSpinFromPrize(prize: Prize, clientSpinId: string): OfflineSpin {', 'export function offlineSpinFromPrize(prize: Prize, clientSpinId: string): OfflineSpin {'); // no change to signature, just add campaignSlug
api = api.replace('prizeId: prize.id,', 'prizeId: prize.id,\n    campaignSlug: prize.campaignSlug,');

fs.writeFileSync('src/services/api.ts', api);
