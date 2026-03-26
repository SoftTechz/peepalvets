from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.core.firebase import get_firestore
from app.schemas.drug import (
    DrugCreate,
    DrugEntryCreate,
    DrugNameUpdate,
    DrugTemplateCreate,
)

router = APIRouter()


def _normalize_number(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _build_history_entry(
    date: str,
    quantity: float,
    price: float,
    gst_percent: float = 0,
) -> dict[str, Any]:
    qty = _normalize_number(quantity)
    unit_price = _normalize_number(price)
    gst_value = _normalize_number(gst_percent)
    base_amount = qty * unit_price
    gst_amount = base_amount * gst_value / 100
    return {
        "id": f"entry_{uuid4().hex}",
        "date": date,
        "quantity": qty,
        "price": unit_price,
        "gstPercent": gst_value,
        "baseAmount": base_amount,
        "gstAmount": gst_amount,
        "totalBill": base_amount + gst_amount,
    }


def _recalculate_drug_fields(drug_data: dict[str, Any]) -> dict[str, Any]:
    history = drug_data.get("history") or []
    present_quantity = sum(_normalize_number(entry.get("quantity")) for entry in history)
    total_bill = sum(_normalize_number(entry.get("totalBill")) for entry in history)

    latest_entry = history[0] if history else None
    oldest_entry = history[-1] if history else None

    return {
        **drug_data,
        "presentQuantity": present_quantity,
        "totalBill": total_bill,
        "latestPrice": _normalize_number(latest_entry.get("price")) if latest_entry else 0,
        "lastAddedDate": latest_entry.get("date") if latest_entry else None,
        "addedOn": oldest_entry.get("date") if oldest_entry else drug_data.get("addedOn"),
    }


@router.post("/")
def create_drug(payload: DrugCreate):
    try:
        db = get_firestore()
        drugs_ref = db.collection("drugs")

        name = payload.name.strip()
        existing = list(drugs_ref.where("name", "==", name).stream())
        if existing:
            raise HTTPException(status_code=400, detail="Drug name already exists")

        now = datetime.now(timezone.utc)
        doc_ref = drugs_ref.document()

        entry = _build_history_entry(
            payload.date,
            payload.quantity,
            payload.price,
            payload.gstPercent,
        )
        doc_ref.set(
            {
                "id": doc_ref.id,
                "name": name,
                "addedOn": payload.date,
                "lastAddedDate": payload.date,
                "presentQuantity": entry["quantity"],
                "latestPrice": entry["price"],
                "totalBill": entry["totalBill"],
                "history": [entry],
                "created_at": now,
                "updated_at": None,
            }
        )

        return {"success": True, "drug_id": doc_ref.id, "id": doc_ref.id}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/")
def get_all_drugs():
    db = get_firestore()
    docs = (
        db.collection("drugs")
        .select(["name", "lastAddedDate", "presentQuantity", "created_at"])
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )

    drugs = []
    for doc in docs:
        drug_data = doc.to_dict() or {}
        drug_data["id"] = doc.id
        drugs.append(drug_data)

    return {"drugs": drugs}


@router.get("/{drug_id}")
def get_drug_by_id(drug_id: str):
    db = get_firestore()
    doc_ref = db.collection("drugs").document(drug_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Drug not found")

    drug_data = doc.to_dict() or {}
    drug_data["id"] = doc.id
    return {"drug": drug_data}


@router.put("/{drug_id}/name")
def update_drug_name(drug_id: str, payload: DrugNameUpdate):
    db = get_firestore()
    drugs_ref = db.collection("drugs")
    doc_ref = drugs_ref.document(drug_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Drug not found")

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Drug name is required")
    existing = list(drugs_ref.where("name", "==", name).stream())
    if any(match.id != drug_id for match in existing):
        raise HTTPException(status_code=400, detail="Drug name already exists")

    doc_ref.update({"name": name, "updated_at": datetime.now(timezone.utc)})
    return {"success": True}


@router.post("/{drug_id}/entries")
def add_drug_entry(drug_id: str, payload: DrugEntryCreate):
    db = get_firestore()
    doc_ref = db.collection("drugs").document(drug_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Drug not found")

    current = doc.to_dict() or {}
    history = current.get("history") or []
    entry = _build_history_entry(
        payload.date,
        payload.quantity,
        payload.price,
        payload.gstPercent,
    )
    updated_history = [entry, *history]

    updated = _recalculate_drug_fields({**current, "history": updated_history})
    updated["updated_at"] = datetime.now(timezone.utc)

    doc_ref.update(
        {
            "history": updated["history"],
            "presentQuantity": updated["presentQuantity"],
            "totalBill": updated["totalBill"],
            "latestPrice": updated["latestPrice"],
            "lastAddedDate": updated["lastAddedDate"],
            "addedOn": updated["addedOn"],
            "updated_at": updated["updated_at"],
        }
    )

    return {"success": True}


@router.delete("/{drug_id}/entries/{entry_id}")
def delete_drug_entry(drug_id: str, entry_id: str):
    db = get_firestore()
    doc_ref = db.collection("drugs").document(drug_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Drug not found")

    current = doc.to_dict() or {}
    history = current.get("history") or []
    updated_history = [entry for entry in history if entry.get("id") != entry_id]
    if len(updated_history) == len(history):
        raise HTTPException(status_code=404, detail="History entry not found")

    updated = _recalculate_drug_fields({**current, "history": updated_history})
    updated["updated_at"] = datetime.now(timezone.utc)

    doc_ref.update(
        {
            "history": updated["history"],
            "presentQuantity": updated["presentQuantity"],
            "totalBill": updated["totalBill"],
            "latestPrice": updated["latestPrice"],
            "lastAddedDate": updated["lastAddedDate"],
            "addedOn": updated["addedOn"],
            "updated_at": updated["updated_at"],
        }
    )

    return {"success": True}


@router.delete("/{drug_id}")
def delete_drug(drug_id: str):
    db = get_firestore()
    doc_ref = db.collection("drugs").document(drug_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Drug not found")

    doc_ref.delete()
    return {"success": True}


@router.post("/manage/templates")
def create_drug_template(payload: DrugTemplateCreate):
    try:
        db = get_firestore()
        templates_ref = db.collection("drug_templates")
        name = payload.templateName.strip()
        if not name:
            raise HTTPException(status_code=422, detail="Template name is required")

        existing = list(templates_ref.where("templateName", "==", name).limit(1).stream())
        if existing:
            raise HTTPException(status_code=400, detail="Template name already exists")

        now = datetime.now(timezone.utc)
        doc_ref = templates_ref.document()
        doc_ref.set(
            {
                "id": doc_ref.id,
                "templateName": name,
                "medicines": payload.medicines or [],
                "created_at": now,
                "updated_at": None,
            }
        )
        return {"success": True, "template_id": doc_ref.id, "id": doc_ref.id}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/manage/templates")
def get_all_drug_templates():
    db = get_firestore()
    docs = (
        db.collection("drug_templates")
        .select(["templateName", "medicines", "created_at"])
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )

    templates = []
    for doc in docs:
        item = doc.to_dict() or {}
        item["id"] = doc.id
        templates.append(item)

    return {"templates": templates}


@router.get("/manage/templates/{template_id}")
def get_drug_template_by_id(template_id: str):
    db = get_firestore()
    doc_ref = db.collection("drug_templates").document(template_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Template not found")
    template = doc.to_dict() or {}
    template["id"] = doc.id
    return {"template": template}


@router.delete("/manage/templates/{template_id}")
def delete_drug_template(template_id: str):
    db = get_firestore()
    doc_ref = db.collection("drug_templates").document(template_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Template not found")
    doc_ref.delete()
    return {"success": True}
