import { Router } from 'express'
import { getServices, getSettings } from '../db.js'

export const servicesRoute = Router()

servicesRoute.get('/api/settings', async (_, res) => {
  try {
    const settings = await getSettings()
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

servicesRoute.get('/api/services', async (_, res) => {
  try {
    const services = await getServices()
    res.json(services)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
})
