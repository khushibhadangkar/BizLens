'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowRight, Database, CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown, DollarSign, Activity, FileSpreadsheet } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { apiFiles } from '@/lib/api/files'
import { apiAnalytics } from '@/lib/api/analytics'
import { FileRecord } from '@/lib/types/file'
import { FileMetrics } from '@/lib/types/analytics'
import { FileTable } from '@/components/app/file-table'

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

export default function DashboardPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [latestMetrics, setLatestMetrics] = useState<FileMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isMetricsLoading, setIsMetricsLoading] = useState(false)
  const [metricsError, setMetricsError] = useState(false)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const records = await apiFiles.listFiles()
        // Sort by created_at descending just in case
        const sortedRecords = records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setFiles(sortedRecords)

        const completed = sortedRecords.filter(f => f.status === 'COMPLETED')
        if (completed.length > 0) {
          try {
            setIsMetricsLoading(true)
            const metrics = await apiAnalytics.getFileMetrics(completed[0].id)
            setLatestMetrics(metrics)
          } catch (e) {
            console.error("Failed to fetch latest metrics", e)
            setMetricsError(true)
          } finally {
            setIsMetricsLoading(false)
          }
        }
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
        setFiles([])
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const completedFiles = files.filter(f => f.status === 'COMPLETED')
  const processingFiles = files.filter(f => f.status === 'PROCESSING' || f.status === 'PENDING')
  const failedFiles = files.filter(f => f.status === 'FAILED')
  const latestFile = completedFiles.length > 0 ? completedFiles[0] : null

  // Determine Data Health
  let healthStatus = 'No Data'
  let healthIcon = <Database className="size-5 text-muted-foreground" />
  let healthColor = 'text-muted-foreground'
  
  if (completedFiles.length > 0 && isMetricsLoading) {
    healthStatus = 'Checking health...'
    healthIcon = <Loader2 className="size-5 text-muted-foreground animate-spin" />
    healthColor = 'text-muted-foreground'
  } else if (failedFiles.length > 0) {
    healthStatus = 'Needs Review'
    healthIcon = <AlertCircle className="size-5 text-warning" />
    healthColor = 'text-warning'
  } else if (processingFiles.length > 0) {
    healthStatus = 'Processing'
    healthIcon = <Clock className="size-5 text-primary animate-pulse" />
    healthColor = 'text-primary'
  } else if (completedFiles.length > 0) {
    if (latestMetrics && latestMetrics.revenue_fact_count === 0 && latestMetrics.expense_fact_count === 0) {
      healthStatus = 'Incomplete'
      healthIcon = <AlertCircle className="size-5 text-warning" />
      healthColor = 'text-warning'
    } else if (latestMetrics) {
      healthStatus = 'Healthy'
      healthIcon = <CheckCircle2 className="size-5 text-success" />
      healthColor = 'text-success'
    } else {
      healthStatus = 'Needs Review'
      healthIcon = <AlertCircle className="size-5 text-warning" />
      healthColor = 'text-warning'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl animate-in fade-in duration-500">
        <div className="mb-8">
          <h2 className="text-2xl font-serif tracking-tight text-foreground">Your Intelligence Workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand your data, inspect the evidence, and make decisions with confidence.
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif tracking-tight text-foreground">Your Intelligence Workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand your data, inspect the evidence, and make decisions with confidence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/files" className={buttonVariants({ variant: 'outline' })}>
            View Files
          </Link>
          <Link href="/dashboard/files" className={buttonVariants({ variant: 'default' })}>
            Upload Dataset
          </Link>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="p-16 text-center flex flex-col items-center">
            <h3 className="text-2xl font-serif tracking-tight text-foreground mb-4">Your intelligence workspace is ready.</h3>
            <p className="text-base text-muted-foreground max-w-md mx-auto mb-10">
              Upload your first dataset to begin.
            </p>
            
            <div className="mt-2 mb-10">
              <Link href="/dashboard/files" className={buttonVariants({ variant: 'default', size: 'lg' })}>
                Upload Dataset
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider bg-surface-muted/50 px-6 py-3 rounded-full border border-border">
              <span>01 Upload</span>
              <ArrowRight className="size-3" />
              <span>02 Analyze</span>
              <ArrowRight className="size-3" />
              <span>03 Inspect</span>
              <ArrowRight className="size-3" />
              <span className="text-foreground">04 Evidence</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECTION 1: WORKSPACE OVERVIEW & DATA HEALTH */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Datasets</div>
              <div className="text-3xl font-semibold text-foreground">{files.length}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Completed</div>
              <div className="text-3xl font-semibold text-foreground">{completedFiles.length}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Processing</div>
              <div className="text-3xl font-semibold text-foreground">{processingFiles.length}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Needs Attention</div>
              <div className={`text-3xl font-semibold ${failedFiles.length > 0 ? 'text-danger' : 'text-foreground'}`}>{failedFiles.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SECTION 2: LATEST DATASET */}
            <div className="md:col-span-2 rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Latest Dataset</h3>
                  {latestFile && (
                    <p className="text-xs text-muted-foreground mt-0.5">{latestFile.original_filename}</p>
                  )}
                </div>
                {latestFile && latestMetrics ? (
                  <Link 
                    href={`/dashboard/analytics/${latestFile.id}`}
                    className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                  >
                    View Analytics
                  </Link>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground px-3 py-1 rounded-full border border-border bg-surface">
                    Processing
                  </span>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                {completedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="size-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">No completed dataset yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload and process a dataset to view analytics.</p>
                  </div>
                ) : isMetricsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Extracting verifiable facts...</p>
                  </div>
                ) : metricsError || !latestMetrics ? (
                  <div className="text-center py-8">
                    <AlertCircle className="size-8 text-warning mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Failed to load analytics</p>
                    <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                        <TrendingUp className="size-3 text-success" /> Revenue
                      </div>
                      {latestMetrics.revenue_fact_count === 0 ? (
                        <div className="text-xs text-muted-foreground pt-1">— No data</div>
                      ) : (
                        <div className="text-2xl font-semibold text-foreground">{formatCurrency(latestMetrics.total_revenue)}</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                        <TrendingDown className="size-3 text-danger" /> Expense
                      </div>
                      {latestMetrics.expense_fact_count === 0 ? (
                        <div className="text-xs text-muted-foreground pt-1">— No data</div>
                      ) : (
                        <div className="text-2xl font-semibold text-foreground">{formatCurrency(latestMetrics.total_expense)}</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                        <DollarSign className="size-3 text-primary" /> Net Profit
                      </div>
                      {latestMetrics.revenue_fact_count === 0 && latestMetrics.expense_fact_count === 0 ? (
                        <div className="text-xs text-muted-foreground pt-1">— Insufficient data</div>
                      ) : latestMetrics.expense_fact_count === 0 ? (
                        <div className="text-xs text-muted-foreground pt-1">— Insufficient expense data</div>
                      ) : latestMetrics.revenue_fact_count === 0 ? (
                        <div className="text-xs text-muted-foreground pt-1">— Insufficient revenue data</div>
                      ) : (
                        <div className={`text-2xl font-semibold ${latestMetrics.net_profit < 0 ? 'text-danger' : 'text-foreground'}`}>
                          {formatCurrency(latestMetrics.net_profit)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                        <Activity className="size-3 text-accent" /> Margin
                      </div>
                      {latestMetrics.operating_margin === null ? (
                        <div className="text-xs text-muted-foreground pt-1">— Insufficient data</div>
                      ) : (
                        <div className="text-2xl font-semibold text-foreground">{formatPercent(latestMetrics.operating_margin)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: DATA HEALTH */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border bg-surface-muted/30">
                <h3 className="text-sm font-medium text-foreground">Data Health</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <div className={`rounded-full p-3 bg-surface-muted border border-border`}>
                    {healthIcon}
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${healthColor}`}>{healthStatus}</div>
                    <div className="text-xs text-muted-foreground">System Status</div>
                  </div>
                </div>

                {latestMetrics && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Facts Extracted</span>
                      <span className="text-sm font-medium text-foreground">{latestMetrics.revenue_fact_count + latestMetrics.expense_fact_count}</span>
                    </div>
                    <div className="w-full h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Missing Values</span>
                      <span className="text-sm font-medium text-warning">
                        {(latestMetrics.revenue_fact_count === 0 ? 1 : 0) + (latestMetrics.expense_fact_count === 0 ? 1 : 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: RECENT DATASETS */}
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Recent Datasets</h3>
              <Link href="/dashboard/files" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <FileTable files={files.slice(0, 5)} isLoading={false} fetchError={fetchError} />
          </div>

          {/* SECTION 5: QUICK ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/files" className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 hover:bg-surface-muted transition group">
              <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
                <Database className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Upload Dataset</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Add new financial data</p>
              </div>
            </Link>
            
            <Link href="/dashboard/files" className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 hover:bg-surface-muted transition group">
              <div className="rounded-full bg-surface-muted p-3 text-muted-foreground group-hover:scale-110 transition-transform border border-border">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">View Files</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Manage existing datasets</p>
              </div>
            </Link>
          </div>

        </div>
      )}
    </div>
  )
}
