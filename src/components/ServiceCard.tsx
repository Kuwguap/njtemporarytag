import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Service } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-ink-200 bg-ink-50/80 transition-all duration-300 hover:border-amber/40 hover:shadow-lg hover:shadow-amber/5">
      {service.image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-200">
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm text-ink-600 line-clamp-3">{service.description}</p>
        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-2xl font-bold text-amber">{formatPrice(service.price)}</span>
          <Link
            to={`/checkout/${service.id}`}
            className="btn-primary inline-flex w-full sm:w-auto"
          >
            BUY IT NOW
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
