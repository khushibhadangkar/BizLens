'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ShieldCheck } from 'lucide-react'
import { AppSidebar } from '@/components/app/sidebar'
import { AppTopbar } from '@/components/app/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Not authenticated, redirect to login
        router.push('/login')
      } else {
        // Authenticated, allow access
        setLoading(false)
      }
    }

    checkSession()

    // Set up a listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Prevent flash of dashboard content before redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ShieldCheck className="h-8 w-8 text-gold animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AppTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
