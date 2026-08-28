'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { FileRecord } from '@/lib/types/file'
import { apiFiles } from '@/lib/api/files'
import { UploadZone } from '@/components/app/upload-zone'
import { FileTable } from '@/components/app/file-table'

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const records = await apiFiles.listFiles()
        setFiles(records)
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load files.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchFiles()
  }, [])

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const record = await apiFiles.uploadFile(file)
      // Prepend the new record returned by the server — no page refresh needed.
      setFiles((prev) => [record, ...prev])
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteError(null)
    try {
      await apiFiles.deleteFile(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete file.')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-serif tracking-tight text-foreground">Files</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and manage the documents used by BizLens.
        </p>
      </div>

      <div className="space-y-8">
        <UploadZone onUpload={handleUpload} isUploading={isUploading} />

        {deleteError && (
          <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {deleteError}
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <FileTable
            files={files}
            isLoading={isLoading}
            fetchError={fetchError}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
