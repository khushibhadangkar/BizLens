'use client'

import { useState } from 'react'
import { FileRecord } from '@/lib/types/file'
import { apiFiles } from '@/lib/api/files'
import { UploadZone } from '@/components/app/upload-zone'
import { FileTable } from '@/components/app/file-table'

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const record = await apiFiles.uploadFile(file)
      // Prepend the new file record to the top of the local session list
      setFiles((prev) => [record, ...prev])
    } finally {
      setIsUploading(false)
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

        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <FileTable files={files} />
        </div>
      </div>
    </div>
  )
}
