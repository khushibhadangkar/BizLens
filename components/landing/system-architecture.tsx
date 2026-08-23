import { Code, Database, ShieldCheck, Sparkles } from 'lucide-react'

export function SystemArchitecture() {
  return (
    <section className="border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow">/ 05 SYSTEM ARCHITECTURE</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
              Engineered with <span className="font-serif italic font-normal text-foreground/80">production-grade</span> AI & ML.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Built on a enterprise multi-agent stack: React, TypeScript, FastAPI, Supabase, Gemini API, LangGraph, LlamaIndex, ChromaDB, Pandas, SHAP, and Vercel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-surface-muted px-4 py-1.5 font-mono text-xs text-foreground/80">
              TypeScript Next.js · Python FastAPI
            </span>
          </div>
        </div>

        {/* Tech Stack Pillar Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1: AI & Multi-Agent */}
          <div className="glass-panel rounded-2xl p-6 border border-border bg-surface hover:border-border/80 transition shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">01 / AI & Multi-Agent</span>
              <Sparkles className="size-4 text-accent" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Agentic Reasoning</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Autonomous multi-agent claim verification and hybrid vector retrieval.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-accent/20 bg-accent/10 px-2.5 py-1 text-accent">Google Gemini API</span>
              <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-600">LangGraph</span>
              <span className="rounded-md border border-warning/20 bg-warning/10 px-2.5 py-1 text-warning">LlamaIndex RAG</span>
              <span className="rounded-md border border-success/20 bg-success/10 px-2.5 py-1 text-success">ChromaDB Vector Store</span>
            </div>
          </div>

          {/* Pillar 2: Backend & Data Engine */}
          <div className="glass-panel rounded-2xl p-6 border border-border bg-surface hover:border-border/80 transition shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-success uppercase tracking-wider">02 / Backend & DB</span>
              <Database className="size-4 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Data Pipeline</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Async data extraction, CSV streaming, and PostgreSQL database logic.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-success/20 bg-success/10 px-2.5 py-1 text-success">FastAPI (Python)</span>
              <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-600">Supabase Postgres</span>
              <span className="rounded-md border border-accent/20 bg-accent/10 px-2.5 py-1 text-accent">Pandas & NumPy</span>
              <span className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-foreground/80">Render Infra</span>
            </div>
          </div>

          {/* Pillar 3: ML & Explainability */}
          <div className="glass-panel rounded-2xl p-6 border border-border bg-surface hover:border-border/80 transition shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-warning uppercase tracking-wider">03 / Explainable ML</span>
              <ShieldCheck className="size-4 text-warning" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Feature Attribution</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              SHAP feature importance scoring and Scikit-learn predictive forecasting.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-warning/20 bg-warning/10 px-2.5 py-1 text-warning">SHAP Explainability</span>
              <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-orange-600">Scikit-learn ML</span>
              <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-indigo-600">Plotly & Chart.js</span>
            </div>
          </div>

          {/* Pillar 4: Frontend & Edge Deployment */}
          <div className="glass-panel rounded-2xl p-6 border border-border bg-surface hover:border-border/80 transition shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-600 uppercase tracking-wider">04 / Frontend & Edge</span>
              <Code className="size-4 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Client Interface</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Type-safe React client with Tailwind styling and global Vercel CDN deployment.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-600">React 19 & TypeScript</span>
              <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-600">Tailwind CSS</span>
              <span className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-foreground/80">Vercel Edge</span>
            </div>
          </div>
        </div>

        {/* Live Architecture Dataflow Pipeline diagram */}
        <div className="mt-10 rounded-2xl border border-border bg-surface-muted/30 p-6 shadow-sm">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            ⚡ Live End-to-End Pipeline Execution Flow
          </p>

          <div className="grid gap-3 md:grid-cols-5 text-center text-xs font-mono">
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[10px] text-muted-foreground block mb-1">01 / INGESTION</span>
              <span className="text-foreground font-semibold block">Pandas + LlamaIndex</span>
              <span className="text-[10px] text-muted-foreground">CSV & PDF Parsing</span>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[10px] text-muted-foreground block mb-1">02 / VECTORIZATION</span>
              <span className="text-foreground font-semibold block">ChromaDB Store</span>
              <span className="text-[10px] text-muted-foreground">384-dim Embeddings</span>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[10px] text-muted-foreground block mb-1">03 / ORCHESTRATION</span>
              <span className="text-foreground font-semibold block">LangGraph + Gemini</span>
              <span className="text-[10px] text-muted-foreground">Multi-Agent Loops</span>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[10px] text-muted-foreground block mb-1">04 / EXPLAINABILITY</span>
              <span className="text-foreground font-semibold block">SHAP + Scikit-learn</span>
              <span className="text-[10px] text-muted-foreground">Feature Importance</span>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[10px] text-muted-foreground block mb-1">05 / API & CLIENT</span>
              <span className="text-foreground font-semibold block">FastAPI ➔ React</span>
              <span className="text-[10px] text-muted-foreground">Supabase Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
