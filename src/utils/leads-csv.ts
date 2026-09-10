import type { RaffleLead } from '../types/domain'

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function leadsToCsv(items: RaffleLead[], locale = 'pt-BR'): string {
  const rows = items.map((item) => [
    item.fullName,
    item.phone,
    item.email,
    item.address,
    item.campaign,
    new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date(item.createdAt)),
    new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(new Date(item.createdAt)),
    item.id,
  ])
  const header = ['Nome', 'Telefone', 'E-mail', 'Endereço', 'Campanha', 'Data', 'Hora', 'ID']
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`
}

export function downloadLeadsCsv(items: RaffleLead[]): void {
  const blob = new Blob([leadsToCsv(items)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cadastros-sorteio-ar-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
