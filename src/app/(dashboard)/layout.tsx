import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProfileProvider } from '@/components/ProfileProvider'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <ProfileProvider profile={profile}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto" style={{ background: '#eef1f6' }}>
          {children}
        </main>
      </div>
    </ProfileProvider>
  )
}
