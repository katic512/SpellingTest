import { useState, useRef, useEffect } from 'react'
import '../styles/SpellingTest.css'
import WordDisplay from './WordDisplay'
import SpellingInput from './SpellingInput'
import Feedback from './Feedback'
import DefinitionDisplay from './DefinitionDisplay'
import Statistics from './Statistics'
import Dashboard from './Dashboard'
import RewardDisplay, { rewardEmitter } from './RewardDisplay'
import CashoutModal from './CashoutModal'
import { useAuth } from '../auth/AuthContext'
import { fetchProgress, saveProgressToServer, fetchWordDefinition, addReward, getRewardBalance } from '../utils/api'
import {
  WordPerformance,
  ProgressData,
  initializePerformance,
  loadProgress,
  clearLocalProgress,
  updatePerformance,
  buildPracticeOrder,
  resetProgress,
  rehydratePerformance,
  normalizeWordKey
} from '../utils/spellingEngine'

interface SpellingTestProps {
  words: string[]
  onOpenAdmin?: () => void
}

export interface FeedbackState {
  type: 'none' | 'correct' | 'incorrect'
  message: string
  correctSpelling?: string
}

function applyProgress(
  words: string[],
  saved: ProgressData | null
): { performance: WordPerformance[]; ordered: string[]; index: number } {
  if (saved && saved.words.length > 0) {
    const merged = rehydratePerformance(words, saved.words)
    const ordered = buildPracticeOrder(words, merged)
    const index = Math.min(saved.currentIndex, Math.max(ordered.length - 1, 0))
    return { performance: merged, ordered, index }
  }
  const performance = initializePerformance(words)
  const ordered = buildPracticeOrder(words, performance)
  return { performance, ordered, index: 0 }
}

