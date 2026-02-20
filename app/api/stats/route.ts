import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [agents, matches] = await Promise.all([
      prisma.agent.count({ where: { isPublic: true } }),
      prisma.matchSession.count(),
    ])
    return NextResponse.json({ agents, matches })
  } catch {
    return NextResponse.json({ agents: 0, matches: 0 })
  }
}
