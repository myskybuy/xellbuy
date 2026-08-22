# Xellbuy Next.js

Next.js rebuild of Xellbuy — same UI, PostgreSQL, search, Razorpay + COD.

## Folder

This app lives in **`C:\Users\dell\Desktop\xellbuy-next`** (separate from the old Express project).

## Setup (local)

```bash
cd C:\Users\dell\Desktop\xellbuy-next
copy .env.example .env
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin (default `admin` / `xellbuy@123` unless env changed)

## VPS deploy (Ubuntu)

1. Install Node 18+, PostgreSQL, Nginx, pm2
2. Clone/copy this folder to server
3. Set `.env` (see `.env.example`)
4. `npm install && npm run db:push && npm run db:seed && npm run build`
5. `pm2 start npm --name xellbuy -- start`
6. Nginx reverse proxy → port 3000 + SSL

## Env vars

- `DATABASE_URL` — PostgreSQL connection
- `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `EMAIL_*` — order emails (optional)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` — online pay (optional)

## Features

- Same CSS/UI as original store
- Product search (`/shop?q=...`)
- COD + Razorpay checkout
- Customer accounts + admin panel
- PostgreSQL instead of JSON files
