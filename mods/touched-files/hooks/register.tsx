import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { record, shortPath, statusText } from './touches'

const PANE = 'touched-files'
const files = atom({ plugin: 'touched-files', key: 'files' } as const, [])

async function note($: EngineInterface, path: string, tool: string): Promise<void> {
  const at = await $.clock.now()
  const list = await update($, files, current => record(current, path, tool, at))
  $.ui.status(statusText(list))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'touched', description: 'List every file Claude changed in this session' })
    $.ui.status(statusText(await read($, files)))
    return next(e)
  })

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && !ran.isError) await note($, e.file_path, 'Edit')
    return ran
  })

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && !ran.isError) await note($, e.file_path, 'Write')
    return ran
  })

  on('tool.call', { tool: 'NotebookEdit' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && !ran.isError) await note($, e.notebook_path, 'NotebookEdit')
    return ran
  })

  on('command.run', { command: 'touched' }, async $ => {
    const list = await read($, files)
    if (list.length === 0) return { text: 'No files changed yet this session.' }
    await $.ui.open({ id: PANE, title: 'Changed files' })
    return { text: statusText(list) ?? '' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, files)
    const cwd = await $.session.cwd()
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 4)
    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>No files changed yet this session.</Text>}
        {list.slice(0, room).map(item => (
          <Text>
            {shortPath(item.path, cwd)} <Text dimColor>×{item.edits}</Text>
          </Text>
        ))}
        {list.length > room && <Text dimColor>+{list.length - room} more</Text>}
        <Button
          key="clear"
          label="Clear list"
          onPress={async () => {
            await update($, files, () => [])
            $.ui.status(undefined)
          }}
        />
      </Box>
    )
  })
}
