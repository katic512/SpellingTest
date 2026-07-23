import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export interface WordPerformanceRow {
  word: string
  successes: number
  misses: number
  lastAttempt?: string
}

function parseWordsFile(text: string): string[] {
  const seen = new Set<string>()
  const words: string[] = []
  for (const part of text.split(/[,\n]/)) {
    const word = part.replace(/\uFEFF/g, '').replace(/\u200B/g, '').trim().toLowerCase()
    if (!word || seen.has(word)) continue
    seen.add(word)
    words.push(word)
  }
  return words
}

export async function seedWordsFromFile(): Promise<number> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const wordsPath = path.join(__dirname, '..', 'public', 'words.txt')
  const text = fs.readFileSync(wordsPath, 'utf8')
  const words = parseWordsFile(text)

  if (words.length === 0) {
    throw new Error('No words found in public/words.txt')
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // Upsert only — do not DELETE (would wipe user_word_progress via FK)
    const batchSize = 200
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize)
      const values: unknown[] = []
      const placeholders = batch
        .map((word, idx) => {
          const n = idx * 2
          values.push(word, i + idx)
          return `($${n + 1}, $${n + 2})`
        })
        .join(', ')
      await client.query(
        `INSERT INTO vocabulary_words (word, sort_order) VALUES ${placeholders}
         ON CONFLICT (word) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
        values
      )
    }
    await client.query('COMMIT')
    return words.length
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function migrateJsonProgressToRows(): Promise<void> {
  const col = await pool.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'spelling_progress' AND column_name = 'words'
    ) AS exists
  `)
  if (!col.rows[0]?.exists) return

  const rows = await pool.query<{
    user_id: number
    words: WordPerformanceRow[] | null
  }>(`SELECT user_id, words FROM spelling_progress WHERE words IS NOT NULL AND jsonb_typeof(words) = 'array' AND jsonb_array_length(words) > 0`)

  for (const row of rows.rows) {
    const entries = Array.isArray(row.words) ? row.words : []
    for (const entry of entries) {
      const word = String(entry.word ?? '')
        .replace(/\uFEFF/g, '')
        .replace(/\u200B/g, '')
        .trim()
        .toLowerCase()
      if (!word) continue

      const successes = Math.max(0, Math.floor(Number(entry.successes) || 0))
      const misses = Math.max(0, Math.floor(Number(entry.misses) || 0))
      if (successes === 0 && misses === 0 && !entry.lastAttempt) continue

      const vocab = await pool.query<{ id: number }>(
        `SELECT id FROM vocabulary_words WHERE word = $1`,
        [word]
      )
      if (vocab.rows.length === 0) continue

      await pool.query(
        `INSERT INTO user_word_progress (user_id, word_id, successes, misses, last_attempt)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, word_id) DO UPDATE SET
           successes = GREATEST(user_word_progress.successes, EXCLUDED.successes),
           misses = GREATEST(user_word_progress.misses, EXCLUDED.misses),
           last_attempt = COALESCE(EXCLUDED.last_attempt, user_word_progress.last_attempt)`,
        [
          row.user_id,
          vocab.rows[0].id,
          successes,
          misses,
          entry.lastAttempt ? new Date(entry.lastAttempt) : null
        ]
      )
    }
  }

  await pool.query(`ALTER TABLE spelling_progress DROP COLUMN IF EXISTS words`)
  console.log(`Migrated JSON progress for ${rows.rows.length} user(s) into user_word_progress`)
}

