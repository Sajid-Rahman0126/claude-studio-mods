import { describe, expect, test } from 'claude-code/testing'

import { isSecretPath, secretInCommand } from './guard'

describe('isSecretPath', () => {
  test('flags common secret files', async () => {
    for (const path of ['.env', '/app/.env', 'app/.env.local', '/k/server.pem', '~/.ssh/id_ed25519',
      '/Users/a/.aws/credentials', '.npmrc', 'gcp-credentials.json', 'service-account-prod.json']) {
      expect(isSecretPath(path)).toBe(true)
    }
  })

  test('allows templates and ordinary files', async () => {
    for (const path of ['.env.example', 'app/.env.sample', 'README.md', 'src/env.ts', 'id_ed25519.pub', 'environment.md', 'keys.ts']) {
      expect(isSecretPath(path)).toBe(false)
    }
  })
})

describe('secretInCommand', () => {
  test('finds secrets inside shell commands', async () => {
    expect(secretInCommand('cat .env')).toBe('.env')
    expect(secretInCommand('grep KEY app/.env.production | head')).toBe('app/.env.production')
    expect(secretInCommand('cp ~/.ssh/id_rsa /tmp/x')).toBe('~/.ssh/id_rsa')
  })

  test('lets ordinary commands through', async () => {
    expect(secretInCommand('npm test')).toBe(undefined)
    expect(secretInCommand('cp .env.example .env.sample')).toBe(undefined)
    expect(secretInCommand('git status')).toBe(undefined)
  })
})
