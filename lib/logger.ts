type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  event: string
  data?: Record<string, unknown>
  ts: string
}

function log(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry: LogEntry = { level, event, data, ts: new Date().toISOString() }
  // Structured JSON logs are parsed by Vercel log drains
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  fn(JSON.stringify(entry))
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) => log('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) => log('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) => log('error', event, data),
}
