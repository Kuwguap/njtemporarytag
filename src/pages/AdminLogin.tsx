import { useState } from 'react'
import { Car } from 'lucide-react'
import { loginAdmin } from '@/lib/api'
import { setAuthToken } from '@/lib/store'

interface AdminLoginProps {
  onSuccess: () => void
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await loginAdmin(password)
      setAuthToken(token)
      onSuccess()
    } catch {
      setError('Invalid password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-ink-200 bg-white p-8 shadow-lg">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/20">
            <Car className="h-7 w-7 text-amber" />
          </div>
        </div>
        <h2 className="mt-6 text-center font-display text-xl font-bold text-ink-900">Admin Login</h2>
        <form onSubmit={handleSubmit} className="mt-6">
          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}
          <label htmlFor="password" className="block text-sm font-medium text-ink-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-300 px-4 py-2.5 focus:border-amber focus:ring-2 focus:ring-amber/20"
            placeholder="Enter admin password"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary mt-4 w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
