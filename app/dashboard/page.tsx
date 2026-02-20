import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const agents = await prisma.agent.findMany({
    where: { ownerId: session.user.id },
    include: { toolManifests: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(4,4,12,0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.6" />
            <circle cx="14" cy="14" r="3" fill="var(--cyan)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AGENT<span style={{ color: 'var(--cyan)' }}>MATCH</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/agents" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase', textDecoration: 'none' }}>
            Browse
          </Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            {session.user.name ?? session.user.email}
          </span>
          <form action={async () => {
            'use server'
            const { signOut } = await import('@/auth')
            await signOut({ redirectTo: '/' })
          }}>
            <button type="submit" style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em',
              color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
              textTransform: 'uppercase', padding: '8px 0',
            }}>
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <DashboardClient
        initialAgents={agents.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          capabilities: a.capabilities,
          tags: a.tags,
          isPublic: a.isPublic,
          toolManifests: a.toolManifests.map((t) => ({
            id: t.id,
            toolName: t.toolName,
            description: t.description,
            version: t.version,
          })),
        }))}
        userName={session.user.name ?? null}
      />
    </div>
  )
}
