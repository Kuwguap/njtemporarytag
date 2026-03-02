import { Router } from 'express'
import Stripe from 'stripe'
import { getServiceById, createOrder } from '../db.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake')
const APP_URL = process.env.APP_URL || 'http://localhost:8080'

export const checkoutRoutes = Router()

checkoutRoutes.post('/api/checkout/create-session', async (req, res) => {
  try {
    const { serviceId, insuranceChoice } = req.body || {}
    const service = await getServiceById(serviceId || 'default')
    if (!service) return res.status(400).json({ message: 'Service not found' })

    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.title,
            description: service.description,
          },
          unit_amount: service.price,
        },
        quantity: 1,
      },
    ]

    let insuranceFee = 0
    if (insuranceChoice === 'monthly') {
      insuranceFee = 10000
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Insurance — $100/month',
            description: 'Insurance add-on (monthly)',
          },
          unit_amount: 10000,
        },
        quantity: 1,
      })
    } else if (insuranceChoice === 'yearly') {
      insuranceFee = 90000
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Insurance — $900/year (one-time)',
            description: 'Insurance add-on (annual)',
          },
          unit_amount: 90000,
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/#services`,
      metadata: {
        serviceId: service.id,
        insuranceChoice: insuranceChoice || 'none',
        insuranceFee: String(insuranceFee),
      },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message || 'Checkout failed' })
  }
})

checkoutRoutes.get('/api/checkout/verify', async (req, res) => {
  try {
    const sessionId = req.query.session_id
    if (!sessionId) return res.json({ ok: false })

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return res.json({ ok: false })

    const m = session.metadata || {}
    const service = await getServiceById(m.serviceId || 'default')
    const insuranceFee = parseInt(m.insuranceFee || '0', 10)

    await createOrder({
      stripe_session_id: sessionId,
      service_id: service?.id,
      service_title: service?.title,
      price: service?.price || 15000,
      insurance_type: m.insuranceChoice || 'none',
      insurance_fee: insuranceFee,
      payment_status: 'paid',
      details_complete: false,
      telegram_sent: false,
    })

    res.json({ ok: true, order: { id: session.id, session_id: sessionId } })
  } catch (err) {
    console.error(err)
    res.json({ ok: false })
  }
})
