import { Router } from 'express'
import { getServices } from '../db.js'

export const servicesRoute = Router()

servicesRoute.get('/api/services', async (_, res) => {
  try {
    const services = await getServices()
    res.json(services)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
})
