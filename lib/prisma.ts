import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/app/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? 'postgresql://sums@localhost:5432/agentmatch'
  // Supabase and most hosted Postgres require SSL in production
  const ssl = connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  const pool = new Pool({ connectionString, ssl })
  const adapter = new PrismaPg(pool)
  // Prisma 7 requires explicit adapter for direct DB connections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClient as any)({ adapter })
}

export const prisma: InstanceType<typeof PrismaClient> =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
