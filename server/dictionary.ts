import { pool } from './db.js'

const MERRIAM_WEBSTER_API_KEY =
  process.env.MERRIAM_WEBSTER_API_KEY || '2a1b51e3-7493-4ec5-b9a5-5649e9dc6f23'

export function normalizeWord(word: string): string {
  return word.replace(/\uFEFF/g, '').replace(/\u200B/g, '').trim().toLowerCase()
}

async function fetchDefinitionFromApi(word: string): Promise<string | null> {
  const url = `https://www.dictionaryapi.com/api/v3/references/sd2/json/${encodeURIComponent(word)}?key=${encodeURIComponent(MERRIAM_WEBSTER_API_KEY)}`
  const response = await fetch(url)
  if (!response.ok) return null

  const data: unknown = await response.json()
  if (!Array.isArray(data) || data.length === 0) return null

  const first = data[0]
  if (typeof first === 'string') return null

  const shortdef = (first as { shortdef?: string[] }).shortdef?.filter(Boolean) ?? []
  return shortdef[0] ?? null
}

/**
 * Return definition from DB if present; otherwise fetch from Merriam-Webster,
 * store it on the vocabulary row when the word exists, and return it.
 */
export async function getOrFetchDefinition(rawWord: string): Promise<{
  word: string
  definition: string | null
  source: 'db' | 'api' | 'none'
}> {
  const word = normalizeWord(rawWord)
  if (!word) {
    return { word: '', definition: null, source: 'none' }
  }

  const existing = await pool.query<{ id: number; definition: string | null }>(
    `SELECT id, definition FROM vocabulary_words WHERE word = $1`,
    [word]
  )

  if (existing.rows.length > 0) {
    const row = existing.rows[0]
    if (row.definition && row.definition.trim()) {
      return { word, definition: row.definition.trim(), source: 'db' }
    }

    const fromApi = await fetchDefinitionFromApi(word)
    if (fromApi) {
      await pool.query(`UPDATE vocabulary_words SET definition = $1 WHERE id = $2`, [
        fromApi,
        row.id
      ])
      return { word, definition: fromApi, source: 'api' }
    }
    return { word, definition: null, source: 'none' }
  }

  // Word not in vocabulary — still try API for display, but don't insert
  const fromApi = await fetchDefinitionFromApi(word)
  return { word, definition: fromApi, source: fromApi ? 'api' : 'none' }
}
