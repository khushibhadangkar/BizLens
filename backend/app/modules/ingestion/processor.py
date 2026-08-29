"""
BizLens Backend — Ingestion Processor.

Handles background processing of uploaded files (e.g., CSV parsing).
"""

import csv
import logging
import uuid
import io

from app.core.database import SessionLocal
from app.modules.ingestion.models import ExtractedRow, FileRecord, NormalizedFact
from app.modules.ingestion.normalizer import normalize_extracted_rows
from app.services.storage import storage_service
from app.shared.enums import ProcessingStatus

logger = logging.getLogger(__name__)


def process_file(file_id: uuid.UUID) -> None:
    """
    Background task to process an uploaded file.
    Currently only supports CSV.
    """
    db = SessionLocal()
    try:
        # 1. Load FileRecord
        record = db.query(FileRecord).filter(FileRecord.id == file_id).first()
        if not record:
            logger.error(f"process_file: FileRecord {file_id} not found.")
            return

        # 2. Update status to PROCESSING
        record.status = ProcessingStatus.PROCESSING
        db.commit()

        try:
            # 2.5 Clean up existing rows in case of retry
            db.query(NormalizedFact).filter(NormalizedFact.file_id == file_id).delete(synchronize_session=False)
            db.query(ExtractedRow).filter(ExtractedRow.file_id == file_id).delete(synchronize_session=False)
            db.commit()

            # 3. Retrieve bytes
            file_bytes = storage_service.get_file_bytes(record.storage_path)

            # 4. Parse CSV
            # Decode to string (utf-8-sig handles BOM if present)
            text_content = file_bytes.decode("utf-8-sig")
            f = io.StringIO(text_content)
            reader = csv.DictReader(f)

            if not reader.fieldnames:
                raise ValueError("CSV file has no headers.")

            # 5. Iteratively persist rows
            # We can use db.bulk_save_objects for performance if there are many rows
            rows_to_insert = []
            for i, row in enumerate(reader, start=1):
                # Clean up row (remove None keys if trailing commas exist)
                clean_row = {k: v for k, v in row.items() if k is not None}
                
                extracted_row = ExtractedRow(
                    file_id=record.id,
                    row_number=i,
                    row_data=clean_row
                )
                rows_to_insert.append(extracted_row)
                
                # Batch insert every 1000 rows to save memory
                if len(rows_to_insert) >= 1000:
                    db.add_all(rows_to_insert)
                    db.flush()

                    # Normalize the batch
                    normalize_extracted_rows(db, rows_to_insert)
                    rows_to_insert.clear()

            if rows_to_insert:
                db.add_all(rows_to_insert)
                db.flush()

                # Normalize the final batch
                normalize_extracted_rows(db, rows_to_insert)
                rows_to_insert.clear()

            # 6. Update to COMPLETED
            record.status = ProcessingStatus.COMPLETED
            db.commit()
            logger.info(f"Successfully processed file {file_id}")

        except Exception as e:
            logger.error(f"Processing failed for file {file_id}: {e}")
            db.rollback()
            
            # 7. Update to FAILED
            record.status = ProcessingStatus.FAILED
            record.error_message = str(e)[:255] # truncate if needed
            db.commit()

    finally:
        db.close()
