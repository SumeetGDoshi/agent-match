'use client'

import { useState } from 'react'

interface AgentData {
  id: string
  name: string
  description: string | null
  capabilities: string[]
  tags: string[]
  isPublic: boolean
  toolManifests: Array<{ id: string; toolName: string; description: string | null; version: string }>
}

export default function AgentForm({
  agent,
  onSuccess,
  onCancel,
}: {
  agent?: AgentData
  onSuccess: (saved: AgentData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(agent?.name ?? '')
  const [description, setDescription] = useState(agent?.description ?? '')
  const [capabilities, setCapabilities] = useState(agent?.capabilities.join(', ') ?? '')
  const [tags, setTags] = useState(agent?.tags.join(', ') ?? '')
  const [isPublic, setIsPublic] = useState(agent?.isPublic ?? true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      capabilities: capabilities.split(',').map((s) => s.trim()).filter(Boolean),
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      isPublic,
    }

    const url = agent ? `/api/agents/${agent.id}` : '/api/agents'
    const method = agent ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const saved = await res.json()
      onSuccess({ ...saved, toolManifests: agent?.toolManifests ?? [] })
    } else {
      const data = await res.json()
      setError(typeof data.error === 'string' ? data.error : 'Failed to save agent')
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border-hover)',
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px',
    padding: '10px 14px', borderRadius: '2px', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em',
    color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '4px' }}>
        — {agent ? 'Edit Agent' : 'Register New Agent'}
      </div>

      <div>
        <label style={labelStyle}>Agent Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. ResearchBot Alpha"
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this agent do?"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      <div>
        <label style={labelStyle}>Capabilities</label>
        <input
          type="text"
          value={capabilities}
          onChange={(e) => setCapabilities(e.target.value)}
          placeholder="web-search, summarization, code-execution"
          style={inputStyle}
        />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Comma-separated list of capabilities
        </p>
      </div>

      <div>
        <label style={labelStyle}>Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="research, nlp, productivity"
          style={inputStyle}
        />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Comma-separated tags for discoverability
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          style={{
            width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
            background: isPublic ? 'var(--cyan)' : 'var(--surface-2)',
            transition: 'background 0.2s', position: 'relative', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', width: '16px', height: '16px', borderRadius: '50%',
            background: isPublic ? 'var(--void)' : 'var(--text-muted)',
            transition: 'left 0.2s',
            left: isPublic ? '21px' : '3px',
          }} />
        </button>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
            {isPublic ? 'Public' : 'Private'}
          </span>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isPublic ? 'Visible in the browse directory' : 'Only visible to you'}
          </p>
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--rose)' }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          type="submit"
          disabled={loading}
          className="btn-neon btn-neon-solid"
          style={{ padding: '10px 28px', fontSize: '11px', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Saving...' : agent ? 'Save Changes' : 'Register Agent'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-neon"
          style={{ padding: '10px 24px', fontSize: '11px' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
