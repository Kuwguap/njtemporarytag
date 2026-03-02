import { Link } from 'react-router-dom'

interface NavLinkProps {
  to: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ to, children, className }: NavLinkProps) {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}
