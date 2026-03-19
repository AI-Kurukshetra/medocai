'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, MessageSquare, Users,
  BarChart3, Settings, Stethoscope, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['cdi_specialist', 'admin', 'physician', 'coder'] },
  { href: '/cases', label: 'Case Worklist', icon: ClipboardList, roles: ['cdi_specialist', 'admin'] },
  { href: '/queries', label: 'Queries', icon: MessageSquare, roles: ['cdi_specialist', 'physician', 'admin', 'coder'] },
  { href: '/patients', label: 'Patients', icon: Users, roles: ['cdi_specialist', 'admin', 'physician', 'coder'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'cdi_specialist'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'cdi_specialist', 'physician', 'coder'] },
]

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const filtered = navItems.filter(item => !userRole || item.roles.includes(userRole))

  return (
    <aside className="w-64 flex flex-col h-full" style={{ background: 'var(--sidebar-bg)' }}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">CDI Platform</p>
            <p className="text-xs" style={{ color: 'var(--sidebar-fg)' }}>Clinical Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filtered.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                color: active ? 'var(--sidebar-active)' : 'var(--sidebar-fg)',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-center" style={{ color: 'var(--sidebar-fg)' }}>
          Powered by Claude AI
        </p>
      </div>
    </aside>
  )
}
