import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Car, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/#benefits', label: 'Benefits' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#faq', label: 'FAQ' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isLanding = loc.pathname === '/'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isLanding ? 'bg-ink-50/90 backdrop-blur-sm' : 'bg-ink-950/95 backdrop-blur-md'
      )}
    >
      <div className="container-wide flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2 group',
            isLanding ? 'text-ink-950' : 'text-ink-50 hover:text-amber'
          )}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber">
            <Car className="h-5 w-5 text-ink-950" strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            NJ Temporary Tag
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isLanding ? 'text-ink-800 hover:text-amber' : 'text-ink-200 hover:text-amber'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/checkout" className="btn-primary hidden sm:inline-flex">
            BUY IT NOW
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl md:hidden',
              isLanding ? 'text-ink-800' : 'text-ink-200'
            )}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-200 bg-ink-50/98 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-200/50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/checkout"
              className="btn-primary mt-2 w-full justify-center"
              onClick={() => setOpen(false)}
            >
              BUY IT NOW
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
