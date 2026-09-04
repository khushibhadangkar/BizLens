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
