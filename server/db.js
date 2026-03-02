import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const useSupabase = supabaseUrl && supabaseKey

let supabase = null
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

const JSON_PATH = path.join(__dirname, '../data.json')

function loadJson() {
  try {
    const raw = fs.readFileSync(JSON_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { services: [], orders: [], activity: [] }
  }
}

function saveJson(data) {
  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true })
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2))
}

export async function getServices() {
  if (useSupabase) {
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false })
    return data || []
  }
  const { services } = loadJson()
  return services.length ? services : [
    { id: 'default', title: 'Standard Temp Tag', description: 'Same-day temporary vehicle tag. Email or 1-hour delivery.', price: 15000, image: null, created_at: new Date().toISOString() }
  ]
}

export async function getServiceById(id) {
  const services = await getServices()
  return services.find((s) => s.id === id) || services[0]
}

export async function createOrder(order) {
  if (useSupabase) {
    const { data } = await supabase.from('orders').insert(order).select('id').single()
    return data?.id
  }
  const j = loadJson()
  const o = { id: `ord_${Date.now()}`, ...order, details_complete: false, created_at: new Date().toISOString(), telegram_sent: false }
  j.orders.push(o)
  saveJson(j)
  return o.id
}

export async function getOrderBySessionId(sessionId) {
  if (useSupabase) {
    const { data } = await supabase.from('orders').select('*').eq('stripe_session_id', sessionId).single()
    return data
  }
  const { orders } = loadJson()
  return orders.find((o) => o.stripe_session_id === sessionId) || null
}

export async function updateOrderBySessionId(sessionId, updates) {
  if (useSupabase) {
    const { data } = await supabase.from('orders').update(updates).eq('stripe_session_id', sessionId).select('*').single()
    return data
  }
  const j = loadJson()
  const idx = j.orders.findIndex((o) => o.stripe_session_id === sessionId)
  if (idx < 0) return null
  j.orders[idx] = { ...j.orders[idx], ...updates }
  saveJson(j)
  return j.orders[idx]
}

export async function getOrders() {
  if (useSupabase) {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    return data || []
  }
  const { orders } = loadJson()
  return orders
}

export async function getStats() {
  const orders = await getOrders()
  const total = orders.reduce((sum, o) => sum + (o.price || 0) + (o.insurance_fee || 0) + (o.delivery_fee || 0), 0)
  return {
    ordersCount: orders.length,
    totalPayments: total,
    telegramStatus: process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Not configured',
  }
}

export async function addService(service) {
  const id = `svc_${Date.now()}`
  const row = { id, ...service, created_at: new Date().toISOString() }
  if (useSupabase) {
    const { data } = await supabase.from('services').insert(row).select('id').single()
    return data?.id
  }
  const j = loadJson()
  j.services.push(row)
  saveJson(j)
  return id
}

export async function deleteService(id) {
  if (useSupabase) {
    await supabase.from('services').delete().eq('id', id)
    return
  }
  const j = loadJson()
  j.services = j.services.filter((s) => s.id !== id)
  saveJson(j)
}

export async function getServicesForAdmin() {
  return getServices()
}

const DEFAULT_SETTINGS = {
  insurance_monthly_price: 10000,
  insurance_yearly_price: 90000,
  fedex_fee: 5000,
  test_mode: false,
  telegram_chat_ids: '',
}

export async function getSettings() {
  if (useSupabase) {
    const { data } = await supabase.from('settings').select('key, value')
    const out = { ...DEFAULT_SETTINGS }
    for (const row of data || []) {
      let v = row?.value
      if (row.key === 'telegram_chat_ids') out[row.key] = (v != null ? String(v) : '') || ''
      else if (v === 'false' || v === false) out[row.key] = false
      else if (v === 'true' || v === true) out[row.key] = true
      else if (typeof v === 'number') out[row.key] = v
      else out[row.key] = parseInt(v, 10) || v
    }
    return out
  }
  try {
    const j = loadJson()
    return { ...DEFAULT_SETTINGS, ...(j.settings || {}) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function updateSettings(updates) {
  if (useSupabase) {
    for (const [key, value] of Object.entries(updates)) {
      const jsonVal = key === 'telegram_chat_ids'
        ? String(value ?? '')
        : typeof value === 'boolean'
          ? value
          : Number(value)
      const { error } = await supabase.from('settings').upsert(
        { key, value: jsonVal, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      if (error) {
        console.error('[DB] Settings upsert error:', key, error)
        throw new Error(`Failed to save setting ${key}: ${error.message}`)
      }
    }
    return getSettings()
  }
  const j = loadJson()
  j.settings = { ...(j.settings || {}), ...updates }
  saveJson(j)
  return getSettings()
}
