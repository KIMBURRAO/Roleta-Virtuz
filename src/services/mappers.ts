import type { AppSettings, Prize, RaffleLead, SpinHistoryItem, SpinResult } from '../types/domain'
import { DEFAULT_SETTINGS } from '../lib/defaults'

type Row = Record<string, unknown>
const string = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const number = (value: unknown, fallback = 0) => typeof value === 'number' ? value : Number(value) || fallback
const boolean = (value: unknown, fallback = false) => typeof value === 'boolean' ? value : fallback
const nullableString = (value: unknown) => typeof value === 'string' && value.length > 0 ? value : null

export function mapPrize(row: Row): Prize {
  return {
    id: string(row.id),
    name: string(row.name),
    description: nullableString(row.description),
    imageUrl: nullableString(row.image_url),
    color: string(row.color, '#08C900'),
    initialStock: number(row.initial_stock),
    currentStock: number(row.current_stock),
    weight: number(row.weight, 1),
    active: boolean(row.active, true),
    forcedAtSpin: row.forced_at_spin == null ? null : number(row.forced_at_spin),
    forcedEverySpins: row.forced_every_spins == null ? null : number(row.forced_every_spins),
    createdAt: string(row.created_at, new Date(0).toISOString()),
    updatedAt: string(row.updated_at, new Date(0).toISOString()),
  }
}

export function mapSettings(row?: Row | null): AppSettings {
  if (!row) return DEFAULT_SETTINGS
  return {
    id: number(row.id, 1),
    eventName: string(row.event_name, DEFAULT_SETTINGS.eventName),
    wheelTitle: string(row.wheel_title, DEFAULT_SETTINGS.wheelTitle),
    wheelSubtitle: string(row.wheel_subtitle, DEFAULT_SETTINGS.wheelSubtitle),
    logoUrl: nullableString(row.logo_url),
    primaryColor: string(row.primary_color, DEFAULT_SETTINGS.primaryColor),
    secondaryColor: string(row.secondary_color, DEFAULT_SETTINGS.secondaryColor),
    backgroundColor: string(row.background_color, DEFAULT_SETTINGS.backgroundColor),
    buttonColor: string(row.button_color, DEFAULT_SETTINGS.buttonColor),
    textColor: string(row.text_color, DEFAULT_SETTINGS.textColor),
    backgroundImageUrl: nullableString(row.background_image_url),
    soundEnabled: boolean(row.sound_enabled, DEFAULT_SETTINGS.soundEnabled),
    confettiEnabled: boolean(row.confetti_enabled, DEFAULT_SETTINGS.confettiEnabled),
    showImages: boolean(row.show_images, DEFAULT_SETTINGS.showImages),
    showNames: boolean(row.show_names, DEFAULT_SETTINGS.showNames),
    stockControlEnabled: boolean(row.stock_control_enabled, DEFAULT_SETTINGS.stockControlEnabled),
    weightedDrawEnabled: boolean(row.weighted_draw_enabled, DEFAULT_SETTINGS.weightedDrawEnabled),
    fullscreenButtonEnabled: boolean(row.fullscreen_button_enabled, DEFAULT_SETTINGS.fullscreenButtonEnabled),
    updatedAt: string(row.updated_at, new Date(0).toISOString()),
  }
}

export function mapSpin(row: Row): SpinResult {
  return {
    spinId: string(row.spin_id ?? row.id),
    clientSpinId: string(row.client_spin_id),
    prizeId: string(row.prize_id),
    prizeName: string(row.prize_name ?? row.prize_name_snapshot),
    prizeImageUrl: nullableString(row.prize_image_url ?? row.prize_image_url_snapshot),
    prizeColor: string(row.prize_color ?? row.prize_color_snapshot, '#08C900'),
    stockAfterSpin: number(row.stock_after_spin),
    spinNumber: row.spin_number == null ? null : number(row.spin_number),
    createdAt: string(row.created_at, new Date().toISOString()),
    source: string(row.source, 'online') === 'offline' ? 'offline' : 'online',
    syncStatus: string(row.sync_status, 'confirmed') === 'conflict' ? 'conflict' : string(row.sync_status) === 'pending' ? 'pending' : 'confirmed',
  }
}

export function mapHistory(row: Row): SpinHistoryItem {
  return { ...mapSpin(row), eventSessionId: string(row.event_session_id) }
}

export function mapRaffleLead(row: Row): RaffleLead {
  return {
    id: string(row.id),
    fullName: string(row.full_name),
    phone: string(row.phone),
    email: string(row.email),
    address: string(row.address),
    campaign: string(row.campaign, 'sorteio-ar-condicionado'),
    createdAt: string(row.created_at, new Date(0).toISOString()),
  }
}

export function settingsToRow(settings: AppSettings): Row {
  return {
    id: 1,
    event_name: settings.eventName,
    wheel_title: settings.wheelTitle,
    wheel_subtitle: settings.wheelSubtitle,
    logo_url: settings.logoUrl,
    primary_color: settings.primaryColor,
    secondary_color: settings.secondaryColor,
    background_color: settings.backgroundColor,
    button_color: settings.buttonColor,
    text_color: settings.textColor,
    background_image_url: settings.backgroundImageUrl,
    sound_enabled: settings.soundEnabled,
    confetti_enabled: settings.confettiEnabled,
    show_images: settings.showImages,
    show_names: settings.showNames,
    stock_control_enabled: settings.stockControlEnabled,
    weighted_draw_enabled: settings.weightedDrawEnabled,
    fullscreen_button_enabled: settings.fullscreenButtonEnabled,
  }
}
