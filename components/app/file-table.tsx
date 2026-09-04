'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileRecord } from '@/lib/types/file'
import { FileType, AlertCircle, CheckCircle2, Clock, Loader2, Database, Trash2 } from 'lucide-react'

interface FileTableProps {
  files: FileRecord[]
  isLoading?: boolean
  fetchError?: string | null
  onDelete?: (id: string) => Promise<void>
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function StatusBadge({ status }: { status: FileRecord['status'] }) {
  switch (status) {
    case 'PENDING':
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">
          {status === 'PROCESSING' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          <span className="capitalize">{status.toLowerCase()}</span>
        </span>
      )
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success ring-1 ring-inset ring-success/20">
          <CheckCircle2 className="h-3 w-3" />
          <span className="capitalize">{status.toLowerCase()}</span>
        </span>
      )
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger ring-1 ring-inset ring-danger/20">
          <AlertCircle className="h-3 w-3" />
          <span className="capitalize">{status.toLowerCase()}</span>
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
          <span className="capitalize">{status}</span>
        </span>
      )
  }
}

export function FileTable({ files, isLoading, fetchError, onDelete }: FileTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!onDelete || deletingId) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch {
      // Error is displayed by the parent page component above the table.
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center border-t border-border">
        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mb-4" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading files...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center border-t border-border">
        <AlertCircle className="h-6 w-6 text-danger mb-4" aria-hidden="true" />
        <p className="text-sm text-danger">{fetchError}</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center border-t border-border">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted mb-4">
          <Database className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-medium text-foreground">No files uploaded yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          Upload a document above to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border-t border-border">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-surface-muted text-muted-foreground uppercase tracking-wider text-xs font-medium">
          <tr>
            <th scope="col" className="px-6 py-3">Filename</th>
            <th scope="col" className="px-6 py-3">Type</th>
            <th scope="col" className="px-6 py-3">Size</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3 text-right">Uploaded</th>
            <th scope="col" className="px-6 py-3 text-right"><span className="sr-only">Analytics</span></th>
            {onDelete && <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-surface-muted/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileType className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground truncate max-w-[200px] lg:max-w-[300px]">
                      {file.original_filename}
                    </span>
                    {file.error_message && (
                      <span className="text-xs text-danger truncate max-w-[200px] lg:max-w-[300px] mt-0.5">
                        {file.error_message}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="uppercase text-xs font-medium text-muted-foreground">
                  {file.file_type}
                </span>
              </td>
              <td className="px-6 py-4 text-muted-foreground">
                {formatBytes(file.file_size)}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={file.status} />
              </td>
              <td className="px-6 py-4 text-right text-muted-foreground tabular-nums">
                {new Date(file.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-6 py-4 text-right">
                {file.status === 'COMPLETED' ? (
                  <Link 
                    href={`/dashboard/analytics/${file.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    View Analytics
                  </Link>
                ) : (
                  <span className="inline-block px-3 py-1.5 text-xs font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                    Not Ready
                  </span>
                )}
              </td>
              {onDelete && (
                <td className="px-4 py-4">
                  <button
                    aria-label={`Delete ${file.original_filename}`}
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingId === file.id}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
