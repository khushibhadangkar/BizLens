'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Lightbulb,
  BarChart2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { apiAnalytics } from '@/lib/api/analytics'
import { apiFiles } from '@/lib/api/files'
import {
  FileMetrics,
  Insight,
  NormalizedFact,
  VerificationRecord,
  VerificationStatus,
} from '@/lib/types/analytics'
import { FileRecord } from '@/lib/types/file'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

function shortCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

function EvidencePanel({
  fileId,
  canonicalName,
  factCount,
}: {
  fileId: string
  canonicalName: string
  factCount: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [facts, setFacts] = useState<NormalizedFact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleOpen = async () => {
    if (!isOpen && facts.length === 0 && factCount > 0) {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiAnalytics.getEvidenceFacts(fileId, canonicalName)
        setFacts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load evidence.')
      } finally {
        setIsLoading(false)
      }
    }
    setIsOpen(!isOpen)
  }

  if (factCount === 0) return null

  return (
    <div className="mt-4">
      <button
        onClick={toggleOpen}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        {isOpen ? 'Hide evidence' : `View evidence (${factCount} facts)`}
      </button>
      {isOpen && (
        <div className="mt-3 rounded-md border border-border bg-surface-muted overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-4 text-xs text-danger">{error}</div>
          ) : facts.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">No contributing facts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-surface border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Source Row</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {facts.map((fact) => (
                    <tr key={fact.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-2 text-muted-foreground">Row {fact.row_number}</td>
                      <td className="px-4 py-2">{fact.category || '-'}</td>
                      <td className="px-4 py-2">{fact.date_value || '-'}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {fact.value_numeric !== null ? formatCurrency(fact.value_numeric) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  revenue: <TrendingUp className="size-4 text-success" />,
  expense: <TrendingDown className="size-4 text-danger" />,
  net_profit: <DollarSign className="size-4 text-primary" />,
  operating_margin: <Activity className="size-4 text-accent" />,
  data_quality: <AlertCircle className="size-4 text-warning" />,
}

function formatSupportingValue(metric: string, value: number | null): string | null {
  if (value === null) return null
  if (metric === 'operating_margin') return `${value.toFixed(2)}%`
  return formatCurrency(value)
}

function InsightCard({ insight }: { insight: Insight }) {
  const icon = INSIGHT_ICONS[insight.metric] ?? <Lightbulb className="size-4 text-muted-foreground" />
  const formattedValue = formatSupportingValue(insight.metric, insight.supporting_value)
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground">{insight.label}</span>
        </div>
        {formattedValue && (
          <span className="shrink-0 text-xs font-mono font-medium text-muted-foreground bg-surface-muted px-2 py-0.5 rounded border border-border">
            {formattedValue}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{insight.observation}</p>
    </div>
  )
}

function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success ring-1 ring-inset ring-success/20">
        <ShieldCheck className="h-3 w-3" />Verified
      </span>
    )
  }
  if (status === 'NEEDS_REVIEW') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning ring-1 ring-inset ring-warning/20">
        <AlertCircle className="h-3 w-3" />Needs Review
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
      Unable to Verify
    </span>
  )
}

type Tab = 'metrics' | 'insights' | 'verification'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'metrics', label: 'Metrics', icon: <BarChart2 className="size-3.5" /> },
  { id: 'insights', label: 'Insights', icon: <Lightbulb className="size-3.5" /> },
  { id: 'verification', label: 'Verification', icon: <ShieldCheck className="size-3.5" /> },
]

