import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Car className="h-16 w-16 text-ink-300" />
      <h1 className="mt-4 font-display text-3xl font-bold text-ink-900">404</h1>
      <p className="mt-2 text-ink-600">Page not found.</p>
      <Link to="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  )
}
