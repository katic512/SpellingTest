import { ProgressData } from './spellingEngine'

const TOKEN_KEY = 'spelling-test-token'
const USER_KEY = 'spelling-test-user'

export interface AuthUser {
  id: number
  username: string
  role: 'admin' | 'user'
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.error || res.statusText
  } catch {
    return res.statusText || 'Request failed'
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await fetch('/api/auth/me', { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return data.user as AuthUser
}

export async function fetchWords(): Promise<string[]> {
  const res = await fetch('/api/words')
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  if (!Array.isArray(data.words) || data.words.length === 0) {
    throw new Error('No words returned from server')
  }
  return data.words as string[]
}

export async function fetchWordDefinition(word: string): Promise<string | null> {
  const res = await fetch(`/api/words/${encodeURIComponent(word)}/definition`)
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return typeof data.definition === 'string' && data.definition.trim()
    ? data.definition.trim()
    : null
}

export interface AdminWord {
  id: number
  word: string
  definition: string | null
  sortOrder: number
}

export async function fetchAdminWords(): Promise<AdminWord[]> {
  const res = await fetch('/api/admin/words', { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return (data.words ?? []) as AdminWord[]
}

export async function createAdminWord(
  word: string,
  definition?: string
): Promise<AdminWord> {
  const res = await fetch('/api/admin/words', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ word, definition: definition || undefined })
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function updateAdminWord(
  id: number,
  patch: { word?: string; definition?: string | null }
): Promise<AdminWord> {
  const res = await fetch(`/api/admin/words/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(patch)
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function deleteAdminWord(id: number): Promise<void> {
  const res = await fetch(`/api/admin/words/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  if (!res.ok) throw new Error(await parseError(res))
}


export async function fetchProgress(): Promise<ProgressData | null> {
  const res = await fetch('/api/progress', { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  if (!Array.isArray(data.words) || data.words.length === 0) return null
  return {
    words: data.words,
    currentIndex: data.currentIndex ?? 0,
    totalAttempts: data.totalAttempts ?? 0,
    lastUpdated: data.lastUpdated ?? new Date().toISOString()
  }
}

export async function saveProgressToServer(data: ProgressData): Promise<void> {
  const res = await fetch('/api/progress', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      words: data.words,
      currentIndex: data.currentIndex,
      totalAttempts: data.totalAttempts
    })
  })
  if (!res.ok) throw new Error(await parseError(res))
}