export default function SpellingTest({ words, onOpenAdmin }: SpellingTestProps) {
  const { user, logout } = useAuth()
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
  const [progressReady, setProgressReady] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [sessionAttempts, setSessionAttempts] = useState(0)
  const [sessionSuccesses, setSessionSuccesses] = useState(0)
  const [sessionMisses, setSessionMisses] = useState(0)
  const [showCashout, setShowCashout] = useState(false)
  const [balance, setBalance] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipNextSave = useRef(true)

  const currentWord = orderedWords[currentIndex] || ''
  const totalAttempts = performance.reduce((sum, p) => sum + p.successes + p.misses, 0)

  // Load progress from Neon (migrate browser localStorage once if DB is empty)
  useEffect(() => {
    let cancelled = false
    setProgressReady(false)
    skipNextSave.current = true
    setSessionAttempts(0)
    setSessionSuccesses(0)
    setSessionMisses(0)

    const load = async () => {
      try {
        let remote = await fetchProgress()
        const local = loadProgress()

        if ((!remote || remote.words.length === 0) && local && local.words.length > 0) {
          const migrated: ProgressData = {
            ...local,
            lastUpdated: new Date().toISOString()
          }
          await saveProgressToServer(migrated)
          clearLocalProgress()
          remote = migrated
        }

        if (cancelled) return
        const applied = applyProgress(words, remote)
        setPerformance(applied.performance)
        setOrderedWords(applied.ordered)
        setCurrentIndex(applied.index)
      } catch (err) {
        console.error('Failed to load server progress:', err)
        if (cancelled) return
        const applied = applyProgress(words, loadProgress())
        setPerformance(applied.performance)
        setOrderedWords(applied.ordered)
        setCurrentIndex(applied.index)
      } finally {
        if (!cancelled) setProgressReady(true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [words, user?.id])

  // Persist progress to Neon whenever it changes
  useEffect(() => {
    if (!progressReady || performance.length === 0 || orderedWords.length === 0) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    const progressData: ProgressData = {
      words: performance,
      currentIndex,
      totalAttempts,
      lastUpdated: new Date().toISOString()
    }

    const timer = window.setTimeout(() => {
      saveProgressToServer(progressData)
        .then(() => setSaveError(null))
        .catch(err => {
          console.error('Failed to save progress:', err)
          setSaveError(err instanceof Error ? err.message : 'Failed to save progress')
        })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [performance, currentIndex, orderedWords, totalAttempts, progressReady])

  // Initialize on component mount
  useEffect(() => {
    setUserInput('')
    setFeedback({ type: 'none', message: '' })
    inputRef.current?.focus()
  }, [])

  // Fetch definition from DB (server falls back to dictionary API and caches)
  useEffect(() => {
    const fetchDefinition = async () => {
      if (!currentWord) return

      setLoadingDefinition(true)
      try {
        const meaning = await fetchWordDefinition(currentWord)
        setDefinition(meaning ?? 'Definition not available')
      } catch (error) {
        console.error('Error fetching definition:', error)
        setDefinition('Definition not available')
      } finally {
        setLoadingDefinition(false)
      }
    }

    fetchDefinition()
  }, [currentWord])

  // Fetch balance when cashout modal opens
  useEffect(() => {
    if (!showCashout) return

    const fetchBalance = async () => {
      try {
        const data = await getRewardBalance()
        setBalance(data.balance_cents)
      } catch (err) {
        console.error('Failed to fetch balance:', err)
      }
    }

    fetchBalance()
  }, [showCashout])

  const handleCheck = () => {
    const key = normalizeWordKey(currentWord)
    if (!key) return

    const isCorrect = normalizeWordKey(userInput) === key

    setPerformance(prev => updatePerformance(prev, currentWord, isCorrect))
    setSessionAttempts(n => n + 1)
    if (isCorrect) {
      setSessionSuccesses(n => n + 1)
      // Award $0.05 for correct answer (5 cents)
      addReward(5).catch(err => {
        console.error('Failed to award reward:', err)
      })
      // Trigger immediate RewardDisplay refresh
      rewardEmitter.emit()
    } else {
      setSessionMisses(n => n + 1)
    }

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
    // Rebuild queue every Next so words with 1–4 successes reappear soon,
    // and words that just hit 5 successes drop out.
    const reshuffled = buildPracticeOrder(words, performance)
    setOrderedWords(reshuffled)
    setCurrentIndex(0)
    setUserInput('')
    setFeedback({ type: 'none', message: '' })
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback.type === 'none' && userInput.trim().length > 0) {
        handleCheck()
      } else if (feedback.type === 'correct') {
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

  if (!progressReady) {
    return (
      <div className="spelling-test-container">
        <div className="progress-loading">Loading your progress…</div>
      </div>
    )
  }

  return (
    <div className="spelling-test-container">
      <div className="header-with-controls">
        <h1 className="title">🎓 Spelling Test</h1>
        <div className="header-actions">
          <RewardDisplay />
          <button
            type="button"
            className="btn-toggle-dashboard"
            onClick={() => setShowCashout(true)}
            title="Cash out your rewards"
          >
            💵 Cash Out
          </button>
          <span className="user-chip" title={user?.username}>
            {user?.username}
          </span>
          {onOpenAdmin && (
            <button type="button" className="btn-toggle-dashboard" onClick={onOpenAdmin}>
              Admin
            </button>
          )}
          <button type="button" className="btn-toggle-dashboard" onClick={logout}>
            Sign out
          </button>
          <button
            type="button"
            className="btn-toggle-dashboard"
            onClick={() => setShowDashboard(!showDashboard)}
          >
            {showDashboard ? 'Close Dashboard' : '📊 Show Dashboard'}
          </button>
        </div>
      </div>
      {saveError && <div className="save-error">Could not save: {saveError}</div>}
      
      {showDashboard ? (
        <Dashboard
          words={words}
          performance={performance}
          sessionAttempts={sessionAttempts}
          sessionSuccesses={sessionSuccesses}
          sessionMisses={sessionMisses}
          onReset={handleReset}
          onExport={handleExport}
        />
      ) : orderedWords.length === 0 ? (
        <div className="test-card">
          <p className="all-mastered-message">
            All words have 5 correct in a row. Open the dashboard or reset if you want to practice again.
          </p>
        </div>
      ) : (
        <>
          <Statistics
            performance={performance}
            currentWord={currentWord}
            sessionAttempts={sessionAttempts}
            sessionSuccesses={sessionSuccesses}
            sessionMisses={sessionMisses}
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
                      disabled={orderedWords.length === 0}
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
      <CashoutModal
        isOpen={showCashout}
        balance_cents={balance}
        onClose={() => setShowCashout(false)}
        onSuccess={() => {
          // Refresh balance after successful cashout
          getRewardBalance().then(data => setBalance(data.balance_cents)).catch(err => console.error(err))
        }}
      />
    </div>
  )
}
