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

servicesRoute.get('/api/vin/decode', async (req, res) => {
  try {
    const vin = String(req.query.vin || '').trim().toUpperCase()
    if (vin.length < 8) return res.status(400).json({ error: 'VIN too short' })
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(vin)}?format=json`
    const resp = await fetch(url)
    const data = await resp.json()
    const r = data?.Results?.[0]
    if (!r) return res.json({ year: '', make: '', model: '' })
    const year = r.ModelYear?.trim() || ''
    const make = r.Make?.trim() || ''
    const model = (r.Model?.trim() || r.Series?.trim() || '').replace(/\s+/g, ' ')
    res.json({ year, make, model })
  } catch (err) {
    res.status(500).json({ error: 'VIN lookup failed' })
  }
})
