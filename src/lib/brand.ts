const normalizeBase = (base: string) => {
  const trimmed = base.trim() || '/'
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}

export function brandAsset(path: string, base = import.meta.env.BASE_URL): string {
  return `${normalizeBase(base)}${path.replace(/^\/+/, '')}`
}

export const BRAND_ASSETS = {
  horizontalLight: brandAsset('brand/virtuz-logo-horizontal-light-v2.png'),
  stackedDark: brandAsset('brand/virtuz-logo-stacked-dark.png'),
  markDark: brandAsset('brand/virtuz-mark-dark.png'),
  markLight: brandAsset('brand/virtuz-mark-light.png'),
  ringLight: brandAsset('brand/virtuz-logo-ring-light.png'),
} as const

export function getLogoFallbackSource(hasAlreadyFallenBack: boolean): string | null {
  return hasAlreadyFallenBack ? null : BRAND_ASSETS.horizontalLight
}
