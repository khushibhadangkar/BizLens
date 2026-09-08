"""create_verification_records

Revision ID: 8h890i983874
Revises: 7g789h872763
Create Date: 2026-09-08

Creates the verification_records table and the verification_status enum.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8h890i983874"
down_revision = "7g789h872763"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "verification_records",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("file_id", sa.UUID(), nullable=False),
        sa.Column("metric", sa.String(), nullable=False),
        sa.Column("claimed_value", sa.Float(), nullable=False),
        sa.Column("verified_value", sa.Float(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "VERIFIED",
                "NEEDS_REVIEW",
                "UNABLE_TO_VERIFY",
                name="verification_status",
                create_type=True,  # Enum type is created once here.
            ),
            nullable=False,
        ),
        sa.Column("fact_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["file_id"],
            ["file_records.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_verification_records_file_id"),
        "verification_records",
        ["file_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_verification_records_metric"),
        "verification_records",
        ["metric"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_verification_records_metric"),
        table_name="verification_records",
    )
    op.drop_index(
        op.f("ix_verification_records_file_id"),
        table_name="verification_records",
    )
    op.drop_table("verification_records")

    # Drop the enum after the table is gone.
    verification_status_enum = sa.Enum(name="verification_status")
    verification_status_enum.drop(op.get_bind(), checkfirst=True)
