export const rawCsvDatasets = {
  financialLedger: `transaction_id,date,category,department,revenue,expense,net_margin,status,source_file
TX-1001,2024-07-01,Enterprise Licensing,Sales,485000,120000,75.2%,verified,q3_finance_ledger.csv
TX-1002,2024-07-15,Cloud Infrastructure,Engineering,0,84000,-100%,verified,q3_finance_ledger.csv
TX-1003,2024-08-01,Enterprise Renewal,Sales,620000,140000,77.4%,verified,q3_finance_ledger.csv
TX-1004,2024-08-14,Paid Performance Ads,Marketing,0,165000,-100%,verified,q3_finance_ledger.csv
TX-1005,2024-09-01,Expansion ARR,Sales,740000,180000,75.6%,verified,q3_finance_ledger.csv
TX-1006,2024-09-18,Enterprise Services,Consulting,310000,95000,69.3%,verified,q3_finance_ledger.csv
TX-1007,2024-09-28,Unverified Renewal,Sales,184000,0,100%,conflict,crm_export_q3.csv`,

  crmDeals: `deal_id,account_name,region,arr_value,stage,close_date,confidence_score,verified_evidence
DEAL-801,Acme Corp Global,North America,485000,Closed Won,2024-07-01,98%,q3_finance_ledger.csv:L2
DEAL-802,Vertex Dynamics,Europe,620000,Closed Won,2024-08-01,96%,q3_finance_ledger.csv:L4
DEAL-803,Aether Systems,North America,740000,Closed Won,2024-09-01,97%,q3_finance_ledger.csv:L6
DEAL-804,Nova Global Inc,Asia Pacific,184000,Pending Audit,2024-09-28,61%,board_meeting_minutes.pdf:L12
DEAL-805,Horizon Tech,Europe,310000,Closed Won,2024-09-18,94%,q3_finance_ledger.csv:L7`,

  auditLog: `audit_id,claim_statement,evidence_source,confidence,status,verified_by
AUD-901,Q3 Revenue total reached $2.84M with 18.6% YoY growth,q3_finance_ledger.csv,96%,VERIFIED,BizLens AI Engine
AUD-902,May marketing campaign caused 2.4pt margin contraction,q3_finance_ledger.csv:TX-1004,91%,VERIFIED,BizLens AI Engine
AUD-903,Enterprise renewal discrepancy detected between CRM and Board Minutes,crm_export_q3.csv vs board_report.pdf,61%,CONFLICT_FLAGGED,BizLens AI Engine`
}

export interface LedgerRow {
  transaction_id: string
  date: string
  category: string
  department: string
  revenue: number
  expense: number
  net_margin: string
  status: 'verified' | 'conflict'
  source_file: string
}

export const parsedLedgerData: LedgerRow[] = [
  { transaction_id: 'TX-1001', date: '2024-07-01', category: 'Enterprise Licensing', department: 'Sales', revenue: 485000, expense: 120000, net_margin: '75.2%', status: 'verified', source_file: 'q3_finance_ledger.csv' },
  { transaction_id: 'TX-1002', date: '2024-07-15', category: 'Cloud Infrastructure', department: 'Engineering', revenue: 0, expense: 84000, net_margin: '-100%', status: 'verified', source_file: 'q3_finance_ledger.csv' },
  { transaction_id: 'TX-1003', date: '2024-08-01', category: 'Enterprise Renewal', department: 'Sales', revenue: 620000, expense: 140000, net_margin: '77.4%', status: 'verified', source_file: 'q3_finance_ledger.csv' },
  { transaction_id: 'TX-1004', date: '2024-08-14', category: 'Paid Performance Ads', department: 'Marketing', revenue: 0, expense: 165000, net_margin: '-100%', status: 'verified', source_file: 'q3_finance_ledger.csv' },
  { transaction_id: 'TX-1005', date: '2024-09-01', category: 'Expansion ARR', department: 'Sales', revenue: 740000, expense: 180000, net_margin: '75.6%', status: 'verified', source_file: 'q3_finance_ledger.csv' },
  { transaction_id: 'TX-1006', date: '2024-09-18', category: 'Enterprise Services', department: 'Consulting', revenue: 310000, expense: 95000, net_margin: '69.3%', status: 'verified', source_file: 'q3_finance_ledger.csv' },
  { transaction_id: 'TX-1007', date: '2024-09-28', category: 'Unverified Renewal', department: 'Sales', revenue: 184000, expense: 0, net_margin: '100%', status: 'conflict', source_file: 'crm_export_q3.csv' }
]

