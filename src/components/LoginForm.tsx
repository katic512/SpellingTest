import { FormEvent, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import './LoginForm.css'

export default function LoginForm() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">Spelling Test</h1>
        <p className="login-subtitle">
          {mode === 'login' ? 'Sign in to sync your progress' : 'Create an account to save progress'}
        </p>

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">
          Username
          <input
            className="login-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            required
            minLength={3}
            maxLength={32}
            disabled={submitting}
          />
        </label>

        <label className="login-label">
          Password
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={mode === 'register' ? 6 : undefined}
            disabled={submitting}
          />
        </label>

        <button className="login-submit" type="submit" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          className="login-switch"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
          disabled={submitting}
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
