import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

let getAccessToken = (): string | null => null
let clearSession = (): void => undefined
let setAccessToken = (_token: string): void => undefined

/**
 * بتهيئة عميل الـ HTTP من نقطة الدخول بدل ربط طبقة الشبكة بالـ store مباشرة.
 */
export function configureHttp(options: {
  getAccessToken: () => string | null
  clearSession: () => void
  setAccessToken: (token: string) => void
}): void {
  getAccessToken = options.getAccessToken
  clearSession = options.clearSession
  setAccessToken = options.setAccessToken
}

/**
 * Single axios instance for the whole app. The access token lives only in
 * memory (the Zustand auth store) — never in localStorage — and the refresh
 * token is an HttpOnly cookie the browser attaches automatically, so
 * `withCredentials` must stay on for every request.
 */
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

// Single-flight refresh: concurrent 401s while a refresh is already in
// flight all await the same promise instead of firing N parallel refreshes.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<{ data: { accessToken: string } }>("/auth/refresh")
      .then((res) => res.data.data.accessToken)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !config || config._retried || config.url === "/auth/refresh") {
      return Promise.reject(error)
    }

    config._retried = true
    const newToken = await refreshAccessToken()

    if (!newToken) {
      clearSession()
      return Promise.reject(error)
    }

    setAccessToken(newToken)
    config.headers.set("Authorization", `Bearer ${newToken}`)
    return apiClient(config)
  }
)
