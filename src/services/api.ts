import { DEFAULT_SETTINGS } from '../lib/defaults'
import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase'
import type { AppSettings, DashboardMetrics, OfflineSpin, Prize, PrizeInput, SpinHistoryItem, SpinResult } from '../types/domain'
import { cachePublicData, getCachedPublicData, markOfflineConflict, pendingOfflineSpins, removeOfflineSpin } from './cache'
import { mapHistory, mapPrize, mapSettings, mapSpin, settingsToRow } from './mappers'

export class FriendlyError extends Error {}

const PUBLIC_PRIZE_COLUMNS = 'id,name,description,image_url,color,initial_stock,current_stock,weight,active,created_at,updated_at'

function messageFor(error: unknown, fallback: string): FriendlyError {
  if (error instanceof FriendlyError) return error
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('SUPABASE_NOT_CONFIGURED')) return new FriendlyError('Conecte o projeto ao Supabase para usar esta área.')
  if (message.includes('NO_PRIZES_AVAILABLE')) return new FriendlyError('Os prêmios estão sendo preparados.')
  if (message.includes('PRIZE_UNAVAILABLE')) return new FriendlyError('A lista de prêmios mudou. Tente novamente.')
  if (/JWT|session|refresh_token/i.test(message)) return new FriendlyError('Sua sessão expirou. Entre novamente.')
  if (/42501|permission denied|ADMIN_REQUIRED/i.test(message)) return new FriendlyError('Sua conta não tem permissão para esta ação.')
  if (/Failed to fetch|network|Load failed/i.test(message)) return new FriendlyError('A conexão está instável. Tente novamente em instantes.')
  return new FriendlyError(fallback)
}

export async function fetchPublicData(): Promise<{ prizes: Prize[]; settings: AppSettings; fromCache: boolean }> {
  if (!supabase) {
    const cached = await getCachedPublicData()
    return { prizes: cached.prizes, settings: cached.settings ?? DEFAULT_SETTINGS, fromCache: true }
  }

  try {
    const [prizesResponse, settingsResponse] = await Promise.all([
      supabase.from('prizes').select(PUBLIC_PRIZE_COLUMNS).eq('active', true).order('created_at'),
      supabase.from('app_settings').select('*').eq('id', 1).single(),
    ])
    if (prizesResponse.error) throw prizesResponse.error
    if (settingsResponse.error) throw settingsResponse.error
    const prizes = (prizesResponse.data ?? []).map((row) => mapPrize(row))
    const settings = mapSettings(settingsResponse.data)
    await cachePublicData(prizes, settings)
    return { prizes, settings, fromCache: false }
  } catch {
    const cached = await getCachedPublicData()
    return { prizes: cached.prizes, settings: cached.settings ?? DEFAULT_SETTINGS, fromCache: true }
  }
}

export async function fetchAllPrizes(): Promise<Prize[]> {
  try {
    const { data, error } = await requireSupabase().from('prizes').select('*').order('created_at')
    if (error) throw error
    return (data ?? []).map((row) => mapPrize(row))
  } catch (error) {
    throw messageFor(error, 'Não foi possível carregar os prêmios.')
  }
}

export async function savePrize(input: PrizeInput, existing?: Prize): Promise<Prize> {
  try {
    const client = requireSupabase()
    const stockDelta = existing ? input.quantity - existing.initialStock : input.quantity
    const row = {
      ...(existing ? { id: existing.id } : {}),
      name: input.name.trim(),
      description: input.description?.trim() || null,
      image_url: input.imageUrl || null,
      color: input.color.toUpperCase(),
      initial_stock: input.quantity,
      current_stock: existing ? Math.max(0, existing.currentStock + stockDelta) : input.quantity,
      weight: input.weight,
      active: input.active,
      forced_at_spin: input.forcedAtSpin ?? null,
      forced_every_spins: input.forcedEverySpins ?? null,
    }
    const { data, error } = await client.from('prizes').upsert(row).select().single()
    if (error) throw error
    return mapPrize(data)
  } catch (error) {
    throw messageFor(error, 'Não foi possível salvar o prêmio.')
  }
}

export async function duplicatePrize(prize: Prize): Promise<Prize> {
  return savePrize({
    name: `${prize.name} — cópia`,
    description: prize.description,
    imageUrl: prize.imageUrl,
    color: prize.color,
    quantity: prize.initialStock,
    weight: prize.weight,
    active: false,
    forcedAtSpin: null,
    forcedEverySpins: null,
  })
}

