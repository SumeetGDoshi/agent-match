import { describe, it, expect } from 'vitest'
import { scoreCompatibility, isCompatible } from '@/lib/compatibility'

const makeAgent = (
  capabilities: string[],
  tags: string[],
  toolNames: string[]
) => ({
  capabilities,
  tags,
  toolManifests: toolNames.map((name) => ({
    toolName: name,
    inputSchema: { type: 'object', properties: {} },
  })),
})

describe('scoreCompatibility', () => {
  it('returns 0 for two empty agents', () => {
    const score = scoreCompatibility(makeAgent([], [], []), makeAgent([], [], []))
    expect(score).toBe(0)
  })

  it('returns 1 for identical agents with capabilities', () => {
    const a = makeAgent(['search', 'write'], ['coding'], ['bash', 'fs'])
    const b = makeAgent(['search', 'write'], ['coding'], ['bash', 'fs'])
    const score = scoreCompatibility(a, b)
    // Identical capabilities = max capability score, but same tools = no complementary bonus
    expect(score).toBeGreaterThan(0.3)
  })

  it('rewards complementary tools', () => {
    const a = makeAgent(['search'], ['ai'], ['web-search'])
    const b = makeAgent(['search'], ['ai'], ['code-runner'])
    const score = scoreCompatibility(a, b)
    expect(score).toBeGreaterThan(0)
  })

  it('is deterministic', () => {
    const a = makeAgent(['nlp', 'vision'], ['ml'], ['classify', 'detect'])
    const b = makeAgent(['search', 'nlp'], ['ai', 'ml'], ['search', 'rank'])
    const s1 = scoreCompatibility(a, b)
    const s2 = scoreCompatibility(a, b)
    expect(s1).toBe(s2)
  })

  it('is symmetric', () => {
    const a = makeAgent(['nlp'], ['ml'], ['classify'])
    const b = makeAgent(['search'], ['ai'], ['search'])
    const s1 = scoreCompatibility(a, b)
    const s2 = scoreCompatibility(b, a)
    expect(s1).toBe(s2)
  })

  it('score is between 0 and 1', () => {
    const a = makeAgent(['a', 'b', 'c'], ['x'], ['t1', 't2'])
    const b = makeAgent(['b', 'c', 'd'], ['x', 'y'], ['t2', 't3'])
    const score = scoreCompatibility(a, b)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

describe('isCompatible', () => {
  it('returns true for score >= 0.3', () => {
    expect(isCompatible(0.3)).toBe(true)
    expect(isCompatible(0.5)).toBe(true)
    expect(isCompatible(1)).toBe(true)
  })

  it('returns false for score < 0.3', () => {
    expect(isCompatible(0)).toBe(false)
    expect(isCompatible(0.29)).toBe(false)
  })
})
