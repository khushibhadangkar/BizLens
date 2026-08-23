'use client'

import { useState } from 'react'

import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { novaRetail, type Claim } from '@/lib/bizlens-data'
import { EvidenceDrawer } from '@/components/landing/evidence-drawer'

export function DecisionBrief() {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  function verifyClaim(claim: Claim) {
    setSelectedClaim(claim)
  }

  return (
    <>
      <section className="border-t border-border bg-background py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">/ 06 DECISION BRIEF</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
              Make the next move <span className="font-serif italic font-normal text-foreground/80">obvious</span>.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              The final output is not another dashboard. It is a concise, sourced brief your team can act on.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div>
                <p className="font-semibold text-foreground text-base">Nova Retail Group / Decision brief</p>
                <p className="text-xs text-muted-foreground">Prepared from verified Q3 evidence</p>
              </div>
              <ArrowUpRight className="size-5 text-foreground/80" />
            </div>

            <div className="grid gap-4 py-8 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-muted/50 p-4.5">
                <p className="eyebrow text-[10px]">Signal</p>
                <p className="mt-2 text-lg font-medium text-foreground">Growth is real</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted/50 p-4.5">
                <p className="eyebrow text-[10px]">Risk</p>
                <p className="mt-2 text-lg font-medium text-foreground">Renewals conflict</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted/50 p-4.5">
                <p className="eyebrow text-[10px]">Action</p>
                <p className="mt-2 text-lg font-medium text-foreground">Prioritize enterprise</p>
              </div>
            </div>

            <button 
              onClick={() => novaRetail.claims[0] && verifyClaim(novaRetail.claims[0])} 
              className="flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 shadow-md"
            >
              Verify this insight <ShieldCheck className="size-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </section>

      {/* EVIDENCE DRAWER MODAL */}
      <EvidenceDrawer claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
    </>
  )
}
