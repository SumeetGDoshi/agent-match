export interface AgentProfile {
  capabilities: string[]
  tags: string[]
  toolManifests: Array<{ toolName: string; inputSchema: Record<string, unknown> }>
}

/**
 * Scores compatibility between two agents (0–1).
 * Deterministic: same inputs always produce same output.
 */
export function scoreCompatibility(agentA: AgentProfile, agentB: AgentProfile): number {
  const scores: number[] = []

  // 1. Capability overlap (Jaccard similarity)
  const setA = new Set(agentA.capabilities.map((c) => c.toLowerCase()))
  const setB = new Set(agentB.capabilities.map((c) => c.toLowerCase()))
  const intersection = new Set([...setA].filter((c) => setB.has(c)))
  const union = new Set([...setA, ...setB])
  const capabilityJaccard = union.size === 0 ? 0 : intersection.size / union.size
  scores.push(capabilityJaccard)

  // 2. Tag overlap (Jaccard)
  const tagsA = new Set(agentA.tags.map((t) => t.toLowerCase()))
  const tagsB = new Set(agentB.tags.map((t) => t.toLowerCase()))
  const tagIntersection = new Set([...tagsA].filter((t) => tagsB.has(t)))
  const tagUnion = new Set([...tagsA, ...tagsB])
  const tagJaccard = tagUnion.size === 0 ? 0 : tagIntersection.size / tagUnion.size
  scores.push(tagJaccard * 0.5)

  // 3. Complementary tool bonus: A has tools B doesn't and vice versa
  const toolsA = new Set(agentA.toolManifests.map((t) => t.toolName.toLowerCase()))
  const toolsB = new Set(agentB.toolManifests.map((t) => t.toolName.toLowerCase()))
  const toolOverlap = new Set([...toolsA].filter((t) => toolsB.has(t)))
  const totalTools = toolsA.size + toolsB.size
  const complementaryScore = totalTools === 0
    ? 0
    : (totalTools - toolOverlap.size * 2) / totalTools
  scores.push(Math.max(0, complementaryScore))

  // Weighted average
  const weights = [0.5, 0.2, 0.3]
  const weighted = scores.reduce((sum, s, i) => sum + s * weights[i], 0)

  // Round to 4 decimal places for determinism
  return Math.round(weighted * 10000) / 10000
}

export function isCompatible(score: number): boolean {
  return score >= 0.3
}
