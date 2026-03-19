import logging
from app.core.firebase import get_firestore

logger = logging.getLogger(__name__)


class DashboardService:
    def __init__(self):
        self.db = get_firestore()

    def get_stats(self) -> dict:
        """Fetch dashboard counters for invoices, customers, and items."""
        try:
            # count_doc = self.db.collection("Count").document("count").get()
            # count_data = count_doc.to_dict() if count_doc.exists else {}

            # total_invoices = int(count_data.get("inv_no", 0) or 0)
            total_customers = len(
                list(
                    self.db.collection("customers")
                    .where("is_active", "==", True)
                    .stream()
                )
            )
            # total_items = len(
            #     list(
            #         self.db.collection("items").where("is_active", "==", True).stream()
            #     )
            # )
            # # calculate the total fiels in totals metadata of all invoices
            # invoices = self.db.collection("invoices").stream()
            # total_revenue = 0
            # for invoice in invoices:
            #     invoice_data = invoice.to_dict()
            #     totals = invoice_data.get("totals", {})
            #     total_revenue += float(totals.get("total", 0) or 0)

            return {
                # "total_invoices": total_invoices,
                "total_customers": total_customers,
                # "total_items": total_items,
                # "total_revenue": total_revenue,
            }
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}")
            raise Exception(f"Failed to fetch dashboard stats: {str(e)}")
