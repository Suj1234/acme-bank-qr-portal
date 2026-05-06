import { createContext, useContext, useState } from 'react'

export type Role = 'branch' | 'admin'
export type AdminRole = 'l1' | 'l2'

export interface AuthUser {
  username: string
  role: Role
  adminRole?: AdminRole
  displayName: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const ACCOUNTS: Record<string, { password: string; role: Role; adminRole?: AdminRole; displayName: string }> = {
  branch:   { password: 'branch123',   role: 'branch', displayName: 'Branch Officer' },
  admin:    { password: 'admin123',    role: 'admin',  adminRole: 'l1', displayName: 'Admin (L1)' },
  l1admin:  { password: 'l1admin123',  role: 'admin',  adminRole: 'l1', displayName: 'Admin (L1) — Priya Nair' },
  l2admin:  { password: 'l2admin123',  role: 'admin',  adminRole: 'l2', displayName: 'Admin (L2) — Rahul Mehta' },
}

const AuthContext = createContext<AuthContextValue>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('cb_user') ?? 'null') } catch { return null }
  })

  const login = (username: string, password: string): boolean => {
    const key = username.toLowerCase() as keyof typeof ACCOUNTS
    const acc = ACCOUNTS[key]
    if (acc?.password === password) {
      const u: AuthUser = { username: key, role: acc.role, adminRole: acc.adminRole, displayName: acc.displayName }
      setUser(u)
      localStorage.setItem('cb_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cb_user')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
