export interface FileMetrics {
  file_id: string
  total_revenue: number
  total_expense: number
  net_profit: number
  operating_margin: number | null
  revenue_fact_count: number
  expense_fact_count: number
}

export interface NormalizedFact {
  id: string
  extracted_row_id: string
  row_number: number
  canonical_name: string
  value_numeric: number | null
  date_value: string | null
  category: string | null
}

// ── Phase 4: Insights ──────────────────────────────────────────────────────

export interface Insight {
  metric: string
  label: string
  observation: string
  supporting_value: number | null
}

export interface FileInsightsResponse {
  file_id: string
  insights: Insight[]
}

// ── Phase 4: Verification ──────────────────────────────────────────────────

export type VerificationStatus = 'VERIFIED' | 'NEEDS_REVIEW' | 'UNABLE_TO_VERIFY'

export interface VerificationRecord {
  id: string
  file_id: string
  metric: string
  claimed_value: number
  verified_value: number
  status: VerificationStatus
  fact_count: number
  created_at: string
}