export async function loadUserProgress(userId: number): Promise<{
  words: WordPerformanceRow[]
  currentIndex: number
  totalAttempts: number
  lastUpdated: string
}> {
  const meta = await pool.query(
    `SELECT current_index, total_attempts, last_updated
     FROM spelling_progress WHERE user_id = $1`,
    [userId]
  )

  const wordRows = await pool.query<{
    word: string
    successes: number
    misses: number
    last_attempt: Date | null
  }>(
    `SELECT v.word,
            COALESCE(p.successes, 0) AS successes,
            COALESCE(p.misses, 0) AS misses,
            p.last_attempt
     FROM vocabulary_words v
     LEFT JOIN user_word_progress p
       ON p.word_id = v.id AND p.user_id = $1
     ORDER BY v.sort_order ASC, v.word ASC`,
    [userId]
  )

  const words: WordPerformanceRow[] = wordRows.rows.map(r => ({
    word: r.word,
    successes: r.successes,
    misses: r.misses,
    lastAttempt: r.last_attempt ? new Date(r.last_attempt).toISOString() : undefined
  }))

  if (meta.rows.length === 0) {
    return {
      words,
      currentIndex: 0,
      totalAttempts: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  const row = meta.rows[0]
  return {
    words,
    currentIndex: row.current_index,
    totalAttempts: row.total_attempts,
    lastUpdated: row.last_updated
  }
}

export async function saveUserProgress(
  userId: number,
  words: WordPerformanceRow[],
  currentIndex: number,
  totalAttempts: number
): Promise<{
  words: WordPerformanceRow[]
  currentIndex: number
  totalAttempts: number
  lastUpdated: string
}> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      `INSERT INTO spelling_progress (user_id, current_index, total_attempts, last_updated)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         current_index = EXCLUDED.current_index,
         total_attempts = EXCLUDED.total_attempts,
         last_updated = NOW()`,
      [userId, currentIndex, totalAttempts]
    )

    const vocab = await client.query<{ id: number; word: string }>(
      `SELECT id, word FROM vocabulary_words`
    )
    const wordIdByName = new Map(vocab.rows.map(r => [r.word, r.id]))

    const toUpsert: Array<{
      wordId: number
      successes: number
      misses: number
      lastAttempt: Date | null
    }> = []
    const toClearWordIds: number[] = []

    for (const entry of words) {
      const word = String(entry.word ?? '')
        .replace(/\uFEFF/g, '')
        .replace(/\u200B/g, '')
        .trim()
        .toLowerCase()
      const wordId = wordIdByName.get(word)
      if (!wordId) continue

      const successes = Math.max(0, Math.floor(Number(entry.successes) || 0))
      const misses = Math.max(0, Math.floor(Number(entry.misses) || 0))
      const lastAttempt = entry.lastAttempt ? new Date(entry.lastAttempt) : null

      if (successes === 0 && misses === 0 && !lastAttempt) {
        toClearWordIds.push(wordId)
      } else {
        toUpsert.push({ wordId, successes, misses, lastAttempt })
      }
    }

    if (toClearWordIds.length > 0) {
      await client.query(
        `DELETE FROM user_word_progress
         WHERE user_id = $1 AND word_id = ANY($2::int[])`,
        [userId, toClearWordIds]
      )
    }

    const batchSize = 100
    for (let i = 0; i < toUpsert.length; i += batchSize) {
      const batch = toUpsert.slice(i, i + batchSize)
      const values: unknown[] = []
      const placeholders = batch
        .map((row, idx) => {
          const n = idx * 5
          values.push(userId, row.wordId, row.successes, row.misses, row.lastAttempt)
          return `($${n + 1}, $${n + 2}, $${n + 3}, $${n + 4}, $${n + 5})`
        })
        .join(', ')
      await client.query(
        `INSERT INTO user_word_progress (user_id, word_id, successes, misses, last_attempt)
         VALUES ${placeholders}
         ON CONFLICT (user_id, word_id) DO UPDATE SET
           successes = EXCLUDED.successes,
           misses = EXCLUDED.misses,
           last_attempt = EXCLUDED.last_attempt`,
        values
      )
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  return loadUserProgress(userId)
}

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS spelling_progress (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      current_index INTEGER NOT NULL DEFAULT 0,
      total_attempts INTEGER NOT NULL DEFAULT 0,
      last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS vocabulary_words (
      id SERIAL PRIMARY KEY,
      word TEXT NOT NULL UNIQUE,
      definition TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_word_progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      word_id INTEGER NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
      successes INTEGER NOT NULL DEFAULT 0,
      misses INTEGER NOT NULL DEFAULT 0,
      last_attempt TIMESTAMPTZ,
      PRIMARY KEY (user_id, word_id)
    );

    CREATE INDEX IF NOT EXISTS idx_user_word_progress_user
      ON user_word_progress (user_id);
  `)

  // Older DBs may still have the JSONB words column — keep it until migration runs
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'spelling_progress' AND column_name = 'words'
      ) AND EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'spelling_progress'
      ) THEN
        NULL; -- already migrated / fresh schema without words
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'spelling_progress' AND column_name = 'words'
      ) THEN
        NULL; -- will migrate below
      END IF;
    END $$;
  `)

  await pool.query(`
    ALTER TABLE vocabulary_words
      ADD COLUMN IF NOT EXISTS definition TEXT
  `)

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  `)
  // Ensure check constraint exists (ignore if already present)
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
      ) THEN
        ALTER TABLE users
          ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));
      END IF;
    END $$;
  `)
  await pool.query(`UPDATE users SET role = 'user' WHERE role IS NULL OR role NOT IN ('admin', 'user')`)
  await pool.query(`UPDATE users SET role = 'admin' WHERE username = 'katic'`)
  await pool.query(`UPDATE users SET role = 'user' WHERE username <> 'katic'`)

  const count = await pool.query<{ n: string }>('SELECT COUNT(*)::text AS n FROM vocabulary_words')
  if (Number(count.rows[0].n) === 0) {
    const n = await seedWordsFromFile()
    console.log(`Seeded vocabulary_words with ${n} words from public/words.txt`)
  }

  await migrateJsonProgressToRows()
}
