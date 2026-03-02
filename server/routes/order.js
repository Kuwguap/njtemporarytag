import { Router } from 'express'
import Stripe from 'stripe'
import { getOrderBySessionId, updateOrderBySessionId, createOrder, getServiceById, getOrders } from '../db.js'
import { sendOrderToTelegram } from '../telegram.js'
import { sendSuccessEmail } from '../email.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake')

export const orderRoutes = Router()

orderRoutes.get('/api/order/status', async (req, res) => {
  try {
    const sessionId = req.query.session_id
    if (!sessionId) return res.status(400).json({ error: 'session_id required' })

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return res.json({ paid: false, canComplete: false })
    }

    const order = await getOrderBySessionId(sessionId)
    return res.json({
      paid: true,
      canComplete: true,
      detailsComplete: order?.details_complete || false,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to check status' })
  }
})

orderRoutes.post('/api/order/complete', async (req, res) => {
  try {
    const { session_id, ...form } = req.body || {}
    if (!session_id) return res.status(400).json({ error: 'session_id required' })

    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not verified' })
    }

    let order = await getOrderBySessionId(session_id)
    if (!order) {
      const m = session.metadata || {}
      const service = await getServiceById(m.serviceId || 'default')
      const insuranceFee = parseInt(m.insuranceFee || '0', 10)
      await createOrder({
        stripe_session_id: session_id,
        service_id: service?.id,
        service_title: service?.title,
        price: service?.price || 15000,
        insurance_type: m.insuranceChoice || 'none',
        insurance_fee: insuranceFee,
        payment_status: 'paid',
        details_complete: false,
        telegram_sent: false,
      })
      order = await getOrderBySessionId(session_id)
    }
    if (!order) return res.status(500).json({ error: 'Failed to create order' })
    if (order.details_complete) {
      return res.json({ ok: true, message: 'Order already completed' })
    }

    const updates = {
      delivery_date: form.deliveryDate || form.delivery_date,
      delivery_time: form.deliveryTime || form.delivery_time,
      delivery_method: form.deliveryMethod || form.delivery_method,
      delivery_email: form.deliveryEmail || form.delivery_email || form.email || null,
      first_name: form.firstName || form.first_name,
      last_name: form.lastName || form.last_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      vin: form.vin,
      car_make_model: form.carMakeModel || form.car_make_model,
      color: form.color,
      insurance_type: form.insuranceType || form.insurance_type || order.insurance_type,
      insurance_company: form.insuranceCompany || form.insurance_company,
      insurance_policy: form.insurancePolicy || form.insurance_policy,
      details_complete: true,
    }

    const updated = await updateOrderBySessionId(session_id, updates)
    if (!updated) return res.status(500).json({ error: 'Failed to update order' })

    const tg = await sendOrderToTelegram(updated)
    const results = tg.results || []
    await updateOrderBySessionId(session_id, {
      telegram_sent: tg.sent,
      telegram_recipients: results.map((r) => r.chatId).join(','),
      telegram_errors: results.filter((r) => !r.ok).map((r) => r.error).join('; ') || null,
    })

    // Send confirmation email when we have a valid delivery email
    const emailTo = updated.delivery_email || updated.email
    if (emailTo && String(emailTo).includes('@')) {
      await sendSuccessEmail(updated)
    }

    res.json({ ok: true, telegramSent: tg.sent })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to complete order' })
  }
})

orderRoutes.post('/api/orders/:id/send-success-email', async (req, res) => {
  try {
    const { id } = req.params
    let order = await getOrderBySessionId(id)
    if (!order) {
      const orders = await getOrders()
      order = orders.find((o) => o.id === id || o.stripe_session_id === id) || null
    }
    if (!order) return res.status(404).json({ sent: false, error: 'Order not found' })

    const to = order.delivery_email || order.email
    if (!to || !String(to).includes('@')) {
      return res.json({ sent: false, error: 'No valid delivery email' })
    }

    const result = await sendSuccessEmail(order, true)
    res.json({ sent: result.sent, error: result.error })
  } catch (err) {
    console.error(err)
    res.status(500).json({ sent: false, error: err.message || 'Failed to send email' })
  }
})
