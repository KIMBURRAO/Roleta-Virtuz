import type { AppSettings } from '../types/domain'

export const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  eventName: 'Virtuz',
  wheelTitle: 'Roda da sorte',
  wheelSubtitle: 'Gire a roleta e concorra a prêmios!',
  wheelHighlightText: 'INCLUINDO 1 AR-CONDICIONADO',
  wheelFooterText: 'Boa sorte! 🍀',
  wheelSubfooterText: 'Seu prêmio será revelado ao final da rodada.',
  wheelFontFamily: 'Inter',
  wheelTitleFontSize: 80,
  wheelLabelFontSize: 14,
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
