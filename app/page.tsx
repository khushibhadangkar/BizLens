'use client'

import { useState } from 'react'
import { ChevronRight, Hexagon, Menu, ShieldCheck, X } from 'lucide-react'
import { BizLensScene } from '@/components/bizlens-scene'
import { BizLensDemo } from '@/components/bizlens-demo'

function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-foreground font-sans">
      {/* Navigation Header */}
      <header className="absolute inset-x-0 top-0 z-30 flex h-20 items-center justify-between px-6 md:px-12 lg:px-16">
        <a href="#top" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-white">
          <Hexagon className="size-6 text-white stroke-[1.75]" aria-hidden="true" />
          BizLens
        </a>
        <nav className="hidden items-center gap-10 text-[14px] font-medium text-zinc-400 lg:flex">
          <a href="#demo" className="transition hover:text-white">Platform</a>
          <a href="#trust" className="transition hover:text-white">Trust Layer</a>
          <a href="#demo" className="transition hover:text-white">Dashboard</a>
          <a href="#copilot" className="transition hover:text-white">Contact</a>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => scrollTo('demo')} 
            className="hidden rounded-lg border border-zinc-700/80 bg-[#18181c]/90 px-4.5 py-2 text-[13.5px] font-medium text-white shadow-sm transition hover:bg-zinc-800 hover:border-zinc-600 sm:block"
          >
            Try BizLens Free
          </button>
          <button aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)} className="rounded-md border border-zinc-800 p-2 text-zinc-300 lg:hidden">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="absolute left-0 right-0 top-20 flex flex-col gap-4 border-b border-zinc-800 bg-[#080808] px-8 py-6 text-sm lg:hidden">
            <a href="#demo" onClick={() => setMenuOpen(false)}>Platform</a>
            <a href="#trust" onClick={() => setMenuOpen(false)}>Trust Layer</a>
            <a href="#demo" onClick={() => setMenuOpen(false)}>Dashboard</a>
            <a href="#copilot" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section id="top" className="relative isolate min-h-screen bg-[#080808] pt-20">
        <BizLensScene />
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1600px] flex-col justify-between px-6 pb-12 pt-14 md:px-12 lg:px-16">
          {/* Top Info Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
            {/* Left Signal List */}
            <div className="hidden flex-col gap-3.5 text-[11.5px] uppercase tracking-[0.22em] text-zinc-400 md:flex">
              <span>/ &nbsp; DATA INTELLIGENCE</span>
              <span>/ &nbsp; TRUST VERIFICATION</span>
              <span>/ &nbsp; AI DECISION ENGINE</span>
            </div>

            {/* Right Paragraph */}
            <div className="md:ml-auto md:max-w-[380px] md:text-right text-[17px] leading-[1.45] text-zinc-100">
              Upload any spreadsheet or report. Get verified intelligence your team can act on.
            </div>
          </div>

          {/* Bottom Content Row */}
          <div className="mt-auto grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            {/* Main Headline & Subtext */}
            <div className="lg:col-span-8 max-w-[820px]">
              {/* Trusted Badge */}
              <div className="inline-flex items-center gap-3 rounded-r-md border border-zinc-800/80 bg-[#16171d]/90 py-1.5 pl-3 pr-4 text-[11px] uppercase tracking-[0.2em] text-zinc-300 backdrop-blur-md">
                <span className="h-3.5 w-[2px] rounded-full bg-white" />
                TRUSTED BY 200+ ENTERPRISE TEAMS
              </div>

              {/* Main Headline */}
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl lg:text-[76px]">
                See the signal.<br />
                Trust the decision.
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-[580px] text-base leading-relaxed text-zinc-400 sm:text-lg">
                BizLens transforms your Excel, CSV, and PDF files into verified dashboards, forecasts, and decisions — with every AI claim independently checked.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => scrollTo('demo')} 
                  className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-medium text-black transition hover:bg-zinc-200"
                >
                  Start Free Trial <ChevronRight className="size-4 text-black" />
                </button>
                <button 
                  onClick={() => scrollTo('copilot')} 
                  className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-[#222329] px-7 py-3.5 text-[14.5px] font-medium text-white transition hover:bg-zinc-800 hover:border-zinc-600"
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Trust Score Card */}
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="w-full max-w-[350px] rounded-2xl border border-zinc-800/90 bg-[#121319]/90 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  <ShieldCheck className="size-5 text-zinc-200 stroke-[1.75]" />
                  <span>TRUST SCORE</span>
                </div>
                <div className="mt-4 text-[58px] font-bold leading-none tracking-tight text-white">
                  96%
                </div>
                <p className="mt-2 text-[14px] text-zinc-400">
                  Verified Accuracy
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2.5">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-[#1b1c24]/70 py-3.5 px-2 text-center">
                    <b className="text-lg font-bold text-white leading-none">3</b>
                    <span className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-zinc-400">SOURCES</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-[#1b1c24]/70 py-3.5 px-2 text-center">
                    <b className="text-lg font-bold text-white leading-none">1.2s</b>
                    <span className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-zinc-400">ANALYSIS</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-[#1b1c24]/70 py-3.5 px-2 text-center">
                    <b className="text-lg font-bold text-white leading-none">24</b>
                    <span className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-zinc-400">INSIGHTS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BizLensDemo />

      <footer className="border-t border-zinc-800 bg-[#080808] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-zinc-400 sm:flex-row">
          <span>BizLens / Decision intelligence for teams</span>
          <span>Built for clarity, grounded in evidence.</span>
        </div>
      </footer>
    </main>
  )
}
