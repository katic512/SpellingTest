/**
 * Progress persistence utility
 * Manages word performance tracking and local storage
 */

export interface WordPerformance {
  word: string
  successes: number
  misses: number
  lastAttempt?: string
}

export interface ProgressData {
  words: WordPerformance[]
  currentIndex: number
  totalAttempts: number
  lastUpdated: string
}

const STORAGE_KEY = 'spelling-test-progress'

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
  isCorrect: boolean
): WordPerformance[] => {
  return performance.map(p => {
    if (p.word === word.toLowerCase()) {
      return {
        ...p,
        successes: isCorrect ? p.successes + 1 : p.successes,
        misses: !isCorrect ? p.misses + 1 : p.misses,
        lastAttempt: new Date().toISOString()
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

/**
 * Sort words by performance rules:
 * 1. New words first (never attempted)
 * 2. Frequently misspelled words
 * 3. Words with mixed results
 * 4. Consistently spelled words
 */
export const sortWordsByPerformance = (
  words: string[],
  performance: WordPerformance[]
): string[] => {
  // Create a map for quick lookup
  const perfMap = new Map(performance.map(p => [p.word, p]))
  
  return [...words].sort((a, b) => {
    const perfA = perfMap.get(a.toLowerCase())
    const perfB = perfMap.get(b.toLowerCase())
    
    if (!perfA || !perfB) return 0
    
    // Priority 1: New words first (never attempted)
    const totalA = perfA.successes + perfA.misses
    const totalB = perfB.successes + perfB.misses
    
    if (totalA === 0 && totalB !== 0) return -1
    if (totalB === 0 && totalA !== 0) return 1
    if (totalA === 0 && totalB === 0) return 0
    
    // Priority 2: Calculate accuracy
    const accuracyA = perfA.successes / totalA
    const accuracyB = perfB.successes / totalB
    
    // Lower accuracy = higher priority (more practice needed)
    if (accuracyA !== accuracyB) {
      return accuracyA - accuracyB
    }
    
    // Priority 3: If same accuracy, prioritize by most attempts (most practiced)
    return totalB - totalA
  })
}

/**
 * Shuffle words within categories while maintaining priority
 */
export const shuffleWithinCategories = (
  words: string[],
  performance: WordPerformance[],
  categorySize: number = 5
): string[] => {
  const sorted = sortWordsByPerformance(words, performance)
  const result: string[] = []
  
  // Process in chunks and shuffle within each chunk
  for (let i = 0; i < sorted.length; i += categorySize) {
    const chunk = sorted.slice(i, i + categorySize)
    const shuffled = [...chunk].sort(() => Math.random() - 0.5)
    result.push(...shuffled)
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
