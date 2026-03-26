from fastapi import APIRouter, HTTPException
from app.services.dashboard_service import DashboardService

router = APIRouter()
dashboard_service = DashboardService()


@router.get("/stats")
def get_dashboard_stats():
    """Get dashboard statistics."""
    try:
        stats = dashboard_service.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/low-stock")
def get_dashboard_low_stock(threshold: int = 50, limit: int = 10):
    """Get low stock drug details."""
    try:
        low_stock = dashboard_service.get_low_stock_drugs(threshold, limit)
        return {"success": True, "data": low_stock}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
