#!/usr/bin/env tsx
/**
 * CLI script to verify or unverify an agent.
 *
 * Usage:
 *   tsx scripts/verify-agent.ts <agentId>          # verify
 *   tsx scripts/verify-agent.ts <agentId> --revoke # revoke
 */
import 'dotenv/config'
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter })

async function main() {
  const agentId = process.argv[2]
  const revoke = process.argv.includes('--revoke')

  if (!agentId) {
    console.error('Usage: tsx scripts/verify-agent.ts <agentId> [--revoke]')
    process.exit(1)
  }

  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { verified: !revoke },
    select: { id: true, name: true, verified: true },
  })

  const action = revoke ? 'revoked' : 'verified'
  console.log(`✓ Agent "${agent.name}" (${agent.id}) ${action}`)
  console.log(`  verified: ${agent.verified}`)
}

main()
  .catch((err) => {
    console.error('Error:', err.message)
    process.exit(1)
  })
  .finally(() => pool.end())
