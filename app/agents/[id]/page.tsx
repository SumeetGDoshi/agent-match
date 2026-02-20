import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import MatchInitiator from './MatchInitiator'

export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ exchanged?: string }>
}) {
  const { id } = await params
  const { exchanged } = await searchParams
  const session = await auth()

  const [agent, myAgents] = await Promise.all([
    prisma.agent.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        toolManifests: true,
      },
    }),
    session?.user?.id
      ? prisma.agent.findMany({
          where: { ownerId: session.user.id },
          select: { id: true, name: true },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
  ])

  if (!agent) notFound()
  if (!agent.isPublic && agent.ownerId !== session?.user?.id) notFound()

  const isOwner = session?.user?.id === agent.ownerId

  async function handleDelete() {
    'use server'
    const s = await auth()
    if (!s?.user?.id) return
    const a = await prisma.agent.findUnique({ where: { id } })
    if (!a || a.ownerId !== s.user.id) return
    await prisma.agent.delete({ where: { id } })
    redirect('/dashboard')
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/agents" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase', textDecoration: 'none' }}>
            Browse
          </Link>
          <Link href="/dashboard" className="btn-neon" style={{ padding: '8px 20px', fontSize: '11px' }}>
            Dashboard
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px' }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          <Link href="/agents" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Agents</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{agent.name}</span>
        </div>

        {/* Exchange success banner */}
        {exchanged === 'true' && (
          <div style={{ marginBottom: '32px', padding: '16px 20px', border: '1px solid var(--cyan)', background: 'var(--cyan-dim)', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--cyan)', fontSize: '16px' }}>✓</span>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan)', margin: 0 }}>
              Capability exchange complete. Your agent has been updated with new tools.
            </p>
          </div>
        )}

        {/* Agent header */}
        <div className="gradient-border scanlines" style={{ padding: '40px', borderRadius: '2px', marginBottom: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div className="agent-id" style={{ marginBottom: '8px' }}>
                AGT_{agent.id.slice(0, 8).toUpperCase()}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '8px' }}>
                {agent.name}
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Owner: <span style={{ color: 'var(--text-secondary)' }}>{agent.owner.name ?? 'Anonymous'}</span>
                <span style={{ margin: '0 8px', color: 'var(--border-hover)' }}>·</span>
                {agent.isPublic
                  ? <span style={{ color: 'var(--cyan)' }}>Public</span>
                  : <span style={{ color: 'var(--amber)' }}>Private</span>}
              </p>
              {agent.description && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '600px' }}>
                  {agent.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0, alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'center', padding: '16px 24px', border: '1px solid var(--border-hover)', borderRadius: '2px', background: 'var(--surface-2)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', color: 'var(--cyan)', fontWeight: 500 }}>{agent.toolManifests.length}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>Tools</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 24px', border: '1px solid var(--border-hover)', borderRadius: '2px', background: 'var(--surface-2)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', color: 'var(--rose)', fontWeight: 500 }}>{agent.capabilities.length}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>Caps</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {agent.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '24px' }}>
              {agent.tags.map((tag) => (
                <span key={tag} className="cap-tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Corner accents */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '16px', height: '16px', borderTop: '1px solid var(--cyan)', borderRight: '1px solid var(--cyan)', opacity: 0.4 }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '16px', height: '16px', borderBottom: '1px solid var(--rose)', borderLeft: '1px solid var(--rose)', opacity: 0.4 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Capabilities */}
          {agent.capabilities.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px', padding: '28px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--rose)', textTransform: 'uppercase', marginBottom: '16px' }}>
                — Capabilities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {agent.capabilities.map((cap) => (
                  <div key={cap} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--rose)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Manifests */}
          {agent.toolManifests.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px', padding: '28px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '16px' }}>
                — MCP Tools
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {agent.toolManifests.map((tool) => (
                  <div key={tool.id} style={{ padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tool.description ? '4px' : 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>{tool.toolName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '2px' }}>
                        v{tool.version}
                      </span>
                    </div>
                    {tool.description && (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                        {tool.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions section */}
        <div style={{ marginTop: '32px' }}>
          {isOwner ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px', border: '1px solid var(--border)', borderRadius: '2px', background: 'var(--surface)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1 }}>
                You own this agent
              </span>
              <Link
                href="/dashboard"
                className="btn-neon"
                style={{ padding: '8px 20px', fontSize: '11px' }}
              >
                Edit in Dashboard
              </Link>
              <form action={handleDelete}>
                <button
                  type="submit"
                  className="btn-neon btn-neon-rose"
                  style={{ padding: '8px 20px', fontSize: '11px' }}
                  onClick={(e) => {
                    if (!confirm(`Delete "${agent.name}"? This cannot be undone.`)) {
                      e.preventDefault()
                    }
                  }}
                >
                  Delete Agent
                </button>
              </form>
            </div>
          ) : (
            <MatchInitiator
              targetAgent={{ id: agent.id, name: agent.name }}
              myAgents={myAgents}
              isLoggedIn={!!session}
            />
          )}
        </div>
      </div>
    </div>
  )
}
