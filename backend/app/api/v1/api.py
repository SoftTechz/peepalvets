from fastapi import APIRouter
from app.api.v1 import appointments, auth, billing, customers, dashboard, drugs, reports

# items, invoices, dashboard

router = APIRouter()

# Include all routers
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(customers.router, prefix="/customers", tags=["customers"])
router.include_router(drugs.router, prefix="/drugs", tags=["drugs"])
router.include_router(
    appointments.router, prefix="/appointments", tags=["appointments"]
)
router.include_router(billing.router, prefix="/billing", tags=["billing"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])
# router.include_router(items.router, prefix="/items", tags=["items"])
# router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
