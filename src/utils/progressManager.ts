/**
 * Progress persistence utility
 * Manages word performance tracking and local storage
 */

export interface WordPerformance {
  word: string
  successes: number
  misses: number
  lastAttempt?: string
  masteredAtAttempt?: number
}

export interface ProgressData {
  words: WordPerformance[]
  currentIndex: number
  totalAttempts: number
  lastUpdated: string
}

const STORAGE_KEY = 'spelling-test-progress'
const MASTERED_SUCCESS_THRESHOLD = 3
const MASTERED_REVIEW_INTERVAL = 25

/**
 * Initialize performance data for new words
 */
export const initializePerformance = (words: string[]): WordPerformance[] => {
  return words.map(word => ({
    word: word.toLowerCase(),
    successes: 0,
    misses: 0,
    lastAttempt: undefined
  }))
}

/**
 * Load progress from local storage
 */
export const loadProgress = (): ProgressData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const data = JSON.parse(stored) as ProgressData
    return data
  } catch (error) {
    console.error('Error loading progress:', error)
    return null
  }
}

/**
 * Save progress to local storage
 */
export const saveProgress = (data: ProgressData): void => {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Error saving progress:', error)
  }
}

/**
 * Update performance for a word (increment success or miss)
 */
export const updatePerformance = (
  performance: WordPerformance[],
  word: string,
  isCorrect: boolean,
  totalAttemptsAfterCheck: number
): WordPerformance[] => {
  return performance.map(p => {
    if (p.word === word.toLowerCase()) {
      const nextSuccesses = isCorrect ? p.successes + 1 : p.successes
      const nextMisses = !isCorrect ? p.misses + 1 : p.misses
      const becameMastered =
        isCorrect &&
        nextSuccesses >= MASTERED_SUCCESS_THRESHOLD &&
        nextMisses === 0 &&
        p.masteredAtAttempt === undefined

      return {
        ...p,
        successes: nextSuccesses,
        misses: nextMisses,
        lastAttempt: new Date().toISOString(),
        masteredAtAttempt: becameMastered
          ? totalAttemptsAfterCheck
          : !isCorrect
            ? undefined
            : p.masteredAtAttempt
      }
    }
    return p
  })
}

/**
 * Get performance stats for a word
 */
export const getWordStats = (
  performance: WordPerformance[],
  word: string
): { successes: number; misses: number; total: number } => {
  const perf = performance.find(p => p.word === word.toLowerCase())
  if (!perf) return { successes: 0, misses: 0, total: 0 }
  
  return {
    successes: perf.successes,
    misses: perf.misses,
    total: perf.successes + perf.misses
  }
}

/** A word is considered mastered once it is correct 3+ times with no misses. */
export const isMasteredWord = (p: WordPerformance): boolean => {
  return p.successes >= MASTERED_SUCCESS_THRESHOLD && p.misses === 0
}

/**
 * Active practice pool excludes mastered words when there are still other words to practice.
 * If everything is mastered, fall back to full list so practice can continue.
 */
export const getPracticeWordPool = (
  words: string[],
  performance: WordPerformance[],
  totalAttempts: number
): string[] => {
  const perfMap = new Map(performance.map(p => [p.word, p]))
  const active = words.filter(word => {
    const p = perfMap.get(word.toLowerCase())
    if (!p) return true
    if (!isMasteredWord(p)) return true
    if (p.masteredAtAttempt === undefined) return false
    return totalAttempts >= p.masteredAtAttempt + MASTERED_REVIEW_INTERVAL
  })

  return active.length > 0 ? active : words
}

/** Practice priority: wrong words ahead of new, new ahead of perfect-only history */
const practiceTier = (p: WordPerformance): number => {
  const total = p.successes + p.misses
  if (total === 0) return 1
  if (p.misses > 0) return 0
  return 2
}

