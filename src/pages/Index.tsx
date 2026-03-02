import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Shield,
  Clock,
  Mail,
  Truck,
  FileCheck,
  Zap,
  ArrowRight,
  Star,
  ChevronDown,
} from 'lucide-react'
import { ServiceCard } from '@/components/ServiceCard'
import { fetchServices, type Service } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const TRUST_BADGES = [
  { icon: Shield, label: 'Licensed Dealer' },
  { icon: FileCheck, label: 'MVC Verified' },
  { icon: Shield, label: 'DMV Compliant' },
  { icon: Shield, label: 'Your info stays private — not shared or sold' },
]

const BENEFITS = [
  { icon: Zap, title: 'Same-Day', desc: 'Get your temp tag delivered within 1–2 hours or by email instantly.' },
  { icon: Shield, title: '100% Legal', desc: 'Fully compliant with state regulations. No hassle, no risk.' },
  { icon: Clock, title: 'No DMV Wait', desc: 'Skip the lines. We handle the paperwork and verification.' },
  { icon: Mail, title: 'Digital Delivery', desc: 'Receive your printable tag via email in minutes.' },
  { icon: Truck, title: 'Car Delivery', desc: 'Optional 1-hour hand delivery to your location.' },
  { icon: FileCheck, title: 'Full Support', desc: 'Phone support and documentation for peace of mind.' },
]

const DELIVERY = [
  { icon: Mail, title: 'Email Delivery', desc: 'Instant. Print at home. Same-day valid.', highlight: 'Fastest' },
  { icon: Truck, title: 'Driver Delivery', desc: 'We bring it to you. Hand-delivered within 60 minutes.', highlight: 'Convenient' },
  { icon: Truck, title: 'FedEx Delivery', desc: 'FedEx delivery next business day to your address.', highlight: 'Reliable' },
]

const STATS = [
  { value: '10,000+', label: 'Tags Delivered' },
  { value: '1–2 hrs', label: 'Delivery Time' },
  { value: '7 Days', label: 'Tag Validity' },
]

const STEPS = [
  { num: '01', title: 'Pay First', desc: 'Select your package and optional insurance. Pay securely with Stripe.' },
  { num: '02', title: 'Tag Info & Delivery', desc: 'After payment, enter vehicle details, delivery date/time, and contact info.' },
  { num: '03', title: 'Get Your Tag', desc: 'Receive by email, driver, or FedEx delivery. Your info stays private.' },
]

const TESTIMONIALS = [
  { quote: 'Needed a tag same day for a used car I just bought. NJ Temporary Tag had it to me in under an hour. Totally legit.', name: 'Mike R.', stars: 5 },
  { quote: 'Skipped the DMV nightmare. Printed the tag, slapped it on, drove home. Best $150 I spent.', name: 'Sarah K.', stars: 5 },
  { quote: 'Professional, fast, and hassle-free. Will definitely use again if I ever need another temp tag.', name: 'James T.', stars: 5 },
]

const FAQ_ITEMS = [
  { q: 'How fast can I get my temp tag?', a: 'Email delivery: typically within 15–30 minutes. FedEx delivery: next business day. 1-hour car delivery: we bring it to you within 60 minutes of confirmation.' },
  { q: 'Is this legal in my state?', a: 'Yes. We are a licensed dealer and operate in compliance with MVC/DMV regulations. Our tags are valid in NJ, NY, PA, and neighboring states.' },
  { q: 'What do I need to provide?', a: 'After payment: vehicle VIN, make/model, color, your name, email, phone, address, delivery date/time, and delivery method. We handle the rest. Your info stays private and is never shared or sold.' },
  { q: 'Can I print the tag myself?', a: 'Yes. Email delivery includes a printable PDF. Use standard paper; tape it securely to your rear window.' },
  { q: 'What if I have issues?', a: 'Contact us by phone. We provide full support and documentation for every order.' },
]

