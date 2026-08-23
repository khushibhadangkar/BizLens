'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { UploadCloud, FileType, AlertCircle, Loader2 } from 'lucide-react'

const ALLOWED_TYPES = ['.csv', '.xlsx', '.pdf']

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

export function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateAndUpload = async (file: File) => {
    setError(null)
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!ALLOWED_TYPES.includes(ext)) {
      setError(`Unsupported file type: ${ext}. Please upload a .csv, .xlsx, or .pdf`)
      return
    }
    
    if (file.size === 0) {
      setError('File is empty.')
      return
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_SIZE) {
      setError('File exceeds maximum size of 10 MB.')
      return
    }

    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload.')
    }
    
    // Reset input so the same file can be selected again if needed
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (isUploading) return

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (isUploading) return

    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0])
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div 
        className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-muted'}
          ${isUploading ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        role="button"
        tabIndex={0}
        aria-label="Upload document drag and drop area"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onButtonClick()
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.pdf"
          onChange={handleChange}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" aria-hidden="true" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Uploading...</p>
              <p className="text-xs text-muted-foreground mt-1">Please do not close this window.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center pointer-events-none">
            <div className="rounded-full bg-primary/10 p-4">
              <UploadCloud className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Click to upload <span className="font-normal text-muted-foreground">or drag and drop</span>
              </p>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><FileType className="h-3 w-3" /> CSV</span>
                <span className="flex items-center gap-1"><FileType className="h-3 w-3" /> XLSX</span>
                <span className="flex items-center gap-1"><FileType className="h-3 w-3" /> PDF</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
