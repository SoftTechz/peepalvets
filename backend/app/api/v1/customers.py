from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query

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


def normalize_name(name: str | None) -> str | None:
    if name is None:
        return None
    stripped = " ".join(name.strip().split())
    return stripped.lower()


def _is_phone_duplicate(
    db, phone: str | None, exclude_customer_id: str | None = None
) -> bool:
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
        customer_data["name_lower"] = normalize_name(customer_data["name"])
        # if _is_phone_duplicate(db, customer_data.get("phone")):
        #     raise HTTPException(status_code=409, detail="Phone number already exists")

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

    if "name" in update_data and update_data["name"]:
        update_data["name_lower"] = normalize_name(update_data["name"])

    # if "phone" in update_data and _is_phone_duplicate(
    #     db, update_data.get("phone"), exclude_customer_id=customer_id
    # ):
    #     raise HTTPException(status_code=409, detail="Phone number already exists")

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
# Get All Customers with pagination and optional search
# ---------------------------
@router.get("/")
def get_all_customers(
    limit: int = Query(10, ge=1, le=100),
    cursor: str | None = Query(None),
    search: str | None = Query(None, min_length=1),
):
    db = get_firestore()
    customers_ref = db.collection("customers")

    def normalize(doc):
        data = doc.to_dict() or {}
        return {
            "id": doc.id,
            "name": data.get("name"),
            "phone": data.get("phone"),
            "petName": data.get("petName"),
            "petType": data.get("petType"),
        }

    # Build base query + count query
    if search:
        term = normalize_name(search)
        if term is None or term == "":
            term = ""

        query = (
            customers_ref.order_by("name_lower")
            .start_at([term])
            .end_at([f"{term}\uf8ff"])
        )
        count_query = (
            customers_ref.order_by("name_lower")
            .start_at([term])
            .end_at([f"{term}\uf8ff"])
        )
    else:
        query = customers_ref.order_by("created_at", direction="DESCENDING")
        count_query = customers_ref

    # Apply cursor pagination
    if cursor:
        cursor_doc = customers_ref.document(cursor).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)

    query = query.limit(limit + 1)

    docs = list(query.stream())
    has_next = len(docs) > limit

    selected_docs = docs[:limit] if has_next else docs

    customers = [normalize(doc) for doc in selected_docs]

    next_cursor = None
    if has_next and selected_docs:
        next_cursor = selected_docs[-1].id

    # total count aggregation
    total = 0
    try:
        count_agg = count_query.count()
        count_snapshot = count_agg.get()
        if count_snapshot and len(count_snapshot) > 0:
            total = int(count_snapshot[0].value)
    except Exception:
        # fallback in case count aggregation not available
        total = sum(1 for _ in count_query.stream())

    return {
        "customers": customers,
        "limit": limit,
        "next_cursor": next_cursor,
        "has_next": has_next,
        "total": total,
    }


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
