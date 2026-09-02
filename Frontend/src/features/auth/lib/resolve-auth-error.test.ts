import { describe, expect, it } from 'vitest'
import { resolveAuthErrorMessage } from './resolve-auth-error'

describe('resolveAuthErrorMessage', () => {
  const translate = (key: string) => `translated:${key}`

  it('maps invalid credentials to the translated message', () => {
    const error = { response: { data: { error: { code: 'INVALID_CREDENTIALS' } } } }
    expect(resolveAuthErrorMessage(error, translate)).toBe('translated:auth.error_invalid_credentials')
  })

  it('preserves a server conflict message', () => {
    const error = { response: { data: { error: { code: 'CONFLICT', message: 'Email already exists' } } } }
    expect(resolveAuthErrorMessage(error, translate)).toBe('Email already exists')
  })

  it('falls back for unknown failures', () => {
    expect(resolveAuthErrorMessage(new Error('network'), translate)).toBe('translated:auth.error_generic')
  })
})
