import logging
from app.core.firebase import get_firestore

logger = logging.getLogger(__name__)


class DashboardService:
    def __init__(self):
        self.db = get_firestore()

    def get_stats(self) -> dict:
        """Fetch dashboard counters for patients, appointments, drugs, and revenue."""
        try:
            total_customers = len(list(self.db.collection("customers").stream()))
            total_appointments = len(list(self.db.collection("appointments").stream()))
            total_drugs = len(list(self.db.collection("drugs").stream()))

            # Calculate total revenue from doctor fees of all appointments
            total_revenue = 0.0
            for doc in self.db.collection("appointments").stream():
                appointment_data = doc.to_dict() or {}
                doctor_fee = appointment_data.get("doctorFee", 0)
                total_revenue += float(doctor_fee or 0)

            return {
                "total_customers": total_customers,
                "total_appointments": total_appointments,
                "total_drugs": total_drugs,
                "total_revenue": round(total_revenue, 2),
            }
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}")
            raise Exception(f"Failed to fetch dashboard stats: {str(e)}")

    def get_low_stock_drugs(self, threshold: int = 50, limit: int = 10) -> list:
        """Fetch low stock drugs sorted by quantity ascending."""
        try:
            query = (
                self.db.collection("drugs")
                .where("presentQuantity", "<", threshold)
                .order_by("presentQuantity", direction="ASCENDING")
                .limit(limit)
            )
            docs = query.stream()

            low_stock = []
            for doc in docs:
                d = doc.to_dict() or {}
                low_stock.append(
                    {
                        "id": doc.id,
                        "name": d.get("name"),
                        "category": d.get("category", "General"),
                        "quantity": int(d.get("presentQuantity", 0) or 0),
                        "lastAddedDate": d.get("lastAddedDate", "N/A"),
                        "status": (
                            "critical"
                            if int(d.get("presentQuantity", 0) or 0) < 20
                            else "low"
                        ),
                    }
                )

            return low_stock
        except Exception as e:
            logger.error(f"Error fetching low stock drugs: {str(e)}")
            raise Exception(f"Failed to fetch low stock drugs: {str(e)}")
