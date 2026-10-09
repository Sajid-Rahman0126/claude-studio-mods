import type { Touch } from '../types'

// Records one successful edit, keeping the most recently touched file first.
export function record(list: Touch[], path: string, tool: string, at: number): Touch[] {
  const existing = list.find(item => item.path === path)
  const updated: Touch = existing
    ? { ...existing, edits: existing.edits + 1, lastTool: tool, lastAt: at }
    : { path, edits: 1, lastTool: tool, lastAt: at }
  return [updated, ...list.filter(item => item.path !== path)].slice(0, 500)
}

export function statusText(list: Touch[]): string | undefined {
  if (list.length === 0) return undefined
  const edits = list.reduce((sum, item) => sum + item.edits, 0)
  return `✎ ${list.length} file${list.length === 1 ? '' : 's'} changed (${edits} edit${edits === 1 ? '' : 's'})`
}

// Shows paths relative to the session folder when they are inside it.
export function shortPath(path: string, cwd: string): string {
  const base = cwd.endsWith('/') ? cwd : `${cwd}/`
  return path.startsWith(base) ? path.slice(base.length) : path
}
