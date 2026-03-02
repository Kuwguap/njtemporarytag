import { getSettings } from './db.js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

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
    '<b>from NJ Temporary Tag</b>',
    '',
    '🆕 New Order',
    '',
    `Order ID: ${escapeHtml(order.id || order.stripe_session_id)}`,
    `Amount: $${((order.price || 0) + (order.insurance_fee || 0) + (order.delivery_fee || 0)) / 100}`,
    `Insurance: ${escapeHtml(order.insurance_type || 'none')}${order.insurance_company ? ` (${escapeHtml(order.insurance_company)} #${escapeHtml(order.insurance_policy)})` : ''}`,
    '',
    'Delivery:',
    `  Date: ${escapeHtml(order.delivery_date || '—')}`,
    `  Time: ${escapeHtml(order.delivery_time || '—')}`,
    `  Method: ${escapeHtml(order.delivery_method === 'overnight_fedex' ? 'FedEx Delivery' : order.delivery_method === 'driver' ? 'Driver' : (order.delivery_method || 'Email'))}`,
    '',
    'Customer:',
    `  ${escapeHtml(order.first_name)} ${escapeHtml(order.last_name)}`,
    `  ${escapeHtml(order.email)}`,
    `  ${escapeHtml(order.phone)}`,
    `  ${escapeHtml(order.address || '—')}`,
    '',
    'Vehicle:',
    `  VIN: ${escapeHtml(order.vin || '—')}`,
    `  ${escapeHtml(order.car_make_model || '—')} (${escapeHtml(order.color || '—')})`,
  ]

  const text = lines.join('\n')
  const results = []

  for (const chatId of ids) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
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
  const text = '<b>from NJ Temporary Tag</b>\n\n✅ Test from Admin\n\nIf you see this, Telegram notifications are working.'
  const results = []
  for (const chatId of ids) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      })
      const data = await res.json()
      results.push({ chatId, ok: data.ok, error: data.description })
    } catch (err) {
      results.push({ chatId, ok: false, error: String(err) })
    }
  }
  const sent = results.some((r) => r.ok)
  const error = sent ? null : (results.find((r) => !r.ok)?.error || 'Send failed')
  return { sent, results, error }
}
