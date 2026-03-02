const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || ''

export async function sendOrderToTelegram(order) {
  if (!BOT_TOKEN || !CHAT_IDS) return { sent: false, error: 'Telegram not configured' }

  const ids = CHAT_IDS.split(',').map((s) => s.trim()).filter(Boolean)
  if (ids.length === 0) return { sent: false, error: 'No chat IDs' }

  const lines = [
    '🆕 New Order',
    '',
    `Order ID: ${order.id || order.stripe_session_id}`,
    `Amount: $${((order.price || 0) + (order.insurance_fee || 0)) / 100}`,
    `Insurance: ${order.insurance_type || 'none'}${order.insurance_company ? ` (${order.insurance_company} #${order.insurance_policy})` : ''}`,
    '',
    'Delivery:',
    `  Date: ${order.delivery_date || '—'}`,
    `  Time: ${order.delivery_time || '—'}`,
    `  Method: ${order.delivery_method === 'overnight_fedex' ? 'FedEx Delivery' : order.delivery_method === 'driver' ? 'Driver' : (order.delivery_method || 'Email')}`,
    '',
    'Customer:',
    `  ${order.first_name} ${order.last_name}`,
    `  ${order.email}`,
    `  ${order.phone}`,
    `  ${order.address || '—'}`,
    '',
    'Vehicle:',
    `  VIN: ${order.vin || '—'}`,
    `  ${order.car_make_model || '—'} (${order.color || '—'})`,
  ]

  const text = lines.join('\n')
  const results = []

  for (const chatId of ids) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: null }),
      })
      const data = await res.json()
      results.push({ chatId, ok: data.ok, error: data.description })
    } catch (err) {
      results.push({ chatId, ok: false, error: String(err) })
    }
  }

  const sent = results.some((r) => r.ok)
  return { sent, results }
}
