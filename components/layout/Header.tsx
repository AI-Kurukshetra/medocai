'use client'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Bell, Loader2, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header({ user }: { user: any }) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center gap-2">
        {user?.organizations?.name && (
          <span className="text-sm text-slate-500 dark:text-slate-400">{user.organizations.name}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-slate-400" />
            : <Moon className="w-4 h-4 text-slate-500" />
          }
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-medium text-teal-700 dark:bg-teal-900 dark:text-teal-300">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-800 leading-none dark:text-slate-100">{user?.full_name}</p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize dark:text-slate-500">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          disabled={signingOut}
          title="Sign out"
        >
          {signingOut
            ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            : <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          }
        </Button>
      </div>
    </header>
  )
}
