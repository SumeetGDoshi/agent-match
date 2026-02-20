import { prisma } from '@/lib/prisma'

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export interface AuditEntry {
  timestamp: string
  event: string
  details: Record<string, unknown>
}

export async function executeCapabilityExchange(matchSessionId: string): Promise<{
  success: boolean
  exchangeId?: string
  error?: string
}> {
  const session = await prisma.matchSession.findUnique({
    where: { id: matchSessionId },
    include: {
      initiator: { include: { toolManifests: true } },
      target: { include: { toolManifests: true } },
    },
  })

  if (!session) return { success: false, error: 'Match session not found' }
  if (session.status !== 'COMPATIBLE') {
    return { success: false, error: 'Agents not yet confirmed compatible' }
  }

  const auditLog: AuditEntry[] = []
  const log = (event: string, details: Record<string, unknown>) => {
    auditLog.push({ timestamp: new Date().toISOString(), event, details })
  }

  log('EXCHANGE_STARTED', { matchSessionId, initiatorId: session.initiatorId, targetId: session.targetId })

  // Determine tools to exchange (non-overlapping tools each agent has)
  type TM = { id: string; toolName: string; description: string | null; inputSchema: unknown; version: string; agentId: string; createdAt: Date }
  const initiatorTools = session.initiator.toolManifests as TM[]
  const targetTools = session.target.toolManifests as TM[]
  const initiatorToolNames = new Set(initiatorTools.map((t) => t.toolName))
  const targetToolNames = new Set(targetTools.map((t) => t.toolName))

  const toolsForTarget = initiatorTools.filter((t) => !targetToolNames.has(t.toolName))
  const toolsForInitiator = targetTools.filter((t) => !initiatorToolNames.has(t.toolName))

  log('TOOLS_IDENTIFIED', {
    toolsForTarget: toolsForTarget.map((t) => t.toolName),
    toolsForInitiator: toolsForInitiator.map((t) => t.toolName),
  })

  const toolsExchanged = {
    initiatorReceives: toolsForInitiator.map((t) => ({ toolName: t.toolName, version: t.version })),
    targetReceives: toolsForTarget.map((t) => ({ toolName: t.toolName, version: t.version })),
  }

  const exchange = await prisma.$transaction(async (tx: PrismaTx) => {
    const ex = await tx.capabilityExchange.create({
      data: {
        matchSessionId,
        giverId: session.initiatorId,
        receiverId: session.targetId,
        toolsExchanged,
        status: 'IN_PROGRESS',
        auditLog: auditLog as object[],
      },
    })

    // Copy tool manifests to each agent
    if (toolsForTarget.length > 0) {
      await tx.toolManifest.createMany({
        data: toolsForTarget.map((t) => ({
          agentId: session.targetId,
          toolName: t.toolName,
          description: t.description,
          inputSchema: t.inputSchema as object,
          version: t.version,
        })),
        skipDuplicates: true,
      })
    }

    if (toolsForInitiator.length > 0) {
      await tx.toolManifest.createMany({
        data: toolsForInitiator.map((t) => ({
          agentId: session.initiatorId,
          toolName: t.toolName,
          description: t.description,
          inputSchema: t.inputSchema as object,
          version: t.version,
        })),
        skipDuplicates: true,
      })
    }

    log('TOOLS_TRANSFERRED', { count: toolsForTarget.length + toolsForInitiator.length })

    await tx.matchSession.update({
      where: { id: matchSessionId },
      data: { status: 'EXCHANGED' },
    })

    log('EXCHANGE_COMPLETED', { exchangeId: ex.id })

    return await tx.capabilityExchange.update({
      where: { id: ex.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        auditLog: auditLog as object[],
      },
    })
  })

  return { success: true, exchangeId: exchange.id }
}
