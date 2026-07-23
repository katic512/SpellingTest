import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { pool, initDb, seedWordsFromFile, loadUserProgress, saveUserProgress } from './db.js'
import { requireAuth, requireAdmin, signToken, AuthedRequest } from './auth.js'
import { getOrFetchDefinition, normalizeWord } from './dictionary.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/words', async (_req, res) => {
  try {
    const result = await pool.query<{ word: string }>(
      `SELECT word FROM vocabulary_words ORDER BY sort_order ASC, word ASC`
    )
    const words = result.rows.map(r => r.word)
    if (words.length === 0) {
      res.status(503).json({ error: 'No vocabulary words in database' })
      return
    }
    res.json({ words })
  } catch (err) {
    console.error('Load words error:', err)
    res.status(500).json({ error: 'Failed to load words' })
  }
})

app.post('/api/words/seed', requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    const count = await seedWordsFromFile()
    res.json({ ok: true, count })
  } catch (err) {
    console.error('Seed words error:', err)
    res.status(500).json({ error: 'Failed to seed words' })
  }
})

app.get('/api/words/:word/definition', async (req, res) => {
  try {
    const result = await getOrFetchDefinition(String(req.params.word ?? ''))
    res.json({
      word: result.word,
      definition: result.definition,
      source: result.source
    })
  } catch (err) {
    console.error('Definition error:', err)
    res.status(500).json({ error: 'Failed to load definition' })
  }
})

app.get('/api/admin/words', requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    const result = await pool.query<{
      id: number
      word: string
      definition: string | null
      sort_order: number
    }>(
      `SELECT id, word, definition, sort_order
       FROM vocabulary_words
       ORDER BY sort_order ASC, word ASC`
    )
    res.json({
      words: result.rows.map(r => ({
        id: r.id,
        word: r.word,
        definition: r.definition,
        sortOrder: r.sort_order
      }))
    })
  } catch (err) {
    console.error('Admin list words error:', err)
    res.status(500).json({ error: 'Failed to list words' })
  }
})

