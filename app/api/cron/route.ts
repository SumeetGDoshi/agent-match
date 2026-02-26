import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scoreCompatibility, isCompatible } from '@/lib/compatibility'
import { executeCapabilityExchange } from '@/lib/exchange'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Vercel Cron authenticates with Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = new Date().toISOString()
  logger.info('cron.start', { startedAt })
  const stats = {
    agentsProcessed: 0,
    matchesCreated: 0,
    exchangesTriggered: 0,
    exchangesFailed: 0,
    errors: [] as string[],
  }

  try {
    // Fetch all public agents with their tool manifests
    const agents = await prisma.agent.findMany({
      where: { isPublic: true },
      include: { toolManifests: true },
    })
    stats.agentsProcessed = agents.length

    // Score all canonical pairs and create MatchSessions for compatible agents
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const agentA = agents[i]
        const agentB = agents[j]

        // Skip pairs from the same owner
        if (agentA.ownerId === agentB.ownerId) continue

        const score = scoreCompatibility(
          {
            capabilities: agentA.capabilities,
            tags: agentA.tags,
            toolManifests: agentA.toolManifests as Parameters<typeof scoreCompatibility>[0]['toolManifests'],
          },
          {
            capabilities: agentB.capabilities,
            tags: agentB.tags,
            toolManifests: agentB.toolManifests as Parameters<typeof scoreCompatibility>[0]['toolManifests'],
          }
        )

        if (!isCompatible(score)) continue

        // Check if a COMPATIBLE or EXCHANGED session already exists for this pair
        const existing = await prisma.matchSession.findFirst({
          where: {
            OR: [
              { initiatorId: agentA.id, targetId: agentB.id },
              { initiatorId: agentB.id, targetId: agentA.id },
            ],
            status: { in: ['COMPATIBLE', 'EXCHANGED'] },
          },
        })
        if (existing) continue

        await prisma.matchSession.create({
          data: {
            initiatorId: agentA.id,
            targetId: agentB.id,
            status: 'COMPATIBLE',
            compatibilityScore: score,
            sandboxResult: {
              score,
              compatible: true,
              discoveredAt: new Date().toISOString(),
            },
          },
        })
        stats.matchesCreated++
      }
    }

    // Trigger exchanges for all COMPATIBLE sessions not yet exchanged
    const pendingExchanges = await prisma.matchSession.findMany({
      where: { status: 'COMPATIBLE' },
    })

    for (const match of pendingExchanges) {
      const result = await executeCapabilityExchange(match.id)
      if (result.success) {
        stats.exchangesTriggered++
      } else {
        stats.exchangesFailed++
        stats.errors.push(`Match ${match.id}: ${result.error}`)
      }
    }

    const completedAt = new Date().toISOString()
    logger.info('cron.complete', { startedAt, completedAt, ...stats })
    return NextResponse.json({
      ok: true,
      startedAt,
      completedAt,
      ...stats,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('cron.failed', { error: message, startedAt })
    return NextResponse.json(
      { ok: false, error: message, startedAt },
      { status: 500 }
    )
  }
}
