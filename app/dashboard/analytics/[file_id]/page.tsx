'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign, Activity, FileText, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { apiAnalytics } from '@/lib/api/analytics'
import { apiFiles } from '@/lib/api/files'
import { FileMetrics, NormalizedFact } from '@/lib/types/analytics'
import { FileRecord } from '@/lib/types/file'
import { buttonVariants } from '@/components/ui/button'

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

function EvidencePanel({ fileId, canonicalName, factCount }: { fileId: string, canonicalName: string, factCount: number }) {
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
                  {facts.map(fact => (
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

export default function AnalyticsPage() {
  const params = useParams()
  const fileId = params.file_id as string

  const [metrics, setMetrics] = useState<FileMetrics | null>(null)
  const [file, setFile] = useState<FileRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ message: string; status?: number } | null>(null)

  useEffect(() => {
    if (!fileId) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Load file and metrics in parallel
        const [fileData, metricsData] = await Promise.all([
          apiFiles.getFile(fileId),
          apiAnalytics.getFileMetrics(fileId)
        ])
        
        setFile(fileData)
        setMetrics(metricsData)
      } catch (err: unknown) {
        let status = 500
        const errMessage = err instanceof Error ? err.message : String(err)
        if (errMessage.includes('404')) status = 404
        if (errMessage.includes('409') || errMessage.includes('conflict')) status = 409
        
        setError({
          message: errMessage || 'An unexpected error occurred.',
          status
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fileId])

  if (isLoading) {
    return (
      <div className="max-w-5xl animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading analytics...
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border border-border bg-surface p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <Link href="/dashboard/files" className={buttonVariants({ variant: 'ghost', className: "mb-6 -ml-4 text-muted-foreground" })}>
          <ArrowLeft className="mr-2 size-4" /> Back to Files
        </Link>
        <div className="rounded-xl border border-border bg-surface shadow-sm p-12 text-center flex flex-col items-center">
          <AlertCircle className="size-10 text-danger mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            {error.status === 404 ? 'File Not Found' : 
             error.status === 409 ? 'File Not Ready' : 'Failed to load analytics'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {error.message}
          </p>
          <div className="mt-8">
            <Link href="/dashboard/files" className={buttonVariants({ variant: 'default' })}>
              Return to workspace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics || !file) return null

  const hasZeroFacts = metrics.revenue_fact_count === 0 && metrics.expense_fact_count === 0

  return (
    <div className="max-w-5xl animate-in fade-in duration-500">
      <div className="mb-6">
        <Link href="/dashboard/files" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="mr-2 size-4" /> Back to Files
        </Link>
        <h2 className="text-2xl font-serif tracking-tight text-foreground flex items-center gap-3">
          <FileText className="size-6 text-primary" />
          {file.original_filename}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
          {hasZeroFacts ? (
            <>
              <AlertCircle className="size-4 text-warning" />
              Unable to verify
            </>
          ) : (
            <>
              Verified analytics engine 
              <span className="inline-flex h-1 w-1 rounded-full bg-success"></span>
              COMPLETED
            </>
          )}
        </p>
      </div>

      {hasZeroFacts && (
        <div className="mb-8 rounded-lg bg-surface-muted px-4 py-3 border border-border flex items-start gap-3">
          <AlertCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            No recognizable financial facts were detected in this document. Metrics are unavailable until supported financial data is detected.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Total Revenue */}
        <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <TrendingUp className="size-4 text-success" />
            Total Revenue
          </div>
          {metrics.revenue_fact_count === 0 ? (
            <div>
              <div className="text-5xl font-semibold tracking-tight text-muted-foreground/30">—</div>
              <div className="mt-3 text-sm text-muted-foreground">No revenue data detected</div>
            </div>
          ) : (
            <div className="text-5xl font-semibold tracking-tight text-foreground">
              {formatCurrency(metrics.total_revenue)}
            </div>
          )}
          <div className="flex-1" />
          <EvidencePanel 
            fileId={fileId} 
            canonicalName="revenue" 
            factCount={metrics.revenue_fact_count} 
          />
        </div>

        {/* Total Expense */}
        <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <TrendingDown className="size-4 text-danger" />
            Total Expense
          </div>
          {metrics.expense_fact_count === 0 ? (
            <div>
              <div className="text-5xl font-semibold tracking-tight text-muted-foreground/30">—</div>
              <div className="mt-3 text-sm text-muted-foreground">No expense data detected</div>
            </div>
          ) : (
            <div className="text-5xl font-semibold tracking-tight text-foreground">
              {formatCurrency(metrics.total_expense)}
            </div>
          )}
          <div className="flex-1" />
          <EvidencePanel 
            fileId={fileId} 
            canonicalName="expense" 
            factCount={metrics.expense_fact_count} 
          />
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <DollarSign className="size-4 text-primary" />
            Net Profit
          </div>
          {hasZeroFacts ? (
            <div>
              <div className="text-5xl font-semibold tracking-tight text-muted-foreground/30">—</div>
              <div className="mt-3 text-sm text-muted-foreground">Insufficient data</div>
            </div>
          ) : metrics.expense_fact_count === 0 ? (
            <div>
              <div className="text-5xl font-semibold tracking-tight text-muted-foreground/30">—</div>
              <div className="mt-3 text-sm text-muted-foreground">Insufficient expense data</div>
            </div>
          ) : metrics.revenue_fact_count === 0 ? (
            <div>
              <div className="text-5xl font-semibold tracking-tight text-muted-foreground/30">—</div>
              <div className="mt-3 text-sm text-muted-foreground">Insufficient revenue data</div>
            </div>
          ) : (
            <div className={`text-5xl font-semibold tracking-tight ${metrics.net_profit < 0 ? 'text-danger' : 'text-foreground'}`}>
              {formatCurrency(metrics.net_profit)}
            </div>
          )}
        </div>

        {/* Operating Margin */}
        <div className="rounded-xl border border-border bg-surface shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <Activity className="size-4 text-accent" />
            Operating Margin
          </div>
          {metrics.operating_margin === null ? (
            <div>
              <div className="text-5xl font-semibold tracking-tight text-muted-foreground/30">—</div>
              <div className="mt-3 text-sm text-muted-foreground">Insufficient data</div>
            </div>
          ) : (
            <div className="text-5xl font-semibold tracking-tight text-foreground">
              {formatPercent(metrics.operating_margin)}
            </div>
          )}
          <div className="flex-1" />
          {metrics.operating_margin !== null && (
            <div className="mt-4 text-sm text-muted-foreground">
              Profit as a percentage of revenue
            </div>
          )}
        </div>
      </div>
      
      {/* Data Coverage / Detected Facts Block */}
      <div className="mt-8 rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Data Coverage</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Summary of financial facts successfully processed and verified from this dataset.
          </p>
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
                  <>
                    <AlertCircle className="size-6 text-warning" />
                    <span className="text-sm font-medium text-warning">Unverified</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-6 text-success" />
                    <span className="text-sm font-medium text-success">Verified</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
