import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles')
    .select('is_superadmin, is_matrix_admin, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin && !profile?.is_matrix_admin) redirect('/unauthorized')

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-slate-200 selection:bg-indigo-500/30">

      {/* 1. Sleek Vertical Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/5 bg-[#0f0f11] flex flex-col hidden lg:flex">
        {/* Logo / Branding */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="font-mono text-xs font-bold tracking-widest uppercase text-white">
              PROMPT_CHAIN
            </span>
          </div>
        </div>

        {/* Navigation Placeholder - You can add your links here later */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 rounded-md bg-white/5 text-white text-sm font-medium cursor-pointer transition-all hover:bg-white/10">
            Console
          </div>
          <div className="px-3 py-2 rounded-md text-slate-400 text-sm font-medium cursor-pointer transition-all hover:text-white hover:bg-white/5">
            Workflows
          </div>
          <div className="px-3 py-2 rounded-md text-slate-400 text-sm font-medium cursor-pointer transition-all hover:text-white hover:bg-white/5">
            History
          </div>
        </nav>

        {/* User Footer Section */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 font-mono truncate">{profile?.email}</span>
              <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-tighter">Admin Access</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* 2. Main Canvas Area */}
      <div className="flex-1 lg:pl-64">
        {/* Subtle Top Bar for Actions */}
        <header className="h-14 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
            System / Dashboard
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
          </div>
        </header>

        {/* The "Stage" where children pages load */}
        <main className="relative p-8 max-w-5xl mx-auto">
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <section className="relative z-10">
            {children}
          </section>
        </main>
      </div>
    </div>
  )
}