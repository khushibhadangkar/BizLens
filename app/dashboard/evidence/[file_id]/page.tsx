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
  FileSearch,
} from 'lucide-react'
import { apiAnalytics } from '@/lib/api/analytics'
import { apiFiles } from '@/lib/api/files'
import { NormalizedFact } from '@/lib/types/analytics'
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

type FactWithType = NormalizedFact & { type: 'revenue' | 'expense' }
type FactFilter = 'all' | 'revenue' | 'expense'

export default function EvidenceFilePage() {
  const params = useParams()
  const fileId = params.file_id as string

  const [file, setFile] = useState<FileRecord | null>(null)
  const [facts, setFacts] = useState<FactWithType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FactFilter>('all')

  useEffect(() => {
    if (!fileId) return
    const load = async () => {
      try {
        setIsLoading(true)
        const [fileData, revData, expData] = await Promise.all([
          apiFiles.getFile(fileId),
          apiAnalytics.getEvidenceFacts(fileId, 'revenue'),
          apiAnalytics.getEvidenceFacts(fileId, 'expense'),
        ])
        setFile(fileData)
        const combined: FactWithType[] = [
          ...revData.map((f) => ({ ...f, type: 'revenue' as const })),
          ...expData.map((f) => ({ ...f, type: 'expense' as const })),
        ].sort((a, b) => a.row_number - b.row_number)
        setFacts(combined)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load evidence.'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [fileId])

  const displayed = filter === 'all' ? facts : facts.filter((f) => f.type === filter)
  const revenueCount = facts.filter((f) => f.type === 'revenue').length
  const expenseCount = facts.filter((f) => f.type === 'expense').length

  if (isLoading) {
    return (
      <div className="max-w-5xl animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading evidence...
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 h-64 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <Link
          href="/dashboard/evidence"
          className={buttonVariants({ variant: 'ghost', className: 'mb-6 -ml-4 text-muted-foreground' })}
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Evidence
        </Link>
        <div className="rounded-xl border border-border bg-surface shadow-sm p-12 text-center flex flex-col items-center">
          <AlertCircle className="size-10 text-danger mb-4" />
          <h3 className="text-lg font-medium text-foreground">Failed to load evidence</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">{error}</p>
          <div className="mt-8">
            <Link href="/dashboard/evidence" className={buttonVariants({ variant: 'default' })}>
              Return to Evidence
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/evidence"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 size-4" /> Back to datasets
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-serif tracking-tight text-foreground">
              {file?.original_filename}
            </h2>
            {file?.status && (
              <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success ring-1 ring-inset ring-success/20 uppercase tracking-wider">
                {file.status}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {facts.length} fact{facts.length !== 1 ? 's' : ''} extracted &middot;{' '}
            {revenueCount} revenue &middot; {expenseCount} expense
          </p>
        </div>
      </div>

      {facts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-16 text-center flex flex-col items-center">
          <FileSearch className="size-10 text-muted-foreground mb-4" />
          <h3 className="text-base font-medium text-foreground mb-2">No facts found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            No recognizable financial facts were extracted from this dataset.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Filter controls */}
          <div className="flex items-center gap-2">
            {(['all', 'revenue', 'expense'] as FactFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors border',
                  filter === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted hover:text-foreground',
                )}
              >
                {f === 'revenue' && <TrendingUp className="size-3 text-success" />}
                {f === 'expense' && <TrendingDown className="size-3 text-danger" />}
                <span className="capitalize">{f}</span>
                <span className="ml-1 tabular-nums opacity-60">
                  ({f === 'all' ? facts.length : f === 'revenue' ? revenueCount : expenseCount})
                </span>
              </button>
            ))}
          </div>

          {/* Evidence table */}
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-muted text-muted-foreground uppercase tracking-wider text-xs font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Source Row</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {displayed.map((fact) => (
                    <tr key={fact.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-6 py-3 text-muted-foreground tabular-nums">
                        Row {fact.row_number}
                      </td>
                      <td className="px-6 py-3">
                        {fact.type === 'revenue' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                            <TrendingUp className="size-3" />Revenue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger">
                            <TrendingDown className="size-3" />Expense
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{fact.category || '—'}</td>
                      <td className="px-6 py-3 text-muted-foreground">{fact.date_value || '—'}</td>
                      <td className="px-6 py-3 text-right font-medium tabular-nums">
                        {fact.value_numeric !== null ? formatCurrency(fact.value_numeric) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-right">
            Showing {displayed.length} of {facts.length} fact{facts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