/**
 * Sort words by performance rules:
 * 1. Words with any misses (revisit wrong spellings often)
 * 2. New words (never attempted)
 * 3. Words spelled correctly every time so far (lowest priority)
 *
 * Within tier 0: lower accuracy first, then more misses, then more total attempts.
 * Within tier 2: fewer successful checks first (lightly practiced before “over-drilled”).
 */
export const sortWordsByPerformance = (
  words: string[],
  performance: WordPerformance[]
): string[] => {
  const perfMap = new Map(performance.map(p => [p.word, p]))

  return [...words].sort((a, b) => {
    const perfA = perfMap.get(a.toLowerCase())
    const perfB = perfMap.get(b.toLowerCase())

    if (!perfA || !perfB) return 0

    const tierA = practiceTier(perfA)
    const tierB = practiceTier(perfB)
    if (tierA !== tierB) return tierA - tierB

    const totalA = perfA.successes + perfA.misses
    const totalB = perfB.successes + perfB.misses

    if (tierA === 0) {
      const accuracyA = perfA.successes / totalA
      const accuracyB = perfB.successes / totalB
      if (accuracyA !== accuracyB) return accuracyA - accuracyB
      if (perfA.misses !== perfB.misses) return perfB.misses - perfA.misses
      if (totalA !== totalB) return totalB - totalA
    }

    if (tierA === 2 && perfA.successes !== perfB.successes) {
      return perfA.successes - perfB.successes
    }

    return a.localeCompare(b)
  })
}

/**
 * Shuffle while preserving global priority: only reorder within the same practice tier,
 * then within small batches inside each tier so wrong words stay ahead of perfect ones.
 */
export const shuffleWithinCategories = (
  words: string[],
  performance: WordPerformance[],
  tierBatchSize: number = 4
): string[] => {
  const sorted = sortWordsByPerformance(words, performance)
  const perfMap = new Map(performance.map(p => [p.word, p]))

  const tierOf = (w: string): number => {
    const p = perfMap.get(w.toLowerCase())
    return p ? practiceTier(p) : 1
  }

  const result: string[] = []
  let i = 0

  while (i < sorted.length) {
    const t = tierOf(sorted[i])
    let j = i + 1
    while (j < sorted.length && tierOf(sorted[j]) === t) j++

    const tierRun = sorted.slice(i, j)
    for (let k = 0; k < tierRun.length; k += tierBatchSize) {
      const chunk = tierRun.slice(k, k + tierBatchSize)
      const shuffled = [...chunk].sort(() => Math.random() - 0.5)
      result.push(...shuffled)
    }
    i = j
  }

  return result
}

/**
 * Get overall statistics
 */
export const getOverallStats = (performance: WordPerformance[]) => {
  const totalAttempts = performance.reduce((sum, p) => sum + p.successes + p.misses, 0)
  const totalSuccesses = performance.reduce((sum, p) => sum + p.successes, 0)
  const totalMisses = performance.reduce((sum, p) => sum + p.misses, 0)
  const accuracy = totalAttempts > 0 ? (totalSuccesses / totalAttempts * 100).toFixed(1) : 0
  const masteredWords = performance.filter(p => {
    const total = p.successes + p.misses
    return total > 0 && p.successes / total === 1
  }).length
  const newWords = performance.filter(p => p.successes + p.misses === 0).length
  
  return {
    totalAttempts,
    totalSuccesses,
    totalMisses,
    accuracy: parseFloat(accuracy as string),
    masteredWords,
    newWords,
    wordsInProgress: performance.length - masteredWords - newWords
  }
}

/**
 * Reset all progress (start over)
 */
export const resetProgress = (words: string[]): ProgressData => {
  return {
    words: initializePerformance(words),
    currentIndex: 0,
    totalAttempts: 0,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Export progress as JSON for backup
 */
export const exportProgressAsJson = (data: ProgressData): string => {
  return JSON.stringify(data, null, 2)
}

/**
 * Import progress from JSON
 */
export const importProgressFromJson = (json: string): ProgressData | null => {
  try {
    const data = JSON.parse(json) as ProgressData
    return data
  } catch (error) {
    console.error('Error importing progress:', error)
    return null
  }
}
