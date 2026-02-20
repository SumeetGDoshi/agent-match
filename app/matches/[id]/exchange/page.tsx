import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ExchangeConfirmation from './ExchangeConfirmation'

export default async function ExchangePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const { id } = await params

  const match = await prisma.matchSession.findUnique({
    where: { id },
    include: {
      initiator: { include: { toolManifests: true, owner: { select: { id: true, name: true } } } },
      target: { include: { toolManifests: true, owner: { select: { id: true, name: true } } } },
    },
  })

  if (!match) redirect('/agents')
  if (match.initiator.ownerId !== session.user.id) redirect('/agents')

  return <ExchangeConfirmation match={match} userId={session.user.id} />
}
