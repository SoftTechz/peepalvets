from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    petName: Optional[str] = None
    petAgeYears: Optional[int] = None
    petAgeMonths: Optional[int] = None
    petType: Optional[str] = None
    petBreed: Optional[str] = None
    petSex: Optional[str] = None
    vaccinated: Optional[str] = None
    vaccinationStartDate: Optional[str] = None
    vaccinationEndDate: Optional[str] = None
    deworming: Optional[str] = None
    dewormingStartDate: Optional[str] = None
    dewormingNextDueDate: Optional[str] = None
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    petName: Optional[str] = None
    petAgeYears: Optional[int] = None
    petAgeMonths: Optional[int] = None
    petType: Optional[str] = None
    petBreed: Optional[str] = None
    petSex: Optional[str] = None
    vaccinated: Optional[str] = None
    vaccinationStartDate: Optional[str] = None
    vaccinationEndDate: Optional[str] = None
    deworming: Optional[str] = None
    dewormingStartDate: Optional[str] = None
    dewormingNextDueDate: Optional[str] = None
    notes: Optional[str] = None


class Customer(CustomerBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
