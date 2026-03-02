import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { verifyCheckout } from '@/lib/api'

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }
    verifyCheckout(sessionId)
      .then((res) => setStatus(res.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="section-padding flex min-h-[50vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber border-t-transparent" />
        <p className="mt-4 text-ink-600">Verifying your payment…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="section-padding flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Verification Failed</h1>
        <p className="mt-2 text-ink-600">We couldn&apos;t verify your payment. Please contact support.</p>
        <Link to="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="section-padding flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber/20">
        <CheckCircle className="h-12 w-12 text-amber" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">Payment Successful!</h1>
      <p className="mt-2 max-w-md text-ink-600">
        You can send your tag info right now. Choose your delivery date, time, and method, then enter your contact details.
      </p>
      <Link
        to={`/order/complete?session_id=${sessionId}`}
        className="btn-primary mt-8"
      >
        Complete Order
      </Link>
    </div>
  )
}
