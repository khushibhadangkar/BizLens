'use client'

import { useState } from 'react'
import { CircleAlert, FileText, ShieldCheck } from 'lucide-react'
import { novaRetail, type Claim } from '@/lib/bizlens-data'
import { EvidenceDrawer } from '@/components/landing/evidence-drawer'

export function TrustLayer() {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

  return (
    <section id="trust" className="border-y border-border bg-surface-muted/30 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="eyebrow">/ 02 TRUST LAYER</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
            Confidence, with <span className="font-serif italic font-normal text-foreground/80">receipts</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Open any atomic claim to inspect evidence, conflicts, and the verification sequence behind the answer.
          </p>
          <div className="mt-10 flex items-end gap-5">
            <span className="text-7xl font-bold tracking-tight text-foreground leading-none">{novaRetail.trust}%</span>
            <span className="pb-1 text-xs text-muted-foreground leading-tight">
              <span className="uppercase tracking-[0.18em]">Average Claim Confidence</span><br />
              Across current demo claims
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {novaRetail.claims.map((claim) => (
            <button 
              key={claim.id} 
              aria-label={`View evidence for: ${claim.label}`}
              onClick={() => setSelectedClaim(claim)} 
              className="glass-panel rounded-2xl p-6 text-left border border-border bg-surface transition-all hover:-translate-y-1 hover:border-border/80 hover:bg-surface-muted/50"
            >
              <div className="flex items-center justify-between">
                {claim.status === 'verified' ? <ShieldCheck className="size-5 text-success" /> : <CircleAlert className="size-5 text-warning" />}
                <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${claim.status === 'verified' ? 'text-success' : 'text-warning'}`}>
                  {claim.status}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-foreground">{claim.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {claim.value} · {claim.confidence}% confidence. Click to inspect.
              </p>
            </button>
          ))}

          <div className="glass-panel rounded-2xl p-6 border border-border bg-surface sm:col-span-2">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Source trail</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {novaRetail.sources.map((source) => (
                <span key={source.name} className={`rounded-full border px-4 py-1.5 text-xs flex items-center gap-2 ${source.status === 'verified' ? 'border-success/30 bg-success/5 text-success' : 'border-warning/30 bg-warning/5 text-warning'}`}>
                  {source.status === 'verified' ? <ShieldCheck className="size-3.5" /> : <CircleAlert className="size-3.5" />}
                  <span className="text-foreground/80">{source.name}</span> ({source.rows} rows)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* EVIDENCE DRAWER MODAL */}
      <EvidenceDrawer claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
    </section>
  )
}