export async function setPrizeActive(prizeId: string, active: boolean): Promise<void> {
  const { error } = await requireSupabase().from('prizes').update({ active }).eq('id', prizeId)
  if (error) throw messageFor(error, 'Não foi possível alterar o status do prêmio.')
}

export async function deletePrize(prizeId: string): Promise<void> {
  const { error } = await requireSupabase().from('prizes').delete().eq('id', prizeId)
  if (error) throw messageFor(error, 'Não foi possível excluir o prêmio. Ele pode estar presente no histórico.')
}

export async function addStock(prizeId: string, quantity: number): Promise<void> {
  const { error } = await requireSupabase().rpc('adjust_prize_stock', { p_prize_id: prizeId, p_quantity: quantity })
  if (error) throw messageFor(error, 'Não foi possível adicionar o estoque.')
}

export async function spinOnline(clientSpinId: string): Promise<SpinResult> {
  try {
    const { data, error } = await requireSupabase().rpc('spin_wheel', { p_client_spin_id: clientSpinId })
    if (error) throw error
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new FriendlyError('Não há prêmios disponíveis para sortear.')
    return mapSpin(row)
  } catch (error) {
    throw messageFor(error, 'Não foi possível concluir o sorteio. Tente novamente.')
  }
}

export async function fetchSettings(): Promise<AppSettings> {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS
  const { data, error } = await requireSupabase().from('app_settings').select('*').eq('id', 1).single()
  if (error) throw messageFor(error, 'Não foi possível carregar as configurações.')
  return mapSettings(data)
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const { data, error } = await requireSupabase().from('app_settings').upsert(settingsToRow(settings)).select().single()
  if (error) throw messageFor(error, 'Não foi possível salvar as configurações.')
  return mapSettings(data)
}

export async function fetchHistory(filter: { today?: boolean; prizeId?: string } = {}): Promise<SpinHistoryItem[]> {
  const client = requireSupabase()
  const { data: session, error: sessionError } = await client.from('event_sessions').select('id').eq('is_current', true).single()
  if (sessionError) throw messageFor(sessionError, 'Não foi possível identificar o evento atual.')
  let query = client.from('spins').select('*').eq('event_session_id', session.id).order('created_at', { ascending: false }).limit(2000)
  if (filter.today) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    query = query.gte('created_at', start.toISOString())
  }
  if (filter.prizeId) query = query.eq('prize_id', filter.prizeId)
  const { data, error } = await query
  if (error) throw messageFor(error, 'Não foi possível carregar o histórico.')
  return (data ?? []).map((row) => mapHistory(row))
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [history, prizes] = await Promise.all([fetchHistory({ today: true }), fetchAllPrizes()])
  return {
    spinsToday: history.length,
    prizesDrawn: history.filter((item) => item.syncStatus === 'confirmed').length,
    remainingStock: prizes.reduce((sum, prize) => sum + prize.currentStock, 0),
    outOfStock: prizes.filter((prize) => prize.currentStock <= 0).length,
  }
}

export async function startNewEvent(restoreStock: boolean): Promise<void> {
  const { error } = await requireSupabase().rpc('start_new_event', { p_restore_stock: restoreStock })
  if (error) throw messageFor(error, 'Não foi possível iniciar o novo evento.')
}

export async function reconcilePendingSpins(): Promise<{ synced: number; conflicts: number }> {
  if (!supabase || !navigator.onLine) return { synced: 0, conflicts: 0 }
  const pending = await pendingOfflineSpins()
  let synced = 0
  let conflicts = 0
  for (const spin of pending) {
    const { data, error } = await supabase.rpc('record_offline_spin', {
      p_client_spin_id: spin.clientSpinId,
      p_prize_id: spin.prizeId,
      p_created_at: spin.createdAt,
    })
    if (!error && data) {
      await removeOfflineSpin(spin.clientSpinId)
      synced += 1
    } else if (error && /OFFLINE_DISABLED|PRIZE_UNAVAILABLE/i.test(error.message)) {
      await markOfflineConflict(spin.clientSpinId, 'O giro precisa ser conferido pela equipe.')
      conflicts += 1
    }
  }
  return { synced, conflicts }
}

export function subscribeToPublicChanges(onChange: () => void): () => void {
  if (!supabase) return () => undefined
  const client = supabase
  const channel = client.channel('roleta-publica')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'prizes' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, onChange)
    .subscribe()
  return () => { void client.removeChannel(channel) }
}

export function offlineSpinFromPrize(prize: Prize, clientSpinId: string): OfflineSpin {
  return {
    clientSpinId,
    prizeId: prize.id,
    prizeName: prize.name,
    prizeImageUrl: prize.imageUrl,
    prizeColor: prize.color,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
}
