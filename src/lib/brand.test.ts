import { describe, expect, it } from 'vitest'
import { brandAsset } from './brand'

describe('brandAsset', () => {
  it('monta caminho relativo ao base path configurado no Vite', () => {
    expect(brandAsset('/brand/virtuz-logo-horizontal-light.png', '/Roleta-Virtuz/')).toBe('/Roleta-Virtuz/brand/virtuz-logo-horizontal-light.png')
  })
})
