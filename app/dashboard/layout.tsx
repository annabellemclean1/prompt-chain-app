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

  // Constants for the new "No Purple" theme
  const theme = {
    bg: '#0f172a',        // Deep Slate
    panel: '#1e293b',     // Lighter Slate
    accent: '#00ff88',    // Neon Emerald (Replaces Purple)
    border: 'rgba(255,255,255,0.06)'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: '#f8fafc'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 28px',
        height: '52px',
        borderBottom: `1px solid ${theme.border}`,
        background: theme.panel,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* LOGO: PURPLE REMOVED */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          fontWeight: '800',
          color: '#fff',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '6px', height: '6px', background: theme.accent, borderRadius: '50%' }} />
          <span>prompt-chain-<span style={{ color: theme.accent }}>tool</span></span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* USER TAG */}
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: '#94a3b8',
            background: 'rgba(255,255,255,0.03)',
            padding: '4px 10px',
            borderRadius: '4px',
            border: `1px solid ${theme.border}`
          }}>
            {profile?.email}
          </span>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ThemeToggle />
            <div style={{ width: '1px', height: '14px', background: theme.border }} />
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* RENDER DASHBOARD CONTENT */}
      <main>{children}</main>

      {/* INJECTED GLOBAL OVERRIDE (Optional: Forces variables to match) */}
      <style jsx global>{`
        :root {
          --bg: ${theme.bg};
          --bg-panel: ${theme.panel};
          --accent: ${theme.accent};
          --border: ${theme.border};
          --text: #f8fafc;
          --text-dimmer: #94a3b8;
        }
        /* Ensure no system-wide purples remain */
        ::selection { background: ${theme.accent}; color: #000; }
      `}</style>
    </div>
  )
}