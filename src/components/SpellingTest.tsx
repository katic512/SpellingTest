import { useState, useRef, useEffect } from 'react'
import '../styles/SpellingTest.css'
import WordDisplay from './WordDisplay'
import SpellingInput from './SpellingInput'
import Feedback from './Feedback'
import DefinitionDisplay from './DefinitionDisplay'
import Statistics from './Statistics'
import Dashboard from './Dashboard'
import {
  WordPerformance,
  ProgressData,
  initializePerformance,
  loadProgress,
  saveProgress,
  updatePerformance,
  buildPracticeOrder,
  resetProgress,
  rehydratePerformance,
  normalizeWordKey
} from '../utils/spellingEngine'

/** Merriam-Webster Dictionary API key (personal app; exposed in client bundle) */
const MERRIAM_WEBSTER_API_KEY = '2a1b51e3-7493-4ec5-b9a5-5649e9dc6f23'

interface SpellingTestProps {
  words: string[]
}

export interface FeedbackState {
  type: 'none' | 'correct' | 'incorrect'
  message: string
  correctSpelling?: string
}

export default function SpellingTest({ words }: SpellingTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: 'none',
    message: ''
  })
  const [definition, setDefinition] = useState<string | null>(null)
  const [loadingDefinition, setLoadingDefinition] = useState(false)
  const [performance, setPerformance] = useState<WordPerformance[]>([])
  const [orderedWords, setOrderedWords] = useState<string[]>([])
  const [showDashboard, setShowDashboard] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = orderedWords[currentIndex] || ''
  const totalAttempts = performance.reduce((sum, p) => sum + p.successes + p.misses, 0)

  // Initialize performance data on mount
  useEffect(() => {
    const savedProgress = loadProgress()
    
    if (savedProgress && savedProgress.words.length === words.length) {
      const merged = rehydratePerformance(words, savedProgress.words)
      setPerformance(merged)
      const sorted = buildPracticeOrder(words, merged)
      setOrderedWords(sorted)
      const safeIndex = Math.min(savedProgress.currentIndex, Math.max(sorted.length - 1, 0))
      setCurrentIndex(safeIndex)
    } else {
      // Initialize new progress
      const newPerformance = initializePerformance(words)
      setPerformance(newPerformance)
      const sorted = buildPracticeOrder(words, newPerformance)
      setOrderedWords(sorted)
    }
  }, [words])

  // Save progress whenever it changes
  useEffect(() => {
    if (performance.length > 0 && orderedWords.length > 0) {
      const progressData: ProgressData = {
        words: performance,
        currentIndex,
        totalAttempts,
        lastUpdated: new Date().toISOString()
      }
      saveProgress(progressData)
    }
  }, [performance, currentIndex, orderedWords, totalAttempts])

  // Initialize on component mount
  useEffect(() => {
    setUserInput('')
    setFeedback({ type: 'none', message: '' })
    inputRef.current?.focus()
  }, [])

  // Fetch definition when word changes (Merriam-Webster Elementary Dictionary, sd2)
  useEffect(() => {
    const fetchDefinition = async () => {
      if (!currentWord) return

      setLoadingDefinition(true)
      try {
        const url = `https://www.dictionaryapi.com/api/v3/references/sd2/json/${encodeURIComponent(currentWord)}?key=${encodeURIComponent(MERRIAM_WEBSTER_API_KEY)}`
        const response = await fetch(url)
        if (!response.ok) {
          setDefinition('Definition not available')
          return
        }

        const data: unknown = await response.json()
        if (!Array.isArray(data) || data.length === 0) {
          setDefinition('Definition not available')
          return
        }

        const first = data[0]
        if (typeof first === 'string') {
          setDefinition('Definition not available')
          return
        }

        const shortdef = (first as { shortdef?: string[] }).shortdef?.filter(Boolean) ?? []
        setDefinition(shortdef[0] ?? 'Definition not available')
      } catch (error) {
        console.error('Error fetching definition:', error)
        setDefinition('Definition not available')
      } finally {
        setLoadingDefinition(false)
      }
    }

    fetchDefinition()
  }, [currentWord])

  const handleCheck = () => {
    const key = normalizeWordKey(currentWord)
    if (!key) return

    const isCorrect = normalizeWordKey(userInput) === key

    setPerformance(prev => updatePerformance(prev, currentWord, isCorrect))
    
    // Do NOT re-sort - word stays same until Next is clicked
    
    if (isCorrect) {
      setFeedback({
        type: 'correct',
        message: '✅ Correct!'
      })
    } else {
      setFeedback({
        type: 'incorrect',
        message: '❌ Incorrect! Try again.',
        correctSpelling: currentWord
      })
      // Clear input for user to try again
      setUserInput('')
    }
  }

  const handleNext = () => {
    if (currentIndex < orderedWords.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      
      // Reshuffle every 5 words to maintain adaptive ordering
      if (newIndex % 5 === 0) {
        const reshuffled = buildPracticeOrder(words, performance)
        setOrderedWords(reshuffled)
        setCurrentIndex(0)
      }
      
      setUserInput('')
      setFeedback({ type: 'none', message: '' })
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback.type === 'none' && userInput.trim().length > 0) {
        handleCheck()
      } else if (feedback.type === 'correct' && currentIndex < orderedWords.length - 1) {
        handleNext()
      }
      // For incorrect answers, user can keep typing to try again or click "Check Another"
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const newProgress = resetProgress(words)
      setPerformance(newProgress.words)
      setCurrentIndex(0)
      const sorted = buildPracticeOrder(words, newProgress.words)
      setOrderedWords(sorted)
      setShowDashboard(false)
    }
  }

  const handleExport = () => {
    const progressData: ProgressData = {
      words: performance,
      currentIndex,
      totalAttempts,
      lastUpdated: new Date().toISOString()
    }
    const json = JSON.stringify(progressData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spelling-progress-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="spelling-test-container">
      <div className="header-with-controls">
        <h1 className="title">🎓 Spelling Test</h1>
        <button
          type="button"
          className="btn-toggle-dashboard"
          onClick={() => setShowDashboard(!showDashboard)}
        >
          {showDashboard ? 'Close Dashboard' : '📊 Show Dashboard'}
        </button>
      </div>
      
      {showDashboard ? (
        <Dashboard
          words={words}
          performance={performance}
          onReset={handleReset}
          onExport={handleExport}
        />
      ) : (
        <>
          <Statistics 
            performance={performance} 
            currentWord={currentWord}
          />
          
          <div className="test-card">
            <WordDisplay word={currentWord} />
            
            <DefinitionDisplay 
              definition={definition} 
              loading={loadingDefinition}
            />
            
            <SpellingInput
              value={userInput}
              onChange={setUserInput}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              disabled={false}
            />
            
            <div className="button-group-main">
              {feedback.type === 'none' ? (
                <button
                  type="button"
                  className="btn btn-check"
                  onClick={handleCheck}
                  disabled={userInput.trim().length === 0}
                >
                  Check ✓
                </button>
              ) : (
                <div className="feedback-and-buttons-wrapper">
                  <Feedback feedback={feedback} />
                  <div className="button-group">
                    <button
                      type="button"
                      className="btn btn-check"
                      onClick={handleCheck}
                    >
                      Check Another ✓
                    </button>
                    <button
                      type="button"
                      className="btn btn-next"
                      onClick={handleNext}
                      disabled={currentIndex === orderedWords.length - 1}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
