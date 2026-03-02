import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { getOrders, getStats, getServicesForAdmin, addService, deleteService } from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

export const adminRoutes = Router()

adminRoutes.use('/api/admin', authMiddleware)

adminRoutes.get('/api/admin/orders', async (_, res) => {
  const orders = await getOrders()
  res.json({ orders })
})

adminRoutes.get('/api/admin/stats', async (_, res) => {
  const stats = await getStats()
  res.json(stats)
})

adminRoutes.get('/api/admin/services', async (_, res) => {
  const services = await getServicesForAdmin()
  res.json({ services })
})

adminRoutes.post('/api/admin/services', async (req, res) => {
  const { title, description, price, image } = req.body || {}
  await addService({ title, description, price: price || 15000, image: image || null })
  const services = await getServicesForAdmin()
  res.json({ services })
})

adminRoutes.delete('/api/admin/services/:id', async (req, res) => {
  await deleteService(req.params.id)
  res.json({ ok: true })
})
