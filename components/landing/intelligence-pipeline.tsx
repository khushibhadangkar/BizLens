'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Award, CheckCircle2, Cpu, Database, FileSpreadsheet, ShieldCheck, Sparkles, Zap } from 'lucide-react'

export function IntelligencePipeline() {
  const [pipelineScenario, setPipelineScenario] = useState<'verified' | 'conflict'>('verified')
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0)

  return (
    <section id="pipeline" className="bg-surface-muted/30 py-16 md:py-24">
      {/* Section connector — visually bridges from the Workspace above */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex items-center gap-4 pb-12 md:pb-16">
          <div className="flex-1 border-t border-dashed border-border/60" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">How it works</span>
          <div className="flex-1 border-t border-dashed border-border/60" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Section Header & Scenario Selector */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="eyebrow">/ 02 INTELLIGENCE PIPELINE</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
              Real-time Autonomous <span className="font-serif italic font-normal text-foreground/80">Verification Engine</span>.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Every dashboard you see above is produced by this pipeline. Each step is deterministic, auditable, and independently verifiable.
            </p>
          </div>

          {/* Scenario Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => { setPipelineScenario('verified'); setActiveNodeIndex(5) }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${pipelineScenario === 'verified' ? 'border-success/50 bg-success/10 text-success ring-2 ring-success/30' : 'border-border bg-surface-muted text-muted-foreground hover:text-foreground'}`}
            >
              <CheckCircle2 className="size-3.5" /> Scenario A: Verified Claim
            </button>
            <button 
              onClick={() => { setPipelineScenario('conflict'); setActiveNodeIndex(5) }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${pipelineScenario === 'conflict' ? 'border-warning/50 bg-warning/10 text-warning ring-2 ring-warning/30' : 'border-border bg-surface-muted text-muted-foreground hover:text-foreground'}`}
            >
              <AlertTriangle className="size-3.5" /> Scenario B: Conflict Flag
            </button>
          </div>
        </div>

        {/* Interactive Pipeline Node Map */}
        <div className="mt-10 rounded-2xl border border-border bg-surface p-5 md:p-7 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="size-4 text-success animate-pulse" /> Live Pipeline Dataflow Execution
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              Active: <span className="text-foreground font-bold">{['01 Upload', '02 Analyze', '03 Discover', '04 Insights', '05 Verify', '06 Decide'][activeNodeIndex]}</span>
            </span>
          </div>

          {/* 6 Connected Nodes Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: '01 Upload', sub: 'Ingestion & Parse', icon: FileSpreadsheet },
              { label: '02 Analyze', sub: 'Data Normalization', icon: Cpu },
              { label: '03 Discover', sub: 'Fact Extraction', icon: Database },
              { label: '04 Insights', sub: 'Metrics Engine', icon: Sparkles },
              { label: '05 Verify', sub: 'Logic Audit', icon: ShieldCheck },
              { label: '06 Decide', sub: 'Verified / Conflict', icon: Award },
            ].map((node, idx) => {
              const IconComp = node.icon
              const isActive = activeNodeIndex === idx
              const isPast = activeNodeIndex >= idx

              return (
                <button
                  key={node.label}
                  onClick={() => setActiveNodeIndex(idx)}
                  className={`group relative flex flex-col items-center justify-between rounded-xl p-4 text-center transition-all duration-300 ${isActive ? 'border-2 border-primary bg-primary/5 shadow-md scale-[1.03]' : isPast ? 'border border-border/80 bg-surface-muted/50' : 'border border-border/40 bg-surface-muted/30 opacity-60 hover:opacity-100 hover:border-border/80'}`}
                >
                  <div className="flex items-center justify-center size-10 rounded-xl border border-border bg-surface group-hover:scale-110 transition shadow-sm">
                    <IconComp className={`size-5 ${isActive ? 'text-primary' : isPast ? 'text-foreground/80' : 'text-muted-foreground'}`} />
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-bold text-foreground block">{node.label}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{node.sub}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-center text-xs">
                    {isActive ? (
                      <span className="text-primary font-bold">●</span>
                    ) : isPast ? (
                      <span className="text-success font-bold">✓</span>
                    ) : (
                      <span className="text-muted-foreground/50">○</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Pipeline Result Panel */}
          <div className="mt-8 pt-6 border-t border-border">
            {pipelineScenario === 'verified' ? (
              <motion.div 
                key="verified"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border-2 border-success/40 bg-success/5 p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-success">
                    <CheckCircle2 className="size-4 text-success" /> VERIFIED CLAIM
                  </span>
                  <span className="font-mono text-2xl font-bold text-success">96% CONFIDENCE</span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-foreground">&quot;Revenue increased 18.6% to $2.84M in Q3 2024.&quot;</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  Math check: ($2.84M − $2.39M) / $2.39M = +18.8% growth, confirmed across 2 independent sources within 0.2% tolerance.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-success/20 text-[11px] font-mono">
                  <span className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-success">q3_finance_ledger.csv · Row 2</span>
                  <span className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-success">crm_export_q3.csv · Deals 801-803</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="conflict"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border-2 border-warning/40 bg-warning/5 p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-warning">
                    <AlertTriangle className="size-4 text-warning" /> CONFLICT DETECTED
                  </span>
                  <span className="font-mono text-2xl font-bold text-warning">61% CONFIDENCE</span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-foreground">&quot;Enterprise Renewal Timing Discrepancy ($184,000)&quot;</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  Source Disagreement: CRM export lists renewal in Q3 2024 (Deal #804), but Board Minutes (Page 7) mark it pushed to Q4 2024.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-warning/20 text-[11px] font-mono">
                  <span className="rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1 text-warning">crm_export_q3.csv (Q3 2024)</span>
                  <span className="rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1 text-warning">board_report.pdf (Q4 2024)</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
