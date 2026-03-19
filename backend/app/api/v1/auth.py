from fastapi import APIRouter, HTTPException
from app.core.firebase import get_firestore
from pydantic import BaseModel

router = APIRouter()


class PinVerifyRequest(BaseModel):
    pin: str


@router.post("/verify-pin")
def verify_pin(payload: PinVerifyRequest):
    db = get_firestore()
    doc = db.collection("Login").document("pin").get()

    if not doc.exists:
        raise HTTPException(status_code=500, detail="PIN not configured")

    saved_pin = doc.to_dict().get("login_pin")

    if payload.pin != saved_pin:
        raise HTTPException(status_code=401, detail="Invalid PIN")

    return {"success": True, "message": "PIN verified successfully"}
