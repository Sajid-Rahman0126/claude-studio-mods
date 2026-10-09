import { describe, expect, test } from 'claude-code/testing'

import { cleanCard, parseBoard, statusLine } from './parse'

const BOARD = `---
kanban-plugin: board
---

## Todo

- [ ] [[Project A]] write the intro
- [ ] plain card

## Doing

- [ ] [[notes/Spec|the spec]] review

## Done

- [x] shipped it
- [x] shipped another

%% kanban:settings
\`\`\`
{"kanban-plugin":"board"}
\`\`\`
%%
`

describe('parseBoard', () => {
  test('reads columns, open cards and done counts', async () => {
    const columns = parseBoard(BOARD)
    expect(columns.map(c => c.name)).toEqual(['Todo', 'Doing', 'Done'])
    expect(columns[0]?.open).toEqual(['Project A write the intro', 'plain card'])
    expect(columns[1]?.open).toEqual(['the spec review'])
    expect(columns[2]?.done).toBe(2)
  })

  test('ignores the Kanban settings block', async () => {
    const columns = parseBoard(BOARD + '\n## After\n- [ ] real\n')
    expect(columns.length).toBe(4)
    expect(columns[3]?.open).toEqual(['real'])
  })
})

describe('statusLine', () => {
  test('lists the first three busy columns', async () => {
    expect(statusLine(parseBoard(BOARD))).toBe('Board · Todo 2 · Doing 1')
  })

  test('says all clear when nothing is open', async () => {
    expect(statusLine(parseBoard('## Done\n- [x] a\n'))).toBe('Board: all clear')
  })

  test('is empty with no columns', async () => {
    expect(statusLine([])).toBe(undefined)
  })

  test('counts extra columns past three', async () => {
    const text = ['A', 'B', 'C', 'D', 'E'].map(n => `## ${n}\n- [ ] x`).join('\n')
    expect(statusLine(parseBoard(text))).toBe('Board · A 1 · B 1 · C 1 +2')
  })
})

describe('cleanCard', () => {
  test('shortens long cards', async () => {
    expect(cleanCard('x'.repeat(120)).length).toBe(90)
  })
})
