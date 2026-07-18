import { useState, useEffect, useCallback } from 'react'
import './App.css'
import SpellingTest from './components/SpellingTest'
import LoginForm from './components/LoginForm'
import AdminWords from './components/AdminWords'
import { useAuth } from './auth/AuthContext'
import { fetchWords } from './utils/api'

function App() {
  const { user, loading: authLoading } = useAuth()
  const [words, setWords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<'practice' | 'admin'>('practice')

  const loadWords = useCallback(async () => {
    setLoading(true)
    try {
      const parsedWords = await fetchWords()
      setWords(parsedWords)
      setError(null)
    } catch (err) {
      console.error('Error loading words:', err)
      setError(`Error loading words: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setWords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWords()
  }, [loadWords])

  useEffect(() => {
    if (user?.role !== 'admin' && page === 'admin') {
      setPage('practice')
    }
  }, [user, page])

  if (authLoading || (loading && page === 'practice')) {
    return (
      <div className="app">
        <div className="loading">⏳ Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <LoginForm />
      </div>
    )
  }

  if (page === 'admin' && user.role === 'admin') {
    return (
      <div className="app">
        <AdminWords
          onBack={() => {
            setPage('practice')
            loadWords()
          }}
        />
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="app">
        <div className="error-banner">
          {error ?? 'No vocabulary words available. Ask an admin to seed the word list.'}
        </div>
        {user.role === 'admin' && (
          <button
            type="button"
            className="btn-toggle-dashboard"
            style={{ marginTop: 16 }}
            onClick={() => setPage('admin')}
          >
            Open Admin
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}
      <SpellingTest
        words={words}
        onOpenAdmin={user.role === 'admin' ? () => setPage('admin') : undefined}
      />
    </div>
  )
}

export default App
