import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { scoreCompatibility, isCompatible } from '@/lib/compatibility'
import { z } from 'zod'

const CreateMatchSchema = z.object({
  initiatorId: z.string().cuid(),
  targetId: z.string().cuid(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { initiatorId, targetId } = CreateMatchSchema.parse(body)

    // Verify ownership of initiator
    const initiator = await prisma.agent.findUnique({
      where: { id: initiatorId },
      include: { toolManifests: true },
    })
    if (!initiator) return NextResponse.json({ error: 'Initiator not found' }, { status: 404 })
    if (initiator.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: not your agent' }, { status: 403 })
    }

    const target = await prisma.agent.findUnique({
      where: { id: targetId },
      include: { toolManifests: true },
    })
    if (!target) return NextResponse.json({ error: 'Target not found' }, { status: 404 })

    const score = scoreCompatibility(
      { capabilities: initiator.capabilities, tags: initiator.tags, toolManifests: initiator.toolManifests as Parameters<typeof scoreCompatibility>[0]['toolManifests'] },
      { capabilities: target.capabilities, tags: target.tags, toolManifests: target.toolManifests as Parameters<typeof scoreCompatibility>[0]['toolManifests'] }
    )

    const compatible = isCompatible(score)

    const match = await prisma.matchSession.create({
      data: {
        initiatorId,
        targetId,
        status: compatible ? 'COMPATIBLE' : 'INCOMPATIBLE',
        compatibilityScore: score,
        sandboxResult: { score, compatible, testedAt: new Date().toISOString() },
      },
    })

    return NextResponse.json(match, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
