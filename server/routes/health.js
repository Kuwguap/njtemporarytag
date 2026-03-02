import { Router } from 'express'
export const healthRoute = Router()

healthRoute.get('/api/health', (_, res) => {
  res.json({ ok: true })
})
