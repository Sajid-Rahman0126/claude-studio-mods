import { describe, expect, mock, test } from 'claude-code/testing'

import { record, shortPath, statusText } from './touches'

describe('record', () => {
  test('counts repeat edits and keeps the latest first', async () => {
    let list = record([], '/p/a.ts', 'Edit', 1)
    list = record(list, '/p/b.ts', 'Write', 2)
    list = record(list, '/p/a.ts', 'Edit', 3)
    expect(list.map(item => item.path)).toEqual(['/p/a.ts', '/p/b.ts'])
    expect(list[0]?.edits).toBe(2)
  })
})

describe('statusText', () => {
  test('is empty with no edits', async () => {
    expect(statusText([])).toBe(undefined)
  })

  test('summarises files and edits', async () => {
    const list = record(record([], '/p/a.ts', 'Edit', 1), '/p/a.ts', 'Edit', 2)
    expect(statusText(list)).toBe('✎ 1 file changed (2 edits)')
  })
})

describe('shortPath', () => {
  test('trims the session folder', async () => {
    expect(shortPath('/home/me/proj/src/a.ts', '/home/me/proj')).toBe('src/a.ts')
    expect(shortPath('/etc/hosts', '/home/me/proj')).toBe('/etc/hosts')
  })
})

describe('touched-files hooks', () => {
  test('counts a successful edit but not a denied one', async ($, on) => {
    mock.clock(on)
    const lines: (string | undefined)[] = []
    on('ui.status', ($, e, next) => {
      lines.push(e.text)
      return next(e)
    })
    let allow = true
    on('tool.call', () => (allow ? { result: {} as never } : { deny: 'no' }))
    await $.tool.call({ tool: 'Edit', file_path: '/p/one.ts', old_string: 'a', new_string: 'b' })
    allow = false
    await $.tool.call({ tool: 'Edit', file_path: '/p/two.ts', old_string: 'a', new_string: 'b' })
    expect(lines).toEqual(['✎ 1 file changed (1 edit)'])
  })
})
