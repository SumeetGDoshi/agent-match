import 'dotenv/config'
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter })

async function main() {
  console.log('🌱 Seeding agent network...')

  // System user for seeded agents
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@agentmatch.ai' },
    update: {},
    create: {
      email: 'system@agentmatch.ai',
      name: 'AgentMatch Network',
      emailVerified: new Date(),
    },
  })

  // ─── Agent 1: Technical Content Creator ───────────────────────────────────
  const contentCreator = await prisma.agent.upsert({
    where: { id: 'seed-content-creator' },
    update: {},
    create: {
      id: 'seed-content-creator',
      name: 'TechScribe',
      description:
        'Expert technical writer and content creator. Transforms complex engineering concepts into clear documentation, blog posts, and tutorials. Specializes in API docs, developer guides, and release notes.',
      capabilities: ['technical-writing', 'documentation', 'content-creation', 'markdown', 'api-docs'],
      tags: ['writing', 'developer-relations', 'documentation'],
      isPublic: true,
      verified: true,
      ownerId: systemUser.id,
      toolManifests: {
        create: [
          {
            toolName: 'write_technical_doc',
            description: 'Generate technical documentation from code or specs',
            inputSchema: {
              type: 'object',
              properties: {
                topic: { type: 'string', description: 'Documentation topic or function name' },
                code_snippet: { type: 'string', description: 'Optional code to document' },
                format: { type: 'string', enum: ['markdown', 'html', 'rst'] },
              },
              required: ['topic'],
            },
          },
          {
            toolName: 'create_tutorial',
            description: 'Create step-by-step tutorials with code examples',
            inputSchema: {
              type: 'object',
              properties: {
                subject: { type: 'string' },
                skill_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
              },
              required: ['subject'],
            },
          },
          {
            toolName: 'generate_changelog',
            description: 'Generate structured changelogs from git commits or diff summaries',
            inputSchema: {
              type: 'object',
              properties: {
                commits: { type: 'array', items: { type: 'string' } },
                version: { type: 'string' },
              },
              required: ['commits'],
            },
          },
        ],
      },
    },
  })

  // ─── Agent 2: DevRel Automation Bot ───────────────────────────────────────
  const devRelBot = await prisma.agent.upsert({
    where: { id: 'seed-devrel-bot' },
    update: {},
    create: {
      id: 'seed-devrel-bot',
      name: 'DevRelPro',
      description:
        'Automates developer relations workflows: monitors community channels, crafts developer-friendly responses, tracks SDK adoption metrics, and identifies integration opportunities.',
      capabilities: ['community-management', 'developer-relations', 'analytics', 'api-monitoring'],
      tags: ['developer-relations', 'community', 'analytics'],
      isPublic: true,
      verified: true,
      ownerId: systemUser.id,
      toolManifests: {
        create: [
          {
            toolName: 'monitor_github_issues',
            description: 'Monitor GitHub repositories for new issues and questions',
            inputSchema: {
              type: 'object',
              properties: {
                repo: { type: 'string', description: 'owner/repo format' },
                labels: { type: 'array', items: { type: 'string' } },
              },
              required: ['repo'],
            },
          },
          {
            toolName: 'draft_community_reply',
            description: 'Draft empathetic, technically accurate community replies',
            inputSchema: {
              type: 'object',
              properties: {
                issue_body: { type: 'string' },
                context: { type: 'string', description: 'Product documentation context' },
                tone: { type: 'string', enum: ['helpful', 'technical', 'friendly'] },
              },
              required: ['issue_body'],
            },
          },
          {
            toolName: 'track_sdk_adoption',
            description: 'Analyze SDK usage metrics across package registries',
            inputSchema: {
              type: 'object',
              properties: {
                package_name: { type: 'string' },
                registry: { type: 'string', enum: ['npm', 'pypi', 'rubygems', 'maven'] },
              },
              required: ['package_name', 'registry'],
            },
          },
          {
            toolName: 'web_search',
            description: 'Search the web for developer mentions and discussions',
            inputSchema: {
              type: 'object',
              properties: { query: { type: 'string' } },
              required: ['query'],
            },
          },
        ],
      },
    },
  })

  // ─── Agent 3: Workshop Assistant ──────────────────────────────────────────
  const workshopAssistant = await prisma.agent.upsert({
    where: { id: 'seed-workshop-assistant' },
    update: {},
    create: {
      id: 'seed-workshop-assistant',
      name: 'WorkshopGuide',
      description:
        'Designs and facilitates interactive developer workshops. Creates hands-on exercises, manages lab environments, tracks participant progress, and generates personalized feedback.',
      capabilities: ['workshop-design', 'education', 'code-exercises', 'feedback-generation'],
      tags: ['education', 'developer-relations', 'training'],
      isPublic: true,
      verified: false,
      ownerId: systemUser.id,
      toolManifests: {
        create: [
          {
            toolName: 'create_code_exercise',
            description: 'Generate hands-on coding exercises with test cases',
            inputSchema: {
              type: 'object',
              properties: {
                topic: { type: 'string' },
                difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                language: { type: 'string' },
              },
              required: ['topic', 'language'],
            },
          },
          {
            toolName: 'evaluate_submission',
            description: 'Evaluate a workshop participant code submission and provide feedback',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                expected_behavior: { type: 'string' },
                rubric: { type: 'object' },
              },
              required: ['code', 'expected_behavior'],
            },
          },
          {
            toolName: 'generate_lab_instructions',
            description: 'Generate detailed lab setup and exercise instructions',
            inputSchema: {
              type: 'object',
              properties: {
                workshop_title: { type: 'string' },
                prerequisites: { type: 'array', items: { type: 'string' } },
                steps: { type: 'array', items: { type: 'string' } },
              },
              required: ['workshop_title'],
            },
          },
        ],
      },
    },
  })

  // ─── Agent 4: Research Scout ───────────────────────────────────────────────
  const researchScout = await prisma.agent.upsert({
    where: { id: 'seed-research-scout' },
    update: {},
    create: {
      id: 'seed-research-scout',
      name: 'ResearchScout',
      description:
        'Autonomous research agent that scours technical papers, GitHub trending, and developer forums to surface emerging tools, libraries, and best practices relevant to your stack.',
      capabilities: ['research', 'trend-analysis', 'summarization', 'technical-evaluation'],
      tags: ['research', 'analytics', 'developer-relations'],
      isPublic: true,
      verified: false,
      ownerId: systemUser.id,
      toolManifests: {
        create: [
          {
            toolName: 'search_arxiv',
            description: 'Search arXiv for relevant research papers',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                max_results: { type: 'number', default: 10 },
              },
              required: ['query'],
            },
          },
          {
            toolName: 'fetch_github_trending',
            description: 'Fetch trending GitHub repositories by language and time period',
            inputSchema: {
              type: 'object',
              properties: {
                language: { type: 'string' },
                since: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
              },
              required: [],
            },
          },
          {
            toolName: 'summarize_content',
            description: 'Summarize long-form content into concise bullet points',
            inputSchema: {
              type: 'object',
              properties: {
                content: { type: 'string' },
                max_bullets: { type: 'number', default: 5 },
              },
              required: ['content'],
            },
          },
          {
            toolName: 'write_technical_doc',
            description: 'Write a technical summary report from research findings',
            inputSchema: {
              type: 'object',
              properties: {
                topic: { type: 'string' },
                findings: { type: 'array', items: { type: 'string' } },
              },
              required: ['topic'],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Seeded agents:')
  console.log(`  • ${contentCreator.name} (${contentCreator.id}) — verified: ${contentCreator.verified}`)
  console.log(`  • ${devRelBot.name} (${devRelBot.id}) — verified: ${devRelBot.verified}`)
  console.log(`  • ${workshopAssistant.name} (${workshopAssistant.id}) — verified: ${workshopAssistant.verified}`)
  console.log(`  • ${researchScout.name} (${researchScout.id}) — verified: ${researchScout.verified}`)
  console.log('')
  console.log('✅ Network seeded successfully!')
}

main()
  .catch((err) => {
    console.error('Seed error:', err)
    process.exit(1)
  })
  .finally(() => pool.end())
