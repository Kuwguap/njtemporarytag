import { useEffect, useState } from 'react'
import { AdminLogin } from './AdminLogin'
import { getAuthToken, clearAuthToken } from '@/lib/store'
import { fetchAdmin, postAdmin, deleteAdmin } from '@/lib/api'

type Tab = 'analytics' | 'orders' | 'services'

export function Admin() {
  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('analytics')
  const [stats, setStats] = useState<Record<string, unknown>>({})
  const [orders, setOrders] = useState<unknown[]>([])
  const [services, setServices] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [newService, setNewService] = useState({ title: '', description: '', price: 15000, image: '' })

  useEffect(() => {
    setToken(getAuthToken())
  }, [])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      fetchAdmin('/api/admin/stats', token),
      fetchAdmin('/api/admin/orders', token),
      fetchAdmin('/api/admin/services', token),
    ])
      .then(([s, o, svc]) => {
        setStats(s as Record<string, unknown>)
        setOrders((o as { orders?: unknown[] })?.orders ?? [])
        setServices((svc as { services?: unknown[] })?.services ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, tab])

  function handleLogout() {
    clearAuthToken()
    setToken(null)
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    try {
      await postAdmin('/api/admin/services', token, {
        title: newService.title,
        description: newService.description,
        price: newService.price,
        image: newService.image || null,
      })
      setNewService({ title: '', description: '', price: 15000, image: '' })
      const res = await fetchAdmin('/api/admin/services', token)
      setServices((res as { services?: unknown[] })?.services ?? [])
    } catch {}
  }

  async function handleDeleteService(id: string) {
    if (!token || !confirm('Delete this service?')) return
    try {
      await deleteAdmin(`/api/admin/services/${id}`, token)
      const res = await fetchAdmin('/api/admin/services', token)
      setServices((res as { services?: unknown[] })?.services ?? [])
    } catch {}
  }

  if (!token) return <AdminLogin onSuccess={() => setToken(getAuthToken())} />

  const tabs: { key: Tab; label: string }[] = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'orders', label: 'Orders' },
    { key: 'services', label: 'Services' },
  ]

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="border-b border-ink-200 bg-white">
        <div className="container-wide flex items-center justify-between px-4 py-4">
          <h1 className="font-display text-xl font-bold text-ink-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="text-sm font-medium text-ink-600 hover:text-amber">
            Log out
          </button>
        </div>
        <div className="flex gap-1 px-4">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium ${
                tab === key ? 'border-b-2 border-amber text-amber' : 'text-ink-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="container-wide section-padding">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
          </div>
        )}
        {!loading && tab === 'analytics' && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <p className="text-sm text-ink-500">Orders</p>
              <p className="font-display text-2xl font-bold text-ink-900">{String(stats.ordersCount ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <p className="text-sm text-ink-500">Total Revenue</p>
              <p className="font-display text-2xl font-bold text-amber">${Number(stats.totalPayments ?? 0) / 100}</p>
            </div>
            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <p className="text-sm text-ink-500">Telegram</p>
              <p className="font-display text-xl font-bold text-ink-900">{String(stats.telegramStatus ?? 'N/A')}</p>
            </div>
          </div>
        )}
        {!loading && tab === 'orders' && (
          <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50">
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Vehicle</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Delivery</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Insurance</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">Details</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-900">TG</th>
                </tr>
              </thead>
              <tbody>
                {(orders as Record<string, unknown>[]).map((o) => {
                  const customer = [o.first_name, o.last_name].filter(Boolean).join(' ') || '—'
                  const total = (Number(o.price ?? 0) + Number(o.insurance_fee ?? 0)) / 100
                  const ins = o.insurance_type === 'monthly' ? '$100/mo' : o.insurance_type === 'yearly' ? '$900/yr' : o.insurance_company ? 'Own' : '—'
                  const deliveryMethodDisplay = o.delivery_method === 'overnight_fedex' ? 'FedEx Delivery' : o.delivery_method === 'driver' ? 'Driver' : o.delivery_method === 'email' ? 'Email' : String(o.delivery_method || '—')
                  const delivery: string = o.details_complete ? (o.delivery_date ? `${deliveryMethodDisplay}, ${String(o.delivery_date)}` : deliveryMethodDisplay) : 'Pending'
                  return (
                    <tr key={String(o.id)} className="border-b border-ink-100">
                      <td className="px-4 py-3 font-mono text-xs">{String(o.stripe_session_id || o.id).slice(0, 12)}...</td>
                      <td className="px-4 py-3">{customer}</td>
                      <td className="px-4 py-3">{String(o.email || '—')}</td>
                      <td className="px-4 py-3">{String(o.car_make_model || o.vin || '—')}</td>
                      <td className="px-4 py-3">{delivery}</td>
                      <td className="px-4 py-3">{ins}</td>
                      <td className="px-4 py-3">${total}</td>
                      <td className="px-4 py-3">{new Date(String(o.created_at)).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{o.details_complete ? '✓' : '⋯'}</td>
                      <td className="px-4 py-3">{o.telegram_sent ? '✓' : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="px-4 py-8 text-center text-ink-500">No orders yet.</p>
            )}
          </div>
        )}
        {!loading && tab === 'services' && (
          <div className="space-y-6">
            <form onSubmit={handleAddService} className="rounded-2xl border border-ink-200 bg-white p-6">
              <h3 className="font-display font-semibold text-ink-900">Add Service</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="Title"
                  value={newService.title}
                  onChange={(e) => setNewService((s) => ({ ...s, title: e.target.value }))}
                  className="rounded-xl border border-ink-300 px-4 py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (cents)"
                  value={newService.price}
                  onChange={(e) => setNewService((s) => ({ ...s, price: Number(e.target.value) }))}
                  className="rounded-xl border border-ink-300 px-4 py-2"
                />
              </div>
              <textarea
                placeholder="Description"
                value={newService.description}
                onChange={(e) => setNewService((s) => ({ ...s, description: e.target.value }))}
                className="mt-4 w-full rounded-xl border border-ink-300 px-4 py-2"
                rows={2}
              />
              <input
                placeholder="Image URL (optional)"
                value={newService.image}
                onChange={(e) => setNewService((s) => ({ ...s, image: e.target.value }))}
                className="mt-4 w-full rounded-xl border border-ink-300 px-4 py-2"
              />
              <button type="submit" className="btn-primary mt-4">Add Service</button>
            </form>
            <div className="space-y-2">
              {(services as Record<string, unknown>[]).map((s) => (
                <div
                  key={String(s.id)}
                  className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3"
                >
                  <span className="font-medium">{String(s.title)}</span>
                  <span className="text-ink-600">${Number(s.price ?? 0) / 100}</span>
                  <button
                    onClick={() => handleDeleteService(String(s.id))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
