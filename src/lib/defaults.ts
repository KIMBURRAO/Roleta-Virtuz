import type { AppSettings } from '../types/domain'

export const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  eventName: 'Virtuz',
  wheelTitle: 'Roda da sorte',
  wheelSubtitle: 'Gire a roleta e descubra seu prêmio!',
  logoUrl: null,
  primaryColor: '#08C900',
  secondaryColor: '#064F25',
  backgroundColor: '#043F1E',
  buttonColor: '#0BE000',
  textColor: '#FFFFFF',
  backgroundImageUrl: null,
  soundEnabled: false,
  confettiEnabled: true,
  showImages: true,
  showNames: true,
  stockControlEnabled: true,
  weightedDrawEnabled: true,
  fullscreenButtonEnabled: true,
  updatedAt: new Date(0).toISOString(),
}

export const ASSET_BUCKET = 'virtuz-assets'
