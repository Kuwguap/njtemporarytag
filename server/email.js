const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'NJ Temporary Tag <onboarding@resend.dev>'

function buildSuccessEmailHtml(order) {
  const isEmailDelivery = order.delivery_method === 'email'
  const deliveryText = isEmailDelivery
    ? 'Your temporary tag package has been processed and will be delivered to your email shortly. Check your inbox for your temp tag, registration, and insurance card.'
    : order.delivery_method === 'overnight_fedex'
      ? "Your order is confirmed. We'll ship your temp tag via FedEx delivery next business day."
      : "Your order is confirmed. A driver will deliver your temp tag in the time frame you selected."

  const footerText = isEmailDelivery
    ? "Print and you're ready to go."
    : "We'll be in touch with delivery details."

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmed</title></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a;">Order Confirmed</h1>
  <p>${deliveryText}</p>
  <p style="margin-top: 24px; font-size: 14px; color: #666;">${footerText}</p>
  <p style="margin-top: 32px; font-size: 12px; color: #999;">NJ Temporary Tag — Licensed dealer. MVC verified.</p>
</body>
</html>
  `.trim()
}

export async function sendSuccessEmail(order, resend = false) {
  const to = order.delivery_email || order.email
  if (!to || !String(to).includes('@')) {
    console.warn('[Email] No valid deliveryEmail on order')
    return { sent: false, error: 'No valid email' }
  }

  if (!RESEND_API_KEY) {
    if (!resend) console.warn('[Email] RESEND_API_KEY not set — skipping send')
    return { sent: false, error: 'Resend not configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: 'Your NJ Temporary Tag — Order Confirmed',
        html: buildSuccessEmailHtml(order),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Email] Resend error:', data)
      return { sent: false, error: data.message || 'Resend error' }
    }

    console.log('[Email] Sent to', to, 'id:', data?.id)
    return { sent: true, id: data?.id }
  } catch (error) {
    console.error('[Email] Resend error:', error)
    return { sent: false, error: String(error) }
  }
}
