import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { fetchSettings } from '@/lib/api'

type DeliveryMethod = 'email' | 'driver' | 'overnight_fedex'

export function CheckoutDelivery() {
  const navigate = useNavigate()
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('email')
  const [email, setEmail] = useState('')
  const [fedexFee, setFedexFee] = useState(50)

  useEffect(() => {
    fetchSettings().then((s) => setFedexFee((s.fedex_fee ?? 5000) / 100))
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    sessionStorage.setItem('checkout_delivery', JSON.stringify({ deliveryMethod, email }))
    navigate('/checkout/select')
  }

  return (
    <div className="section-padding min-h-screen bg-ink-50">
      <div className="container-narrow mx-auto max-w-lg">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">TriStateTags</h1>
        <h2 className="mt-2 font-display text-xl font-semibold text-amber">Payment First — Tag Guaranteed</h2>
        <p className="mt-4 text-ink-600">
          Your payment guarantees your temporary tag. You&apos;ll provide tag details immediately after payment.
        </p>
        <div className="mt-6 rounded-xl border-2 border-amber/30 bg-amber/5 p-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 shrink-0 text-amber" />
            <p className="text-sm text-ink-700">
              Your payment is 100% private. We never sell or share your data.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-ink-900">How would you like to receive your tag?</h3>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer gap-4 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input
                  type="radio"
                  name="delivery"
                  value="email"
                  checked={deliveryMethod === 'email'}
                  onChange={() => setDeliveryMethod('email')}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-ink-900">Email Delivery</span>
                  <p className="text-sm text-ink-600">Instant delivery to your inbox</p>
                </div>
              </label>
              <label className="flex cursor-pointer gap-4 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input
                  type="radio"
                  name="delivery"
                  value="driver"
                  checked={deliveryMethod === 'driver'}
                  onChange={() => setDeliveryMethod('driver')}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-ink-900">Driver Delivery</span>
                  <p className="text-sm text-ink-600">1hr, 2hr, or schedule (NY time)</p>
                </div>
              </label>
              <label className="flex cursor-pointer gap-4 rounded-xl border border-ink-200 p-4 has-[:checked]:border-amber has-[:checked]:bg-amber/5">
                <input
                  type="radio"
                  name="delivery"
                  value="overnight_fedex"
                  checked={deliveryMethod === 'overnight_fedex'}
                  onChange={() => setDeliveryMethod('overnight_fedex')}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-ink-900">FedEx Delivery</span>
                  <p className="text-sm text-ink-600">+${fedexFee} — Next business day</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="checkout-email" className="block text-sm font-medium text-ink-700">
              Email address
            </label>
            <input
              id="checkout-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-ink-300 px-4 py-3"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Continue to Product Selection
          </button>
        </form>
      </div>
    </div>
  )
}
