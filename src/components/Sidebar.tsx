'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useProfile } from './ProfileProvider'
import { createClient } from '@/lib/supabase/client'
import { getDepartmentColor } from '@/lib/departments'

const NAV = [
  {
    href: '/calendario',
    label: 'Calendario',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/indicadores',
    label: 'Indicadores',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const profile = useProfile()
  const deptColor = getDepartmentColor(profile.department)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full"
      style={{ background: '#002d6b' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ background: '#004c9e' }}
          >
            CCB
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Calendario</div>
            <div className="text-white/50 text-xs">Gestión de tareas</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: active ? '3px solid #009de2' : '3px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: deptColor }}
            >
              {profile.department_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{profile.department_name}</div>
              <div className="text-white/40 text-xs truncate">{profile.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-white/50 hover:text-white/80 transition-colors py-1"
          >
            Cerrar sesión →
          </button>
        </div>
      </div>
    </aside>
  )
}
