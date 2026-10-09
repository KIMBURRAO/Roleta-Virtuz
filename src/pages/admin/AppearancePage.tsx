import { useAdminCampaign } from '../../features/campaigns/CampaignContext'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageUp, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { Wheel } from '../../features/wheel/components/Wheel'
import { fetchAllPrizes, fetchSettings, saveSettings } from '../../services/api'
import { uploadAsset } from '../../services/storage'
import type { AppSettings } from '../../types/domain'
import { BRAND_ASSETS } from '../../lib/brand'

function AppearanceEditor({ initial }: { initial: AppSettings }) {
  const queryClient = useQueryClient()
  const { campaignSlug } = useAdminCampaign()
  const prizes = useQuery({ queryKey: ['admin-prizes', campaignSlug], queryFn: () => fetchAllPrizes(campaignSlug) })
  const [settings, setSettings] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => setSettings((current) => ({ ...current, [key]: value }))
  const upload = async (file: File | undefined, target: 'logoUrl' | 'backgroundImageUrl') => { if (!file) return; try { set(target, await uploadAsset(file, 'branding')) } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.') } }
  const save = async () => { setBusy(true); try { setSettings(await saveSettings(settings)); await queryClient.invalidateQueries({ queryKey: ['public-data'] }); toast.success('Aparência salva.') } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível salvar.') } finally { setBusy(false) } }

  return <div className="appearance-layout"><section className="panel settings-form"><h2>Identidade do evento</h2><div className="form-grid">
    <Field label="Nome do evento"><Input value={settings.eventName} onChange={(event) => set('eventName', event.target.value)} /></Field>
    <Field label="Título da roleta"><Input value={settings.wheelTitle} onChange={(event) => set('wheelTitle', event.target.value)} /></Field>
    <Field label="Subtítulo"><Input value={settings.wheelSubtitle} onChange={(event) => set('wheelSubtitle', event.target.value)} /></Field>
    <Field label="Texto Destaque"><Input value={settings.wheelHighlightText ?? ''} onChange={(event) => set('wheelHighlightText', event.target.value)} /></Field>
    <Field label="Rodapé Linha 1"><Input value={settings.wheelFooterText ?? ''} onChange={(event) => set('wheelFooterText', event.target.value)} /></Field>
    <Field label="Rodapé Linha 2"><Input value={settings.wheelSubfooterText ?? ''} onChange={(event) => set('wheelSubfooterText', event.target.value)} /></Field>
    <Field label="Fonte da roleta"><select className="select-input" value={settings.wheelFontFamily} onChange={(event) => set('wheelFontFamily', event.target.value)}><option value="Inter">Inter</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Trebuchet MS">Trebuchet MS</option><option value="Verdana">Verdana</option></select></Field>
    <Field label={`Tamanho do título: ${settings.wheelTitleFontSize}px`}><input className="range-input" type="range" min="24" max="120" step="1" value={settings.wheelTitleFontSize} onChange={(event) => set('wheelTitleFontSize', Number(event.target.value))} /></Field>
    <Field label={`Tamanho dos nomes na roleta: ${settings.wheelLabelFontSize}px`}><input className="range-input" type="range" min="8" max="24" step="1" value={settings.wheelLabelFontSize} onChange={(event) => set('wheelLabelFontSize', Number(event.target.value))} /><small>Em roletas com muitas fatias, o texto se ajusta para caber.</small></Field>
    <Field label={`Tamanho das imagens na roleta: ${settings.wheelImageSize}px`}><input className="range-input" type="range" min="10" max="80" step="1" value={settings.wheelImageSize} onChange={(event) => set('wheelImageSize', Number(event.target.value))} /></Field>
    <Field label={`Posição das imagens (distância do centro): ${settings.wheelImageRadius}px`}><input className="range-input" type="range" min="20" max="120" step="1" value={settings.wheelImageRadius} onChange={(event) => set('wheelImageRadius', Number(event.target.value))} /></Field>
    <div className="asset-fields"><label className="upload-box"><ImageUp /><span>Alterar logo</span><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files?.[0], 'logoUrl')} /></label><label className="upload-box"><ImageUp /><span>Imagem de fundo</span><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files?.[0], 'backgroundImageUrl')} /></label></div>
    <div className="color-settings">{([['primaryColor','Cor principal'],['secondaryColor','Cor secundária'],['backgroundColor','Cor de fundo'],['buttonColor','Cor do botão'],['textColor','Cor dos textos']] as const).map(([key,label]) => <Field key={key} label={label}><div className="color-input"><input type="color" value={settings[key]} onChange={(event) => set(key,event.target.value)} /><Input value={settings[key]} onChange={(event) => set(key,event.target.value)} /></div></Field>)}</div>
    <Button onClick={() => void save()} disabled={busy}><Palette /> {busy ? 'Salvando…' : 'Salvar aparência'}</Button>
  </div></section>
  <section className="appearance-preview"><div className="preview-label">Prévia ao vivo</div><div className="mini-public" style={{ color: settings.textColor, backgroundColor: settings.backgroundColor, backgroundImage: settings.backgroundImageUrl ? `linear-gradient(rgba(0,30,12,.55),rgba(0,30,12,.55)), url(${settings.backgroundImageUrl})` : undefined, fontFamily: settings.wheelFontFamily }}><img src={settings.logoUrl ?? BRAND_ASSETS.horizontalLight} alt="" /><p>{settings.eventName}</p><h2 style={{ fontSize: `${settings.wheelTitleFontSize}px` }}>{settings.wheelTitle}</h2><span>{settings.wheelSubtitle}</span>{(prizes.data?.filter((item) => item.active).length ?? 0) > 0 ? <Wheel prizes={prizes.data!.filter((item) => item.active).slice(0, 8)} settings={settings} rotation={0} spinning={false} /> : <div className="wheel-stage" aria-hidden="true"><div className="wheel-pointer" /><div className="wheel-placeholder"><div className="wheel-placeholder__hub"><img src={BRAND_ASSETS.markDark} alt="" /></div></div></div>}<button style={{ background: settings.buttonColor }}>Girar roleta</button></div></section></div>
}

export function AppearancePage() {
  const { campaignSlug } = useAdminCampaign()
  const query = useQuery({ queryKey: ['app-settings', campaignSlug], queryFn: () => fetchSettings(campaignSlug) })
  return <div className="admin-page"><header className="page-header"><div><p className="page-kicker">Personalização</p><h1>Aparência</h1><p>Ajuste a identidade sem alterar o código.</p></div></header>{query.isLoading ? <div className="skeleton-grid" /> : query.error || !query.data ? <div className="notice notice--error">Não foi possível carregar a aparência.</div> : <AppearanceEditor key={query.data.updatedAt} initial={query.data} />}</div>
}
