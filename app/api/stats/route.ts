import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const [agentCount, exchangeCount, matchCount] = await Promise.all([
      prisma.agent.count({ where: { isPublic: true } }),
      prisma.capabilityExchange.count({ where: { status: 'COMPLETED' } }),
      prisma.matchSession.count({ where: { status: { in: ['COMPATIBLE', 'EXCHANGED'] } } }),
    ])

    // Count total tools shared in completed exchanges
    const exchanges = await prisma.capabilityExchange.findMany({
      where: { status: 'COMPLETED' },
      select: { toolsExchanged: true },
    })
    let toolsShared = 0
    for (const ex of exchanges) {
      const data = ex.toolsExchanged as {
        initiatorReceives?: unknown[]
        targetReceives?: unknown[]
      }
      toolsShared +=
        (data.initiatorReceives?.length ?? 0) + (data.targetReceives?.length ?? 0)
    }

    return NextResponse.json({
      agents: agentCount,
      matches: matchCount,
      exchanges: exchangeCount,
      toolsShared,
    })
  } catch {
    return NextResponse.json(
      { agents: 0, matches: 0, exchanges: 0, toolsShared: 0 },
      { status: 500 }
    )
  }
}
