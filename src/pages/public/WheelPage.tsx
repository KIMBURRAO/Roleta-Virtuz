import { type CSSProperties, useEffect, useMemo } from 'react'
import { Maximize2, Sparkles, WifiOff } from 'lucide-react'
import { DEFAULT_SETTINGS } from '../../lib/defaults'
import { useOnlineStatus } from '../../hooks/use-online-status'
import { usePublicData } from '../../features/wheel/hooks/use-public-data'
import { useSpinController } from '../../features/wheel/hooks/use-spin-controller'
import { Wheel } from '../../features/wheel/components/Wheel'
import { ResultDialog } from '../../features/wheel/components/ResultDialog'
import { useSpinWebMcp } from '../../lib/webmcp'
import { canReservePrize } from '../../features/offline/offline-policy'
import { BRAND_ASSETS } from '../../lib/brand'

export function WheelPage() {
  const online = useOnlineStatus()
  const publicData = usePublicData()
  const prizes = publicData.data?.prizes ?? []
  const settings = publicData.data?.settings ?? DEFAULT_SETTINGS
  const spin = useSpinController(prizes, settings, online)
  const canSpin = spin.eligible.length > 0 && (spin.phase === 'idle' || spin.phase === 'error') && canReservePrize(online, settings.stockControlEnabled)
  useSpinWebMcp(canSpin, spin.start)

  const theme = useMemo(() => ({
    '--brand-primary': settings.primaryColor,
    '--brand-secondary': settings.secondaryColor,
    '--brand-background': settings.backgroundColor,
    '--brand-text': settings.textColor,
    '--brand-button': settings.buttonColor,
    ...(settings.backgroundImageUrl ? { '--brand-background-image': `url(${settings.backgroundImageUrl})` } : {}),
  }) as CSSProperties, [settings])

  useEffect(() => {
    if (online) document.documentElement.dataset.online = 'true'
    else document.documentElement.dataset.online = 'false'
  }, [online])

  const status = !online && settings.stockControlEnabled
    ? 'Modo offline — conecte para proteger o estoque.'
    : spin.eligible.length === 0
      ? 'Os prêmios estão sendo preparados.'
      : spin.error

  const enterFullscreen = async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.()
    else await document.exitFullscreen?.()
  }

  return (
    <main className="public-shell" style={theme}>
      {settings.fullscreenButtonEnabled && (
        <button className="fullscreen-button" type="button" aria-label="Tela cheia" onClick={() => void enterFullscreen()}>
          <Maximize2 size={20} /><span>Tela cheia</span>
        </button>
      )}
      {!online && <div className="offline-badge"><WifiOff size={15} /> Modo offline</div>}

      <section className="public-copy">
        <img className="virtuz-logo" src={settings.logoUrl ?? BRAND_ASSETS.horizontalLight} alt={settings.eventName || 'Virtuz'} />
        <p className="eyebrow"><Sparkles size={16} /> {settings.eventName || 'Experiência Virtuz'}</p>
        <h1>{settings.wheelTitle}</h1>
        <p className="subtitle">{settings.wheelSubtitle}</p>
      </section>

      <section className="wheel-area" aria-label="Roleta de prêmios">
        {spin.wheelPrizes.length > 0
          ? <Wheel prizes={spin.wheelPrizes} settings={settings} rotation={spin.rotation} spinning={spin.phase === 'spinning'} />
          : <div className="wheel-stage" aria-hidden="true"><div className="wheel-pointer" /><div className="wheel-placeholder"><div className="wheel-placeholder__hub"><img src={BRAND_ASSETS.markDark} alt="" /></div></div></div>}
      </section>

      <section className="spin-area" aria-live="polite">
        <p className={spin.error ? 'empty-message error-message' : 'empty-message'}>{status || '\u00A0'}</p>
        <button className="spin-button" type="button" disabled={!canSpin} onClick={() => void spin.start()}>
          {spin.phase === 'requesting' ? 'Preparando…' : spin.phase === 'spinning' ? 'Girando…' : 'Girar roleta'}
        </button>
      </section>

      {spin.phase === 'result' && spin.result && <ResultDialog result={spin.result} settings={settings} onReset={spin.reset} />}
    </main>
  )
}
