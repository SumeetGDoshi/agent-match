'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MyAgent {
  id: string
  name: string
}

interface MatchResult {
  matchId: string
  score: number
  status: string
}

export default function MatchInitiator({
  targetAgent,
  myAgents,
  isLoggedIn,
}: {
  targetAgent: { id: string; name: string }
  myAgents: MyAgent[]
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(myAgents[0]?.id ?? '')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isLoggedIn) {
    return (
      <div className="gradient-border" style={{ padding: '32px', borderRadius: '2px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Sign in to run a compatibility match with this agent.
        </p>
        <Link href="/auth/signin" className="btn-neon">
          Sign In to Match
        </Link>
      </div>
    )
  }

  if (myAgents.length === 0) {
    return (
      <div className="gradient-border" style={{ padding: '32px', borderRadius: '2px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          You need to register an agent before you can initiate a match.
        </p>
        <Link href="/dashboard" className="btn-neon">
          Register Your Agent
        </Link>
      </div>
    )
  }

  if (result) {
    const scorePercent = Math.round(result.score * 100)
    const compatible = result.status === 'COMPATIBLE'
    return (
      <div className="gradient-border" style={{ padding: '32px', borderRadius: '2px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: compatible ? 'var(--cyan)' : 'var(--rose)', textTransform: 'uppercase', marginBottom: '16px' }}>
          {compatible ? '◆ Compatible' : '◇ Incompatible'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            border: `2px solid ${compatible ? 'var(--cyan)' : 'var(--rose)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${compatible ? 'var(--cyan-glow)' : 'var(--rose-glow)'}`,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: compatible ? 'var(--cyan)' : 'var(--rose)', fontWeight: 500 }}>
              {scorePercent}%
            </span>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Compatibility Score
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {compatible
                ? 'Agents are compatible. Proceed to exchange capabilities.'
                : 'Agents are not compatible enough for an exchange.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {compatible && (
            <button
              onClick={() => router.push(`/matches/${result.matchId}/exchange`)}
              className="btn-neon btn-neon-solid"
              style={{ padding: '10px 24px', fontSize: '11px' }}
            >
              Proceed to Exchange ⚡
            </button>
          )}
          <button
            onClick={() => { setResult(null); setError('') }}
            className="btn-neon"
            style={{ padding: '10px 24px', fontSize: '11px' }}
          >
            Run Another Match
          </button>
        </div>
      </div>
    )
  }

  async function handleMatch() {
    if (!selectedId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initiatorId: selectedId, targetId: targetAgent.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ matchId: data.id, score: data.compatibilityScore, status: data.status })
      } else {
        setError(data.error ?? 'Failed to run match')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-border" style={{ padding: '32px', borderRadius: '2px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '20px' }}>
        — Initiate Match
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
        Select one of your agents to run a compatibility test against{' '}
        <span style={{ color: 'var(--text-primary)' }}>{targetAgent.name}</span>.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Your Agent
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border-hover)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px',
            padding: '10px 14px', borderRadius: '2px', outline: 'none', cursor: 'pointer',
          }}
        >
          {myAgents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--rose)', marginBottom: '16px' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleMatch}
        disabled={loading || !selectedId}
        className="btn-neon btn-neon-solid"
        style={{ padding: '10px 28px', fontSize: '11px', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Running Match...' : 'Run Compatibility Test'}
      </button>
    </div>
  )
}
