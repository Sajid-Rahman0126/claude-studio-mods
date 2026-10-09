export type Touch = { path: string; edits: number; lastTool: string; lastAt: number }

declare module 'claude-code' {
  interface PluginState {
    'touched-files': { files: Touch[] }
  }
}
