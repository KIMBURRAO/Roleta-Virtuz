export interface Prize {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  color: string
  initialStock: number
  currentStock: number
  weight: number
  active: boolean
  forcedAtSpin: number | null
  forcedEverySpins: number | null
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  id: number
  eventName: string
  wheelTitle: string
  wheelSubtitle: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  buttonColor: string
  textColor: string
  backgroundImageUrl: string | null
  soundEnabled: boolean
  confettiEnabled: boolean
  showImages: boolean
  showNames: boolean
  stockControlEnabled: boolean
  weightedDrawEnabled: boolean
  fullscreenButtonEnabled: boolean
  updatedAt: string
}

export type SpinSource = 'online' | 'offline'
export type SpinSyncStatus = 'confirmed' | 'pending' | 'conflict'

export interface SpinResult {
  spinId: string
  clientSpinId: string
  prizeId: string
  prizeName: string
  prizeImageUrl: string | null
  prizeColor: string
  stockAfterSpin: number
  spinNumber: number | null
  createdAt: string
  source: SpinSource
  syncStatus: SpinSyncStatus
}

export interface SpinHistoryItem extends SpinResult {
  eventSessionId: string
}

export interface PrizeInput {
  name: string
  description?: string | null
  imageUrl?: string | null
  color: string
  quantity: number
  weight: number
  active: boolean
  forcedAtSpin?: number | null
  forcedEverySpins?: number | null
}

export interface DashboardMetrics {
  spinsToday: number
  prizesDrawn: number
  remainingStock: number
  outOfStock: number
}

export interface OfflineSpin {
  clientSpinId: string
  prizeId: string
  prizeName: string
  prizeImageUrl: string | null
  prizeColor: string
  createdAt: string
  status: 'pending' | 'conflict'
  reason?: string
}
