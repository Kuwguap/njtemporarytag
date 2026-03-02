import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { healthRoute } from './routes/health.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import { servicesRoute } from './routes/services.js'
import { checkoutRoutes } from './routes/checkout.js'
import { orderRoutes } from './routes/order.js'
import { authRoute } from './routes/auth.js'
import { adminAuth, adminApi } from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(bodyParser.json())

app.use(healthRoute)
app.use(servicesRoute)
app.use(checkoutRoutes)
app.use(orderRoutes)
app.use(authRoute)
app.use('/api/admin', adminAuth, adminApi)

app.use(express.static(path.join(__dirname, '../dist')))
app.use('/api', (req, res, next) => {
  res.status(404).json({ error: 'Not found' })
})
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

if (!process.env.RESEND_API_KEY) {
  console.warn('WARNING: RESEND_API_KEY not set — order completion emails will not send')
} else {
  console.log('Resend configured:', process.env.FROM_EMAIL || 'onboarding@resend.dev')
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
