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
        <a href="#demo" className="transition hover:text-foreground">Platform</a>
        <a href="#trust" className="transition hover:text-foreground">Trust Layer</a>
        <a href="#demo" className="transition hover:text-foreground">Dashboard</a>
        <a href="#copilot" className="transition hover:text-foreground">AI Copilot</a>
      </nav>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden rounded-lg border border-border bg-primary px-4.5 py-2 text-[13.5px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90 sm:block"
        >
          Sign In
        </Link>
        <button aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="rounded-md border border-border p-2 text-muted-foreground lg:hidden hover:bg-surface-muted hover:text-foreground transition">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-20 flex flex-col gap-4 border-b border-border bg-background px-8 py-6 text-sm lg:hidden">
          <a href="#workspace" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#trust" onClick={() => setMenuOpen(false)}>Trust Layer</a>
          <a href="#workspace" onClick={() => setMenuOpen(false)}>Dashboard</a>
          <a href="#copilot" onClick={() => setMenuOpen(false)}>AI Copilot</a>
        </nav>
      )}
    </header>
  )
}
