import { Link } from 'react-router-dom'

export function Terms() {
  return (
    <div className="section-padding min-h-screen bg-ink-50">
      <div className="container-narrow mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink-900">Terms of Service</h1>
        <p className="mt-2 text-ink-600">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-ink mt-8 space-y-4 text-ink-700">
          <p>Welcome to NJ Temporary Tag. By using our service, you agree to these terms.</p>
          <p>We provide temporary vehicle tags as a licensed dealer. Tags are valid per state regulations. You are responsible for providing accurate vehicle and contact information.</p>
          <p>Refunds are handled per our refund policy. Contact support for disputes.</p>
        </div>
        <Link to="/" className="btn-secondary mt-8 inline-flex">← Back to Home</Link>
      </div>
    </div>
  )
}
