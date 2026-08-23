import { supabase } from '@/lib/supabase/client'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Authentication required')
  }

  return { Authorization: `Bearer ${session.access_token}` }
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
  } catch {
    return response.statusText
  }
}
