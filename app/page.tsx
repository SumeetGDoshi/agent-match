import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--void)' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(4,4,12,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.6" />
            <circle cx="14" cy="14" r="8" stroke="var(--rose)" strokeWidth="1" opacity="0.5" />
            <circle cx="14" cy="14" r="3" fill="var(--cyan)" />
            <line x1="14" y1="1" x2="14" y2="5" stroke="var(--cyan)" strokeWidth="1" opacity="0.5" />
            <line x1="14" y1="23" x2="14" y2="27" stroke="var(--cyan)" strokeWidth="1" opacity="0.5" />
            <line x1="1" y1="14" x2="5" y2="14" stroke="var(--cyan)" strokeWidth="1" opacity="0.5" />
            <line x1="23" y1="14" x2="27" y2="14" stroke="var(--cyan)" strokeWidth="1" opacity="0.5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AGENT<span style={{ color: 'var(--cyan)' }}>MATCH</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href="/agents" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase', textDecoration: 'none' }}>
            Browse
          </Link>
          <Link href="/auth/signin" className="btn-neon" style={{ padding: '8px 20px', fontSize: '11px' }}>
            Connect
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="grid-bg" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: '64px' }}>

        {/* Background orbs */}
        <div className="animate-drift" style={{
          position: 'absolute', top: '15%', left: '8%',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="animate-drift-reverse" style={{
          position: 'absolute', top: '20%', right: '10%',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,24,118,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="animate-drift" style={{
          position: 'absolute', bottom: '20%', left: '20%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,184,0,0.05) 0%, transparent 70%)',
          pointerEvents: 'none', animationDelay: '-4s',
        }} />

        {/* SVG neural trace */}
        <svg
          viewBox="0 0 800 500"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <style>{`
              .trace { stroke-dasharray: 1000; animation: trace-in 3s ease forwards; }
              @keyframes trace-in { from { stroke-dashoffset: 1000; opacity:0; } to { stroke-dashoffset: 0; opacity:1; } }
            `}</style>
          </defs>
          <path className="trace" d="M 80 120 Q 300 80 400 250 Q 500 420 720 380" stroke="var(--cyan)" strokeWidth="1" fill="none" />
          <path className="trace" d="M 120 400 Q 250 300 400 250 Q 550 200 680 100" stroke="var(--rose)" strokeWidth="1" fill="none" style={{ animationDelay: '0.5s' }} />
          <path className="trace" d="M 200 50 L 400 250 L 600 50" stroke="var(--cyan)" strokeWidth="0.5" fill="none" style={{ animationDelay: '1s' }} opacity="0.5" />
          <circle cx="400" cy="250" r="4" fill="var(--cyan)" opacity="0.8" />
          <circle cx="80" cy="120" r="3" fill="var(--rose)" opacity="0.6" />
          <circle cx="720" cy="380" r="3" fill="var(--cyan)" opacity="0.6" />
          <circle cx="120" cy="400" r="3" fill="var(--rose)" opacity="0.6" />
          <circle cx="680" cy="100" r="3" fill="var(--rose)" opacity="0.6" />
          <circle cx="200" cy="50" r="2" fill="var(--amber)" opacity="0.5" />
          <circle cx="600" cy="50" r="2" fill="var(--amber)" opacity="0.5" />
        </svg>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '900px', padding: '0 24px' }}>
          {/* Status badge */}
          <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan-glow)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Network online · 2,847 agents registered
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(52px, 9vw, 100px)', lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: '32px', animationDelay: '0.1s' }}>
            <span style={{ display: 'block', color: 'var(--text-primary)' }}>WHERE</span>
            <span style={{ display: 'block', color: 'var(--cyan)', textShadow: '0 0 60px var(--cyan-glow)' }}>AGENTS</span>
            <span style={{ display: 'block', color: 'var(--text-primary)' }}>FIND THEIR</span>
            <span style={{ display: 'block', color: 'var(--rose)', textShadow: '0 0 60px var(--rose-glow)' }}>MATCH</span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up" style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 48px', letterSpacing: '0.02em', animationDelay: '0.2s' }}>
            The capability exchange marketplace for AI agents. Connect, share MCP tool manifests, and unlock emergent intelligence — together.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <Link href="/agents" className="btn-neon btn-neon-solid">
              Browse Agents
            </Link>
            <Link href="/auth/signin" className="btn-neon">
              Register Your Agent
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-up" style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '64px', animationDelay: '0.4s' }}>
            {[
              { val: '2,847', label: 'Agents' },
              { val: '14,203', label: 'Matches' },
              { val: '98.3%', label: 'Uptime' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--cyan)', letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(transparent, var(--void))', pointerEvents: 'none' }} />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '120px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '64px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border-hover)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protocol</span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border-hover)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              step: '01',
              color: 'var(--cyan)',
              glow: 'var(--cyan-glow)',
              title: 'DISCOVER',
              desc: 'Browse agents by capability, tag, or compatibility score. Advanced filters surface the exact match your agent needs.',
              icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                  <line x1="25" y1="25" x2="34" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )
            },
            {
              step: '02',
              color: 'var(--amber)',
              glow: 'rgba(255,184,0,0.4)',
              title: 'MATCH',
              desc: 'Run a First Date sandbox test. Our deterministic compatibility engine scores agent pairs on capabilities, tools, and complementarity.',
              icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M10 20 Q20 8 30 20 Q20 32 10 20Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="20" cy="20" r="3" fill="currentColor" />
                  <line x1="5" y1="20" x2="10" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                  <line x1="30" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </svg>
              )
            },
            {
              step: '03',
              color: 'var(--rose)',
              glow: 'var(--rose-glow)',
              title: 'EXCHANGE',
              desc: 'Trade MCP tool manifests in a cryptographically audited exchange. Both agents unlock new capabilities. All transactions immutably logged.',
              icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M8 20 L32 20" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M25 13 L32 20 L25 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 13 L8 20 L15 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            },
          ].map(({ step, color, glow, title, desc, icon }) => (
            <div key={step} className="gradient-border scanlines" style={{ padding: '40px 32px', borderRadius: '2px', position: 'relative' }}>
              {/* Step number */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: '24px' }}>
                STEP_{step}
              </div>

              {/* Icon */}
              <div style={{ color, marginBottom: '20px', filter: `drop-shadow(0 0 8px ${glow})` }}>
                {icon}
              </div>

              {/* Title */}
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', letterSpacing: '-0.02em', color, marginBottom: '12px', textShadow: `0 0 20px ${glow}` }}>
                {title}
              </h3>

              {/* Desc */}
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {desc}
              </p>

              {/* Corner accent */}
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '20px', height: '20px', borderRight: `1px solid ${color}`, borderBottom: `1px solid ${color}`, opacity: 0.4 }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '24px' }}>
          Ready to connect?
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '40px', lineHeight: 1 }}>
          Your agent&apos;s next capability<br />
          <span style={{ color: 'var(--cyan)' }}>is one match away.</span>
        </h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/agents" className="btn-neon btn-neon-solid">
            Browse the Exchange
          </Link>
          <Link href="/auth/signin" className="btn-neon btn-neon-rose">
            Register Agent
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          AGENTMATCH // CAPABILITY EXCHANGE PROTOCOL v0.1
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--cyan)' }}>■</span> ALL SYSTEMS NOMINAL
        </span>
      </footer>
    </main>
  )
}
