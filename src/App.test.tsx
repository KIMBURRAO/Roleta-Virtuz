import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('abre diretamente na experiência da Roleta Virtuz', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /roda da sorte/i })).toBeVisible()
    expect(await screen.findByText(/os prêmios estão sendo preparados/i)).toBeVisible()
    expect(screen.getByRole('button', { name: /girar roleta/i })).toBeDisabled()
  })
})
