import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AuthUser {
  id: string
  username: string
  email: string
  displayName: string
  roles: string[]
  permissions: string[]
}

export type BootstrapStatus =
  | "idle"
  | "running"
  | "retrying"
  | "ready"
  | "degraded"
  | "blocked"
  | "error"

interface AuthState {
  /** In-memory only — never persisted, never touches localStorage. */
  accessToken: string | null
  user: AuthUser | null
  isPersistentSession: boolean
  bootstrapStatus: BootstrapStatus
  /** Last username typed at login, persisted only when "remember me" was checked. */
  rememberedUsername: string | null

  setAccessToken: (token: string) => void
  setSession: (payload: { accessToken: string; user: AuthUser; persistent: boolean }) => void
  clearSession: () => void
  setBootstrapStatus: (status: BootstrapStatus) => void
  setRememberedUsername: (username: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isPersistentSession: false,
      bootstrapStatus: "idle",
      rememberedUsername: null,

      setAccessToken: (token) => set({ accessToken: token }),

      setSession: ({ accessToken, user, persistent }) =>
        set({ accessToken, user, isPersistentSession: persistent }),

      clearSession: () =>
        set({ accessToken: null, user: null, isPersistentSession: false }),

      setBootstrapStatus: (status) => set({ bootstrapStatus: status }),

      setRememberedUsername: (username) => set({ rememberedUsername: username }),
    }),
    {
      name: "b-auth:auth-prefs",
      // Only the remembered-identifier convenience field is persisted.
      // The access token and user profile are re-derived every load via the
      // refresh-cookie bootstrap flow — they must never sit in storage.
      partialize: (state) => ({ rememberedUsername: state.rememberedUsername }),
    }
  )
)
