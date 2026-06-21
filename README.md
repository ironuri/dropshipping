# EcoSolar Cosmetics — Dropshipping Store

Production-ready Next.js 15 e-commerce store for the Spanish cosmetics market. Specializes in pharmacy-grade sun care (ISDIN, Heliocare, La Roche-Posay) and eco/natural skincare (Biosolis, Florame, Dr. Hauschka).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (Email + Google OAuth) |
| Payments | Stripe (EU Checkout, IVA 21%) |
| Search | Algolia (DB fallback included) |
| Email | Resend |
| State | Zustand (cart, wishlist) |
| Images | Next.js Image + Cloudinary |
| Deployment | Vercel |

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm installed globally

### 2. Environment setup
```bash
cp .env.example .env.local
# Fill in required values (see below)
```

### 3. Install & run
```bash
pnpm install
pnpm db:migrate     # Create tables
pnpm db:generate    # Generate Prisma client
pnpm db:seed        # Seed 24 products + 4 bundles
pnpm dev            # http://localhost:3000
```

## Required Environment Variables

### Core
```
DATABASE_URL=postgresql://user:pass@host:5432/cosmetics_store
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
```

### Stripe (payments)
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
Webhook URL: `https://yourstore.es/api/webhooks/stripe`  
Events: `checkout.session.completed`

### Google OAuth
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
Authorized callback: `https://yourstore.es/api/auth/callback/google`

### Suppliers
```
BIGBUY_API_KEY=...
DIETISUR_CSV_URL=https://...   # Provided by DietiSur support
```

### Email (Resend)
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourstore.es
```

### Algolia (optional — DB fallback works without it)
```
NEXT_PUBLIC_ALGOLIA_APP_ID=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...
ALGOLIA_ADMIN_KEY=...
```

### Cron authentication
```
CRON_SECRET=<random secret>
```

## Vercel Deployment

```bash
# 1. Connect repo to Vercel, add all env vars
# 2. Deploy
# 3. Run migrations on production:
DATABASE_URL=<prod-url> pnpm db:migrate
DATABASE_URL=<prod-url> pnpm db:seed
```

Cron jobs are configured in `vercel.json`:
- BigBuy sync: every 6 hours
- DietiSur sync: every hour

## Admin Panel

Navigate to `/admin/dashboard`. Requires `ADMIN` role.

Create first admin:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Manual Supplier Sync

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://yourstore.es/api/sync/bigbuy
curl -H "Authorization: Bearer $CRON_SECRET" https://yourstore.es/api/sync/dietisur
```

## Seeded Products

**24 products** pre-seeded across two suppliers:
- **BigBuy (13 products)**: ISDIN, Heliocare, La Roche-Posay, Biotherm, Garnier, Nivea, Byphasse, Mario Badescu, Payot, Shiseido, Caudalie, USU
- **DietiSur (11 products)**: Biosolis, Alphanova Sun, Dr. Hauschka, Florame, Cattier, Annemarie Börlind, Avril, Corpore Sano

**4 bundles**: Rutina Solar Diaria, Kit Eco Solar, Protección Familiar, Anti-Manchas Pro

## Mock Implementations (need real credentials)

| Feature | File | Needs |
|---------|------|-------|
| BigBuy sync | `lib/bigbuy.ts` | `BIGBUY_API_KEY` |
| DietiSur sync | `lib/dietisur.ts` | `DIETISUR_CSV_URL` |
| Stripe webhooks | `app/api/webhooks/stripe/route.ts` | `STRIPE_WEBHOOK_SECRET` |
| Algolia search | `lib/algolia.ts` | Algolia env vars |
| Email notifications | All order flows | `RESEND_API_KEY` |
| Google sign-in | `auth.ts` | Google OAuth credentials |

See [SUPPLIERS.md](SUPPLIERS.md) for supplier integration details.
