'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle, Database, FileText, ArrowRight } from 'lucide-react'
import { apiFiles } from '@/lib/api/files'
import { FileRecord } from '@/lib/types/file'
import { buttonVariants } from '@/components/ui/button'

function formatBytes(bytes: number): string {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function EvidenceIndexPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const records = await apiFiles.listFiles()
        const completed = records
          .filter((f) => f.status === 'COMPLETED')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setFiles(completed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load datasets.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-5xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-serif tracking-tight text-foreground">Evidence</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Trace every metric back to the underlying data.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center flex flex-col items-center">
          <AlertCircle className="size-8 text-danger mb-3" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-16 text-center flex flex-col items-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted mb-4 border border-border">
            <Database className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-2">No completed datasets</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Upload and process a dataset to inspect its evidence.
          </p>
          <Link href="/dashboard/files" className={buttonVariants({ variant: 'default' })}>
            Go to Files
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <Link
              key={file.id}
              href={`/dashboard/evidence/${file.id}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 hover:bg-surface-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-surface-muted p-3 border border-border group-hover:border-foreground/20 transition-colors">
                  <FileText className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {file.original_filename}
                    </p>
                    <span className="inline-flex items-center rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success ring-1 ring-inset ring-success/20">
                      {file.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(file.file_size)} &middot;{' '}
                    {new Date(file.created_at).toLocaleDateString([], {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Inspect Evidence
                </span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