app.post('/api/admin/words', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const word = normalizeWord(String(req.body.word ?? ''))
    const definition =
      req.body.definition != null && String(req.body.definition).trim()
        ? String(req.body.definition).trim()
        : null

    if (!word) {
      res.status(400).json({ error: 'Word is required' })
      return
    }

    const maxOrder = await pool.query<{ n: number }>(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM vocabulary_words`
    )
    const sortOrder = maxOrder.rows[0]?.n ?? 0

    const inserted = await pool.query<{
      id: number
      word: string
      definition: string | null
      sort_order: number
    }>(
      `INSERT INTO vocabulary_words (word, definition, sort_order)
       VALUES ($1, $2, $3)
       RETURNING id, word, definition, sort_order`,
      [word, definition, sortOrder]
    )

    let row = inserted.rows[0]
    if (!row.definition) {
      const fetched = await getOrFetchDefinition(word)
      if (fetched.definition) {
        const updated = await pool.query<{
          id: number
          word: string
          definition: string | null
          sort_order: number
        }>(
          `SELECT id, word, definition, sort_order FROM vocabulary_words WHERE id = $1`,
          [row.id]
        )
        row = updated.rows[0]
      }
    }

    res.status(201).json({
      id: row.id,
      word: row.word,
      definition: row.definition,
      sortOrder: row.sort_order
    })
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    if (code === '23505') {
      res.status(409).json({ error: 'Word already exists' })
      return
    }
    console.error('Admin add word error:', err)
    res.status(500).json({ error: 'Failed to add word' })
  }
})

app.put('/api/admin/words/:id', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid word id' })
      return
    }

    const existing = await pool.query<{ id: number; word: string; definition: string | null }>(
      `SELECT id, word, definition FROM vocabulary_words WHERE id = $1`,
      [id]
    )
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Word not found' })
      return
    }

    const nextWord =
      req.body.word != null ? normalizeWord(String(req.body.word)) : existing.rows[0].word
    if (!nextWord) {
      res.status(400).json({ error: 'Word cannot be empty' })
      return
    }

    const nextDefinition =
      req.body.definition !== undefined
        ? req.body.definition == null || String(req.body.definition).trim() === ''
          ? null
          : String(req.body.definition).trim()
        : existing.rows[0].definition

    const updated = await pool.query<{
      id: number
      word: string
      definition: string | null
      sort_order: number
    }>(
      `UPDATE vocabulary_words
       SET word = $1, definition = $2
       WHERE id = $3
       RETURNING id, word, definition, sort_order`,
      [nextWord, nextDefinition, id]
    )

    const row = updated.rows[0]
    res.json({
      id: row.id,
      word: row.word,
      definition: row.definition,
      sortOrder: row.sort_order
    })
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    if (code === '23505') {
      res.status(409).json({ error: 'Another word already uses that spelling' })
      return
    }
    console.error('Admin update word error:', err)
    res.status(500).json({ error: 'Failed to update word' })
  }
})

app.delete('/api/admin/words/:id', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid word id' })
      return
    }

    const result = await pool.query(
      `DELETE FROM vocabulary_words WHERE id = $1 RETURNING id, word`,
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Word not found' })
      return
    }
    res.json({ ok: true, id: result.rows[0].id, word: result.rows[0].word })
  } catch (err) {
    console.error('Admin delete word error:', err)
    res.status(500).json({ error: 'Failed to delete word' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const username = String(req.body.username ?? '').trim().toLowerCase()
    const password = String(req.body.password ?? '')

    if (username.length < 3 || username.length > 32) {
      res.status(400).json({ error: 'Username must be 3–32 characters' })
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, 'user')
       RETURNING id, username, role`,
      [username, passwordHash]
    )

    const user = result.rows[0]
    await pool.query(
      `INSERT INTO spelling_progress (user_id, current_index, total_attempts)
       VALUES ($1, 0, 0)`,
      [user.id]
    )

    const role = user.role === 'admin' ? 'admin' : 'user'
    const token = signToken({ userId: user.id, username: user.username, role })
    res.status(201).json({ token, user: { id: user.id, username: user.username, role } })
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    if (code === '23505') {
      res.status(409).json({ error: 'Username already taken' })
      return
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String(req.body.username ?? '').trim().toLowerCase()
    const password = String(req.body.password ?? '')

    const result = await pool.query(
      `SELECT id, username, password_hash, role FROM users WHERE username = $1`,
      [username]
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    const user = result.rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    const role = user.role === 'admin' ? 'admin' : 'user'
    const token = signToken({ userId: user.id, username: user.username, role })
    res.json({ token, user: { id: user.id, username: user.username, role } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, role FROM users WHERE id = $1`,
      [req.user!.userId]
    )
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' })
      return
    }
    const user = result.rows[0]
    const role = user.role === 'admin' ? 'admin' : 'user'
    res.json({ user: { id: user.id, username: user.username, role } })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Failed to load user' })
  }
})

app.get('/api/progress', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const progress = await loadUserProgress(req.user!.userId)
    res.json(progress)
  } catch (err) {
    console.error('Load progress error:', err)
    res.status(500).json({ error: 'Failed to load progress' })
  }
})

app.put('/api/progress', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { words, currentIndex, totalAttempts } = req.body
    if (!Array.isArray(words)) {
      res.status(400).json({ error: 'words must be an array' })
      return
    }

    const progress = await saveUserProgress(
      req.user!.userId,
      words,
      Number(currentIndex) || 0,
      Number(totalAttempts) || 0
    )
    res.json(progress)
  } catch (err) {
    console.error('Save progress error:', err)
    res.status(500).json({ error: 'Failed to save progress' })
  }
})

async function start() {
  await initDb()
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
