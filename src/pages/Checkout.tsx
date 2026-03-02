import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { fetchServices, createCheckoutSession } from '@/lib/api'
import type { Service } from '@/lib/api'

type InsuranceChoice = 'none' | 'monthly' | 'yearly'

export function Checkout() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [insuranceChoice, setInsuranceChoice] = useState<InsuranceChoice>('none')

  useEffect(() => {
    fetchServices()
      .then((list) => {
        const s = list.find((x) => x.id === serviceId) ?? list[0] ?? { id: 'default', title: 'Temp Tag', description: 'Standard package', price: 15000, image: null }
        setService(s)
      })
      .catch(() => setService({ id: 'default', title: 'Temp Tag', description: 'Standard package', price: 15000, image: null }))
      .finally(() => setLoading(false))
  }, [serviceId])

  const insuranceMonthlyPrice = 100
  const insuranceYearlyPrice = 900
  const showMonthly = (insuranceMonthlyPrice ?? 0) > 0
  const showYearly = (insuranceYearlyPrice ?? 0) > 0

  useEffect(() => {
    if (loading) return
    if (insuranceChoice === 'monthly' && !showMonthly) setInsuranceChoice('none')
    else if (insuranceChoice === 'yearly' && !showYearly) setInsuranceChoice('none')
  }, [loading, showMonthly, showYearly, insuranceChoice])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!service) return
    setSubmitting(true)
    setError('')
    try {
      const { url } = await createCheckoutSession(service.id, { insuranceChoice })
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setSubmitting(false)
    }
  }

  if (loading || !service) {
    return (
      <div className="section-padding flex min-h-[50vh] items-center justify-center">
        <p className="text-ink-600">Loading…</p>
      </div>
    )
  }

  const basePrice = service.price / 100
  const insuranceFee = insuranceChoice === 'monthly' ? insuranceMonthlyPrice : insuranceChoice === 'yearly' ? insuranceYearlyPrice : 0
  const total = basePrice + insuranceFee

  return (
    <div className="section-padding min-h-screen bg-ink-50">
      <div className="container-narrow mx-auto max-w-xl">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Step 1: Payment</h1>
        <p className="mt-1 text-ink-600">
          Pay first. After payment, you&apos;ll provide tag details and delivery preferences.
        </p>

        <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-6">
          <p className="font-display font-semibold text-ink-900">{service.title}</p>
          <p className="mt-1 text-sm text-ink-600">{service.description}</p>
          <p className="mt-2 font-display text-xl font-bold text-amber">${basePrice}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-display font-semibold text-ink-900">Insurance</h3>
          <p className="mt-1 text-sm text-ink-600">
            {showMonthly || showYearly ? 'Tag only, or add temporary insurance' : 'Temporary tag'}
          </p>
          <div className="mt-3 space-y-2">
            <label className="flex cursor-pointer gap-3 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
              <input type="radio" name="insurance" value="none" checked={insuranceChoice === 'none'} onChange={() => setInsuranceChoice('none')} className="mt-1" />
              <span>I have my own insurance (provide details after payment)</span>
            </label>
            {showMonthly && (
              <label className="flex cursor-pointer gap-3 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input type="radio" name="insurance" value="monthly" checked={insuranceChoice === 'monthly'} onChange={() => setInsuranceChoice('monthly')} className="mt-1" />
                <span>Add insurance — $100/month</span>
              </label>
            )}
            {showYearly && (
              <label className="flex cursor-pointer gap-3 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input type="radio" name="insurance" value="yearly" checked={insuranceChoice === 'yearly'} onChange={() => setInsuranceChoice('yearly')} className="mt-1" />
                <span>Add insurance — $900/year (one-time)</span>
              </label>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-ink-100 px-4 py-3">
          <span className="font-display font-semibold text-ink-900">Total</span>
          <span className="font-display text-2xl font-bold text-amber">${total}</span>
        </div>

        <div className="mt-6 rounded-xl border-2 border-amber/30 bg-amber/5 p-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 shrink-0 text-amber" />
            <div>
              <p className="font-semibold text-ink-900">Your information stays private — not shared or sold.</p>
              <p className="mt-1 text-sm text-ink-700">Right after you pay, you can send your tag info (date, delivery, contact details).</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Redirecting…' : 'Get My Plate'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm font-medium text-ink-700">
          Right after you pay → you can send your tag info right away.
        </p>
      </div>
    </div>
  )
}
