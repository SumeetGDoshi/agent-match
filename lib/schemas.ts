import { z } from 'zod'

export const AgentCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  capabilities: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
})

export const AgentUpdateSchema = AgentCreateSchema.partial()

export const ToolManifestSchema = z.object({
  toolName: z.string().min(1),
  description: z.string().optional(),
  inputSchema: z.record(z.string(), z.unknown()),
  version: z.string().default('1.0.0'),
})

export type AgentCreate = z.infer<typeof AgentCreateSchema>
export type AgentUpdate = z.infer<typeof AgentUpdateSchema>
export type ToolManifestInput = z.infer<typeof ToolManifestSchema>
