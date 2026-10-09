import type { EngineInterface, Register } from 'claude-code'

import { isSecretPath, secretInCommand } from './guard'

async function blocked($: EngineInterface, path: string): Promise<string | undefined> {
  if (isSecretPath(path)) return path
  // Follow symlinks: a harmless-looking link can point at a secret file.
  const stat = await $.fs.stat(path, { resolve: true }).catch(() => undefined)
  return stat?.realPath && isSecretPath(stat.realPath) ? stat.realPath : undefined
}

function denial($: EngineInterface, tool: string, what: string): { deny: string } {
  $.ui.toast(`secret-guard blocked ${tool} on ${what}`)
  return {
    deny: `secret-guard: ${what} looks like a secret (env file, key or credentials), so ${tool} was blocked. Ask the user to share only the specific non-secret value you need, or to disable the secret-guard plugin.`,
  }
}

export const register: Register = on => {
  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    const hit = await blocked($, e.file_path)
    return hit ? denial($, 'Read', hit) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-guard: its check failed, so the call was blocked.' }))

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const hit = await blocked($, e.file_path)
    return hit ? denial($, 'Edit', hit) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-guard: its check failed, so the call was blocked.' }))

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const hit = await blocked($, e.file_path)
    return hit ? denial($, 'Write', hit) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-guard: its check failed, so the call was blocked.' }))

  on('tool.call', { tool: 'Bash' }, ($, e, next) => {
    const hit = secretInCommand(e.command)
    return hit ? denial($, 'Bash', hit) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-guard: its check failed, so the call was blocked.' }))
}
