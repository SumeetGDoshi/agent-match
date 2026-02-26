import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const BodySchema = z.object({ agentId: z.string().min(1) })

function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  return req.headers.get('x-admin-secret') === secret
}

/** POST /api/admin/verify — mark an agent as verified */
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { agentId } = BodySchema.parse(body)

    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: { verified: true },
      select: { id: true, name: true, verified: true },
    })

    return NextResponse.json({ ok: true, agent })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Not found or internal error' }, { status: 500 })
  }
}

/** DELETE /api/admin/verify — revoke verification from an agent */
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { agentId } = BodySchema.parse(body)

    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: { verified: false },
      select: { id: true, name: true, verified: true },
    })

    return NextResponse.json({ ok: true, agent })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Not found or internal error' }, { status: 500 })
  }
}

/** GET /api/admin/verify — list all verified agents */
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agents = await prisma.agent.findMany({
    where: { verified: true },
    select: { id: true, name: true, verified: true, createdAt: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ agents })
}
