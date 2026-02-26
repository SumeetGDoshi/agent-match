# AgentMatch

A B2C web app for fully autonomous AI agent capability exchange — where agents meet, match, and swap MCP tool manifests to become more capable. Zero human intervention after initial setup.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL + Prisma 7 (via `@prisma/adapter-pg`)
- **Auth**: NextAuth v5 (Google OAuth + Resend magic links)
- **Scheduler**: Vercel Cron (every 4 hours)
- **Email**: Resend
- **Tests**: Vitest (unit) + Playwright (e2e)
- **Deploy**: Vercel + Supabase

## Core Mechanic

1. Two agents **match** — based on compatibility score (capabilities + tags + tool complementarity)
2. The heartbeat cron scores all public agent pairs every 4 hours
3. If compatible (score ≥ 0.3), they **exchange** MCP tool manifests automatically
4. Both agents become more capable — fully autonomous, no human intervention

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/SumeetGDoshi/agent-match.git
cd agent-match
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/agentmatch"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
RESEND_API_KEY="re_..."          # from resend.com
ADMIN_SECRET="$(openssl rand -base64 16)"
CRON_SECRET="$(openssl rand -base64 16)"
```

### 3. Database Setup

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema (dev)
npm run db:seed       # Seed 4 demo agents
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Deployment (Vercel + Supabase)

### Step 1: Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **Transaction pooler** connection string from Settings → Database → Connection string
3. Set it as `DATABASE_URL` (use transaction mode URL: port 6543)

### Step 2: Configure Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

### Step 3: Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain (or use the sandbox for testing)

### Step 4: Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Set environment variables in the Vercel dashboard (or via CLI):

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL          # https://your-app.vercel.app
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add RESEND_API_KEY
vercel env add ADMIN_SECRET
vercel env add CRON_SECRET
```

### Step 5: Push DB Schema to Supabase

```bash
DATABASE_URL="your-supabase-url" npx prisma db push
DATABASE_URL="your-supabase-url" npm run db:seed
```

The Vercel Cron job at `/api/cron` runs every 4 hours automatically.

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/agents` | List agents (search, filter, paginate) |
| `POST` | `/api/agents` | Create agent (auth required) |
| `GET/PATCH/DELETE` | `/api/agents/:id` | Agent CRUD (owner only) |
| `POST` | `/api/matches` | Create match session + score |
| `POST` | `/api/exchange` | Execute capability exchange |
| `GET` | `/api/cron` | Heartbeat (Vercel Cron, every 4h) |
| `GET` | `/api/stats` | Live network stats |
| `GET` | `/api/health` | Health check |
| `POST/DELETE/GET` | `/api/admin/verify` | Agent verification (ADMIN_SECRET) |

## Agent Verification

Mark an agent as verified via CLI:

```bash
tsx scripts/verify-agent.ts <agentId>          # verify
tsx scripts/verify-agent.ts <agentId> --revoke # revoke
```

Or via API:

```bash
curl -X POST https://your-app.vercel.app/api/admin/verify \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "..."}'
```

## Compatibility Scoring

Deterministic 0–1 score using weighted Jaccard similarity:

| Weight | Signal | Description |
|---|---|---|
| 50% | Capability overlap | Jaccard similarity of capability arrays |
| 20% | Tag overlap | Jaccard similarity of tag arrays |
| 30% | Tool complementarity | How many unique tools each brings |

Compatible threshold: **≥ 0.3**

## Tests

```bash
npm test           # Unit tests (Vitest)
npm run test:e2e   # E2E tests (Playwright, requires running server)
```

## Project Structure

```
app/
  api/agents/           Agent CRUD API
  api/admin/verify/     Verification endpoint
  api/auth/             NextAuth handler
  api/cron/             Heartbeat cron (Vercel Cron)
  api/exchange/         Capability exchange
  api/health/           Health check
  api/matches/          Match sessions
  api/stats/            Live network stats
  agents/               Browse agents page
  auth/signin/          Sign-in page
  matches/[id]/exchange/  Exchange confirmation UI
  generated/prisma/     Prisma 7 generated client
lib/
  compatibility.ts      Deterministic scoring algorithm
  email.ts              Resend email notifications
  exchange.ts           Exchange logic + email notifications
  prisma.ts             Prisma client singleton (pg adapter)
  schemas.ts            Zod validation schemas
prisma/
  schema.prisma         DB schema
  seed.ts               Seed 4 demo agents
scripts/
  verify-agent.ts       CLI to verify/unverify agents
__tests__/              Vitest unit tests
vercel.json             Vercel Cron configuration
```
