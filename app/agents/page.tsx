'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  description: string | null
  capabilities: string[]
  tags: string[]
  isPublic: boolean
  createdAt: string
  owner: { id: string; name: string | null; image: string | null }
  toolManifests: Array<{ id: string; toolName: string }>
}

export default function AgentsBrowsePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, limit: '20' })
    const res = await fetch(`/api/agents?${params}`)
    if (res.ok) {
      const data = await res.json()
      setAgents(data.agents)
      setTotal(data.total)
    }
    setLoading(false)
  }, [search])

  useEffect(() => {
    const t = setTimeout(fetchAgents, 300)
    return () => clearTimeout(t)
  }, [fetchAgents])

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.6" />
            <circle cx="14" cy="14" r="3" fill="var(--cyan)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AGENT<span style={{ color: 'var(--cyan)' }}>MATCH</span>
          </span>
        </Link>
        <Link href="/dashboard" className="btn-neon" style={{ padding: '8px 20px', fontSize: '11px' }}>
          Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '12px' }}>
            — Exchange Directory
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '16px' }}>
            Browse Agents
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--cyan)' }}>{total}</span> agents available for capability exchange
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '520px', marginBottom: '48px' }}>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, capability, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ borderRadius: '2px' }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: '220px', background: 'var(--surface)', borderRadius: '2px',
                border: '1px solid var(--border)', opacity: 0.5,
                animation: 'pulse-glow 2s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '48px', marginBottom: '24px', color: 'var(--text-muted)' }}>[ ]</div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>No agents found</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>Be the first to register your agent</p>
            <Link href="/auth/signin" className="btn-neon" style={{ display: 'inline-flex', marginTop: '32px' }}>
              Register Agent
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agents/${agent.id}`} style={{ textDecoration: 'none' }}>
      <div className="gradient-border scanlines" style={{
        padding: '28px', borderRadius: '2px', cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '0 8px 40px rgba(0,245,255,0.08)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="agent-id" style={{ marginBottom: '6px' }}>
              AGT_{agent.id.slice(0, 8).toUpperCase()}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {agent.name}
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {agent.owner.name ?? 'Anonymous'}
            </p>
          </div>

          {/* Capability count ring */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: `2px solid var(--rose)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--rose)', fontWeight: 500, lineHeight: 1, textAlign: 'center' }}>
              {agent.capabilities.length}<br />
              <span style={{ fontSize: '8px', letterSpacing: '0.05em' }}>caps</span>
            </span>
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {agent.description}
          </p>
        )}

        {/* Tags */}
        {agent.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {agent.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="cap-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="divider" style={{ marginBottom: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--cyan)' }}>{agent.toolManifests.length}</span> tools
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--rose)' }}>{agent.capabilities.length}</span> capabilities
          </div>
        </div>

        {/* Corner accent */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '12px', height: '12px', borderTop: '1px solid var(--cyan)', borderRight: '1px solid var(--cyan)', opacity: 0.4 }} />
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '12px', height: '12px', borderBottom: '1px solid var(--rose)', borderLeft: '1px solid var(--rose)', opacity: 0.4 }} />
      </div>
    </Link>
  )
}
