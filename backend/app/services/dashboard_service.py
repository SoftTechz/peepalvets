import logging
import time
from app.core.firebase import get_firestore

logger = logging.getLogger(__name__)


class DashboardService:
    def __init__(self):
        self.db = get_firestore()

    def get_stats(self) -> dict:
        """Fetch dashboard counters for patients, appointments, drugs, and revenue."""
        start_total = time.time()
        try:
            t0 = time.time()
            total_customers = len(list(self.db.collection("customers").stream()))
            print(f"[TIME] DashboardService.get_stats customers count: {time.time() - t0:.4f}s")

            t1 = time.time()
            total_appointments = len(list(self.db.collection("appointments").stream()))
            print(f"[TIME] DashboardService.get_stats appointments count: {time.time() - t1:.4f}s")

            t2 = time.time()
            total_drugs = len(list(self.db.collection("drugs").stream()))
            print(f"[TIME] DashboardService.get_stats drugs count: {time.time() - t2:.4f}s")

            # Calculate total revenue from doctor fees of all appointments
            t3 = time.time()
            total_revenue = 0.0
            for doc in self.db.collection("appointments").stream():
                appointment_data = doc.to_dict() or {}
                doctor_fee = appointment_data.get("doctorFee", 0)
                total_revenue += float(doctor_fee or 0)
            print(f"[TIME] DashboardService.get_stats revenue calc: {time.time() - t3:.4f}s")

            print(f"[TIME] DashboardService.get_stats TOTAL: {time.time() - start_total:.4f}s")

            return {
                "total_customers": total_customers,
                "total_appointments": total_appointments,
                "total_drugs": total_drugs,
                "total_revenue": round(total_revenue, 2),
            }
        except Exception as e:
            print(
                f"[TIME] DashboardService.get_stats TOTAL (error): {time.time() - start_total:.4f}s"
            )
            logger.error(f"Error fetching dashboard stats: {str(e)}")
            raise Exception(f"Failed to fetch dashboard stats: {str(e)}")

    def get_low_stock_drugs(self, threshold: int = 50, limit: int = 10) -> list:
        """Fetch low stock drugs sorted by quantity ascending."""
        start_total = time.time()
        try:
            t0 = time.time()
            query = (
                self.db.collection("drugs")
                .where("presentQuantity", "<", threshold)
                .order_by("presentQuantity", direction="ASCENDING")
                .limit(limit)
            )
            print(f"[TIME] DashboardService.get_low_stock_drugs query build: {time.time() - t0:.4f}s")

            t1 = time.time()
            docs = list(query.stream())
            print(f"[TIME] DashboardService.get_low_stock_drugs stream fetch: {time.time() - t1:.4f}s")

            t2 = time.time()
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
            print(f"[TIME] DashboardService.get_low_stock_drugs normalize: {time.time() - t2:.4f}s")
            print(f"[TIME] DashboardService.get_low_stock_drugs TOTAL: {time.time() - start_total:.4f}s")

            return low_stock
        except Exception as e:
            print(
                "[TIME] DashboardService.get_low_stock_drugs TOTAL (error): "
                f"{time.time() - start_total:.4f}s"
            )
            logger.error(f"Error fetching low stock drugs: {str(e)}")
            raise Exception(f"Failed to fetch low stock drugs: {str(e)}")
