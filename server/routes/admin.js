import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { getOrders, getStats, getServicesForAdmin, addService, deleteService, getSettings, updateSettings } from '../db.js'

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

const adminApi = Router()

adminApi.get('/orders', async (_, res) => {
  const orders = await getOrders()
  res.json({ orders })
})

adminApi.get('/stats', async (_, res) => {
  const stats = await getStats()
  res.json(stats)
})

adminApi.get('/services', async (_, res) => {
  const services = await getServicesForAdmin()
  res.json({ services })
})

adminApi.post('/services', async (req, res) => {
  const { title, description, price, image } = req.body || {}
  await addService({ title, description, price: typeof price === 'number' ? price : 15000, image: image || null })
  const services = await getServicesForAdmin()
  res.json({ services })
})

adminApi.delete('/services/:id', async (req, res) => {
  await deleteService(req.params.id)
  res.json({ ok: true })
})

adminApi.get('/settings', async (_, res) => {
  const settings = await getSettings()
  res.json(settings)
})

adminApi.post('/settings', async (req, res) => {
  try {
    const updates = req.body || {}
    const allowed = ['insurance_monthly_price', 'insurance_yearly_price', 'fedex_fee', 'test_mode']
    const filtered = {}
    for (const k of allowed) {
      if (k in updates) {
        if (k === 'test_mode') {
          filtered[k] = updates[k] === true || updates[k] === 'true'
        } else {
          const num = Number(updates[k])
          filtered[k] = isNaN(num) ? 0 : Math.round(num)
        }
      }
    }
    if (Object.keys(filtered).length === 0) {
      const settings = await getSettings()
      return res.json(settings)
    }
    const settings = await updateSettings(filtered)
    res.json(settings)
  } catch (err) {
    console.error('[Admin] Settings save error:', err)
    res.status(500).json({ error: err.message || 'Failed to save settings' })
  }
})

export const adminRoutes = Router()
adminRoutes.use('/api/admin', authMiddleware, adminApi)
