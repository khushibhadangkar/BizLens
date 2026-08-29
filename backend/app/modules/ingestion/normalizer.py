"""
BizLens Backend — Data Normalization.

Extracts normalized facts from raw ExtractedRow records.
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

def normalize_column_name(col: str) -> str:
    """Normalize column name to a consistent format for exact matching."""
    # Convert to lowercase, replace underscores and hyphens with spaces, strip whitespace
    col_str = str(col).lower().replace("_", " ").replace("-", " ")
    return " ".join(col_str.split())

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

def extract_category(row_data: dict[str, Any]) -> str | None:
    """Attempt to extract a category or dimension from common columns."""
    # Look for department, category, region, type
    for k, v in row_data.items():
        k_lower = k.lower()
        if any(x in k_lower for x in ["category", "department", "region", "type"]):
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
    cat_val = extract_category(row.row_data)
    
    for k, v in row.row_data.items():
        norm_col = normalize_column_name(k)
        canonical_name = None
        
        # Match metrics using exact aliases
        if norm_col in REVENUE_ALIASES:
            canonical_name = "revenue"
        elif norm_col in EXPENSE_ALIASES:
            canonical_name = "expense"
            
        if canonical_name:
            # Parse numeric value securely
            try:
                # Remove common currency/formatting characters
                clean_v = re.sub(r'[^\d.-]', '', str(v))
                if not clean_v or clean_v in ['-', '.']:
                    num_val = None
                else:
                    num_val = float(clean_v)
            except (ValueError, TypeError):
                num_val = None
                
            if num_val is not None:
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
