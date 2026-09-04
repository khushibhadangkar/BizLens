import { ChevronRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/landing/header'
import { LiveWorkspace } from '@/components/landing/live-workspace'
import { TrustLayer } from '@/components/landing/trust-layer'
import { IntelligencePipeline } from '@/components/landing/intelligence-pipeline'
import { DecisionBrief } from '@/components/landing/decision-brief'
import { BizLensScene } from '@/components/bizlens-scene'
import { novaRetail } from '@/lib/bizlens-data'

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <Header />

      {/* Hero Section */}
      <section id="top" className="relative isolate min-h-[85vh] overflow-hidden bg-background pt-20">
        <BizLensScene />
        <div className="relative z-10 mx-auto flex min-h-[calc(85vh-80px)] max-w-[1600px] flex-col justify-between px-6 pb-10 pt-14 md:px-12 lg:px-16">
          {/* Top Info Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
            {/* Left Signal List */}
            <div className="hidden flex-col gap-3.5 text-[11.5px] uppercase tracking-[0.22em] text-muted-foreground md:flex">
              <span>/ &nbsp; DATA INTELLIGENCE</span>
              <span>/ &nbsp; TRUST VERIFICATION</span>
              <span>/ &nbsp; AI DECISION ENGINE</span>
            </div>

            {/* Right Paragraph */}
            <div className="md:ml-auto md:max-w-[380px] md:text-right text-[17px] leading-[1.45] text-foreground/90">
              Upload any spreadsheet or report. Get verified intelligence your team can act on.
            </div>
          </div>

          {/* Bottom Content Row */}
          <div className="mt-auto grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            {/* Main Headline & Subtext */}
            <div className="lg:col-span-8 max-w-[820px]">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-3 rounded-r-md border border-border bg-surface-muted/90 py-1.5 pl-3 pr-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md">
                <span className="h-3.5 w-[2px] rounded-full bg-accent" />
                VERIFIED DECISION ENGINE
              </div>

              {/* Main Headline */}
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl md:text-7xl lg:text-[76px]">
                See the signal.<br />
                Trust the decision.
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-[580px] text-base leading-relaxed text-muted-foreground sm:text-lg">
                BizLens transforms your Excel, CSV, and PDF files into verified dashboards, forecasts, and decisions — with every AI claim independently checked.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#workspace"
                  className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[14.5px] font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Explore BizLens <ChevronRight className="size-4" />
                </a>
                <a
                  href="#pipeline"
                  className="flex items-center gap-2 rounded-full border border-border bg-surface px-7 py-3.5 text-[14.5px] font-medium text-foreground transition hover:bg-surface-muted"
                >
                  See it live
                </a>
              </div>
            </div>

            {/* Right Trust Score Card */}
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="w-full max-w-[350px] rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <ShieldCheck className="size-5 text-success stroke-[1.75]" />
                  <span>AVERAGE CLAIM CONFIDENCE</span>
                </div>
                <div className="mt-4 text-[58px] font-bold leading-none tracking-tight text-foreground">
                  {novaRetail.trust}%
                </div>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  Demo verification
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2.5">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-muted/70 py-3.5 px-2 text-center">
                    <b className="text-lg font-bold text-foreground leading-none">{novaRetail.sources.length}</b>
                    <span className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">DEMO SOURCES</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-muted/70 py-3.5 px-2 text-center">
                    <b className="text-lg font-bold text-foreground leading-none">1.2s</b>
                    <span className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">SIMULATED</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-muted/70 py-3.5 px-2 text-center">
                    <b className="text-lg font-bold text-foreground leading-none">{novaRetail.claims.length}</b>
                    <span className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">MOCK CLAIMS</span>
                  </div>
                </div>

                <p className="mt-4 text-center text-[9.5px] font-mono text-muted-foreground/70 uppercase tracking-widest">
                  Live demo simulation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extracted Product Sections — ordered to tell the story: Workspace → Pipeline → Trust → Decision */}
      <LiveWorkspace />

      <IntelligencePipeline />
      <TrustLayer />
      <DecisionBrief />

      {/* Final Conversion Section */}
      <section className="relative overflow-hidden border-t border-border bg-surface-muted/30 py-16 md:py-24">
        {/* Abstract Background Visual */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="grid grid-cols-4 gap-8">
            <div className="size-32 rounded-xl bg-foreground/20 rotate-12 blur-2xl" />
            <div className="size-32 rounded-xl bg-foreground/20 -rotate-12 blur-2xl" />
            <div className="size-32 rounded-full bg-primary/20 rotate-45 blur-2xl" />
            <div className="size-32 rounded-full bg-success/20 rotate-90 blur-2xl" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-12">
          {/* Subtle Data Flow Graphic */}
          <div className="mb-10 flex justify-center items-center gap-4 text-muted-foreground/40">
            <div className="flex flex-col gap-1.5 items-end">
              <div className="h-0.5 w-8 rounded-full bg-border" />
              <div className="h-0.5 w-12 rounded-full bg-border" />
              <div className="h-0.5 w-6 rounded-full bg-border" />
            </div>
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
            <div className="relative flex items-center justify-center size-12 rounded-xl border border-success/30 bg-success/10 shadow-sm">
              <ShieldCheck className="size-6 text-success" />
              <div className="absolute -right-2 -top-2 size-4 rounded-full bg-success animate-pulse opacity-50" />
            </div>
            <div className="h-px w-12 bg-gradient-to-r from-border to-transparent" />
            <div className="flex flex-col gap-1.5 items-start">
              <div className="h-0.5 w-10 rounded-full bg-primary/50" />
              <div className="h-0.5 w-6 rounded-full bg-primary/50" />
            </div>
          </div>

          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
            Stop searching through data.<br />
            <span className="font-serif italic font-normal text-foreground/80">Start making decisions.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Upload your own data and experience the full BizLens intelligence workspace today.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-[15px] font-medium text-primary-foreground transition hover:opacity-90 shadow-xl"
            >
              Create Your Workspace <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-8 py-4 text-[15px] font-medium text-foreground transition hover:bg-surface-muted"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>BizLens / Decision intelligence for teams</span>
          <span>Built for clarity, grounded in evidence.</span>
        </div>
      </footer>
    </main>
  )
}
