from fastapi import APIRouter, HTTPException
from app.core.firebase import get_firestore
from pydantic import BaseModel
import time

router = APIRouter()


class PinVerifyRequest(BaseModel):
    pin: str


class PinChangeRequest(BaseModel):
    current_pin: str
    new_pin: str


# @router.post("/verify-pin")
# def verify_pin(payload: PinVerifyRequest):
#     db = get_firestore()
#     doc = db.collection("Login").document("pin").get()
#
#     if not doc.exists:
#         raise HTTPException(status_code=500, detail="PIN not configured")
#
#     saved_pin = doc.to_dict().get("login_pin")
#
#     if payload.pin != saved_pin:
#         raise HTTPException(status_code=401, detail="Invalid PIN")
#
#     return {"success": True, "message": "PIN verified successfully"}


@router.post("/verify-pin")
def verify_pin(payload: PinVerifyRequest):
    start_total = time.time()

    t0 = time.time()
    db = get_firestore()
    print(f"[TIME] Verify PIN DB init: {time.time() - t0:.4f}s")

    t1 = time.time()
    doc = db.collection("Login").document("pin").get()
    print(f"[TIME] Verify PIN fetch doc: {time.time() - t1:.4f}s")

    if not doc.exists:
        raise HTTPException(status_code=500, detail="PIN not configured")

    t2 = time.time()
    saved_pin = doc.to_dict().get("login_pin")
    is_valid = payload.pin == saved_pin
    print(f"[TIME] Verify PIN compare: {time.time() - t2:.4f}s")

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid PIN")

    print(f"[TIME] Verify PIN TOTAL API: {time.time() - start_total:.4f}s")
    return {"success": True, "message": "PIN verified successfully"}


@router.post("/change-pin")
def change_pin(payload: PinChangeRequest):
    db = get_firestore()

    # First verify current PIN
    doc = db.collection("Login").document("pin").get()

    if not doc.exists:
        raise HTTPException(status_code=500, detail="PIN not configured")

    saved_pin = doc.to_dict().get("login_pin")

    if payload.current_pin != saved_pin:
        raise HTTPException(status_code=401, detail="Current PIN is incorrect")

    # Validate new PIN
    if len(payload.new_pin) != 4 or not payload.new_pin.isdigit():
        raise HTTPException(status_code=400, detail="New PIN must be exactly 4 digits")

    if payload.current_pin == payload.new_pin:
        raise HTTPException(
            status_code=400, detail="New PIN must be different from current PIN"
        )

    # Update PIN in database
    db.collection("Login").document("pin").update({"login_pin": payload.new_pin})

    return {"success": True, "message": "PIN changed successfully"}
