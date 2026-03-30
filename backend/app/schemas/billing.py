from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class BillingItem(BaseModel):
    service_or_item: str = Field(..., min_length=1)
    quantity: float = Field(..., ge=0)
    rate: float = Field(..., ge=0)
    amount: float = Field(..., ge=0)


class BillingBase(BaseModel):
    patient_name: str = Field(..., min_length=1)
    phone_number: Optional[str] = None
    pet_name: Optional[str] = None
    address: Optional[str] = None
    date: str = Field(..., min_length=1)
    items: List[BillingItem] = Field(..., min_items=1)
    total_amount: float = Field(..., ge=0)


class BillingCreate(BillingBase):
    pass


class BillingUpdate(BaseModel):
    patient_name: Optional[str] = None
    phone_number: Optional[str] = None
    pet_name: Optional[str] = None
    address: Optional[str] = None
    date: Optional[str] = None
    items: Optional[List[BillingItem]] = None
    total_amount: Optional[float] = None


class Billing(BillingBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
