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
  
  listFiles: async (): Promise<FileRecord[]> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'GET',
      headers,
    })
    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Failed to fetch files: ${errorMessage}`)
    }
    return response.json()
  },

  getFile: async (id: string): Promise<FileRecord> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: 'GET',
      headers,
    })
    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Failed to fetch file: ${errorMessage}`)
    }
    return response.json()
  },

  deleteFile: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: 'DELETE',
      headers,
    })
    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Failed to delete file: ${errorMessage}`)
    }
  },
}
