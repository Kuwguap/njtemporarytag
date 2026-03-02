# Deployment Guide — NJ Temporary Tag

## Architecture

- **Render:** Full-stack (Node API + static frontend) — single service
- **Vercel (optional):** Frontend only — API stays on Render
- **Supabase:** PostgreSQL database

---

## 1. Supabase

1. Create project at [supabase.com](https://supabase.com)
2. **Settings → API** — copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. **SQL Editor** — run `supabase/setup.sql`

---

## 2. Render (recommended — all-in-one)

1. Connect GitHub repo at [render.com](https://render.com)
2. **New → Web Service**
3. Build: `npm install && npm run build`
4. Start: `node server/index.js`
5. Add environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `JWT_SECRET` | Yes | Random string for JWT |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `APP_URL` | Yes | Your Render URL (e.g. `https://nj-temporary-tag.onrender.com`) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `TELEGRAM_BOT_TOKEN` | No | From @BotFather |
| `TELEGRAM_CHAT_IDS` | No | Comma-separated chat IDs |

6. Deploy. Your site runs at the Render URL.

---

## 3. Vercel (frontend only)

Use when you want Vercel's CDN for the frontend and Render for the API.

1. Deploy backend on Render first; note the URL
2. Create Vercel project; connect the same repo
3. **Settings → Environment Variables:**
   - `VITE_API_URL` = your Render URL (e.g. `https://nj-temporary-tag.onrender.com`) — no trailing slash
4. **Build:** `npm run build` — **Output:** `dist`
5. Override **Root Directory** if needed
6. Redeploy so `VITE_API_URL` is applied to the build

The frontend will call the Render API for all `/api/*` requests.

---

## 4. Stripe

1. Create products/prices or use Checkout with `price_data` (already configured)
2. Get **Secret key** from Stripe Dashboard → Developers → API keys
3. Add to Render: `STRIPE_SECRET_KEY=sk_live_...`
4. In Stripe Dashboard → Webhooks (optional): add endpoint for payment events

---

## 5. Telegram

1. Create bot via [@BotFather](https://t.me/botfather); copy `TELEGRAM_BOT_TOKEN`
2. Get your chat ID (e.g. use [@userinfobot](https://t.me/userinfobot) or add the bot to a group and get group ID)
3. Add to Render:
   - `TELEGRAM_BOT_TOKEN=...`
   - `TELEGRAM_CHAT_IDS=123456789,987654321` (comma-separated)

---

## 6. Mailer (Resend) — You Don't Buy Email Addresses

**You do NOT buy an email address.** Resend sends from your own domain after you verify it. Free tier: 100 emails/day.

1. Sign up at [resend.com](https://resend.com), create an API key.
2. In Resend Dashboard → Domains → Add Domain → add your domain.
3. Add the DNS records (SPF, DKIM) where your domain DNS is managed (Vercel, Cloudflare, etc.).
4. Click "Verify" in Resend. Wait 5–15 minutes.
5. Set in Render: `FROM_EMAIL`, `RESEND_API_KEY`

**If domain isn't verified yet:** Temporarily use `FROM_EMAIL="NJ Temporary Tag <onboarding@resend.dev>"` to test. Email delivery uses the customer's email as the recipient.

---

## Local development

```bash
cp .env.example .env
# Fill ADMIN_PASSWORD, STRIPE_SECRET_KEY, APP_URL (http://localhost:8080)

npm install
npm run dev:all
```

- Site: http://localhost:8080
- API proxy: Vite proxies `/api` to `http://localhost:3001`