export function Index() {
  const [services, setServices] = useState<Service[]>([])
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const { hash } = useLocation()

  useEffect(() => {
    fetchServices().then(setServices).catch(() => setServices([]))
  }, [])

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [hash])

  return (
    <div className="min-h-screen">
      {/* Trust bar */}
      <section className="border-b border-ink-200 bg-ink-100/80">
        <div className="container-wide flex flex-wrap items-center justify-center gap-6 px-4 py-3 sm:gap-10">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-amber" strokeWidth={2} />
              <span className="text-sm font-medium text-ink-700">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 bg-hero-pattern">
        <div className="section-padding container-narrow relative text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink-50 sm:text-5xl md:text-6xl lg:text-7xl">
            Same-Day Temp Tags.
            <br />
            <span className="text-amber">No DMV.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300 sm:text-xl">
            Licensed dealer. MVC verified. Email in minutes, FedEx delivery, or 1-hour car delivery.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/checkout" className="btn-primary text-base">
              BUY IT NOW
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/checkout" className="btn-secondary-dark text-base">
              GET MY TEMP TAG
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-ink-400">
            {['Licensed Dealer', 'MVC Verified', 'DMV Compliant', 'Same Day'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="section-padding bg-ink-50 scroll-mt-20">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            Why NJ Temporary Tag?
          </h2>
          <p className="mt-2 max-w-2xl text-ink-600">
            Fast, legal, and hassle-free. Get back on the road today.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="rounded-3xl border border-ink-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-amber/30 hover:shadow-md"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/15">
                  <Icon className="h-6 w-6 text-amber" strokeWidth={2} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm text-ink-600">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/checkout" className="btn-primary">View Packages</Link>
          </div>
        </div>
      </section>

      {/* Delivery options */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-ink-900">Delivery Options</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {DELIVERY.map(({ icon: Icon, title, desc, highlight }) => (
              <div
                key={title}
                className="flex gap-5 rounded-3xl border-2 border-ink-200 p-6 transition-all hover:border-amber/40"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink-100">
                  <Icon className="h-7 w-7 text-amber" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-ink-900">{title}</h3>
                    <span className="rounded-full bg-amber/20 px-2.5 py-0.5 text-xs font-semibold text-amber-dark">
                      {highlight}
                    </span>
                  </div>
                  <p className="mt-2 text-ink-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-ink-950 text-ink-50">
        <div className="container-wide">
          <div className="grid gap-8 sm:grid-cols-3">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-4xl font-extrabold text-amber sm:text-5xl">{value}</div>
                <div className="mt-1 text-sm font-medium text-ink-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding bg-ink-50 scroll-mt-20">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-ink-900">How It Works</h2>
          <p className="mt-2 text-ink-600">Three simple steps. No DMV. No hassle.</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber font-display text-xl font-bold text-ink-950">
                  {num}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-ink-900">{title}</h3>
                <p className="mt-2 text-ink-600">{desc}</p>
                <div className="absolute -right-4 top-7 hidden h-8 w-8 border-t-2 border-ink-300 md:block" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-ink-900">What Customers Say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, stars }) => (
              <blockquote
                key={name}
                className="rounded-3xl border border-ink-200 bg-ink-50/50 p-6"
              >
                <div className="flex gap-1 text-amber">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-4 text-ink-800">&ldquo;{quote}&rdquo;</p>
                <footer className="mt-4 font-semibold text-ink-700">— {name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-ink-50 scroll-mt-20">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900">Simple Pricing</h2>
          <div className="mt-8 inline-block rounded-3xl border-2 border-amber/50 bg-white p-8 shadow-lg">
            <div className="font-display text-4xl font-bold text-amber">{formatPrice(15000)}</div>
            <p className="mt-2 text-ink-600">Standard temp tag package</p>
            <ul className="mt-4 space-y-2 text-left text-ink-700">
              {['Email or 1-hour delivery', 'MVC compliant', '7-day validity', 'Full support'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/checkout" className="btn-primary mt-6 w-full sm:w-auto">
              BUY IT NOW
            </Link>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section id="services" className="section-padding bg-white scroll-mt-20">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-ink-900">Choose Your Package</h2>
          <p className="mt-2 text-ink-600">Select a service below to get started.</p>
          {services.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-ink-200 bg-ink-50 p-12 text-center">
              <p className="text-ink-600">Loading packages…</p>
              <p className="mt-2 text-sm text-ink-500">If none appear, the default $150 package is available.</p>
              <Link to="/checkout" className="btn-primary mt-6">BUY IT NOW — $150</Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding bg-ink-50 scroll-mt-20">
        <div className="container-narrow">
          <h2 className="font-display text-3xl font-bold text-ink-900">FAQ</h2>
          <div className="mt-8 space-y-2">
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <div
                key={q}
                className="overflow-hidden rounded-2xl border border-ink-200 bg-white transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display font-semibold text-ink-900 transition-colors hover:bg-ink-50"
                  aria-expanded={faqOpen === i}
                >
                  {q}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-500 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="border-t border-ink-100 px-5 py-4 text-ink-600">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-ink-950 text-center">
        <h2 className="font-display text-3xl font-bold text-ink-50 sm:text-4xl">
          Ready for Your Temp Tag?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-ink-300">
          Same-day. Licensed. MVC verified. Get back on the road today.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/checkout" className="btn-primary">
            BUY IT NOW
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/#how-it-works" className="btn-secondary-dark text-base">
            How It Works
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-ink-100">
        <div className="container-wide section-padding">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="font-display text-lg font-bold text-ink-900">NJ Temporary Tag</span>
              <p className="mt-2 text-sm text-ink-600">NJ Temporary Tag — Same-day temporary vehicle tags. Licensed dealer.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-ink-900">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                <li><Link to="/#how-it-works" className="hover:text-amber">How It Works</Link></li>
                <li><Link to="/#faq" className="hover:text-amber">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-ink-900">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                <li><Link to="/terms" className="hover:text-amber">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-amber">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-ink-900">Support</h4>
              <p className="mt-3 text-sm text-ink-600">Contact us for order help and questions.</p>
            </div>
          </div>
          <div className="mt-12 border-t border-ink-200 pt-8">
            <p className="text-sm text-ink-500">© {new Date().getFullYear()} NJ Temporary Tag. All rights reserved.</p>
            <p className="mt-1 text-xs text-ink-400">Licensed dealer. MVC/DMV compliant. Temp tags valid per state regulations.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
