import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_superadmin, is_matrix_admin, email').eq('id', user.id).single()
  if (!profile?.is_superadmin && !profile?.is_matrix_admin) redirect('/unauthorized')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)', // Resolves to #0f172a in your theme
      color: 'var(--text)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 28px',
        height: '52px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(30, 41, 59, 0.8)', // Matches theme.panel with transparency
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {/* LOGO SECTION */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: 'var(--accent)', // The Neon Emerald #00ff88
            borderRadius: '50%',
            boxShadow: '0 0 10px var(--accent)'
          }} />
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            fontWeight: '900',
            color: 'var(--text)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            prompt-chain-<span style={{ color: 'var(--accent)' }}>tool</span>
          </div>
        </div>

        {/* ACTIONS SECTION */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '20px',
            border: '1px solid var(--border)'
          }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              fontWeight: '600',
              color: 'var(--text-dimmer)',
              letterSpacing: '0.02em'
            }}>
              {profile?.email}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ThemeToggle />
            <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ position: 'relative' }}>
        {children}
      </main>
    </div>
  )
}