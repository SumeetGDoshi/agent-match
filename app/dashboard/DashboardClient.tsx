'use client'

import { useState } from 'react'
import Link from 'next/link'
import AgentForm from './AgentForm'

interface AgentData {
  id: string
  name: string
  description: string | null
  capabilities: string[]
  tags: string[]
  isPublic: boolean
  toolManifests: Array<{ id: string; toolName: string; description: string | null; version: string }>
}

type View = { type: 'list' } | { type: 'create' } | { type: 'edit'; agent: AgentData }

export default function DashboardClient({
  initialAgents,
  userName,
}: {
  initialAgents: AgentData[]
  userName: string | null
}) {
  const [agents, setAgents] = useState<AgentData[]>(initialAgents)
  const [view, setView] = useState<View>({ type: 'list' })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(agentId: string, agentName: string) {
    if (!confirm(`Delete "${agentName}"? This cannot be undone.`)) return
    setDeletingId(agentId)
    const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) {
      setAgents((prev) => prev.filter((a) => a.id !== agentId))
    }
    setDeletingId(null)
  }

  function handleSaved(saved: AgentData) {
    if (view.type === 'edit') {
      setAgents((prev) => prev.map((a) => (a.id === saved.id ? saved : a)))
    } else {
      setAgents((prev) => [saved, ...prev])
    }
    setView({ type: 'list' })
  }

  if (view.type === 'create' || view.type === 'edit') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 40px' }}>
        <button
          onClick={() => setView({ type: 'list' })}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back to Dashboard
        </button>
        <div className="gradient-border" style={{ padding: '40px', borderRadius: '2px' }}>
          <AgentForm
            agent={view.type === 'edit' ? view.agent : undefined}
            onSuccess={handleSaved}
            onCancel={() => setView({ type: 'list' })}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '8px' }}>
            — Control Panel
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
            {userName ? `${userName.split(' ')[0]}'s Agents` : 'My Agents'}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span style={{ color: 'var(--cyan)' }}>{agents.length}</span> agent{agents.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => setView({ type: 'create' })}
          className="btn-neon btn-neon-solid"
          style={{ padding: '10px 28px', fontSize: '11px' }}
        >
          + Register Agent
        </button>
      </div>

      {/* Agent list */}
      {agents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '40px', marginBottom: '20px', color: 'var(--text-muted)' }}>[ ]</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>No agents registered yet</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '32px' }}>Register your first agent to start exchanging capabilities</p>
          <button onClick={() => setView({ type: 'create' })} className="btn-neon btn-neon-solid" style={{ padding: '10px 28px', fontSize: '11px' }}>
            Register Your First Agent
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {agents.map((agent) => (
            <div key={agent.id} className="gradient-border" style={{ padding: '28px 32px', borderRadius: '2px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div className="agent-id">AGT_{agent.id.slice(0, 8).toUpperCase()}</div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 8px',
                      border: `1px solid ${agent.isPublic ? 'var(--cyan)' : 'var(--amber)'}`,
                      color: agent.isPublic ? 'var(--cyan)' : 'var(--amber)',
                      borderRadius: '2px', letterSpacing: '0.1em',
                    }}>
                      {agent.isPublic ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: '6px' }}>
                    {agent.name}
                  </h3>
                  {agent.description && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px', maxWidth: '500px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {agent.description}
                    </p>
                  )}
                  {agent.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {agent.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="cap-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--cyan)' }}>{agent.toolManifests.length}</span> tools
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--rose)' }}>{agent.capabilities.length}</span> capabilities
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexShrink: 0 }}>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="btn-neon"
                    style={{ padding: '7px 16px', fontSize: '10px' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => setView({ type: 'edit', agent })}
                    className="btn-neon"
                    style={{ padding: '7px 16px', fontSize: '10px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id, agent.name)}
                    disabled={deletingId === agent.id}
                    className="btn-neon btn-neon-rose"
                    style={{ padding: '7px 16px', fontSize: '10px', opacity: deletingId === agent.id ? 0.5 : 1 }}
                  >
                    {deletingId === agent.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Tool manifests if any */}
              {agent.toolManifests.length > 0 && (
                <>
                  <div className="divider" style={{ margin: '20px 0' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                      MCP Tools
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {agent.toolManifests.map((tool) => (
                        <span key={tool.id} style={{
                          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)',
                          padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '2px',
                          background: 'var(--surface-2)',
                        }}>
                          {tool.toolName}
                          <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>v{tool.version}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
