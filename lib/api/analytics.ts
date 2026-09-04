import { API_BASE_URL, getAuthHeaders, parseApiError } from './client'
import { FileMetrics, NormalizedFact } from '@/lib/types/analytics'

export const apiAnalytics = {
  /**
   * Retrieves the calculated metrics for a given file.
   */
  getFileMetrics: async (fileId: string): Promise<FileMetrics> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/analytics/${fileId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Failed to fetch metrics: ${errorMessage}`)
    }

    return response.json()
  },

  /**
   * Retrieves the contributing evidence facts for a specific metric.
   */
  getEvidenceFacts: async (fileId: string, canonicalName: string): Promise<NormalizedFact[]> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/analytics/${fileId}/evidence/${canonicalName}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Failed to fetch evidence: ${errorMessage}`)
    }

    return response.json()
  },
}
