// Path rules for secret files. Best effort: a determined process can still find a way
// around a deny-list (hard links, copies, encoded paths). This catches the common cases.

const TEMPLATE = /\.env\.(example|sample|template|dist|defaults)$/i

const SECRET_NAMES: RegExp[] = [
  /(^|\/)\.env$/i,
  /(^|\/)\.env\.[^/]+$/i,
  /\.(pem|key|p12|pfx|keystore|jks)$/i,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/i,
  /(^|\/)\.aws\/credentials$/i,
  /(^|\/)\.(npmrc|netrc|pypirc|pgpass)$/i,
  /(^|\/)\.docker\/config\.json$/i,
  /(^|\/)\.config\/gh\/hosts\.yml$/i,
  /(^|\/)[^/]*(service-account|credentials)[^/]*\.json$/i,
]

export function isSecretPath(path: string): boolean {
  const clean = path.trim().replace(/^["']|["']$/g, '')
  if (!clean || TEMPLATE.test(clean)) return false
  return SECRET_NAMES.some(rule => rule.test(clean))
}

// Splits a shell command into path-like words and checks each one.
export function secretInCommand(command: string): string | undefined {
  const words = command.split(/[\s;|&<>()`=]+/).filter(Boolean)
  return words.find(word => isSecretPath(word))
}
