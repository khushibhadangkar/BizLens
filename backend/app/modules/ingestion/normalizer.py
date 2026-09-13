"""
BizLens Backend — Data Normalization.

Extracts normalized facts from raw ExtractedRow records.
Supports both wide-format and ledger-format structures.
"""

import logging
import re
from datetime import datetime, date
from typing import Any

from sqlalchemy.orm import Session
from app.modules.ingestion.models import ExtractedRow, NormalizedFact

logger = logging.getLogger(__name__)

REVENUE_ALIASES = {
    "revenue", "total revenue", "sales", "sales revenue", 
    "gross revenue", "arr", "income", "arr value"
}

EXPENSE_ALIASES = {
    "expense", "expenses", "total expense", "total expenses",
    "cost", "operating cost", "spend"
}

VALUE_FIELD_ALIASES = {
    "amount", "value", "total", "sum", "price", "cost", "net"
}

METRIC_FIELD_ALIASES = {
    "type", "metric", "account", "transaction type", "category", "line item", "classification", "class"
}

def normalize_column_name(col: str) -> str:
    """Normalize column name to a consistent format for exact matching."""
    col_str = str(col).lower().replace("_", " ").replace("-", " ")
    return " ".join(col_str.split())

def parse_numeric(val: Any) -> float | None:
    """Securely parse a numeric value, ignoring currency symbols."""
    if val is None:
        return None
    try:
        clean_v = re.sub(r'[^\d.-]', '', str(val))
        if not clean_v or clean_v in ['-', '.']:
            return None
        return float(clean_v)
    except (ValueError, TypeError):
        return None

def extract_date(row_data: dict[str, Any]) -> date | None:
    """Attempt to extract a valid date from common date columns."""
    for k, v in row_data.items():
        k_lower = k.lower()
        if "date" in k_lower or "time" in k_lower:
            try:
                # Basic ISO format YYYY-MM-DD
                parsed = datetime.strptime(str(v).strip()[:10], "%Y-%m-%d").date()
                return parsed
            except (ValueError, TypeError):
                continue
    return None

def _extract_category_excluding(row_data: dict[str, Any], exclude_keys: set[str]) -> str | None:
    """Extract category while ignoring specific keys (e.g., the metric column itself)."""
    # Order matters: prefer 'category', 'department', 'region' over 'type' 
    # since 'type' is often used for the ledger metric (e.g. Revenue/Expense).
    for term in ["category", "department", "region", "type"]:
        for k, v in row_data.items():
            if k in exclude_keys:
                continue
            if term in k.lower():
                val = str(v).strip()
                if val:
                    return val
    return None

def normalize_row(row: ExtractedRow) -> list[NormalizedFact]:
    """
    Convert a single ExtractedRow into 0 or more NormalizedFacts.
    """
    facts = []
    
    if not isinstance(row.row_data, dict):
        return facts
        
    date_val = extract_date(row.row_data)
    
    found_metrics = set()
    
    # 1. Wide Format Extraction
    for k, v in row.row_data.items():
        norm_col = normalize_column_name(k)
        canonical_name = None
        
        # Match metrics using exact aliases
        if norm_col in REVENUE_ALIASES:
            canonical_name = "revenue"
        elif norm_col in EXPENSE_ALIASES:
            canonical_name = "expense"
            
        if canonical_name:
            num_val = parse_numeric(v)
            if num_val is not None:
                cat_val = _extract_category_excluding(row.row_data, exclude_keys={k})
                fact = NormalizedFact(
                    file_id=row.file_id,
                    extracted_row_id=row.id,
                    row_number=row.row_number,
                    canonical_name=canonical_name,
                    value_numeric=num_val,
                    date_value=date_val,
                    category=cat_val
                )
                facts.append(fact)
                found_metrics.add(canonical_name)

    # 2. Ledger Format Extraction
    ledger_canonical = None
    ledger_key = None
    for k, v in row.row_data.items():
        if isinstance(v, str):
            norm_col = normalize_column_name(k)
            # Only consider values as metrics if the column name is a generic metric/type field
            if norm_col in METRIC_FIELD_ALIASES:
                norm_val = normalize_column_name(v)
                if norm_val in REVENUE_ALIASES:
                    ledger_canonical = "revenue"
                    ledger_key = k
                    break
                elif norm_val in EXPENSE_ALIASES:
                    ledger_canonical = "expense"
                    ledger_key = k
                    break
                
    if ledger_canonical and ledger_canonical not in found_metrics:
        amount_val = None
        
        # Try finding a known value column first
        for k, v in row.row_data.items():
            if k == ledger_key:
                continue
            norm_col = normalize_column_name(k)
            if norm_col in VALUE_FIELD_ALIASES:
                parsed = parse_numeric(v)
                if parsed is not None:
                    amount_val = parsed
                    break
        
        # Fallback to any numeric column that isn't date or category-like
        if amount_val is None:
            for k, v in row.row_data.items():
                if k == ledger_key:
                    continue
                norm_col = normalize_column_name(k)
                if "date" in norm_col or "time" in norm_col:
                    continue
                if any(x in norm_col for x in ["category", "department", "region", "type"]):
                    continue
                
                parsed = parse_numeric(v)
                if parsed is not None:
                    amount_val = parsed
                    break
                    
        if amount_val is not None:
            cat_val = _extract_category_excluding(row.row_data, exclude_keys={ledger_key})
            fact = NormalizedFact(
                file_id=row.file_id,
                extracted_row_id=row.id,
                row_number=row.row_number,
                canonical_name=ledger_canonical,
                value_numeric=amount_val,
                date_value=date_val,
                category=cat_val
            )
            facts.append(fact)

    return facts

def normalize_extracted_rows(db: Session, extracted_rows: list[ExtractedRow]) -> None:
    """
    Run normalization over a batch of extracted rows and persist facts.
    """
    facts_to_insert = []
    for row in extracted_rows:
        facts = normalize_row(row)
        facts_to_insert.extend(facts)
        
    if facts_to_insert:
        db.add_all(facts_to_insert)
        db.flush()
