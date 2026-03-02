const API_URL = import.meta.env.VITE_API_URL || ''

export interface Service {
  id: string
  title: string
  description: string
  price: number
  image: string | null
  created_at?: string
}

export interface CheckoutSession {
  url: string
}

export interface OrderRecord {
  id?: string
  deliveryMethod?: string
  deliveryEmail?: string
  [key: string]: unknown
}

export async function fetchSettings(): Promise<{
  insurance_monthly_price: number
  insurance_yearly_price: number
  fedex_fee: number
  test_mode: boolean
}> {
  const res = await fetch(`${API_URL}/api/settings`)
  if (!res.ok) return {
    insurance_monthly_price: 10000,
    insurance_yearly_price: 90000,
    fedex_fee: 5000,
    test_mode: false,
  }
  return res.json()
}

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/api/services`)
  if (!res.ok) throw new Error('Failed to fetch services')
  return res.json()
}

export async function createCheckoutSession(serviceId: string, data: Record<string, string>): Promise<CheckoutSession> {
  const res = await fetch(`${API_URL}/api/checkout/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId, insuranceChoice: data.insuranceChoice || 'none', ...data }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Checkout failed')
  }
  return res.json()
}

export async function verifyCheckout(sessionId: string): Promise<{ ok: boolean; order?: Record<string, unknown> }> {
  const res = await fetch(`${API_URL}/api/checkout/verify?session_id=${sessionId}`)
  return res.json()
}

export async function getOrderStatus(sessionId: string): Promise<{ paid: boolean; canComplete: boolean; detailsComplete?: boolean; insuranceType?: string }> {
  const res = await fetch(`${API_URL}/api/order/status?session_id=${sessionId}`)
  if (!res.ok) throw new Error('Failed to check order')
  return res.json()
}

export async function completeOrder(sessionId: string, form: Record<string, string>): Promise<{ ok: boolean; telegramSent?: boolean }> {
  const res = await fetch(`${API_URL}/api/order/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, ...form }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to complete order')
  }
  return res.json()
}

export async function loginAdmin(password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error('Invalid password')
  return res.json()
}

export async function fetchAdmin(path: string, token: string): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export async function postAdmin(path: string, token: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string })?.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export async function deleteAdmin(path: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Request failed')
}
