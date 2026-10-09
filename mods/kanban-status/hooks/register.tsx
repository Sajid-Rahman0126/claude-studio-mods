import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { BoardState } from '../types'
import { parseBoard, statusLine } from './parse'

const PANE = 'kanban-status'
const board = atom({ plugin: 'kanban-status', key: 'board' } as const, null)

async function refresh($: EngineInterface, file: string): Promise<BoardState> {
  let next: BoardState
  try {
    next = { file, columns: parseBoard(await $.fs.read(file)), missing: false }
  } catch {
    next = { file, columns: [], missing: true }
  }
  await update($, board, () => next)
  $.ui.status(next.missing ? undefined : statusLine(next.columns))
  return next
}

export const register: Register = (on, options) => {
  const file = typeof options?.file === 'string' && options.file.trim() ? options.file.trim() : 'BOARD.md'

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'board', description: `Show the Kanban board in ${file}` })
    await refresh($, file)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($, file)
    return next(e)
  })

  on('command.run', { command: 'board' }, async $ => {
    const now = await refresh($, file)
    if (now.missing) return { text: `No ${file} in this folder. Set the "Board file" option to point at your board.` }
    await $.ui.open({ id: PANE, title: 'Board' })
    return { text: statusLine(now.columns) ?? 'Board opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const now = await read($, board)
    if (!now || now.missing) return <Text dimColor>No board file found.</Text>
    return (
      <Box flexDirection="column">
        {now.columns.map(column => (
          <Box flexDirection="column">
            <Text bold>
              {column.name} ({column.open.length}{column.done ? `, ${column.done} done` : ''})
            </Text>
            {column.open.map(card => <Text>• {card}</Text>)}
            <Text> </Text>
          </Box>
        ))}
        <Button key="refresh" label="Refresh" onPress={() => refresh($, file)} />
      </Box>
    )
  })
}
