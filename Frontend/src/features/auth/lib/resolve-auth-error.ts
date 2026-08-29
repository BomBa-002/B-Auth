import type { AxiosError } from '@a'

interface ErrorEnvelopeBody {
  error?: {
    code?: string
    message?: string
  }
}

/**
 * Maps a login/register failure onto a user-facing, translated message.
 * Falls back to the server's own message for errors that don't have a
 * dedicated i18n key yet (e.g. register's `CONFLICT` on a duplicate
 * username/email), and to a generic message for anything unrecognized
 * (network failure, 500s, etc.).
 */
export function resolveAuthErrorMessage(err: unknown, t: (key: string) => string): string {
  const axiosError = err as AxiosError<ErrorEnvelopeBody> | undefined
  const code = axiosError?.response?.data?.error?.code
  const serverMessage = axiosError?.response?.data?.error?.message

  if (code === 'INVALID_CREDENTIALS') return t('auth.error_invalid_credentials')
  if (code === 'ACCOUNT_DISABLED') return t('auth.error_account_disabled')
  if (code === 'CONFLICT' && serverMessage) return serverMessage

  return t('auth.error_generic')
}
