import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, OfflineSpin, Prize } from '../types/domain'

interface Snapshot<T> { key: string; value: T; updatedAt: string }

class VirtuzDatabase extends Dexie {
  snapshots!: EntityTable<Snapshot<unknown>, 'key'>
  offlineSpins!: EntityTable<OfflineSpin, 'clientSpinId'>

  constructor() {
    super('roleta-virtuz')
    this.version(1).stores({ snapshots: '&key, updatedAt', offlineSpins: '&clientSpinId, status, createdAt' })
  }
}

export const localDb = new VirtuzDatabase()

export async function cachePublicData(prizes: Prize[], settings: AppSettings): Promise<void> {
  const updatedAt = new Date().toISOString()
  await localDb.snapshots.bulkPut([
    { key: 'prizes', value: prizes, updatedAt },
    { key: 'settings', value: settings, updatedAt },
  ])
}

export async function getCachedPublicData(): Promise<{ prizes: Prize[]; settings: AppSettings | null }> {
  const [prizes, settings] = await Promise.all([
    localDb.snapshots.get('prizes'),
    localDb.snapshots.get('settings'),
  ])
  return {
    prizes: Array.isArray(prizes?.value) ? prizes.value as Prize[] : [],
    settings: settings?.value ? settings.value as AppSettings : null,
  }
}

export async function enqueueOfflineSpin(spin: OfflineSpin): Promise<void> {
  await localDb.offlineSpins.put(spin)
}

export async function pendingOfflineSpins(): Promise<OfflineSpin[]> {
  return localDb.offlineSpins.where('status').equals('pending').sortBy('createdAt')
}

export async function removeOfflineSpin(clientSpinId: string): Promise<void> {
  await localDb.offlineSpins.delete(clientSpinId)
}

export async function markOfflineConflict(clientSpinId: string, reason: string): Promise<void> {
  await localDb.offlineSpins.update(clientSpinId, { status: 'conflict', reason })
}

export async function offlineConflictCount(): Promise<number> {
  return localDb.offlineSpins.where('status').equals('conflict').count()
}
