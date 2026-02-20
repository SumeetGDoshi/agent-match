import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { executeCapabilityExchange } from '@/lib/exchange'
import { z } from 'zod'

const ExchangeSchema = z.object({ matchSessionId: z.string().cuid() })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { matchSessionId } = ExchangeSchema.parse(body)

    const match = await prisma.matchSession.findUnique({
      where: { id: matchSessionId },
      include: { initiator: true, target: true },
    })
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

    // Only initiator's owner can trigger exchange
    if (match.initiator.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await executeCapabilityExchange(matchSessionId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ exchangeId: result.exchangeId, success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
