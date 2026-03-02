import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { fetchSettings, createCheckoutSession } from '@/lib/api'

type InsuranceChoice = 'none' | 'monthly' | 'yearly'

export function CheckoutSelect() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    tag_price: 15000,
    insurance_monthly_price: 10000,
    insurance_yearly_price: 90000,
    fedex_fee: 5000,
    test_mode: false,
  })
  const [insuranceChoice, setInsuranceChoice] = useState<InsuranceChoice>('none')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stored = typeof window !== 'undefined' ? sessionStorage.getItem('checkout_delivery') : null
  const deliveryData = stored ? JSON.parse(stored) : null

  useEffect(() => {
    if (!loading && !deliveryData) {
      navigate('/checkout', { replace: true })
    }
  }, [loading, deliveryData, navigate])

  const tagPrice = settings.tag_price / 100
  const insuranceMonthly = settings.insurance_monthly_price / 100
  const insuranceYearly = settings.insurance_yearly_price / 100
  const fedexFee = deliveryData?.deliveryMethod === 'overnight_fedex' ? settings.fedex_fee / 100 : 0
  const showMonthly = (settings.insurance_monthly_price ?? 0) > 0
  const showYearly = (settings.insurance_yearly_price ?? 0) > 0
  const insuranceFee = insuranceChoice === 'monthly' ? insuranceMonthly : insuranceChoice === 'yearly' ? insuranceYearly : 0
  const total = tagPrice + insuranceFee + fedexFee

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (settings.test_mode) {
        window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/checkout/test-session?deliveryMethod=${deliveryData?.deliveryMethod || 'email'}&deliveryEmail=${encodeURIComponent(deliveryData?.email || '')}&insuranceChoice=${insuranceChoice}`
        return
      }
      const { url } = await createCheckoutSession('default', {
        insuranceChoice,
        deliveryMethod: deliveryData?.deliveryMethod || 'email',
        deliveryEmail: deliveryData?.email || '',
      })
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="section-padding flex min-h-[50vh] items-center justify-center">
        <p className="text-ink-600">Loading…</p>
      </div>
    )
  }

  if (!deliveryData) return null

  return (
    <div className="section-padding min-h-screen bg-ink-50">
      <div className="container-narrow mx-auto max-w-xl">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Choose Your Product</h1>
        <p className="mt-1 text-ink-600">Tag only, or add temporary insurance.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
              <input type="radio" name="product" value="tag_only" checked={insuranceChoice === 'none'} onChange={() => setInsuranceChoice('none')} className="mt-1" />
              <span className="font-medium">Temporary Tag Only</span>
              <span className="font-bold text-amber">${tagPrice}</span>
            </label>
            {showMonthly && (
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input type="radio" name="product" value="monthly" checked={insuranceChoice === 'monthly'} onChange={() => setInsuranceChoice('monthly')} className="mt-1" />
                <span className="font-medium">Tag + Insurance (monthly)</span>
                <span className="font-bold text-amber">${(tagPrice + insuranceMonthly).toFixed(0)}</span>
              </label>
            )}
            {showYearly && (
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input type="radio" name="product" value="yearly" checked={insuranceChoice === 'yearly'} onChange={() => setInsuranceChoice('yearly')} className="mt-1" />
                <span className="font-medium">Tag + Insurance (yearly)</span>
                <span className="font-bold text-amber">${(tagPrice + insuranceYearly).toFixed(0)}</span>
              </label>
            )}
          </div>

          {fedexFee > 0 && (
            <div className="rounded-xl bg-ink-100 px-4 py-2 text-sm text-ink-700">
              FedEx Delivery: +${fedexFee}
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-ink-100 px-4 py-3">
            <span className="font-display font-semibold text-ink-900">Total</span>
            <span className="font-display text-2xl font-bold text-amber">${total}</span>
          </div>

          <div className="rounded-xl border-2 border-amber/30 bg-amber/5 p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 shrink-0 text-amber" />
              <p className="text-sm text-ink-700">Your information stays private — not shared or sold.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Redirecting…' : 'Get My Plate'}
          </button>
        </form>
      </div>
    </div>
  )
}
