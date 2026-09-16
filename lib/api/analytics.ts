import { API_BASE_URL, getAuthHeaders, parseApiError } from './client'
import { FileInsightsResponse, FileMetrics, NormalizedFact, VerificationRecord } from '@/lib/types/analytics'

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

  // ── Phase 4: Insights ────────────────────────────────────────────────────

  /**
   * Retrieves deterministic business insights generated from a completed file's metrics.
   */
  getInsights: async (fileId: string): Promise<FileInsightsResponse> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/analytics/${fileId}/insights`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Failed to fetch insights: ${errorMessage}`)
    }

    return response.json()
  },

  // ── Phase 4: Verification ────────────────────────────────────────────────

  /**
   * Runs the VerificationEngine for a completed file.
   * This is a mutating POST — do not call automatically on page load.
   */
  runVerification: async (fileId: string): Promise<VerificationRecord[]> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/analytics/${fileId}/verify`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Verification failed: ${errorMessage}`)
    }

    return response.json()
  },

  /**
   * Retrieves previously persisted verification records (read-only, no recompute).
   */
  getVerificationRecords: async (fileId: string): Promise<VerificationRecord[]> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/analytics/${fileId}/verification`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorMessage = await parseApiError(response)
      throw new Error(`Failed to fetch verification records: ${errorMessage}`)
    }

    return response.json()
  },
}
