import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { pool, initDb, loadUserProgress, saveUserProgress } from '../server/db.js'
import { requireAuth, requireAdmin, signToken, AuthedRequest } from '../server/auth.js'
import { getOrFetchDefinition, normalizeWord } from '../server/dictionary.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Initialize database if needed
initDb().catch(err => console.error('DB init error:', err))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// Words endpoints
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

// Admin endpoints
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

// Auth endpoints
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

    const existing = await pool.query(`SELECT id FROM users WHERE username = $1`, [username])
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Username already taken' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const inserted = await pool.query<{ id: number; username: string; role: string }>(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role`,
      [username, hashedPassword, 'user']
    )

    const user = inserted.rows[0]
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role as 'admin' | 'user'
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Failed to register' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String(req.body.username ?? '').trim().toLowerCase()
    const password = String(req.body.password ?? '')

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' })
      return
    }

    const result = await pool.query<{ id: number; username: string; password_hash: string; role: string }>(
      `SELECT id, username, password_hash, role FROM users WHERE username = $1`,
      [username]
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role as 'admin' | 'user'
    })
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Failed to login' })
  }
})

app.get('/api/auth/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const result = await pool.query<{ id: number; username: string; role: string }>(
      `SELECT id, username, role FROM users WHERE id = $1`,
      [userId]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    const user = result.rows[0]
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })
  } catch (err) {
    console.error('Get me error:', err)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// Progress endpoints
app.get('/api/progress', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const result = await loadUserProgress(userId)
    res.json(result)
  } catch (err) {
    console.error('Load progress error:', err)
    res.status(500).json({ error: 'Failed to load progress' })
  }
})

app.put('/api/progress', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    await saveUserProgress(userId, req.body.words, req.body.currentIndex, req.body.totalAttempts)
    res.json({ ok: true })
  } catch (err) {
    console.error('Save progress error:', err)
    res.status(500).json({ error: 'Failed to save progress' })
  }
})

export default app
