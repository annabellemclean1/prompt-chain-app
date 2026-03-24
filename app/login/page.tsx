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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 40px',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        background: 'var(--bg-panel)',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* TOP BADGE */}
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          fontFamily: 'var(--mono)',
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
          Secure Terminal
        </div>

        {/* LOGO */}
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontSize: '42px',
          fontWeight: '900',
          marginBottom: '8px',
          color: 'var(--text)',
          letterSpacing: '-0.04em'
        }}>
          crackd<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        <p style={{
          color: 'var(--text-dim)',
          fontSize: '12px',
          marginBottom: '40px',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          [ Internal Access Only ]
        </p>

        {/* ACTION BUTTON */}
        <button
          onClick={signIn}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            padding: '16px',
            background: isHovered ? 'var(--text)' : 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isHovered ? '0 0 20px rgba(255,255,255,0.2)' : `0 0 15px rgba(var(--accent-rgb, 0, 255, 136), 0.2)`
          }}
        >
          Initialize Google OAuth →
        </button>

        {/* FOOTER FOOTNOTE */}
        <div style={{
          marginTop: '32px',
          fontSize: '10px',
          color: 'var(--text-dimmer)',
          fontFamily: 'var(--mono)'
        }}>
          Unauthorized attempts are logged.
        </div>
      </div>
    </div>
  )
}