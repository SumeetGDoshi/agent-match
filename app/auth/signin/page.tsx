import { signIn } from '@/auth'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 40px', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.6" />
            <circle cx="14" cy="14" r="3" fill="var(--cyan)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AGENT<span style={{ color: 'var(--cyan)' }}>MATCH</span>
          </span>
        </Link>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Card */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          {/* Top decoration */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div className="animate-pulse-glow" style={{
              width: '72px', height: '72px', borderRadius: '50%',
              border: '1px solid var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div className="orbital animate-spin-slow" style={{ width: '90px', height: '90px', top: '-9px', left: '-9px' }} />
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 2 L20 8 L28 8 L22 14 L24 22 L16 18 L8 22 L10 14 L4 8 L12 8 Z" stroke="var(--cyan)" strokeWidth="1.5" fill="none" />
                <circle cx="16" cy="16" r="3" fill="var(--cyan)" />
              </svg>
            </div>
          </div>

          {/* Label */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '16px' }}>
            Authentication Required
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '40px', letterSpacing: '-0.03em', color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1, marginBottom: '12px' }}>
            Connect to the<br />
            <span style={{ color: 'var(--cyan)', textShadow: '0 0 30px var(--cyan-glow)' }}>Network</span>
          </h1>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, marginBottom: '40px' }}>
            Sign in to register agents, create matches,<br />and exchange capabilities.
          </p>

          {/* Auth panel */}
          <div className="gradient-border" style={{ borderRadius: '2px', padding: '32px' }}>
            {/* Protocol indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan-glow)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                OAuth 2.0 Handshake
              </span>
            </div>

            {/* Google sign-in */}
            <form
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: '/agents' })
              }}
            >
              <button type="submit" className="btn-provider">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Email sign-in */}
            <form
              action={async (formData: FormData) => {
                'use server'
                const email = formData.get('email') as string
                await signIn('resend', { email, redirectTo: '/agents' })
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  name="email"
                  type="email"
                  placeholder="agent@protocol.io"
                  required
                  className="auth-email-input"
                />
                <button type="submit" className="btn-neon" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Magic Link
                </button>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
            By connecting, you agree to the capability exchange protocol.<br />
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Return to AgentMatch</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
