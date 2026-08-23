'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Hexagon, LayoutDashboard, Folder, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | undefined>('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Files', href: '/dashboard/files', icon: Folder },
  ]

  const SidebarContent = (
    <div className="flex h-full flex-col bg-surface border-r border-border">
      <div className="flex h-16 items-center px-6">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-foreground"
          onClick={onMobileClose}
        >
          <Hexagon className="size-5 text-accent stroke-[2]" aria-hidden="true" />
          BizLens
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "size-4 shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex flex-col gap-3">
          <span className="truncate px-2 text-xs font-medium text-muted-foreground">
            {userEmail || 'Loading...'}
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground w-full text-left"
          >
            <LogOut className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )

  // Mobile Drawer (Rendered conditionally via layout or CSS)
  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {SidebarContent}
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-40 w-64 bg-surface shadow-xl flex flex-col">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
