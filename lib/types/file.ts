export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface FileRecord {
  id: string
  owner_id: string
  original_filename: string
  file_type: string
  mime_type: string
  file_size: number
  status: ProcessingStatus
  error_message: string | null
  created_at: string
  updated_at: string
}
