import type { SpinHistoryItem } from '../types/domain'

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function historyToCsv(items: SpinHistoryItem[], locale = 'pt-BR'): string {
  const rows = items.map((item) => [
    item.spinNumber ?? '',
    new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date(item.createdAt)),
    new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(new Date(item.createdAt)),
    item.prizeName,
    item.spinId,
    item.stockAfterSpin,
    item.source,
    item.syncStatus,
  ])
  const header = ['Giro', 'Data', 'Hora', 'Prêmio', 'ID do sorteio', 'Estoque após sorteio', 'Origem', 'Sincronização']
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`
}

export function downloadCsv(items: SpinHistoryItem[]): void {
  const blob = new Blob([historyToCsv(items)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `historico-roleta-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
