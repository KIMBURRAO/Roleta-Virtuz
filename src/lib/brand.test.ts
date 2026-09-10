import { describe, expect, it } from 'vitest'
import { BRAND_ASSETS, brandAsset } from './brand'

describe('brandAsset', () => {
  it('monta caminho relativo ao base path configurado no Vite', () => {
    expect(brandAsset('/brand/virtuz-logo-horizontal-light.png', '/Roleta-Virtuz/')).toBe('/Roleta-Virtuz/brand/virtuz-logo-horizontal-light.png')
  })

  it('usa a versão de alto contraste da mesma logo horizontal', () => {
    expect(BRAND_ASSETS.horizontalLight).toContain('virtuz-logo-horizontal-light-v2.png')
  })
})
