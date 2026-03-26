from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException

from app.core.firebase import get_firestore
from app.schemas.customer import CustomerCreate, CustomerUpdate

router = APIRouter()


def _normalize_customer_fields(data: dict[str, Any]) -> dict[str, Any]:
    """Trim string fields and convert empty strings to None."""
    normalized: dict[str, Any] = {}
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
            normalized[key] = value if value else None
        else:
            normalized[key] = value
    return normalized


def _is_phone_duplicate(db, phone: str | None, exclude_customer_id: str | None = None) -> bool:
    if not phone:
        return False

    docs = db.collection("customers").where("phone", "==", phone).stream()
    for doc in docs:
        if exclude_customer_id and doc.id == exclude_customer_id:
            continue
        return True
    return False


# ---------------------------
# Create Customer
# ---------------------------
@router.post("/")
def create_customer(payload: CustomerCreate):
    try:
        db = get_firestore()
        now = datetime.now(timezone.utc)
        customer_data = _normalize_customer_fields(payload.model_dump())
        customer_data["name"] = payload.name.strip()
        if _is_phone_duplicate(db, customer_data.get("phone")):
            raise HTTPException(status_code=409, detail="Phone number already exists")

        doc_ref = db.collection("customers").document()

        doc_ref.set(
            {
                "id": doc_ref.id,
                **customer_data,
                "created_at": now,
                "updated_at": None,
            }
        )

        return {
            "success": True,
            "customer_id": doc_ref.id,
            "id": doc_ref.id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Update Customer
# ---------------------------
@router.put("/{customer_id}")
def update_customer(customer_id: str, payload: CustomerUpdate):
    db = get_firestore()
    doc_ref = db.collection("customers").document(customer_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = payload.model_dump(exclude_unset=True)
    update_data = _normalize_customer_fields(update_data)

    if "name" in update_data and update_data["name"] is None:
        raise HTTPException(status_code=422, detail="Patient name cannot be empty")

    if "phone" in update_data and _is_phone_duplicate(
        db, update_data.get("phone"), exclude_customer_id=customer_id
    ):
        raise HTTPException(status_code=409, detail="Phone number already exists")

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    update_data["updated_at"] = datetime.now(timezone.utc)

    doc_ref.update(update_data)

    return {"success": True}


# ---------------------------
# Delete Customer
# ---------------------------
@router.delete("/{customer_id}")
def delete_customer(customer_id: str):
    db = get_firestore()
    doc_ref = db.collection("customers").document(customer_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Customer not found")

    doc_ref.delete()

    return {"success": True}


# ---------------------------
# Get All Customers and sort by date descending
# ---------------------------
@router.get("/")
def get_all_customers():
    db = get_firestore()
    customers_ref = db.collection("customers")
    query = (
        customers_ref.select(["name", "phone", "petName", "petType", "created_at"])
        .order_by("created_at", direction="DESCENDING")
    )
    docs = query.stream()

    customers = []
    for doc in docs:
        customer_data = doc.to_dict() or {}
        customers.append(
            {
                "id": doc.id,
                "name": customer_data.get("name"),
                "phone": customer_data.get("phone"),
                "petName": customer_data.get("petName"),
                "petType": customer_data.get("petType"),
            }
        )

    return {"customers": customers}


# ---------------------------
# Get Customer by ID
# ---------------------------
@router.get("/{customer_id}")
def get_customer_by_id(customer_id: str):
    db = get_firestore()
    doc_ref = db.collection("customers").document(customer_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer_data = doc.to_dict() or {}
    customer_data["id"] = doc.id

    return {"customer": customer_data}
