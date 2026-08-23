'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronRight, Database, Download, FileSpreadsheet, LayoutDashboard, Play, ShieldCheck, Upload, X } from 'lucide-react'
import { departmentExpenses, novaRetail, parsedLedgerData, rawCsvDatasets, workflowDescriptions, workflowSteps } from '@/lib/bizlens-data'

export function LiveWorkspace() {
  const [files, setFiles] = useState<string[]>(['q3_finance_ledger.csv', 'crm_export_q3.csv', 'board_report.pdf'])
  const [activeStep, setActiveStep] = useState(1)
  
  // Live Dashboard & Database Controls
  const [demoTab, setDemoTab] = useState<'dashboard' | 'csv'>('dashboard')
  const [selectedCsvKey, setSelectedCsvKey] = useState<keyof typeof rawCsvDatasets>('financialLedger')
  const [rawViewMode, setRawViewMode] = useState<'table' | 'raw'>('table')

  const status = useMemo(() => `${files.length} sources active · CSV database indexed`, [files])

  // Live KPI Summary Metrics
  const kpiMetrics = useMemo(() => {
    const verifiedRows = parsedLedgerData.filter((r) => r.status === 'verified')
    const totalRev = verifiedRows.reduce((acc, r) => acc + r.revenue, 0)
    const totalExp = verifiedRows.reduce((acc, r) => acc + r.expense, 0)
    const netProfit = totalRev - totalExp
    const marginPct = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : '0.0'
    const conflictCount = parsedLedgerData.filter((r) => r.status === 'conflict').length

    return {
      totalRev: `$${(totalRev / 1000000).toFixed(2)}M`,
      totalExp: `$${(totalExp / 1000).toFixed(0)}k`,
      netProfit: `$${(netProfit / 1000000).toFixed(2)}M`,
      marginPct: `${marginPct}%`,
      conflictCount,
    }
  }, [])

  function loadDataset() { 
    setFiles(['q3_finance_ledger.csv', 'crm_export_q3.csv', 'board_report.pdf'])
    setActiveStep(1) 
  }

  function addFiles(list: FileList | null) { 
    if (!list) return
    const names = Array.from(list).filter((file) => /\.(csv|xlsx?|pdf)$/i.test(file.name)).map((file) => file.name)
    if (names.length) { 
      setFiles((current) => [...new Set([...current, ...names])])
      setActiveStep(1) 
    } 
  }

  function downloadCsvData() {
    const csvContent = "data:text/csv;charset=utf-8," + rawCsvDatasets.financialLedger
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "bizlens_verified_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section id="workspace" className="mx-auto max-w-7xl px-6 py-24 md:px-12 lg:py-36">
      <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-start">
        {/* Left Column Controls */}
        <div>
          <p className="eyebrow">/ 01 LIVE WORKSPACE & DATABASE</p>
          <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
            From raw CSV files to a decision you can <span className="font-serif italic font-normal text-foreground/80">defend</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Upload any spreadsheet. BizLens indexes the data, builds a live dashboard, and lets you inspect every raw record.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button 
              onClick={loadDataset} 
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 shadow-md"
            >
              <Play className="size-4 fill-current text-primary-foreground" /> Reload CSV Dataset
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-medium text-foreground transition hover:bg-surface-muted hover:border-border">
              <input className="sr-only" type="file" multiple accept=".csv,.xlsx,.xls,.pdf" onChange={(e) => addFiles(e.target.files)} />
              <Upload className="size-4" /> Upload Custom CSV
            </label>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="flex size-2 rounded-full bg-success animate-pulse" />
            <span>{status}</span>
          </div>

          {files.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {files.map((file) => (
                <span key={file} className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3.5 py-1.5 text-xs text-foreground/80">
                  <FileSpreadsheet className="size-3.5 text-muted-foreground" />
                  {file}
                  <button aria-label={`Remove ${file}`} onClick={() => setFiles(files.filter((item) => item !== file))}>
                    <X className="size-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Multi-Tab Functional Dashboard */}
        <div className="glass-panel overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-xl backdrop-blur-xl transition-all duration-300">
          {/* Dashboard Header Bar & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/80 px-5 py-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDemoTab('dashboard')} 
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${demoTab === 'dashboard' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutDashboard className="size-3.5" /> Dashboard
              </button>
              <button 
                onClick={() => setDemoTab('csv')} 
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${demoTab === 'csv' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Database className="size-3.5" /> Raw CSV
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={downloadCsvData}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-surface-muted hover:text-foreground transition"
              >
                <Download className="size-3.5" /> Export CSV
              </button>
              <span className="status-pill success">
                <ShieldCheck className="size-3.5" /> Verified
              </span>
            </div>
          </div>

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {demoTab === 'dashboard' && (
            <div className="p-6">
              {/* KPI Cards */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                  <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">{kpiMetrics.totalRev}</p>
                  <p className="mt-1 text-[11px] text-success font-medium">+18.6% YoY</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Operating Margin</p>
                  <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">{kpiMetrics.marginPct}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Net Profit {kpiMetrics.netProfit}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Accuracy Score</p>
                  <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">96%</p>
                  <p className="mt-1 text-[11px] text-success font-medium">Independent Check</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Flagged Conflicts</p>
                  <p className="mt-2 text-2xl font-bold text-warning tracking-tight">{kpiMetrics.conflictCount}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">$184k Renewal Gap</p>
                </div>
              </div>

              {/* Chart & Breakdown */}
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Revenue & Forecast Trend ($k)</p>
                    <span className="text-[10px] text-muted-foreground font-mono">Q3 - Q4 2024</span>
                  </div>
                  <div className="h-52 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={novaRetail.forecast}>
                        <defs>
                          <linearGradient id="signal" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} width={36} />
                        <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-foreground)' }} />
                        <Area type="monotone" dataKey="actual" stroke="var(--color-accent)" fill="url(#signal)" strokeWidth={2} name="Actual Rev ($k)" />
                        <Area type="monotone" dataKey="forecast" stroke="var(--color-muted-foreground)" fill="none" strokeDasharray="4 4" strokeWidth={1.5} name="Forecast ($k)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground pb-2">Department Expenses</p>
                  <div className="h-52 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentExpenses}>
                        <CartesianGrid stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="dept" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} width={30} />
                        <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-foreground)' }} />
                        <Bar dataKey="exp" fill="var(--color-accent)" radius={[6, 6, 0, 0]} name="Expense ($k)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RAW CSV DATABASE BROWSER */}
          {demoTab === 'csv' && (
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedCsvKey('financialLedger')} 
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${selectedCsvKey === 'financialLedger' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'border border-border bg-surface-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    q3_finance_ledger.csv
                  </button>
                  <button 
                    onClick={() => setSelectedCsvKey('crmDeals')} 
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${selectedCsvKey === 'crmDeals' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'border border-border bg-surface-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    crm_export_q3.csv
                  </button>
                  <button 
                    onClick={() => setSelectedCsvKey('auditLog')} 
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${selectedCsvKey === 'auditLog' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'border border-border bg-surface-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    ai_audit_log.csv
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setRawViewMode('table')} 
                    className={`rounded-md px-2.5 py-1 text-xs transition ${rawViewMode === 'table' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
                  >
                    Table
                  </button>
                  <button 
                    onClick={() => setRawViewMode('raw')} 
                    className={`rounded-md px-2.5 py-1 text-xs transition ${rawViewMode === 'raw' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
                  >
                    Raw Text
                  </button>
                </div>
              </div>

              {rawViewMode === 'raw' ? (
                <pre className="overflow-x-auto rounded-xl border border-border bg-surface-muted p-4 text-xs font-mono text-foreground/80 leading-relaxed shadow-inner">
                  {rawCsvDatasets[selectedCsvKey]}
                </pre>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm max-w-full">
                  <table className="w-full text-left text-xs font-mono min-w-max">
                    <thead className="bg-surface-muted font-bold text-foreground border-b border-border">
                      <tr>
                        <th className="p-2.5 text-muted-foreground w-10 text-center select-none border-r border-border bg-surface-muted/30">#</th>
                        {rawCsvDatasets[selectedCsvKey].split('\n')[0].split(',').map((cell, cIdx) => (
                          <th key={cIdx} className="p-2.5">{cell}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground/80">
                      {rawCsvDatasets[selectedCsvKey].split('\n').slice(1).map((line, idx) => (
                        <tr key={idx} className="hover:bg-surface-muted/50">
                          <td className="p-2.5 text-muted-foreground w-10 text-center select-none border-r border-border bg-surface-muted/30">{idx + 1}</td>
                          {line.split(',').map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Workflow Step Bar */}
      <div className="mt-12 flex overflow-x-auto gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm snap-x">
        {workflowSteps.map((step, i) => (
          <button 
            key={step} 
            onClick={() => setActiveStep(i)} 
            className={`step-button whitespace-nowrap snap-start shrink-0 ${activeStep === i ? 'step-active' : ''}`}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            <span className="truncate">{step}</span>
            {i < workflowSteps.length - 1 && <ChevronRight className="size-4 ml-2 text-muted-foreground/50" />}
          </button>
        ))}
      </div>

      <motion.div 
        key={activeStep} 
        initial={{ opacity: 0, y: 6 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mt-5 rounded-xl border border-border bg-surface p-5 text-sm text-foreground/80 shadow-sm"
      >
        <span className="font-semibold text-foreground">{workflowSteps[activeStep]}:</span>{' '}
        {workflowDescriptions[activeStep]}
      </motion.div>
    </section>
  )
}
