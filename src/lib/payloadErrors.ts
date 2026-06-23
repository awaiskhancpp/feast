// Payload doesn't normalize a unique-constraint violation into one
// predictable shape - depending on the path, it can arrive as a raw
// postgres error (code 23505) or already wrapped with a message mentioning
// "duplicate key" / "unique". Checking for either keeps this resilient to
// which one actually surfaces, without depending on internals that could
// change between Payload versions.
export function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const code = (error as { code?: unknown }).code
  if (code === '23505') return true

  const message = (error as { message?: unknown }).message
  if (typeof message === 'string') {
    const lower = message.toLowerCase()
    return lower.includes('duplicate key') || lower.includes('unique constraint')
  }

  return false
}
