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
const MASTERED_SUCCESS_THRESHOLD = 3

/** Canonical word key for matching (strips BOM / zero-width chars, trims, lowercases). */
export const normalizeWordKey = (w: string): string =>
  w.replace(/\uFEFF/g, '').replace(/\u200B/g, '').trim().toLowerCase()

/**
 * Fisher–Yates shuffle (unbiased).
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const isMasteredWord = (p: WordPerformance): boolean =>
  p.successes >= MASTERED_SUCCESS_THRESHOLD && p.misses === 0

/**
 * Initialize tracking rows in random order (breaks alphabetical bias).
 */
export const initializePerformance = (words: string[]): WordPerformance[] => {
  return shuffleArray([...words]).map(word => ({
    word: normalizeWordKey(word),
    successes: 0,
    misses: 0,
    lastAttempt: undefined
  }))
}

const pickLatestAttempt = (a?: string, b?: string): string | undefined => {
  if (!a) return b
  if (!b) return a
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b
}

/** Coerce stored values so UI math and comparisons stay sane. */
export const normalizePerformanceRow = (p: WordPerformance): WordPerformance => {
  const word = normalizeWordKey(String(p.word ?? ''))
  const successes = Math.max(0, Math.floor(Number(p.successes) || 0))
  const misses = Math.max(0, Math.floor(Number(p.misses) || 0))
  return {
    word,
    successes,
    misses,
    lastAttempt: p.lastAttempt
  }
}

/**
 * Merge saved rows by word (last-write wins for duplicate keys), then align to the
 * current `words` list so stats always attach to the right spelling. Fixes false
 * misses when an old save was index-aligned but the word list order changed.
 */
export const rehydratePerformance = (
  words: string[],
  saved: WordPerformance[]
): WordPerformance[] => {
  const merged = new Map<string, WordPerformance>()
  for (const raw of saved) {
    const p = normalizePerformanceRow(raw)
    const prev = merged.get(p.word)
    if (!prev) {
      merged.set(p.word, { ...p })
    } else {
      merged.set(p.word, {
        word: p.word,
        successes: Math.max(prev.successes, p.successes),
        misses: Math.max(prev.misses, p.misses),
        lastAttempt: pickLatestAttempt(prev.lastAttempt, p.lastAttempt)
      })
    }
  }

  return words.map(w => {
    const key = normalizeWordKey(w)
    const hit = merged.get(key)
    if (hit) return { ...hit, word: key }
    return {
      word: key,
      successes: 0,
      misses: 0,
      lastAttempt: undefined
    }
  })
}

export const loadProgress = (): ProgressData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as ProgressData
  } catch (error) {
    console.error('Error loading progress:', error)
    return null
  }
}

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

export const updatePerformance = (
  performance: WordPerformance[],
  word: string,
  isCorrect: boolean
): WordPerformance[] => {
  const key = normalizeWordKey(word)
  if (!key) return performance

  return performance.map(p => {
    if (p.word !== key) return p

    return {
      ...p,
      successes: isCorrect ? p.successes + 1 : p.successes,
      misses: isCorrect ? p.misses : p.misses + 1,
      lastAttempt: new Date().toISOString()
    }
  })
}

export const getWordStats = (
  performance: WordPerformance[],
  word: string
): { successes: number; misses: number; total: number } => {
  const perf = performance.find(p => p.word === normalizeWordKey(word))
  if (!perf) return { successes: 0, misses: 0, total: 0 }

  return {
    successes: perf.successes,
    misses: perf.misses,
    total: perf.successes + perf.misses
  }
}

/**
 * Full practice queue: mistake words → never attempted → in-flight (not yet mastered).
 * Mastered words (3+ correct, 0 misses) are omitted until everything else is done.
 */
export const buildPracticeOrder = (
  allWords: string[],
  performance: WordPerformance[]
): string[] => {
  const perfMap = new Map(
    performance.map(p => {
      const k = normalizeWordKey(p.word)
      return [k, { ...p, word: k }] as const
    })
  )
  const mistaken: string[] = []
  const fresh: string[] = []
  const ongoing: string[] = []

  for (const w of allWords) {
    const p = perfMap.get(normalizeWordKey(w))
    if (!p) {
      fresh.push(w)
      continue
    }
    if (isMasteredWord(p)) continue

    const total = p.successes + p.misses
    if (p.misses > 0) mistaken.push(w)
    else if (total === 0) fresh.push(w)
    else ongoing.push(w)
  }

  const ordered = [
    ...shuffleArray(mistaken),
    ...shuffleArray(fresh),
    ...shuffleArray(ongoing)
  ]

  if (ordered.length > 0) return ordered
  return shuffleArray([...allWords])
}

/**
 * Smaller slice for optional batch-style sessions (same priority rules as buildPracticeOrder).
 */
export const getNextTestBatch = (
  performance: WordPerformance[],
  batchSize: number = 10
): string[] => {
  const allWords = performance.map(p => p.word)
  const pool = buildPracticeOrder(allWords, performance)
  return pool.slice(0, Math.min(batchSize, pool.length))
}

export const getOverallStats = (performance: WordPerformance[]) => {
  const totalAttempts = performance.reduce((sum, p) => sum + p.successes + p.misses, 0)
  const totalSuccesses = performance.reduce((sum, p) => sum + p.successes, 0)
  const totalMisses = performance.reduce((sum, p) => sum + p.misses, 0)
  const accuracy =
    totalAttempts > 0 ? ((totalSuccesses / totalAttempts) * 100).toFixed(1) : '0.0'

  const masteredWords = performance.filter(p => isMasteredWord(p)).length
  const newWords = performance.filter(p => p.successes + p.misses === 0).length
  const wordsInProgress = performance.length - masteredWords - newWords

  return {
    totalAttempts,
    totalSuccesses,
    totalMisses,
    accuracy: parseFloat(accuracy),
    masteredWords,
    newWords,
    wordsInProgress
  }
}

export const resetProgress = (words: string[]): ProgressData => {
  return {
    words: initializePerformance(words),
    currentIndex: 0,
    totalAttempts: 0,
    lastUpdated: new Date().toISOString()
  }
}

export const exportProgressAsJson = (data: ProgressData): string => {
  return JSON.stringify(data, null, 2)
}

export const importProgressFromJson = (json: string): ProgressData | null => {
  try {
    return JSON.parse(json) as ProgressData
  } catch (error) {
    console.error('Error importing progress:', error)
    return null
  }
}
