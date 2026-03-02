import { Router } from 'express'
import Stripe from 'stripe'
import { getServiceById, createOrder, getSettings, getOrderBySessionId } from '../db.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake')
const APP_URL = process.env.APP_URL || 'http://localhost:8080'

export const checkoutRoutes = Router()

checkoutRoutes.post('/api/checkout/create-session', async (req, res) => {
  try {
    const { serviceId, insuranceChoice, deliveryMethod, deliveryEmail } = req.body || {}
    const service = await getServiceById(serviceId || 'default')
    if (!service) return res.status(400).json({ message: 'Service not found' })

    const settings = await getSettings()
    const tagPrice = settings.tag_price ?? service.price ?? 15000
    let insuranceFee = 0
    const insuranceMonthly = settings.insurance_monthly_price ?? 10000
    const insuranceYearly = settings.insurance_yearly_price ?? 90000

    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.title,
            description: service.description,
          },
          unit_amount: tagPrice,
        },
        quantity: 1,
      },
    ]

    if (insuranceChoice === 'monthly') {
      insuranceFee = insuranceMonthly
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Insurance — $${insuranceMonthly / 100}/month`,
            description: 'Insurance add-on (monthly)',
          },
          unit_amount: insuranceMonthly,
        },
        quantity: 1,
      })
    } else if (insuranceChoice === 'yearly') {
      insuranceFee = insuranceYearly
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Insurance — $${insuranceYearly / 100}/year (one-time)`,
            description: 'Insurance add-on (annual)',
          },
          unit_amount: insuranceYearly,
        },
        quantity: 1,
      })
    }

    const fedexFee = settings.fedex_fee ?? 5000
    if (deliveryMethod === 'overnight_fedex') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'FedEx Delivery',
            description: 'Next business day',
          },
          unit_amount: fedexFee,
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout`,
      metadata: {
        serviceId: service.id,
        insuranceChoice: insuranceChoice || 'none',
        insuranceFee: String(insuranceFee),
        deliveryMethod: deliveryMethod || 'email',
        deliveryEmail: deliveryEmail || '',
      },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message || 'Checkout failed' })
  }
})

checkoutRoutes.get('/api/checkout/test-session', async (req, res) => {
  try {
    const settings = await getSettings()
    if (!settings.test_mode) return res.redirect(APP_URL + '/checkout')

    const sessionId = 'test_' + Date.now()
    const { deliveryMethod, deliveryEmail, insuranceChoice } = req.query || {}
    const tagPrice = settings.tag_price || 15000
    let insuranceFee = 0
    if (insuranceChoice === 'monthly') insuranceFee = settings.insurance_monthly_price || 10000
    else if (insuranceChoice === 'yearly') insuranceFee = settings.insurance_yearly_price || 90000
    const fedexFee = deliveryMethod === 'overnight_fedex' ? (settings.fedex_fee || 5000) : 0

    await createOrder({
      stripe_session_id: sessionId,
      service_id: 'default',
      service_title: 'Standard Temp Tag',
      price: tagPrice,
      insurance_type: insuranceChoice || 'none',
      insurance_fee: insuranceFee,
      delivery_method: deliveryMethod || 'email',
      delivery_email: deliveryEmail || null,
      payment_status: 'paid',
      details_complete: false,
      telegram_sent: false,
    })

    res.redirect(`${APP_URL}/checkout/success?session_id=${sessionId}`)
  } catch (err) {
    console.error(err)
    res.redirect(APP_URL + '/checkout')
  }
})

checkoutRoutes.get('/api/checkout/verify', async (req, res) => {
  try {
    const sessionId = req.query.session_id
    if (!sessionId) return res.json({ ok: false })

    if (String(sessionId).startsWith('test_')) {
      const { getOrderBySessionId } = await import('../db.js')
      const order = await getOrderBySessionId(sessionId)
      return res.json({ ok: order != null, order: order ? { id: sessionId, session_id: sessionId } : null })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return res.json({ ok: false })

    const existing = await getOrderBySessionId(sessionId)
    if (existing) return res.json({ ok: true, order: { id: session.id, session_id: sessionId } })

    const m = session.metadata || {}
    const service = await getServiceById(m.serviceId || 'default')
    const settings = await getSettings()
    const insuranceFee = parseInt(m.insuranceFee || '0', 10)
    const tagPrice = settings.tag_price ?? service?.price ?? 15000
    const deliveryFee = m.deliveryMethod === 'overnight_fedex' ? (settings.fedex_fee ?? 5000) : 0

    await createOrder({
      stripe_session_id: sessionId,
      service_id: service?.id,
      service_title: service?.title,
      price: tagPrice,
      insurance_type: m.insuranceChoice || 'none',
      insurance_fee: insuranceFee,
      delivery_fee: deliveryFee,
      delivery_method: m.deliveryMethod || null,
      delivery_email: m.deliveryEmail || null,
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
