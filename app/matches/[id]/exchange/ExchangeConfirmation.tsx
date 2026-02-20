'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ToolManifest {
  id: string
  toolName: string
  description: string | null
  version: string
}

interface AgentWithTools {
  id: string
  name: string
  toolManifests: ToolManifest[]
  owner: { id: string; name: string | null }
}

interface MatchSession {
  id: string
  status: string
  compatibilityScore: number | null
  initiator: AgentWithTools
  target: AgentWithTools
}

export default function ExchangeConfirmation({
  match,
  userId,
}: {
  match: MatchSession
  userId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiatorToolNames = new Set(match.initiator.toolManifests.map((t) => t.toolName))
  const targetToolNames = new Set(match.target.toolManifests.map((t) => t.toolName))
  const toolsForTarget = match.initiator.toolManifests.filter((t) => !targetToolNames.has(t.toolName))
  const toolsForInitiator = match.target.toolManifests.filter((t) => !initiatorToolNames.has(t.toolName))

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchSessionId: match.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Exchange failed')
      } else {
        router.push(`/agents/${match.initiator.id}?exchanged=true`)
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const score = match.compatibilityScore ?? 0
  const scorePercent = Math.round(score * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Confirm Capability Exchange</h1>
        <p className="text-purple-300 mb-8">Review what each agent will receive before confirming.</p>

        {/* Compatibility Score */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6 text-center">
          <p className="text-purple-300 mb-1">Compatibility Score</p>
          <div className="text-5xl font-bold text-white mb-2">{scorePercent}%</div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-3 transition-all"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* Exchange Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ExchangePanel
            title={`${match.initiator.name} receives`}
            tools={toolsForInitiator}
            emptyMessage="No new tools to receive"
          />
          <ExchangePanel
            title={`${match.target.name} receives`}
            tools={toolsForTarget}
            emptyMessage="No new tools to receive"
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl p-4 mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-white/20 text-purple-300 rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || match.status === 'EXCHANGED'}
            className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
          >
            {loading ? 'Exchanging...' : match.status === 'EXCHANGED' ? 'Already Exchanged' : 'Confirm Exchange ⚡'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ExchangePanel({
  title,
  tools,
  emptyMessage,
}: {
  title: string
  tools: ToolManifest[]
  emptyMessage: string
}) {
  return (
    <div className="bg-white/10 rounded-2xl p-5">
      <h3 className="font-semibold text-white mb-3">{title}</h3>
      {tools.length === 0 ? (
        <p className="text-purple-400 text-sm">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {tools.map((t) => (
            <li key={t.id} className="flex items-center gap-2 text-sm text-purple-200">
              <span className="text-green-400">+</span>
              <span className="font-mono">{t.toolName}</span>
              <span className="text-purple-400 text-xs">v{t.version}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
