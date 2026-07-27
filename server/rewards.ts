import express, { Request, Response } from 'express'
import { pool } from './db.js'
import { requireAuth, AuthedRequest } from './auth.js'

const router = express.Router()

// Get user's reward balance
router.get('/balance', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const result = await pool.query<{
      balance_cents: number
      total_earned_cents: number
      total_cashed_out_cents: number
    }>(
      `SELECT balance_cents, total_earned_cents, total_cashed_out_cents 
       FROM users WHERE id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching rewards:', error)
    res.status(500).json({ error: 'Failed to fetch rewards' })
  }
})

// Add reward for correct answer
router.post('/add', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { reward_cents = 500 } = req.body // Default 5 cents ($0.05)

    const result = await pool.query<{
      balance_cents: number
      total_earned_cents: number
      total_cashed_out_cents: number
    }>(
      `UPDATE users 
       SET balance_cents = balance_cents + $1, 
           total_earned_cents = total_earned_cents + $1
       WHERE id = $2
       RETURNING balance_cents, total_earned_cents, total_cashed_out_cents`,
      [reward_cents, userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error adding reward:', error)
    res.status(500).json({ error: 'Failed to add reward' })
  }
})

// Request cashout
router.post('/cashout', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { amount_dollars } = req.body

    if (!amount_dollars || amount_dollars < 1 || amount_dollars % 1 !== 0) {
      res.status(400).json({ error: 'Amount must be a whole number >= 1 dollar' })
      return
    }

    const amount_cents = amount_dollars * 100

    // Check if user has enough balance
    const balanceResult = await pool.query<{ balance_cents: number }>(
      'SELECT balance_cents FROM users WHERE id = $1',
      [userId]
    )

    if (balanceResult.rows.length === 0 || balanceResult.rows[0].balance_cents < amount_cents) {
      res.status(400).json({ error: 'Insufficient balance' })
      return
    }

    // Deduct from balance and record cashout
    await pool.query('BEGIN')

    try {
      const updateResult = await pool.query<{
        balance_cents: number
        total_cashed_out_cents: number
      }>(
        `UPDATE users 
         SET balance_cents = balance_cents - $1,
             total_cashed_out_cents = total_cashed_out_cents + $1
         WHERE id = $2
         RETURNING balance_cents, total_cashed_out_cents`,
        [amount_cents, userId]
      )

      const cashoutResult = await pool.query<{
        id: number
        amount_cents: number
        created_at: string
      }>(
        `INSERT INTO cashout_history (user_id, amount_cents, status)
         VALUES ($1, $2, 'completed')
         RETURNING id, amount_cents, created_at`,
        [userId, amount_cents]
      )

      await pool.query('COMMIT')

      res.json({
        success: true,
        cashout_id: cashoutResult.rows[0].id,
        amount_dollars,
        new_balance: updateResult.rows[0].balance_cents / 100,
        timestamp: cashoutResult.rows[0].created_at
      })
    } catch (err) {
      await pool.query('ROLLBACK')
      throw err
    }
  } catch (error) {
    console.error('Error processing cashout:', error)
    res.status(500).json({ error: 'Failed to process cashout' })
  }
})

// Get cashout history
router.get('/cashout-history', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const result = await pool.query<{
      id: number
      amount_cents: number
      status: string
      created_at: string
    }>(
      `SELECT id, amount_cents, status, created_at 
       FROM cashout_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching cashout history:', error)
    res.status(500).json({ error: 'Failed to fetch cashout history' })
  }
})

export default router
