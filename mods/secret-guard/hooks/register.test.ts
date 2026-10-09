import { describe, expect, test } from 'claude-code/testing'

describe('secret-guard hooks', () => {
  test('denies reading an env file', async ($, on) => {
    on('tool.call', () => ({ deny: 'reached-the-tool' }))
    const ran = await $.tool.call({ tool: 'Read', file_path: '/project/.env' })
    expect(ran.deny?.startsWith('secret-guard:')).toBe(true)
  })

  test('denies a shell command that prints a key', async ($, on) => {
    on('tool.call', () => ({ deny: 'reached-the-tool' }))
    const ran = await $.tool.call({ tool: 'Bash', command: 'cat ~/.ssh/id_rsa' })
    expect(ran.deny?.startsWith('secret-guard:')).toBe(true)
  })

  test('lets ordinary reads reach the tool', async ($, on) => {
    on('tool.call', () => ({ deny: 'reached-the-tool' }))
    const ran = await $.tool.call({ tool: 'Read', file_path: '/project/README.md' })
    expect(ran.deny).toBe('reached-the-tool')
  })

  test('lets template env files through', async ($, on) => {
    on('tool.call', () => ({ deny: 'reached-the-tool' }))
    const ran = await $.tool.call({ tool: 'Edit', file_path: '/project/.env.example', old_string: 'a', new_string: 'b' })
    expect(ran.deny).toBe('reached-the-tool')
  })
})
