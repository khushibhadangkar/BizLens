'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowUpRight, Check, ChevronRight, CircleAlert, Code, Database, Download, FileSpreadsheet, FileText, Filter, LayoutDashboard, MessageCircle, Play, Search, ShieldCheck, Sparkles, Terminal, Upload, X, AlertTriangle, Award, CheckCircle2, Cpu, Zap } from 'lucide-react'
import { copilotAnswers, novaRetail, parsedLedgerData, rawCsvDatasets, sampleQueries, workflowSteps, type Claim, type LedgerRow } from '@/lib/bizlens-data'

const questions = Object.keys(copilotAnswers)

export function BizLensDemo() {
  const [files, setFiles] = useState<string[]>(['q3_finance_ledger.csv', 'crm_export_q3.csv', 'board_report.pdf'])
  const [activeStep, setActiveStep] = useState(1)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [verified, setVerified] = useState(false)
  const [verificationRunning, setVerificationRunning] = useState(false)
  const [verificationStep, setVerificationStep] = useState(-1)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask a question and BizLens will trace the answer back to the verified source trail.')

  // Live Dashboard & Database Controls
  const [demoTab, setDemoTab] = useState<'dashboard' | 'csv' | 'sql' | 'audit'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCsvKey, setSelectedCsvKey] = useState<keyof typeof rawCsvDatasets>('financialLedger')
  const [rawViewMode, setRawViewMode] = useState<'table' | 'raw'>('table')
  const [sqlQuery, setSqlQuery] = useState(sampleQueries[0].query)
  const [sqlResults, setSqlResults] = useState<{ count: number; data: Partial<LedgerRow>[]; executionTime: string }>({
    count: 6,
    data: parsedLedgerData.filter((r) => r.status === 'verified'),
    executionTime: '0.42ms'
  })

  // Live Intelligence Engine Controls
  const [pipelineScenario, setPipelineScenario] = useState<'verified' | 'conflict'>('verified')
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(5)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  function runPipelineSimulation() {
    setIsSimulating(true)
    setActiveNodeIndex(0)
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step <= 5) {
        setActiveNodeIndex(step)
      } else {
        clearInterval(interval)
        setIsSimulating(false)
      }
    }, 850)
  }


  const hasDataset = files.length > 0
  const status = useMemo(() => `${files.length} sources active · CSV database indexed`, [files])

  // Filtered Ledger Data calculation
  const filteredLedger = useMemo(() => {
    return parsedLedgerData.filter((row) => {
      const matchesSearch = searchQuery === '' || 
        row.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.source_file.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDept = deptFilter === 'all' || row.department.toLowerCase() === deptFilter.toLowerCase()
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [searchQuery, deptFilter, statusFilter])

  // Live KPI Summary Metrics
  const kpiMetrics = useMemo(() => {
    const verifiedRows = filteredLedger.filter((r) => r.status === 'verified')
    const totalRev = verifiedRows.reduce((acc, r) => acc + r.revenue, 0)
    const totalExp = verifiedRows.reduce((acc, r) => acc + r.expense, 0)
    const netProfit = totalRev - totalExp
    const marginPct = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : '0.0'
    const conflictCount = filteredLedger.filter((r) => r.status === 'conflict').length

    return {
      totalRev: `$${(totalRev / 1000000).toFixed(2)}M`,
      totalExp: `$${(totalExp / 1000).toFixed(0)}k`,
      netProfit: `$${(netProfit / 1000000).toFixed(2)}M`,
      marginPct: `${marginPct}%`,
      conflictCount,
    }
  }, [filteredLedger])

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

  function runCustomSql(queryText: string) {
    setSqlQuery(queryText)
    const lower = queryText.toLowerCase()
    let resultRows = parsedLedgerData

    if (lower.includes("status = 'verified'")) {
      resultRows = parsedLedgerData.filter((r) => r.status === 'verified')
    } else if (lower.includes("status = 'conflict'")) {
      resultRows = parsedLedgerData.filter((r) => r.status === 'conflict')
    } else if (lower.includes('department')) {
      resultRows = parsedLedgerData.filter((r) => r.department === 'Sales' || r.department === 'Marketing')
    }

    setSqlResults({
      count: resultRows.length,
      data: resultRows,
      executionTime: `${(Math.random() * 0.3 + 0.2).toFixed(2)}ms`
    })
  }

  function verifyClaim(claim: Claim) {
    setSelectedClaim(claim)
    setVerified(false)
    setVerificationRunning(true)
    setVerificationStep(0)
    let step = 0
    const timer = window.setInterval(() => {
      step += 1
      setVerificationStep(step)
      if (step >= 3) {
        window.clearInterval(timer)
        setVerificationRunning(false)
        setVerified(true)
      }
    }, 650)
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

  return <>
    {/* 01 / LIVE WORKSPACE & DASHBOARD */}
    <section id="demo" className="mx-auto max-w-7xl px-6 py-24 md:px-12 lg:py-36">
      <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-start">
        {/* Left Column Controls */}
        <div>
          <p className="eyebrow">/ 01 LIVE WORKSPACE & DATABASE</p>
          <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl leading-[1.05]">
            From raw CSV files to a decision you can <span className="font-serif italic font-normal text-white">defend</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
            Fully functional live demo powered by indexed CSV database files. Filter transactions, inspect raw CSV code, or run live SQL queries.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button 
              onClick={loadDataset} 
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-zinc-200 shadow-md"
            >
              <Play className="size-4 fill-current text-black" /> Reload CSV Dataset
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700/60 bg-[#181920] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 hover:border-zinc-600">
              <input className="sr-only" type="file" multiple accept=".csv,.xlsx,.xls,.pdf" onChange={(e) => addFiles(e.target.files)} />
              <Upload className="size-4" /> Upload Custom CSV
            </label>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{status}</span>
          </div>

          {files.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {files.map((file) => (
                <span key={file} className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#161720] px-3.5 py-1.5 text-xs text-zinc-300">
                  <FileSpreadsheet className="size-3.5 text-zinc-400" />
                  {file}
                  <button aria-label={`Remove ${file}`} onClick={() => setFiles(files.filter((item) => item !== file))}>
                    <X className="size-3 text-zinc-500 hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Quick Query Actions */}
          <div className="mt-8 rounded-xl border border-zinc-800/80 bg-[#121319]/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Terminal className="size-4 text-zinc-300" /> Quick SQL Query Templates
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {sampleQueries.map((q) => (
                <button 
                  key={q.name} 
                  onClick={() => { setDemoTab('sql'); runCustomSql(q.query) }} 
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#171822] px-3.5 py-2.5 text-left text-xs text-zinc-300 hover:border-zinc-600 hover:text-white transition"
                >
                  <span className="font-medium">{q.name}</span>
                  <ChevronRight className="size-3.5 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Tab Functional Dashboard */}
        <motion.div layout className="glass-panel overflow-hidden rounded-2xl border border-zinc-800/90 bg-[#121319]/90 shadow-2xl backdrop-blur-xl">
          {/* Dashboard Header Bar & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-[#171821]/80 px-5 py-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDemoTab('dashboard')} 
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${demoTab === 'dashboard' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
              >
                <LayoutDashboard className="size-3.5" /> Dashboard
              </button>
              <button 
                onClick={() => setDemoTab('csv')} 
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${demoTab === 'csv' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
              >
                <Database className="size-3.5" /> Raw CSV
              </button>
              <button 
                onClick={() => setDemoTab('sql')} 
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${demoTab === 'sql' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
              >
                <Code className="size-3.5" /> SQL Engine
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={downloadCsvData}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-[#181920] px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                <Download className="size-3.5" /> Export CSV
              </button>
              <span className="status-pill">
                <ShieldCheck className="size-3.5" /> Verified
              </span>
            </div>
          </div>

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {demoTab === 'dashboard' && (
            <div className="p-6">
              {/* KPI Cards */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-xl border border-zinc-800/80 bg-[#1b1c24]/70 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Total Revenue</p>
                  <p className="mt-2 text-2xl font-bold text-white tracking-tight">{kpiMetrics.totalRev}</p>
                  <p className="mt-1 text-[11px] text-emerald-400 font-medium">+18.6% YoY</p>
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-[#1b1c24]/70 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Operating Margin</p>
                  <p className="mt-2 text-2xl font-bold text-white tracking-tight">{kpiMetrics.marginPct}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Net Profit {kpiMetrics.netProfit}</p>
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-[#1b1c24]/70 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Accuracy Score</p>
                  <p className="mt-2 text-2xl font-bold text-white tracking-tight">96%</p>
                  <p className="mt-1 text-[11px] text-emerald-400 font-medium">Independent Check</p>
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-[#1b1c24]/70 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Flagged Conflicts</p>
                  <p className="mt-2 text-2xl font-bold text-amber-400 tracking-tight">{kpiMetrics.conflictCount}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">$184k Renewal Gap</p>
                </div>
              </div>

              {/* Chart & Breakdown */}
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-[#161720]/80 p-4">
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Revenue & Forecast Trend ($k)</p>
                    <span className="text-[10px] text-zinc-500 font-mono">Q3 - Q4 2024</span>
                  </div>
                  <div className="h-52 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={novaRetail.forecast}>
                        <defs>
                          <linearGradient id="signal" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="month" stroke="#71717a" tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" tickLine={false} axisLine={false} width={36} />
                        <Tooltip contentStyle={{ background: '#121319', border: '1px solid #27272a', borderRadius: 12, color: '#ffffff' }} />
                        <Area type="monotone" dataKey="actual" stroke="#ffffff" fill="url(#signal)" strokeWidth={2} name="Actual Rev ($k)" />
                        <Area type="monotone" dataKey="forecast" stroke="#a1a1aa" fill="none" strokeDasharray="4 4" strokeWidth={1.5} name="Forecast ($k)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-[#161720]/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300 pb-2">Department Expenses</p>
                  <div className="h-52 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { dept: 'Sales', exp: 440 },
                        { dept: 'Mktg', exp: 165 },
                        { dept: 'Eng', exp: 84 },
                        { dept: 'Consult', exp: 95 },
                      ]}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="dept" stroke="#71717a" tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" tickLine={false} axisLine={false} width={30} />
                        <Tooltip contentStyle={{ background: '#121319', border: '1px solid #27272a', borderRadius: 12, color: '#ffffff' }} />
                        <Bar dataKey="exp" fill="#e4e4e7" radius={[6, 6, 0, 0]} name="Expense ($k)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Filters & Live Ledger Data Table */}
              <div className="mt-6 border-t border-zinc-800/80 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Verified Ledger Records ({filteredLedger.length})</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-500" />
                      <input 
                        type="text"
                        placeholder="Search ledger..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg border border-zinc-800 bg-[#161720] pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                      />
                    </div>

                    <select 
                      value={deptFilter} 
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="rounded-lg border border-zinc-800 bg-[#161720] px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="all">All Depts</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Consulting">Consulting</option>
                    </select>

                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-zinc-800 bg-[#161720] px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="verified">Verified Only</option>
                      <option value="conflict">Conflicts Only</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#161720]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-800 bg-[#1c1d27] text-zinc-400 font-mono text-[10.5px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">TX ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Dept</th>
                        <th className="p-3">Revenue</th>
                        <th className="p-3">Expense</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Source File</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {filteredLedger.map((row) => (
                        <tr key={row.transaction_id} className="hover:bg-[#1f202b] transition">
                          <td className="p-3 font-mono font-medium text-white">{row.transaction_id}</td>
                          <td className="p-3 text-zinc-400">{row.date}</td>
                          <td className="p-3 font-medium text-white">{row.category}</td>
                          <td className="p-3 text-zinc-400">{row.department}</td>
                          <td className="p-3 font-semibold text-white">${row.revenue.toLocaleString()}</td>
                          <td className="p-3 text-zinc-400">${row.expense.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${row.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {row.status === 'verified' ? <Check className="size-3" /> : <CircleAlert className="size-3" />}
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-zinc-400">{row.source_file}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${selectedCsvKey === 'financialLedger' ? 'bg-white text-black font-semibold' : 'border border-zinc-800 bg-[#161720] text-zinc-400 hover:text-white'}`}
                  >
                    q3_finance_ledger.csv
                  </button>
                  <button 
                    onClick={() => setSelectedCsvKey('crmDeals')} 
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${selectedCsvKey === 'crmDeals' ? 'bg-white text-black font-semibold' : 'border border-zinc-800 bg-[#161720] text-zinc-400 hover:text-white'}`}
                  >
                    crm_export_q3.csv
                  </button>
                  <button 
                    onClick={() => setSelectedCsvKey('auditLog')} 
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${selectedCsvKey === 'auditLog' ? 'bg-white text-black font-semibold' : 'border border-zinc-800 bg-[#161720] text-zinc-400 hover:text-white'}`}
                  >
                    ai_audit_log.csv
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setRawViewMode('table')} 
                    className={`rounded-md px-2.5 py-1 text-xs transition ${rawViewMode === 'table' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
                  >
                    Table
                  </button>
                  <button 
                    onClick={() => setRawViewMode('raw')} 
                    className={`rounded-md px-2.5 py-1 text-xs transition ${rawViewMode === 'raw' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
                  >
                    Raw Text
                  </button>
                </div>
              </div>

              {rawViewMode === 'raw' ? (
                <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0e12] p-4 text-xs font-mono text-zinc-300 leading-relaxed">
                  {rawCsvDatasets[selectedCsvKey]}
                </pre>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#161720]">
                  <table className="w-full text-left text-xs font-mono">
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {rawCsvDatasets[selectedCsvKey].split('\n').map((line, idx) => (
                        <tr key={idx} className={idx === 0 ? 'bg-[#1c1d27] font-bold text-white' : 'hover:bg-[#1f202b]'}>
                          <td className="p-2.5 text-zinc-500 w-10 text-center select-none border-r border-zinc-800">{idx + 1}</td>
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

          {/* TAB 3: SQL & QUERY CONSOLE */}
          {demoTab === 'sql' && (
            <div className="p-6">
              <div className="rounded-xl border border-zinc-800 bg-[#0d0e12] p-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Terminal className="size-4 text-emerald-400" /> Interactive SQL Query Executor
                  </span>
                  <span className="text-xs font-mono text-zinc-500">Latency: {sqlResults.executionTime}</span>
                </div>

                <div className="mt-3">
                  <textarea 
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={3}
                    className="w-full bg-transparent text-xs font-mono text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => runCustomSql(sqlQuery)}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Execute Query <Play className="size-3 fill-current" />
                  </button>
                </div>
              </div>

              {/* SQL Result Output */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Query Results ({sqlResults.count} Rows Returned)</p>
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#161720]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="border-b border-zinc-800 bg-[#1c1d27] text-zinc-400 uppercase">
                      <tr>
                        <th className="p-3">TX ID</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Dept</th>
                        <th className="p-3">Revenue</th>
                        <th className="p-3">Expense</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {sqlResults.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#1f202b]">
                          <td className="p-3 text-white font-medium">{row.transaction_id}</td>
                          <td className="p-3">{row.category}</td>
                          <td className="p-3">{row.department}</td>
                          <td className="p-3 font-semibold text-white">${row.revenue?.toLocaleString()}</td>
                          <td className="p-3">${row.expense?.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${row.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Workflow Step Bar */}
      <div className="mt-12 grid gap-3 rounded-2xl border border-zinc-800/80 bg-[#121319]/60 p-3 md:grid-cols-6">
        {workflowSteps.map((step, i) => (
          <button 
            key={step} 
            onClick={() => setActiveStep(i)} 
            className={`step-button ${activeStep === i ? 'step-active' : ''}`}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            <span className="truncate">{step}</span>
            {i < workflowSteps.length - 1 && <ChevronRight className="hidden size-4 md:block ml-auto text-zinc-600" />}
          </button>
        ))}
      </div>

      <motion.div 
        key={activeStep} 
        initial={{ opacity: 0, y: 6 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mt-5 rounded-xl border border-zinc-800/80 bg-[#161720]/80 p-5 text-sm text-zinc-400"
      >
        <span className="font-semibold text-white">{workflowSteps[activeStep]}:</span>{' '}
        {['Bring the source trail into one workspace.', 'Normalize fields, dates, and business definitions.', 'Retrieve supporting context from every connected file.', 'Generate dashboards, forecasts, and atomic claims.', 'Check every claim against independent evidence.', 'Turn the verified signal into a focused next action.'][activeStep]}
      </motion.div>
    </section>

    {/* 02 / TRUST LAYER */}
    <section id="trust" className="border-y border-zinc-800/80 bg-[#080808] py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="eyebrow">/ 02 TRUST LAYER</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl leading-[1.05]">
            Confidence, with <span className="font-serif italic font-normal text-white">receipts</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
            Open any atomic claim to inspect evidence, conflicts, and the verification sequence behind the answer.
          </p>
          <div className="mt-10 flex items-end gap-5">
            <span className="text-7xl font-bold tracking-tight text-white leading-none">{novaRetail.trust}%</span>
            <span className="pb-1 text-xs uppercase tracking-[0.18em] text-zinc-400 leading-tight">
              Trust score<br />verified accuracy
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {novaRetail.claims.map((claim) => (
            <button 
              key={claim.id} 
              onClick={() => setSelectedClaim(claim)} 
              className="glass-panel rounded-2xl p-6 text-left border border-zinc-800/90 bg-[#121319]/80 transition-all hover:-translate-y-1 hover:border-zinc-600 hover:bg-[#181922]/90"
            >
              <div className="flex items-center justify-between">
                {claim.status === 'verified' ? <ShieldCheck className="size-5 text-emerald-400" /> : <CircleAlert className="size-5 text-amber-400" />}
                <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${claim.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {claim.status}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-white">{claim.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {claim.value} · {claim.confidence}% confidence. Click to inspect.
              </p>
            </button>
          ))}

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/90 bg-[#121319]/80 sm:col-span-2">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-zinc-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Source trail</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {novaRetail.sources.map((source) => (
                <span key={source.name} className="rounded-full border border-zinc-800 bg-[#181920] px-4 py-1.5 text-xs text-zinc-300">
                  {source.name} ({source.rows} rows)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* 03 / AI COPILOT */}
    <section id="copilot" className="mx-auto max-w-7xl px-6 py-24 md:px-12 lg:py-36">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow">/ 03 AI COPILOT</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl leading-[1.05]">
            Ask the question behind the <span className="font-serif italic font-normal text-white">number</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
            A decision partner that knows where every answer came from.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-zinc-800/90 bg-[#121319]/90 shadow-2xl">
          <div className="flex items-center gap-3.5 border-b border-zinc-800/80 pb-5">
            <span className="grid size-10 place-items-center rounded-xl bg-white text-black">
              <Sparkles className="size-5 fill-current text-black" />
            </span>
            <div>
              <p className="font-semibold text-white text-base">BizLens Copilot</p>
              <p className="text-xs text-zinc-400">Grounded in your verified workspace</p>
            </div>
          </div>

          <div className="min-h-36 py-7">
            <p className="text-sm leading-relaxed text-zinc-300 font-normal">{answer}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {questions.map((item) => (
              <button 
                key={item} 
                onClick={() => { setQuestion(item); setAnswer(copilotAnswers[item]) }} 
                className={`rounded-full border px-4 py-2 text-left text-xs font-medium transition ${question === item ? 'border-white bg-white/10 text-white' : 'border-zinc-800 bg-[#181920] text-zinc-400 hover:border-zinc-600 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#161720] p-4 text-sm text-zinc-400">
            <MessageCircle className="size-4 text-zinc-400" />
            <span>Ask a follow-up question</span>
            <span className="ml-auto text-xs font-mono text-zinc-500">⌘ K</span>
          </div>
        </div>
      </div>
    </section>

    {/* 04 / LIVE INTERACTIVE INTELLIGENCE ENGINE */}
    <section className="border-t border-zinc-800/80 bg-[#080808] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Section Header & Scenario Selector */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="eyebrow">/ 04 LIVE INTELLIGENCE PIPELINE</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl leading-[1.05]">
              Real-time Autonomous <span className="font-serif italic font-normal text-white">Verification Engine</span>.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
              Interactive pipeline execution: <span className="text-white font-mono text-xs">Files ➔ Analyze ➔ RAG ➔ Gemini ➔ Verify ➔ Decide</span>. Toggle scenarios or run live step simulation.
            </p>
          </div>

          {/* Scenario Toggles & Simulation Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => { setPipelineScenario('verified'); setActiveNodeIndex(5) }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${pipelineScenario === 'verified' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-zinc-800 bg-[#161720] text-zinc-400 hover:text-white'}`}
            >
              <CheckCircle2 className="size-3.5" /> Scenario A: Verified Claim
            </button>
            <button 
              onClick={() => { setPipelineScenario('conflict'); setActiveNodeIndex(5) }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${pipelineScenario === 'conflict' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-zinc-800 bg-[#161720] text-zinc-400 hover:text-white'}`}
            >
              <AlertTriangle className="size-3.5" /> Scenario B: Conflict Flag
            </button>
            <button 
              onClick={runPipelineSimulation}
              disabled={isSimulating}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              <Play className="size-3.5 fill-current text-black" /> {isSimulating ? 'Running Pipeline...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Interactive Pipeline Node Map */}
        <div className="mt-12 rounded-2xl border border-zinc-800/90 bg-[#121319]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-8">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Zap className="size-4 text-emerald-400 animate-pulse" /> Live Pipeline Dataflow Execution (Click Node to Inspect State)
            </span>
            <span className="text-xs font-mono text-zinc-500">
              Active Node: <span className="text-white font-bold">{['Files Ingestion', 'Schema Alignment', 'LlamaIndex RAG', 'Gemini Synthesis', 'SHAP Audit', 'Decision Engine'][activeNodeIndex]}</span>
            </span>
          </div>

          {/* 6 Connected Nodes Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative">
            {[
              { label: 'Files', sub: 'Ingestion & Parse', icon: FileSpreadsheet },
              { label: 'Analyze', sub: 'Pandas & Schema', icon: Cpu },
              { label: 'RAG', sub: 'ChromaDB Vector', icon: Database },
              { label: 'Gemini', sub: 'Gemini 2.5 Flash', icon: Sparkles },
              { label: 'Verify', sub: 'SHAP Math Audit', icon: ShieldCheck },
              { label: 'Decide', sub: 'Verified / Conflict', icon: Award },
            ].map((node, idx) => {
              const IconComp = node.icon
              const isActive = activeNodeIndex === idx
              const isPast = activeNodeIndex >= idx

              return (
                <button
                  key={node.label}
                  onClick={() => setActiveNodeIndex(idx)}
                  className={`group relative flex flex-col items-center justify-between rounded-xl p-4 text-center transition-all duration-300 ${isActive ? 'border-2 border-white bg-[#1e202c] shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.03]' : isPast ? 'border border-zinc-700 bg-[#161722]' : 'border border-zinc-800/80 bg-[#121319]/60 opacity-60 hover:opacity-100 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center justify-center size-10 rounded-xl border border-zinc-700/60 bg-[#1b1c28] group-hover:scale-110 transition">
                    <IconComp className={`size-5 ${isActive ? 'text-white' : isPast ? 'text-zinc-300' : 'text-zinc-500'}`} />
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-bold text-white block">{idx + 1}. {node.label}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{node.sub}</span>
                  </div>

                  {/* Glowing step indicator dot */}
                  <div className="mt-3 flex items-center justify-center">
                    <span className={`size-2 rounded-full ${isActive ? 'bg-white shadow-[0_0_10px_#ffffff] animate-ping' : isPast ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Node Execution State Telemetry & Result Panel */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-center pt-6 border-t border-zinc-800/80">
            {/* Left Console Log Output */}
            <div className="lg:col-span-6 rounded-xl border border-zinc-800 bg-[#0d0e12] p-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                <span className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="size-3.5 text-zinc-400" /> Pipeline Telemetry Log
                </span>
                <span className="text-emerald-400 text-[10px]">STATUS: ACTIVE (24ms)</span>
              </div>

              <div className="space-y-2 text-zinc-300 leading-relaxed text-[11px]">
                <p><span className="text-zinc-500">[00:01.02]</span> Ingesting <span className="text-white">q3_finance_ledger.csv</span> & <span className="text-white">crm_export_q3.csv</span> (1.4M rows)</p>
                <p><span className="text-zinc-500">[00:01.18]</span> Pandas schema normalization complete. Columns aligned: [revenue, expense, date].</p>
                <p><span className="text-zinc-500">[00:01.35]</span> ChromaDB retrieved 12 relevant chunks (cosine similarity = 0.96).</p>
                <p><span className="text-zinc-500">[00:01.52]</span> Google Gemini 2.5 Flash synthesis output: <span className="text-emerald-400 font-semibold">{pipelineScenario === 'verified' ? '"Revenue increased 18.6% to $2.84M in Q3 2024."' : '"Q3 Enterprise Renewal ARR total is $184,000."'}</span></p>
                <p><span className="text-zinc-500">[00:01.88]</span> SHAP feature math audit: {pipelineScenario === 'verified' ? 'Variance < 0.2%. Cross-check PASS.' : 'CRITICAL: Discrepancy between CRM (Q3) and Board PDF (Q4).'}</p>
              </div>
            </div>

            {/* Right Live Decision Result Card */}
            <div className="lg:col-span-6">
              {pipelineScenario === 'verified' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                      <CheckCircle2 className="size-4 text-emerald-400" /> VERIFIED CLAIM
                    </span>
                    <span className="font-mono text-2xl font-bold text-emerald-400">96% CONFIDENCE</span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">"Revenue increased 18.6% to $2.84M in Q3 2024."</h3>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-200/80">
                    Math check confirmed: ($2.84M - $2.39M) / $2.39M = +18.8% growth aligned across 2 independent sources within 0.2% tolerance.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-emerald-500/20 text-[11px] font-mono">
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">q3_finance_ledger.csv:L2</span>
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">crm_export_q3.csv:DEAL-801-803</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.15)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                      <AlertTriangle className="size-4 text-amber-400" /> CONFLICT DETECTED
                    </span>
                    <span className="font-mono text-2xl font-bold text-amber-400">61% CONFIDENCE</span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">"Enterprise Renewal Timing Discrepancy ($184,000)"</h3>
                  <p className="mt-2 text-xs leading-relaxed text-amber-200/80">
                    Source Disagreement: CRM export lists renewal in Q3 2024 (Deal #804), but Board Minutes (Page 7) mark renewal pushed to Q4 2024.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-amber-500/20 text-[11px] font-mono">
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300">crm_export_q3.csv (Q3 2024)</span>
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300">board_report.pdf (Q4 2024)</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>


    {/* 05 / PRODUCTION TECH STACK & SYSTEM ARCHITECTURE */}
    <section className="border-t border-zinc-800/80 bg-[#080808] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow">/ 05 SYSTEM ARCHITECTURE</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl leading-[1.05]">
              Engineered with <span className="font-serif italic font-normal text-white">production-grade</span> AI & ML.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
              Built on a enterprise multi-agent stack: React, TypeScript, FastAPI, Supabase, Gemini API, LangGraph, LlamaIndex, ChromaDB, Pandas, SHAP, and Vercel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-zinc-700 bg-[#161720] px-4 py-1.5 font-mono text-xs text-zinc-300">
              100% Type-Safe · 14 Microservices
            </span>
          </div>
        </div>

        {/* Tech Stack Pillar Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1: AI & Multi-Agent */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/90 bg-[#121319]/90 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider">01 / AI & Multi-Agent</span>
              <Sparkles className="size-4 text-blue-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Agentic Reasoning</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Autonomous multi-agent claim verification and hybrid vector retrieval.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-blue-300">Google Gemini API</span>
              <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-300">LangGraph</span>
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300">LlamaIndex RAG</span>
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">ChromaDB Vector Store</span>
            </div>
          </div>

          {/* Pillar 2: Backend & Data Engine */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/90 bg-[#121319]/90 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">02 / Backend & DB</span>
              <Database className="size-4 text-emerald-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Data Pipeline</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Async data extraction, CSV streaming, and PostgreSQL database logic.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">FastAPI (Python)</span>
              <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">Supabase Postgres</span>
              <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-blue-300">Pandas & NumPy</span>
              <span className="rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 py-1 text-zinc-300">Render Infra</span>
            </div>
          </div>

          {/* Pillar 3: ML & Explainability */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/90 bg-[#121319]/90 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">03 / Explainable ML</span>
              <ShieldCheck className="size-4 text-amber-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Feature Attribution</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              SHAP feature importance scoring and Scikit-learn predictive forecasting.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300">SHAP Explainability</span>
              <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-orange-300">Scikit-learn ML</span>
              <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-indigo-300">Plotly & Chart.js</span>
            </div>
          </div>

          {/* Pillar 4: Frontend & Edge Deployment */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/90 bg-[#121319]/90 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-400 uppercase tracking-wider">04 / Frontend & Edge</span>
              <Code className="size-4 text-purple-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Client Interface</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Type-safe React client with Tailwind styling and global Vercel CDN deployment.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-300">React 19 & TypeScript</span>
              <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">Tailwind CSS</span>
              <span className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-white">Vercel Edge</span>
            </div>
          </div>
        </div>

        {/* Live Architecture Dataflow Pipeline diagram */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-[#0d0e12] p-6">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            ⚡ Live End-to-End Pipeline Execution Flow
          </p>

          <div className="grid gap-3 md:grid-cols-5 text-center text-xs font-mono">
            <div className="rounded-xl border border-zinc-800 bg-[#161720] p-3">
              <span className="text-[10px] text-zinc-500 block mb-1">01 / INGESTION</span>
              <span className="text-white font-semibold block">Pandas + LlamaIndex</span>
              <span className="text-[10px] text-zinc-400">CSV & PDF Parsing</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#161720] p-3">
              <span className="text-[10px] text-zinc-500 block mb-1">02 / VECTORIZATION</span>
              <span className="text-white font-semibold block">ChromaDB Store</span>
              <span className="text-[10px] text-zinc-400">384-dim Embeddings</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#161720] p-3">
              <span className="text-[10px] text-zinc-500 block mb-1">03 / ORCHESTRATION</span>
              <span className="text-white font-semibold block">LangGraph + Gemini</span>
              <span className="text-[10px] text-zinc-400">Multi-Agent Loops</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#161720] p-3">
              <span className="text-[10px] text-zinc-500 block mb-1">04 / EXPLAINABILITY</span>
              <span className="text-white font-semibold block">SHAP + Scikit-learn</span>
              <span className="text-[10px] text-zinc-400">Feature Importance</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#161720] p-3">
              <span className="text-[10px] text-zinc-500 block mb-1">05 / API & CLIENT</span>
              <span className="text-white font-semibold block">FastAPI ➔ React</span>
              <span className="text-[10px] text-zinc-400">Supabase Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* 06 / DECISION BRIEF */}
    <section className="border-t border-zinc-800/80 bg-[#080808] py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow">/ 06 DECISION BRIEF</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl leading-[1.05]">
            Make the next move <span className="font-serif italic font-normal text-white">obvious</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
            The final output is not another dashboard. It is a concise, sourced brief your team can act on.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-zinc-800/90 bg-[#121319]/90 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
            <div>
              <p className="font-semibold text-white text-base">Nova Retail Group / Decision brief</p>
              <p className="text-xs text-zinc-400">Prepared from verified Q3 evidence</p>
            </div>
            <ArrowUpRight className="size-5 text-zinc-200" />
          </div>

          <div className="grid gap-4 py-8 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800/80 bg-[#181922]/70 p-4.5">
              <p className="eyebrow text-[10px]">Signal</p>
              <p className="mt-2 text-lg font-medium text-white">Growth is real</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-[#181922]/70 p-4.5">
              <p className="eyebrow text-[10px]">Risk</p>
              <p className="mt-2 text-lg font-medium text-white">Renewals conflict</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-[#181922]/70 p-4.5">
              <p className="eyebrow text-[10px]">Action</p>
              <p className="mt-2 text-lg font-medium text-white">Prioritize enterprise</p>
            </div>
          </div>

          <button 
            onClick={() => novaRetail.claims[0] && verifyClaim(novaRetail.claims[0])} 
            className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-zinc-200 shadow-md"
          >
            Verify this insight <ShieldCheck className="size-4 text-black" />
          </button>
        </div>
      </div>
    </section>


    {/* EVIDENCE DRAWER MODAL */}
    {selectedClaim && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5 backdrop-blur-md">
        <motion.div initial={{ y: 16, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="glass-panel w-full max-w-lg rounded-2xl border border-zinc-800/90 bg-[#121319] p-8 shadow-2xl">
          <button aria-label="Close evidence" onClick={() => { setSelectedClaim(null); setVerified(false); setVerificationRunning(false) }} className="float-right rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="size-5" />
          </button>
          <p className="eyebrow">/ EVIDENCE DRAWER</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{selectedClaim.label}</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{selectedClaim.detail}</p>
          
          <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-[#181920] p-4">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Confidence</span>
            <b className="text-2xl font-bold text-white">{verified ? '98%' : `${selectedClaim.confidence}%`}</b>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {selectedClaim.evidence.map((item, index) => (
              <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="grid size-6 place-items-center rounded-full border border-zinc-800 bg-[#171822] font-mono text-xs text-zinc-400">
                  {verificationStep >= index || verified ? <Check className="size-3.5 text-emerald-400" /> : index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>

          {verificationRunning && <p className="mt-6 text-xs font-mono uppercase tracking-[0.16em] text-white">Checking evidence layer {Math.min(verificationStep + 1, 3)} of 3...</p>}
          {!verified && !verificationRunning && (
            <button onClick={() => verifyClaim(selectedClaim)} className="mt-7 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200">
              Verify this insight <ShieldCheck className="size-4 text-black" />
            </button>
          )}
          {verified && (
            <p className="mt-7 flex items-center gap-2 text-sm font-medium text-emerald-400">
              <Check className="size-4 text-emerald-400" /> Verified across independent source evidence.
            </p>
          )}
        </motion.div>
      </motion.div>
    )}
  </>
}



