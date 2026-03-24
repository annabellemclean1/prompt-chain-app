'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const [isHovered, setIsHovered] = useState(false)

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  // Matching the Midnight Cyberpunk palette exactly
  const theme = {
    bg: '#0f172a',        // Deep Slate
    panel: '#1e293b',     // Lighter Slate
    accent: '#00ff88',    // Neon Emerald
    border: 'rgba(255,255,255,0.06)',
    text: '#f8fafc'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.bg, // Matches Dashboard
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 40px',
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        background: theme.panel, // Matches Layout Nav
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* TERMINAL TAG */}
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: 'rgba(0, 255, 136, 0.05)',
          border: `1px solid ${theme.accent}33`,
          borderRadius: '20px',
          fontFamily: 'var(--mono)',
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: theme.accent,
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
          System Access
        </div>

        {/* LOGO - PURPLE REMOVED */}
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontSize: '42px',
          fontWeight: '900',
          marginBottom: '8px',
          color: theme.text,
          letterSpacing: '-0.04em'
        }}>
          crackd<span style={{ color: theme.accent }}>.</span>
        </h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '12px',
          marginBottom: '40px',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          [ Superadmin Auth Required ]
        </p>

        {/* LOGIN BUTTON - NEON EMERALD */}
        <button
          onClick={signIn}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            padding: '16px',
            background: isHovered ? '#fff' : theme.accent,
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isHovered
              ? '0 0 30px rgba(255,255,255,0.2)'
              : `0 0 15px rgba(0, 255, 136, 0.15)`
          }}
        >
          Authorize via Google →
        </button>

        <div style={{
          marginTop: '32px',
          fontSize: '10px',
          color: '#475569',
          fontFamily: 'var(--mono)'
        }}>
          Connection Secure // AES-256
        </div>
      </div>
    </div>
  )
}