export default function AnalyticsPage() {
  const params = useParams()
  const fileId = params.file_id as string

  const [metrics, setMetrics] = useState<FileMetrics | null>(null)
  const [file, setFile] = useState<FileRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ message: string; status?: number } | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('metrics')

  const [insights, setInsights] = useState<Insight[] | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState<string | null>(null)

  const [verificationRecords, setVerificationRecords] = useState<VerificationRecord[] | null>(null)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verificationRunning, setVerificationRunning] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  useEffect(() => {
    if (!fileId) return
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [fileData, metricsData, verificationData] = await Promise.all([
          apiFiles.getFile(fileId),
          apiAnalytics.getFileMetrics(fileId),
          apiAnalytics.getVerificationRecords(fileId).catch(() => null),
        ])
        setFile(fileData)
        setMetrics(metricsData)
        if (verificationData) {
          setVerificationRecords(verificationData)
        } else {
          setVerificationRecords([])
        }
      } catch (err: unknown) {
        let status = 500
        const errMessage = err instanceof Error ? err.message : String(err)
        if (errMessage.includes('404')) status = 404
        if (errMessage.includes('409') || errMessage.includes('conflict')) status = 409
        setError({ message: errMessage || 'An unexpected error occurred.', status })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fileId])

  const loadInsights = async () => {
    if (insights !== null || insightsLoading) return
    setInsightsLoading(true)
    setInsightsError(null)
    try {
      const data = await apiAnalytics.getInsights(fileId)
      setInsights(data.insights)
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : 'Failed to load insights.')
    } finally {
      setInsightsLoading(false)
    }
  }

  const loadVerificationRecords = async () => {
    // Now loaded on mount, but we keep this for manual refresh if needed
    if (verificationLoading) return
    setVerificationLoading(true)
    setVerificationError(null)
    try {
      const records = await apiAnalytics.getVerificationRecords(fileId)
      setVerificationRecords(records)
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Failed to load verification records.')
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'insights') loadInsights()
    if (tab === 'verification') loadVerificationRecords()
  }

  const handleRunVerification = async () => {
    setVerificationRunning(true)
    setVerificationError(null)
    try {
      const records = await apiAnalytics.runVerification(fileId)
      setVerificationRecords(records)
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setVerificationRunning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading analytics...
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <Link
          href="/dashboard/analytics"
          className={buttonVariants({ variant: 'ghost', className: 'mb-6 -ml-4 text-muted-foreground' })}
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Analytics
        </Link>
        <div className="rounded-xl border border-border bg-surface shadow-sm p-12 text-center flex flex-col items-center">
          <AlertCircle className="size-10 text-danger mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            {error.status === 404 ? 'File Not Found' : error.status === 409 ? 'File Not Ready' : 'Failed to load analytics'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">{error.message}</p>
          <div className="mt-8">
            <Link href="/dashboard/analytics" className={buttonVariants({ variant: 'default' })}>
              Return to Analytics
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics || !file) return null

  const hasZeroFacts = metrics.revenue_fact_count === 0 && metrics.expense_fact_count === 0
  const chartData = [
    { name: 'Revenue', value: metrics.total_revenue },
    { name: 'Expense', value: metrics.total_expense },
  ]

  return (
    <div className="max-w-5xl animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 size-4" /> Back to datasets
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-serif tracking-tight text-foreground">
              {file.original_filename}
            </h2>
            <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success ring-1 ring-inset ring-success/20 uppercase tracking-wider">
              {file.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            Uploaded {new Date(file.created_at).toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            &middot;
            {verificationRecords && verificationRecords.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="size-3.5" /> Verification complete</span>
            ) : (
              <span>Verification not run</span>
            )}
          </p>
        </div>
        {!hasZeroFacts && (
          <div className="flex items-center mt-2 md:mt-0">
            <button
              onClick={handleRunVerification}
              disabled={verificationRunning}
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'shadow-sm bg-surface' })}
            >
              {verificationRunning ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />Running Verification&hellip;</>
              ) : (
                <><ShieldCheck className="size-4 mr-2" />Run Verification</>
              )}
            </button>
          </div>
        )}
      </div>

      {hasZeroFacts && (
        <div className="mb-8 rounded-lg bg-surface-muted px-4 py-3 border border-border flex items-start gap-3 shadow-sm">
          <AlertCircle className="size-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            No recognizable financial facts were detected in this document. Metrics are unavailable until supported financial data is detected.
          </p>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-border mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'metrics' && (
        <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-bottom-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <TrendingUp className="size-4 text-success" />Total Revenue
              </div>
              {metrics.revenue_fact_count === 0 ? (
                <div>
                  <div className="text-4xl font-serif tracking-tight text-muted-foreground/30">—</div>
                  <div className="mt-2 text-xs text-muted-foreground">No revenue data detected</div>
                </div>
              ) : (
                <div className="text-4xl font-serif tracking-tight text-foreground">{formatCurrency(metrics.total_revenue)}</div>
              )}
              <div className="flex-1" />
              <EvidencePanel fileId={fileId} canonicalName="revenue" factCount={metrics.revenue_fact_count} />
            </div>

            <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <TrendingDown className="size-4 text-danger" />Total Expense
              </div>
              {metrics.expense_fact_count === 0 ? (
                <div>
                  <div className="text-4xl font-serif tracking-tight text-muted-foreground/30">—</div>
                  <div className="mt-2 text-xs text-muted-foreground">No expense data detected</div>
                </div>
              ) : (
                <div className="text-4xl font-serif tracking-tight text-foreground">{formatCurrency(metrics.total_expense)}</div>
              )}
              <div className="flex-1" />
              <EvidencePanel fileId={fileId} canonicalName="expense" factCount={metrics.expense_fact_count} />
            </div>

            <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <DollarSign className="size-4 text-primary" />Net Profit
              </div>
              {hasZeroFacts ? (
                <div><div className="text-4xl font-serif tracking-tight text-muted-foreground/30">—</div><div className="mt-2 text-xs text-muted-foreground">Insufficient data</div></div>
              ) : metrics.expense_fact_count === 0 ? (
                <div><div className="text-4xl font-serif tracking-tight text-muted-foreground/30">—</div><div className="mt-2 text-xs text-muted-foreground">Insufficient expense data</div></div>
              ) : metrics.revenue_fact_count === 0 ? (
                <div><div className="text-4xl font-serif tracking-tight text-muted-foreground/30">—</div><div className="mt-2 text-xs text-muted-foreground">Insufficient revenue data</div></div>
              ) : (
                <div className={`text-4xl font-serif tracking-tight ${metrics.net_profit < 0 ? 'text-danger' : 'text-foreground'}`}>
                  {formatCurrency(metrics.net_profit)}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <Activity className="size-4 text-accent" />Operating Margin
              </div>
              {metrics.operating_margin === null ? (
                <div><div className="text-4xl font-serif tracking-tight text-muted-foreground/30">—</div><div className="mt-2 text-xs text-muted-foreground">Insufficient data</div></div>
              ) : (
                <div className="text-4xl font-serif tracking-tight text-foreground">{formatPercent(metrics.operating_margin)}</div>
              )}
              <div className="flex-1" />
              {metrics.operating_margin !== null && (
                <div className="mt-4 text-xs text-muted-foreground">Profit as a percentage of revenue</div>
              )}
            </div>
          </div>

          {!hasZeroFacts && (
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">Revenue vs Expense</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Aggregate totals from this dataset</p>
              </div>
              <div className="p-8">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="40%" margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={shortCurrency} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip
                      formatter={(val) => (typeof val === 'number' ? [formatCurrency(val), ''] : [val, ''])}
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                      cursor={{ fill: 'var(--color-surface-muted)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--color-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">Data Coverage</h3>
              <p className="mt-1 text-sm text-muted-foreground">Summary of financial facts successfully processed and verified from this dataset.</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Facts</div>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{metrics.revenue_fact_count + metrics.expense_fact_count}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Revenue Facts</div>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{metrics.revenue_fact_count}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Expense Facts</div>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{metrics.expense_fact_count}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Verification</div>
                  <div className="mt-2 flex items-center gap-2">
                    {hasZeroFacts ? (
                      <><AlertCircle className="size-5 text-warning" /><span className="text-sm font-medium text-warning">Unavailable</span></>
                    ) : verificationRecords && verificationRecords.length > 0 ? (
                      <><ShieldCheck className="size-5 text-success" /><span className="text-sm font-medium text-success">Verified</span></>
                    ) : (
                      <><AlertCircle className="size-5 text-muted-foreground" /><span className="text-sm font-medium text-muted-foreground">Not run</span></>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href={`/dashboard/evidence/${fileId}`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              View full evidence table →
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
          {insightsLoading || insights === null ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : insightsError ? (
            <div className="rounded-xl border border-border bg-surface p-10 text-center flex flex-col items-center shadow-sm">
              <AlertCircle className="size-8 text-danger mb-3" />
              <p className="text-sm text-danger">{insightsError}</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-16 text-center flex flex-col items-center shadow-sm">
              <Lightbulb className="size-10 text-muted-foreground mb-4" />
              <h3 className="text-base font-medium text-foreground mb-2">No insights available</h3>
              <p className="text-sm text-muted-foreground max-w-xs">The insights engine found no observations for this dataset. This typically means no financial facts were detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                {insights.length} insight{insights.length !== 1 ? 's' : ''} generated from {metrics.revenue_fact_count + metrics.expense_fact_count} facts
              </p>
              {insights.map((insight, idx) => (
                <InsightCard key={`${insight.metric}-${idx}`} insight={insight} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
          {verificationLoading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : verificationError && verificationRecords === null ? (
            <div className="rounded-xl border border-border bg-surface p-10 text-center flex flex-col items-center gap-3 shadow-sm">
              <AlertCircle className="size-8 text-danger" />
              <p className="text-sm text-danger">{verificationError}</p>
            </div>
          ) : verificationRecords === null ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : verificationRecords.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-16 text-center flex flex-col items-center shadow-sm">
              <ShieldCheck className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-base font-medium text-foreground mb-2">Verification has not been run for this dataset.</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
                Run the verification engine to independently validate each metric against the underlying fact records to ensure data integrity.
              </p>
              <button
                onClick={handleRunVerification}
                disabled={verificationRunning || hasZeroFacts}
                className={buttonVariants({ variant: 'default' })}
              >
                {verificationRunning ? (
                  <><Loader2 className="size-4 mr-2 animate-spin" />Running Verification&hellip;</>
                ) : (
                  'Run Verification'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {verificationRecords.length} metric{verificationRecords.length !== 1 ? 's' : ''} verified &middot; Last run {new Date(verificationRecords[verificationRecords.length - 1].created_at).toLocaleString()}
                </p>
                <button
                  onClick={handleRunVerification}
                  disabled={verificationRunning}
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  {verificationRunning ? (
                    <><Loader2 className="size-3.5 mr-2 animate-spin" />Running&hellip;</>
                  ) : (
                    'Re-run Verification'
                  )}
                </button>
              </div>

              {verificationRunning && (
                <div className="rounded-md bg-surface-muted border border-border px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin shrink-0" />Verification engine running&hellip;
                </div>
              )}

              {verificationError && (
                <div className="rounded-md bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                  {verificationError}
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-muted text-muted-foreground uppercase tracking-wider text-xs font-medium border-b border-border">
                      <tr>
                        <th className="px-6 py-3">Metric</th>
                        <th className="px-6 py-3 text-right">Claimed</th>
                        <th className="px-6 py-3 text-right">Verified</th>
                        <th className="px-6 py-3 text-right">Facts</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {verificationRecords.map((rec) => {
                        const diff = rec.status === 'NEEDS_REVIEW' ? Math.abs(rec.claimed_value - rec.verified_value) : null
                        const isMargin = rec.metric === 'operating_margin'
                        return (
                          <tr key={rec.id} className="hover:bg-surface-muted/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground capitalize">{rec.metric.replace(/_/g, ' ')}</td>
                            <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">{isMargin ? `${rec.claimed_value.toFixed(2)}%` : formatCurrency(rec.claimed_value)}</td>
                            <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">{isMargin ? `${rec.verified_value.toFixed(2)}%` : formatCurrency(rec.verified_value)}</td>
                            <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">{rec.fact_count}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <VerificationStatusBadge status={rec.status} />
                                {diff !== null && (
                                  <span className="text-xs text-warning">
                                    &Delta; {isMargin ? `${diff.toFixed(2)}%` : formatCurrency(diff)}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
