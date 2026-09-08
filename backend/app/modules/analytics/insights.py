"""
BizLens Backend — Deterministic Insights Engine.

Generates human-readable business insight observations exclusively from a
FileMetricsResult produced by MetricsEngine.  No LLM is involved.

Rules:
- All observations are derived from deterministic numerical results.
- Observations must not claim trends, growth rates, or comparisons unless
  MetricsEngine provides explicit support for them.
- Supporting values are always drawn from the FileMetricsResult, never invented.
"""

from dataclasses import dataclass
from typing import Optional

from app.modules.analytics.metrics import FileMetricsResult


@dataclass
class Insight:
    """A single deterministic business observation."""

    metric: str
    label: str
    observation: str
    supporting_value: Optional[float]


class InsightsEngine:
    """
    Generates a deterministic list of business insights from FileMetricsResult.

    The output is reproducible: identical input always produces identical output.
    """

    def __init__(self, metrics_result: FileMetricsResult) -> None:
        self._m = metrics_result

    def generate(self) -> list[Insight]:
        """Return all applicable insights for the metrics result."""
        insights: list[Insight] = []

        insights.extend(self._revenue_insight())
        insights.extend(self._expense_insight())
        insights.extend(self._profitability_insight())
        insights.extend(self._margin_insight())
        insights.extend(self._missing_revenue_insight())

        return insights

    # ------------------------------------------------------------------
    # Private helpers — each returns a list (0 or 1 Insight)
    # ------------------------------------------------------------------

    def _revenue_insight(self) -> list[Insight]:
        if self._m.total_revenue > 0:
            return [
                Insight(
                    metric="revenue",
                    label="Total Revenue",
                    observation=(
                        f"Total revenue recognised across this file is "
                        f"{self._m.total_revenue:,.2f}, drawn from "
                        f"{self._m.revenue_fact_count} revenue record(s)."
                    ),
                    supporting_value=self._m.total_revenue,
                )
            ]
        return []

    def _expense_insight(self) -> list[Insight]:
        if self._m.total_expense > 0:
            return [
                Insight(
                    metric="expense",
                    label="Total Expense",
                    observation=(
                        f"Total expenses recognised across this file are "
                        f"{self._m.total_expense:,.2f}, drawn from "
                        f"{self._m.expense_fact_count} expense record(s)."
                    ),
                    supporting_value=self._m.total_expense,
                )
            ]
        return []

    def _profitability_insight(self) -> list[Insight]:
        net = self._m.net_profit
        if net > 0:
            return [
                Insight(
                    metric="net_profit",
                    label="Profitable",
                    observation=(
                        f"The file shows a net profit of {net:,.2f}, "
                        "indicating the recognised revenue exceeds expenses."
                    ),
                    supporting_value=net,
                )
            ]
        elif net < 0:
            return [
                Insight(
                    metric="net_profit",
                    label="Operating at a Loss",
                    observation=(
                        f"The file shows a net loss of {abs(net):,.2f}, "
                        "indicating expenses exceed recognised revenue."
                    ),
                    supporting_value=net,
                )
            ]
        else:
            # Includes the case where both revenue and expense are 0.
            if self._m.total_revenue == 0 and self._m.total_expense == 0:
                return []  # No numerical data — skip profitability observation.
            return [
                Insight(
                    metric="net_profit",
                    label="Break-Even",
                    observation=(
                        "Revenue and expenses in this file are equal: "
                        "the operation appears to be at break-even."
                    ),
                    supporting_value=0.0,
                )
            ]

    def _margin_insight(self) -> list[Insight]:
        if self._m.operating_margin is not None:
            return [
                Insight(
                    metric="operating_margin",
                    label="Operating Margin",
                    observation=(
                        f"The operating margin for this file is "
                        f"{self._m.operating_margin:.2f}%, calculated as "
                        "net profit divided by total revenue."
                    ),
                    supporting_value=self._m.operating_margin,
                )
            ]
        return []

    def _missing_revenue_insight(self) -> list[Insight]:
        if self._m.revenue_fact_count == 0:
            return [
                Insight(
                    metric="data_quality",
                    label="No Revenue Columns Detected",
                    observation=(
                        "No columns with recognised revenue names were found in "
                        "this file. Upload a file whose columns match known revenue "
                        "aliases (e.g., 'Revenue', 'Sales', 'Income') to enable "
                        "revenue analysis."
                    ),
                    supporting_value=None,
                )
            ]
        return []
