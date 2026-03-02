# NJ Temporary Tag — Same-Day Temp Tags

Full-stack e-commerce for temporary vehicle tags. Admin panel, Stripe, Telegram, Supabase (or JSON fallback).

## Quick Start

```bash
cp .env.example .env
# Edit .env: ADMIN_PASSWORD, STRIPE_SECRET_KEY, APP_URL (http://localhost:8080)

npm install
npm run dev:all
```

- **Site:** http://localhost:8080  
- **Admin:** http://localhost:8080/admin (password: `admin123` by default)

## Design

See **[DESIGN.md](./DESIGN.md)** for typography, colors, spacing, and component tokens.

## Flow

1. **Payment first** — User selects package + insurance (none / $100mo / $900yr), pays with Stripe
2. **Complete order** — After payment, user enters delivery date/time, method (email/driver/mail), contact info, vehicle details, insurance (if own)
3. **Telegram** — Order details sent to configured chat IDs

## Features

- **Landing:** Hero, trust bar, benefits, delivery options, stats, how it works, testimonials, pricing, services grid, FAQ, CTAs
- **Checkout:** Payment first (with insurance options) → Stripe → order complete form → Telegram
- **Privacy:** Messaging that info stays private, never shared or sold
- **Admin:** Password auth, analytics, orders (with delivery/insurance), services CRUD
- **DB:** Supabase or JSON file fallback (`data.json`)

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for full Supabase, Render, and Vercel instructions.
