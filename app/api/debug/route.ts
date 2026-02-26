import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.DATABASE_URL ?? 'NOT_SET'
  const masked = url.replace(/:([^@]+)@/, ':***@')

  const results: Record<string, unknown> = { url: masked }

  // Test 1: basic pg connection
  try {
    const pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })
    const res = await pool.query('SELECT 1 as test')
    results.pgDirect = { ok: true, result: res.rows[0] }
    await pool.end()
  } catch (err) {
    results.pgDirect = { ok: false, error: String(err) }
  }

  // Test 2: without SSL
  try {
    const pool = new Pool({
      connectionString: url,
      ssl: false,
      connectionTimeoutMillis: 5000,
    })
    const res = await pool.query('SELECT 2 as test')
    results.pgNoSsl = { ok: true, result: res.rows[0] }
    await pool.end()
  } catch (err) {
    results.pgNoSsl = { ok: false, error: String(err) }
  }

  return NextResponse.json(results)
}