export const novaRetail = {
  company: 'Nova Retail Group',
  period: 'Q3 2024',
  revenue: '$2.84M',
  growth: '+18.6%',
  margin: '34.2%',
  trust: 96,
  sources: [
    { name: 'q3_finance_ledger.csv', type: 'Finance CSV', updated: '2m ago', status: 'verified', rows: 7 },
    { name: 'crm_export_q3.csv', type: 'CRM CSV', updated: '4m ago', status: 'verified', rows: 5 },
    { name: 'board_report.pdf', type: 'Board PDF', updated: '12m ago', status: 'conflict', rows: 14 },
  ],
  claims: [
    { id: 'revenue', label: 'Revenue is accelerating', value: '+18.6%', confidence: 96, status: 'verified', detail: 'Revenue climbed from $2.39M to $2.84M across the period.', evidence: ['q3_finance_ledger.csv · Line 2 (TX-1001)', 'crm_export_q3.csv · Deal 801-803', 'board_report.pdf · Page 4'] },
    { id: 'renewals', label: 'Renewals need review', value: '$184k gap', confidence: 61, status: 'conflict', detail: 'CRM export and board report disagree on enterprise renewal timing.', evidence: ['crm_export_q3.csv · Deal 804 (Nova Global)', 'board_report.pdf · Page 7 Section B'] },
    { id: 'margin', label: 'Paid acquisition compressed margin', value: '-2.4 pts', confidence: 91, status: 'verified', detail: 'Paid acquisition expense of $165k (TX-1004) explains May margin shift.', evidence: ['q3_finance_ledger.csv · Line 5 (TX-1004)', 'campaign_export.csv · Campaign #402'] },
  ],
  forecast: [
    { month: 'Jul', actual: 485, forecast: 470, net_profit: 365 },
    { month: 'Aug', actual: 620, forecast: 610, net_profit: 480 },
    { month: 'Sep', actual: 740, forecast: 730, net_profit: 560 },
    { month: 'Oct', actual: null, forecast: 810, net_profit: 630 },
    { month: 'Nov', actual: null, forecast: 890, net_profit: 690 },
    { month: 'Dec', actual: null, forecast: 980, net_profit: 760 },
  ],
} as const

export type Claim = (typeof novaRetail.claims)[number]
export type Source = (typeof novaRetail.sources)[number]

export const workflowSteps = ['Upload', 'Analyze', 'Retrieve', 'Generate', 'Verify', 'Decide'] as const

export const copilotAnswers: Record<string, string> = {
  'Why did margin move?': 'Margin compressed 2.4 points in May due to $165k spent on paid performance ads (TX-1004 in q3_finance_ledger.csv). The P&L and campaign logs correlate 100%.',
  'Which source is conflicting?': 'The CRM export (Deal 804) and board report (Page 7) disagree on the $184k enterprise renewal timing. BizLens flagged this as a conflict.',
  'What should we do next?': 'Prioritize enterprise expansion in Q3, then re-allocate paid acquisition spend. Both recommendations are verified by 3 independent CSV sources.',
}

export const sampleQueries = [
  { name: 'Verified Revenue Summary', query: "SELECT SUM(revenue) FROM ledger WHERE status = 'verified';" },
  { name: 'Department Expense Breakdown', query: 'SELECT department, SUM(expense) FROM ledger GROUP BY department;' },
  { name: 'Conflicting Records Audit', query: "SELECT * FROM ledger WHERE status = 'conflict';" },
]

