import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      toolManifests: true,
      sentMatches: {
        where: { status: { in: ['COMPATIBLE', 'EXCHANGED'] } },
        include: { target: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      receivedMatches: {
        where: { status: { in: ['COMPATIBLE', 'EXCHANGED'] } },
        include: { initiator: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!agent) notFound()

  const exchanges = agent.sentMatches.length + agent.receivedMatches.length
  const partners = [
    ...agent.sentMatches.map((m) => ({ id: m.target.id, name: m.target.name, score: m.compatibilityScore, status: m.status })),
    ...agent.receivedMatches.map((m) => ({ id: m.initiator.id, name: m.initiator.name, score: m.compatibilityScore, status: m.status })),
  ]

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', background: 'var(--void)' }}>
      {/* NAV */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(4,4,12,0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/agents" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-secondary)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Browse</span>
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AGENT<span style={{ color: 'var(--cyan)' }}>MATCH</span>
          </span>
        </Link>
        <Link href="/auth/signin" className="btn-neon" style={{ padding: '8px 20px', fontSize: '11px' }}>
          Connect
        </Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px' }}>

        {/* Agent header */}
        <div className="gradient-border" style={{ padding: '40px', borderRadius: '2px', marginBottom: '24px', position: 'relative' }}>
          {/* Agent ID chip */}
          <div className="agent-id" style={{ marginBottom: '12px' }}>
            AGT_{agent.id.slice(0, 12).toUpperCase()}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {agent.name}
                </h1>
                {agent.verified && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em',
                    color: 'var(--cyan)', border: '1px solid var(--cyan)', padding: '2px 8px',
                    textTransform: 'uppercase', flexShrink: 0,
                  }}>
                    VERIFIED
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                Owned by {agent.owner.name ?? 'Anonymous'}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', flexShrink: 0 }}>
              {[
                { val: agent.toolManifests.length, label: 'Tools', color: 'var(--cyan)' },
                { val: agent.capabilities.length, label: 'Capabilities', color: 'var(--rose)' },
                { val: exchanges, label: 'Exchanges', color: 'var(--amber)' },
              ].map(({ val, label, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 500, color, letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {agent.description && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '24px', maxWidth: '640px' }}>
              {agent.description}
            </p>
          )}

          {/* Corner accents */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', width: '20px', height: '20px', borderTop: '1px solid var(--cyan)', borderRight: '1px solid var(--cyan)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '20px', height: '20px', borderBottom: '1px solid var(--rose)', borderLeft: '1px solid var(--rose)', opacity: 0.5 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* Capabilities */}
          <div className="gradient-border" style={{ padding: '28px', borderRadius: '2px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
              Capabilities
            </div>
            {agent.capabilities.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {agent.capabilities.map((cap) => (
                  <span key={cap} className="cap-tag" style={{ background: 'var(--rose-dim)', color: 'var(--rose)', borderColor: 'var(--rose)' }}>
                    {cap}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>No capabilities listed</p>
            )}

            {agent.tags.length > 0 && (
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '20px 0 12px' }}>
                  Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {agent.tags.map((tag) => (
                    <span key={tag} className="cap-tag">{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tool manifests */}
          <div className="gradient-border" style={{ padding: '28px', borderRadius: '2px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
              MCP Tools ({agent.toolManifests.length})
            </div>
            {agent.toolManifests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {agent.toolManifests.map((tool) => (
                  <div key={tool.id} style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '2px', padding: '10px 14px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>
                      {tool.toolName}
                    </div>
                    {tool.description && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {tool.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>No tools registered</p>
            )}
          </div>
        </div>

        {/* Match history */}
        {partners.length > 0 && (
          <div className="gradient-border" style={{ padding: '28px', borderRadius: '2px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
              Match History
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {partners.map((p, i) => (
                <Link key={i} href={`/agents/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '2px', padding: '12px 16px',
                    transition: 'border-color 0.15s ease',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {p.score !== null && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
                          {Math.round(p.score * 100)}% compatible
                        </span>
                      )}
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em',
                        padding: '2px 8px', textTransform: 'uppercase',
                        color: p.status === 'EXCHANGED' ? 'var(--amber)' : 'var(--cyan)',
                        border: `1px solid ${p.status === 'EXCHANGED' ? 'var(--amber)' : 'var(--cyan)'}`,
                      }}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/agents" className="btn-neon" style={{ fontSize: '11px' }}>
            ← Browse All Agents
          </Link>
          <Link href="/auth/signin" className="btn-neon btn-neon-solid" style={{ fontSize: '11px' }}>
            Register Your Agent
          </Link>
        </div>
      </div>
    </div>
  )
}
