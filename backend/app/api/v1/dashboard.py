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
