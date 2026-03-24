import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_superadmin, is_matrix_admin, email')
    .eq('id', user.id)
    .single()

  if (error || !profile) redirect('/unauthorized')

  const isAdmin =
    profile.is_superadmin === true || profile.is_matrix_admin === true

  if (!isAdmin) redirect('/unauthorized')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a', // Primary Background
        color: '#f8fafc' // Primary Text
      }}
    >
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 28px',
          height: '52px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)', // Border
          background: 'rgba(30, 41, 59, 0.7)', // Glass panel effect
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            fontWeight: '700',
            color: '#00ff88', // Primary Accent
            letterSpacing: '0.05em',
            textShadow: '0 0 8px rgba(0, 255, 136, 0.4)' // Neon glow
          }}
        >
          prompt-chain-tool
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              color: '#94a3b8' // Muted Text
            }}
          >
            {profile.email}
          </span>

          <div style={{ color: '#00e5ff' }}>
            <ThemeToggle />
          </div>

          <SignOutButton />
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}