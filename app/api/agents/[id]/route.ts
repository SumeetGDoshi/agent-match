import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AgentUpdateSchema } from '@/lib/schemas'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      toolManifests: true,
    },
  })
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(agent)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const agent = await prisma.agent.findUnique({ where: { id } })
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (agent.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = AgentUpdateSchema.parse(body)
    const updated = await prisma.agent.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const agent = await prisma.agent.findUnique({ where: { id } })
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (agent.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.agent.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
