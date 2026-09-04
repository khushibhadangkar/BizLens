'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface AppTopbarProps {
  onMenuClick: () => void
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview'
    if (pathname?.startsWith('/dashboard/analytics')) return 'Analytics'
    if (pathname?.startsWith('/dashboard/files')) return 'Files'
    return 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-sm font-medium tracking-tight text-foreground">
            {getPageTitle()}
          </h1>
        </div>
      </div>
    </header>
  )
}
