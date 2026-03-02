import { Router } from 'express'

export const vinRoute = Router()

vinRoute.get('/decode', async (req, res) => {
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
