import { Router } from 'express'
import jwt from 'jsonwebtoken'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

export const authRoute = Router()

authRoute.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body || {}
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' })
    }
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (err) {
    res.status(500).json({ message: 'Login failed' })
  }
})
