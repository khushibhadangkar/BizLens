'use client'

import { useState } from 'react'
import { Hexagon, Menu, X } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 md:px-12 lg:px-16 bg-background/80 backdrop-blur-md border-b border-border/50">
      <a href="#top" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-foreground">
        <Hexagon className="size-6 text-accent stroke-[1.75]" aria-hidden="true" />
        BizLens
      </a>
      <nav className="hidden items-center gap-10 text-[14px] font-medium text-muted-foreground lg:flex">
        <a href="#workspace" className="transition hover:text-foreground">Platform</a>
        <a href="#trust" className="transition hover:text-foreground">Trust Layer</a>
      </nav>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden text-[13.5px] font-medium text-muted-foreground transition hover:text-foreground sm:block"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="hidden rounded-lg border border-border bg-primary px-4.5 py-2 text-[13.5px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90 sm:block"
        >
          Get Started
        </Link>
        <button aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="rounded-md border border-border p-2 text-muted-foreground lg:hidden hover:bg-surface-muted hover:text-foreground transition">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-20 flex flex-col gap-4 border-b border-border bg-background px-8 py-6 text-sm lg:hidden">
          <a href="#workspace" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#trust" onClick={() => setMenuOpen(false)}>Trust Layer</a>
          <Link href="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} className="text-primary font-medium">Get Started</Link>
        </nav>
      )}
    </header>
  )
}
