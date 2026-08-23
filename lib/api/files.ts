import { API_BASE_URL, getAuthHeaders, parseApiError } from './client'
import { FileRecord } from '@/lib/types/file'

export const apiFiles = {
  /**
   * Uploads a file to the backend
   * @param file File to upload
   */
  uploadFile: async (file: File): Promise<FileRecord> => {
    const headers = await getAuthHeaders()
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'POST',
      body: formData,
      headers: {
        ...headers,
      }
    })
    
    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Upload failed: ${errorMessage}`)
    }
    
    return response.json()
  },
  
  // BLOCKED: awaiting GET /api/v1/files
  listFiles: async (): Promise<FileRecord[]> => {
    throw new Error('Not implemented')
  },

  // BLOCKED: awaiting GET /api/v1/files/:id
  getFile: async (): Promise<FileRecord> => {
    throw new Error('Not implemented')
  },

  // BLOCKED: awaiting DELETE /api/v1/files/:id
  deleteFile: async (): Promise<void> => {
    throw new Error('Not implemented')
  },
}
