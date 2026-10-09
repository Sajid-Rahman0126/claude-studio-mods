import type { Column } from '../types'

// Parses an Obsidian Kanban plugin board (or any markdown with ## columns and - [ ] cards).
export function parseBoard(text: string): Column[] {
  const columns: Column[] = []
  let inSettings = false
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    // Obsidian comments (%% ... %%) hold the Kanban plugin's settings; skip them.
    if (line.startsWith('%%')) {
      const closesOnSameLine = line.length > 2 && line.endsWith('%%')
      if (!closesOnSameLine) inSettings = !inSettings
      continue
    }
    if (inSettings) continue
    const heading = /^##\s+(.+)$/.exec(line)
    if (heading) {
      columns.push({ name: (heading[1] ?? '').trim(), open: [], done: 0 })
      continue
    }
    const current = columns.at(-1)
    if (!current) continue
    const open = /^- \[ \]\s+(.+)$/.exec(line)
    if (open) current.open.push(cleanCard(open[1] ?? ''))
    else if (/^- \[[xX]\]\s+/.test(line)) current.done += 1
  }
  return columns
}

// [[Wiki links]] become plain text; long cards are shortened for one-line display.
export function cleanCard(card: string): string {
  const text = card.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_m, target: string, _p, alias?: string) => alias ?? target)
  return text.length > 90 ? `${text.slice(0, 87)}...` : text
}

export function statusLine(columns: Column[]): string | undefined {
  const busy = columns.filter(column => column.open.length > 0)
  if (busy.length === 0) return columns.length ? 'Board: all clear' : undefined
  const shown = busy.slice(0, 3).map(column => `${column.name} ${column.open.length}`)
  const more = busy.length > 3 ? ` +${busy.length - 3}` : ''
  return `Board · ${shown.join(' · ')}${more}`
}
