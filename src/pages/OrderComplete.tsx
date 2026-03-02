import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Shield, CheckCircle } from 'lucide-react'
import { getOrderStatus, completeOrder } from '@/lib/api'

const DELIVERY_METHODS = [
  { value: 'email', label: 'Email delivery' },
  { value: 'driver', label: 'Driver delivery' },
  { value: 'overnight_fedex', label: 'FedEx Delivery' },
]

export function OrderComplete() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    deliveryDate: '',
    deliveryTime: '',
    deliveryMethod: 'email',
    confirmationEmail: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    vin: '',
    carMakeModel: '',
    color: '',
    insuranceType: 'own' as 'own' | 'monthly' | 'yearly',
    insuranceCompany: '',
    insurancePolicy: '',
  })

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }
    getOrderStatus(sessionId)
      .then((r) => {
        if (r.paid && r.canComplete && !r.detailsComplete) setStatus('form')
        else if (r.detailsComplete) setStatus('success')
        else setStatus('error')
      })
      .catch(() => setStatus('error'))
  }, [sessionId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionId) return
    setSubmitting(true)
    setError('')
    try {
      await completeOrder(sessionId, {
        deliveryDate: form.deliveryDate,
        deliveryTime: form.deliveryTime,
        deliveryMethod: form.deliveryMethod,
        deliveryEmail: form.deliveryMethod === 'email'
          ? form.email
          : (form.deliveryMethod === 'driver' || form.deliveryMethod === 'overnight_fedex') && form.confirmationEmail?.includes('@')
            ? form.confirmationEmail
            : form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        vin: form.vin,
        carMakeModel: form.carMakeModel,
        color: form.color,
        insuranceType: form.insuranceType,
        insuranceCompany: form.insuranceCompany,
        insurancePolicy: form.insurancePolicy,
      })
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="section-padding flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber border-t-transparent" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="section-padding flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Unable to Continue</h1>
        <p className="mt-2 text-ink-600">Invalid or expired session. Please contact support.</p>
        <Link to="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="section-padding flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber/20">
          <CheckCircle className="h-12 w-12 text-amber" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">Order Complete!</h1>
        <p className="mt-2 max-w-md text-ink-600">
          Your tag info has been received. You&apos;ll get your temp tag per your delivery choice (email, driver, or FedEx delivery next business day).
        </p>
        <Link to="/" className="btn-primary mt-8">Back to Home</Link>
      </div>
    )
  }


  return (
    <div className="section-padding min-h-screen bg-ink-50">
      <div className="container-narrow mx-auto max-w-xl">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Send Your Tag Info</h1>
        <p className="mt-1 text-ink-600">
          You can send your tag info right after paying. Fill in this form:
        </p>

        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-ink-700">
          <li>Choose date, time, and delivery (email, driver, or FedEx)</li>
          <li>Enter your name, address, email, and phone</li>
          <li>Add vehicle info and insurance (if you have your own)</li>
        </ol>

        <div className="mt-6 rounded-xl border-2 border-amber/30 bg-amber/5 p-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 shrink-0 text-amber" />
            <p className="font-semibold text-ink-900">
              Your information stays private — not shared or sold.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>
          )}

          <div>
            <h3 className="font-display font-semibold text-ink-900">1. Date, time & delivery method</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700">Date</label>
                <input
                  type="date"
                  required
                  value={form.deliveryDate}
                  onChange={(e) => setForm((f) => ({ ...f, deliveryDate: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Time</label>
                <input
                  type="time"
                  required
                  value={form.deliveryTime}
                  onChange={(e) => setForm((f) => ({ ...f, deliveryTime: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-ink-700">Delivery method</label>
              <select
                value={form.deliveryMethod}
                onChange={(e) => setForm((f) => ({ ...f, deliveryMethod: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5"
              >
                {DELIVERY_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            {(form.deliveryMethod === 'driver' || form.deliveryMethod === 'overnight_fedex') && (
              <div className="mt-3">
                <label htmlFor="confirmation-email" className="block text-sm font-medium text-ink-700">
                  Email for order confirmation (optional)
                </label>
                <input
                  id="confirmation-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.confirmationEmail}
                  onChange={(e) => setForm((f) => ({ ...f, confirmationEmail: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5"
                />
                <p className="mt-1 text-xs text-ink-500">We&apos;ll send order confirmation to this email</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink-900">2. Name, address, email & phone</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700">First name *</label>
                <input type="text" required value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Last name *</label>
                <input type="text" required value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink-700">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Phone *</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink-700">Address *</label>
                <input type="text" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" placeholder="Street, city, state, zip" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink-900">3. Vehicle info</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-ink-700">VIN *</label>
                <input type="text" required value={form.vin} onChange={(e) => setForm((f) => ({ ...f, vin: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Make & model *</label>
                <input type="text" required value={form.carMakeModel} onChange={(e) => setForm((f) => ({ ...f, carMakeModel: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" placeholder="e.g. Toyota Camry" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Color *</label>
                <input type="text" required value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink-900">4. Insurance</h3>
            <p className="mt-1 text-sm text-ink-600">If you paid for insurance at checkout, no further info needed.</p>
            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer gap-3 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input type="radio" name="ins" checked={form.insuranceType === 'own'} onChange={() => setForm((f) => ({ ...f, insuranceType: 'own' }))} className="mt-1" />
                <span>I have my own insurance</span>
              </label>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input type="radio" name="ins" checked={form.insuranceType === 'monthly'} onChange={() => setForm((f) => ({ ...f, insuranceType: 'monthly' }))} className="mt-1" />
                <span>I paid $100/month at checkout</span>
              </label>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input type="radio" name="ins" checked={form.insuranceType === 'yearly'} onChange={() => setForm((f) => ({ ...f, insuranceType: 'yearly' }))} className="mt-1" />
                <span>I paid $900/year at checkout</span>
              </label>
            </div>
            {form.insuranceType === 'own' && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-ink-700">Insurance company *</label>
                  <input type="text" required={form.insuranceType === 'own'} value={form.insuranceCompany} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, insuranceCompany: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700">Policy number *</label>
                  <input type="text" required={form.insuranceType === 'own'} value={form.insurancePolicy} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, insurancePolicy: e.target.value }))} className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5" />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting…' : 'Submit & Complete Order'}
          </button>
        </form>
      </div>
    </div>
  )
}
