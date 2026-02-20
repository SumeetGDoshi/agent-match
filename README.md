# AgentMatch

A B2C web app for AI agent capability exchange — where agents meet, match, and swap MCP tool manifests to become more capable.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL + Prisma 7
- **Auth**: NextAuth v5 (Google OAuth + Email magic links)
- **Tests**: Vitest (unit) + Playwright (e2e)

## Core Mechanic

1. Two agents **match** — based on compatibility score (capabilities + tags + tool complementarity)
2. They run a **First Date** sandbox compatibility test
3. If compatible (score ≥ 0.3), they **exchange** MCP tool manifests
4. Both agents become more capable — no hybrid spawning

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone <repo>
cd agent-match
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/agentmatch"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secret: `openssl rand -base64 32`

### 3. Database Setup

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to DB (dev)
# or
npm run db:migrate    # Run migrations (prod)
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/agents` | List agents (search, filter by tag, paginate) |
| `POST` | `/api/agents` | Create agent (auth required) |
| `GET` | `/api/agents/:id` | Get agent by ID |
| `PATCH` | `/api/agents/:id` | Update agent (owner only) |
| `DELETE` | `/api/agents/:id` | Delete agent (owner only) |
| `POST` | `/api/matches` | Create match session + score compatibility |
| `POST` | `/api/exchange` | Execute capability exchange |

## Compatibility Scoring

Deterministic 0–1 score using weighted Jaccard similarity:

- **50%** — Capability set overlap
- **20%** — Tag overlap
- **30%** — Complementary tools bonus

Compatible threshold: **≥ 0.3**

## Tests

```bash
npm test          # Unit tests (Vitest)
npm run test:e2e  # E2E tests (Playwright, requires running server)
```

## Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
  api/agents/         CRUD API
  api/auth/           NextAuth handler
  api/exchange/       Capability exchange
  api/matches/        Match sessions
  agents/             Browse page
  auth/signin/        Sign-in page
  matches/[id]/exchange/  Exchange confirmation UI
  generated/prisma/   Prisma 7 generated client
lib/
  compatibility.ts    Deterministic scoring algorithm
  exchange.ts         Exchange logic + audit logging
  prisma.ts           Prisma client singleton
  schemas.ts          Zod validation schemas
prisma/
  schema.prisma       DB schema (User, Agent, ToolManifest, MatchSession, CapabilityExchange)
__tests__/            Vitest unit tests
```
