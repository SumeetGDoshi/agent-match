import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AgentCreateSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const tags = searchParams.getAll('tag')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)

  const where = {
    isPublic: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(tags.length > 0 && { tags: { hasSome: tags } }),
  }

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      include: { owner: { select: { id: true, name: true, image: true } }, toolManifests: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.agent.count({ where }),
  ])

  return NextResponse.json({ agents, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = AgentCreateSchema.parse(body)

    const agent = await prisma.agent.create({
      data: { ...data, ownerId: session.user.id },
      include: { owner: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
