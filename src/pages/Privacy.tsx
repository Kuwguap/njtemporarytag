import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <div className="section-padding min-h-screen bg-ink-50">
      <div className="container-narrow mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink-900">Privacy Policy</h1>
        <p className="mt-2 text-ink-600">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-4 text-ink-700">
          <p>We collect information you provide during checkout (name, phone, address, vehicle details). This is used to fulfill your order and comply with regulations.</p>
          <p>Payment processing is handled by Stripe. We do not store card numbers. We may use your contact info to send order confirmations and support communications.</p>
        </div>
        <Link to="/" className="btn-secondary mt-8 inline-flex">← Back to Home</Link>
      </div>
    </div>
  )
}
