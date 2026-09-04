"""
BizLens Backend — Analytics Response Schemas.

Pydantic schemas that serialise the output of MetricsEngine and
the NormalizedFact provenance records for the Analytics API.
These schemas are read-only (API response only); they do not define
new database tables or alter any existing model.
"""

import uuid
from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FileMetricsResponse(BaseModel):
    """
    Serialises a FileMetricsResult returned by MetricsEngine.calculate().

    All numeric fields reflect deterministic SQL aggregates — no LLM involvement.
    operating_margin is None when total_revenue is zero (divide-by-zero guard).
    """

    file_id: uuid.UUID
    total_revenue: float
    total_expense: float
    net_profit: float
    operating_margin: Optional[float]
    revenue_fact_count: int
    expense_fact_count: int

    # FileMetricsResult is a dataclass, not an ORM model, so from_attributes
    # is needed so Pydantic can read its fields directly.
    model_config = ConfigDict(from_attributes=True)


class NormalizedFactResponse(BaseModel):
    """
    Serialises a single NormalizedFact ORM record for evidence/provenance responses.

    Fields are limited to those useful for tracing a metric back to its source row.
    Internal implementation columns (e.g. value_string, created_at) are omitted.
    """

    id: uuid.UUID
    extracted_row_id: uuid.UUID
    row_number: int
    canonical_name: str
    value_numeric: Optional[float]
    date_value: Optional[date]
    category: Optional[str]

    # NormalizedFact is a SQLAlchemy ORM model.
    model_config = ConfigDict(from_attributes=True)
