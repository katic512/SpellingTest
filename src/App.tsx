import { useState, useEffect } from 'react'
import './App.css'
import SpellingTest from './components/SpellingTest'

function App() {
  const [words, setWords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWords = async () => {
      try {
        // Try to fetch words.txt from the public folder
        const response = await fetch('/words.txt')
        if (!response.ok) {
          throw new Error('Failed to load words.txt')
        }
        const text = await response.text()
        // Parse comma-separated or newline-separated words
        const parsedWords = text
          .split(/[,\n]/)
          .map(word => word.trim())
          .filter(word => word.length > 0)
        
        if (parsedWords.length === 0) {
          throw new Error('No words found in words.txt')
        }
        
        setWords(parsedWords)
        setError(null)
      } catch (err) {
        console.error('Error loading words:', err)
        setError(`Error loading words: ${err instanceof Error ? err.message : 'Unknown error'}`)
        // Set some default words as fallback
        setWords(['apple', 'banana', 'elephant', 'butterfly', 'celebration'])
      } finally {
        setLoading(false)
      }
    }

    loadWords()
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">⏳ Loading...</div>
      </div>
    )
  }

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}
      <SpellingTest words={words} />
    </div>
  )
}

export default App
