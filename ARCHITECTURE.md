# AgentMatch Architecture

## Overview

AgentMatch is a fully autonomous capability exchange marketplace for AI agents. After initial setup, no human intervention is required — agents discover, match, and exchange MCP tool manifests automatically on a 4-hour heartbeat cycle.

## System Design

```
┌────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
│                                                            │
│   ┌──────────────┐     ┌──────────────┐                   │
│   │  Next.js App │     │  Vercel Cron │                   │
│   │  (App Router)│     │  (0 */4 * * *)                   │
│   └──────┬───────┘     └──────┬───────┘                   │
│          │                    │                            │
│          ▼                    ▼                            │
│   ┌─────────────────────────────────────┐                 │
│   │         API Routes (Node.js)         │                 │
│   │  /api/agents   /api/matches          │                 │
│   │  /api/exchange /api/cron             │                 │
│   │  /api/admin/verify /api/stats        │                 │
│   └──────────────┬──────────────────────┘                 │
│                  │                                         │
└──────────────────┼─────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
  ┌─────────────┐    ┌───────────────┐
  │  Supabase   │    │    Resend     │
  │ (PostgreSQL)│    │  (Email API)  │
  └─────────────┘    └───────────────┘
```

## Data Flow: Autonomous Exchange Cycle

```
Vercel Cron (every 4h)
    │
    ▼
GET /api/cron
    │
    ├─ 1. Fetch all public agents + toolManifests
    │
    ├─ 2. Score all canonical pairs (O(n²))
    │       scoreCompatibility(agentA, agentB)
    │       → Jaccard(capabilities) * 0.5
    │       + Jaccard(tags) * 0.2
    │       + complementaryTools * 0.3
    │
    ├─ 3. For pairs with score ≥ 0.3:
    │       Create MatchSession (status=COMPATIBLE)
    │       (skip if COMPATIBLE or EXCHANGED already exists)
    │
    └─ 4. For all COMPATIBLE MatchSessions:
            executeCapabilityExchange(matchSessionId)
            │
            ├─ Identify non-overlapping tools each agent has
            ├─ prisma.$transaction:
            │   ├─ Create CapabilityExchange record
            │   ├─ toolManifest.createMany (tools → each agent)
            │   └─ Update MatchSession → EXCHANGED
            └─ Send Resend emails to both owners
```

## Database Schema

```
User ──< Agent ──< ToolManifest
              │
              ├──< MatchSession (initiator + target)
              │         │
              └──< CapabilityExchange
                        │ (giver + receiver)
                        └── toolsExchanged: JSON
                            auditLog: JSON
```

### Key Models

| Model | Purpose |
|---|---|
| `Agent` | Registered AI agent with capabilities, tags, toolManifests |
| `ToolManifest` | Individual MCP tool schema attached to an agent |
| `MatchSession` | Compatibility check between two agents |
| `CapabilityExchange` | Completed tool transfer with immutable audit log |

### Agent Verification

Agents can be marked `verified: true` by admins. Verified status influences:
- Visual badge on UI
- Future: trust weighting in compatibility score
- Future: priority matching

## Compatibility Algorithm

```typescript
scoreCompatibility(agentA, agentB) → [0, 1]

capabilityScore = Jaccard(A.capabilities, B.capabilities)
tagScore        = Jaccard(A.tags, B.tags) * 0.5  // half weight
toolComplementarity = (totalTools - overlap*2) / totalTools

weighted = capabilityScore * 0.5
         + tagScore        * 0.2
         + toolComplementarity * 0.3

// Deterministic, symmetric, rounds to 4 decimal places
```

**Compatible threshold: ≥ 0.3**

## Authentication

NextAuth v5 with database sessions:
- **Google OAuth** — one-click sign in
- **Resend magic link** — email-only sign in
- Sessions stored in PostgreSQL via `@auth/prisma-adapter`

## Cron Security

The `/api/cron` endpoint validates `Authorization: Bearer <CRON_SECRET>`.
Vercel automatically injects this header when triggering configured cron jobs.

## Admin Operations

Protected by `x-admin-secret` header matching `ADMIN_SECRET` env var.

- `POST /api/admin/verify` — verify agent
- `DELETE /api/admin/verify` — revoke verification
- `GET /api/admin/verify` — list verified agents
- `tsx scripts/verify-agent.ts <id>` — CLI alternative

## Scale Considerations

The current O(n²) pair-scoring in the cron job works efficiently up to ~500 agents (125k pairs, ~2s). For larger networks:
- Batch agents by tag/capability buckets to reduce candidate pairs
- Cache compatibility scores, invalidate on agent updates
- Distribute cron across multiple Vercel functions
