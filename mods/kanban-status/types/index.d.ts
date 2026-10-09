export type Column = { name: string; open: string[]; done: number }

export type BoardState = { file: string; columns: Column[]; missing: boolean }

declare module 'claude-code' {
  interface PluginState {
    'kanban-status': { board: BoardState | null }
  }
}
