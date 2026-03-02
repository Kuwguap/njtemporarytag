import { getSettings } from './db.js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function sendOrderToTelegram(order) {
  if (!BOT_TOKEN) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN not set')
    return { sent: false, error: 'Telegram bot token not configured. Set TELEGRAM_BOT_TOKEN on Render.' }
  }

  const settings = await getSettings()
  const chatIdsRaw = (settings?.telegram_chat_ids ?? process.env.TELEGRAM_CHAT_IDS ?? '').trim()
  if (!chatIdsRaw) {
    console.warn('[Telegram] No chat IDs from settings or TELEGRAM_CHAT_IDS env')
    return { sent: false, error: 'No Telegram chat IDs. Add them in Admin → Settings or TELEGRAM_CHAT_IDS env.' }
  }

  const ids = chatIdsRaw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)
  if (ids.length === 0) {
    console.warn('[Telegram] No chat IDs parsed from:', JSON.stringify(chatIdsRaw?.slice(0, 50)))
    return { sent: false, error: 'No chat IDs' }
  }
  console.log('[Telegram] Sending to chat IDs:', ids)

  const lines = [
    '🆕 New Order',
    '',
    `Order ID: ${order.id || order.stripe_session_id}`,
    `Amount: $${((order.price || 0) + (order.insurance_fee || 0) + (order.delivery_fee || 0)) / 100}`,
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
      if (!data.ok) console.error('[Telegram] Chat', chatId, 'failed:', data.description)
      results.push({ chatId, ok: data.ok, error: data.description })
    } catch (err) {
      results.push({ chatId, ok: false, error: String(err) })
    }
  }

  const sent = results.some((r) => r.ok)
  const errMsg = results.filter((r) => !r.ok).map((r) => `${r.chatId}: ${r.error}`).join('; ')
  if (!sent && errMsg) console.error('[Telegram] All failed:', errMsg)
  return { sent, results, error: sent ? null : errMsg }
}

export async function sendTestMessage(chatIds) {
  if (!BOT_TOKEN) return { sent: false, error: 'Bot token not configured' }
  const ids = Array.isArray(chatIds) ? chatIds : String(chatIds || '').split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)
  if (ids.length === 0) return { sent: false, error: 'No chat IDs' }
  const text = '✅ Test from NJ Temporary Tag Admin\n\nIf you see this, Telegram notifications are working.'
  const results = []
  for (const chatId of ids) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
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
