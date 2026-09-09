import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Dialog({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={wide ? 'dialog-card dialog-card--wide' : 'dialog-card'} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header><h2 id="dialog-title">{title}</h2><button type="button" aria-label="Fechar" onClick={onClose}><X /></button></header>
        {children}
      </section>
    </div>
  )
}
