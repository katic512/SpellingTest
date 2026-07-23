import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

export interface AuthPayload {
  userId: number
  username: string
  role: 'admin' | 'user'
}

export interface AuthedRequest extends Request {
  user?: AuthPayload
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '30d' })
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const token = header.slice(7)
    const payload = jwt.verify(token, JWT_SECRET!) as AuthPayload
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role === 'admin' ? 'admin' : 'user'
    }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin only' })
      return
    }
    next()
  })
}
