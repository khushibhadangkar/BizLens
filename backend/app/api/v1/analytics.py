"""
BizLens Backend — Analytics API Router.

Exposes the deterministic MetricsEngine through authenticated HTTP endpoints.
All calculations are performed by MetricsEngine; this router is a thin HTTP
layer that enforces authentication and file ownership, then delegates.

Architecture reminder:
  ANALYTICS COMPUTES  ← this router + MetricsEngine
  LLM EXPLAINS        ← future phase
  VERIFICATION VALIDATES ← future phase
"""

import uuid
import logging

from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import AuthenticatedUser, DbSession
from app.modules.analytics.metrics import MetricsEngine
from app.modules.analytics.schemas import FileMetricsResponse, NormalizedFactResponse
from app.modules.ingestion.models import FileRecord
from app.shared.enums import ProcessingStatus

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics"])


def _get_completed_file(
    file_id: uuid.UUID,
    user_id: str,
    db: DbSession,
) -> FileRecord:
    """
    Shared ownership + status guard used by both analytics endpoints.

    Returns the FileRecord when:
      - It exists AND belongs to the authenticated user.
      - Its processing status is COMPLETED.

    Raises:
      HTTP 404 — file does not exist or belongs to a different user.
      HTTP 409 — file exists and is owned by the user but is not yet COMPLETED.
    """
    record = (
        db.query(FileRecord)
        .filter(FileRecord.id == file_id, FileRecord.owner_id == user_id)
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    if record.status != ProcessingStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"File is not ready for analysis. "
                f"Current status: {record.status}. "
                "Analytics are available only after processing completes."
            ),
        )

    return record


# ---------------------------------------------------------------------------
# GET /api/v1/analytics/{file_id}
# ---------------------------------------------------------------------------

@router.get("/{file_id}", response_model=FileMetricsResponse)
def get_file_metrics(
    file_id: uuid.UUID,
    user_id: AuthenticatedUser,
    db: DbSession,
) -> FileMetricsResponse:
    """
    Return deterministic business metrics for a completed file.

    Metrics are calculated exclusively by MetricsEngine from NormalizedFact
    records.  No LLM or heuristic is involved.

    Returns:
        FileMetricsResponse with revenue, expense, profit, and margin.

    Raises:
        401 — missing or invalid JWT.
        404 — file not found or belongs to a different user.
        409 — file exists but has not finished processing.
    """
    _get_completed_file(file_id, user_id, db)

    engine = MetricsEngine(db, file_id)
    result = engine.calculate()

    logger.info(
        "Metrics calculated for file_id=%s user_id=%s revenue=%.2f expense=%.2f",
        file_id,
        user_id,
        result.total_revenue,
        result.total_expense,
    )

    return FileMetricsResponse.model_validate(result)


# ---------------------------------------------------------------------------
# GET /api/v1/analytics/{file_id}/evidence/{canonical_name}
# ---------------------------------------------------------------------------

@router.get(
    "/{file_id}/evidence/{canonical_name}",
    response_model=list[NormalizedFactResponse],
)
def get_contributing_facts(
    file_id: uuid.UUID,
    canonical_name: str,
    user_id: AuthenticatedUser,
    db: DbSession,
) -> list[NormalizedFactResponse]:
    """
    Return the individual NormalizedFact records that contribute to a metric.

    This provides full provenance tracing: each fact carries its source row
    number and the UUID of the ExtractedRow that contains the original CSV data.

    Currently supported canonical_name values: "revenue", "expense".
    For an unrecognised canonical_name the query finds no facts and returns [].

    Returns:
        List of NormalizedFactResponse (may be empty).

    Raises:
        401 — missing or invalid JWT.
        404 — file not found or belongs to a different user.
        409 — file exists but has not finished processing.
    """
    _get_completed_file(file_id, user_id, db)

    engine = MetricsEngine(db, file_id)
    facts = engine.get_contributing_facts_query(canonical_name).all()

    logger.info(
        "Evidence query: file_id=%s canonical_name=%s facts_returned=%d",
        file_id,
        canonical_name,
        len(facts),
    )

    return [NormalizedFactResponse.model_validate(f) for f in facts]
