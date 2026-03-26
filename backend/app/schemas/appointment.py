from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AppointmentBase(BaseModel):
    customerId: str = Field(..., min_length=1)
    customerName: str = Field(..., min_length=1)
    phone: Optional[str] = None
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
    dewormingEndDate: Optional[str] = None
    date: str
    time: Optional[str] = None
    status: str = Field(default="active")
    chiefComplaint: Optional[str] = None
    historyExamination: Optional[str] = None
    tentativeDiagnosis: Optional[str] = None
    finalDiagnosis: Optional[str] = None
    treatment: Optional[str] = None
    advice: Optional[str] = None
    temperature: Optional[str] = None
    cmm: Optional[str] = None
    heartRate: Optional[str] = None
    breathingRate: Optional[str] = None
    pulseRate: Optional[str] = None
    weight: Optional[str] = None
    doctorFee: Optional[float] = None
    reviewDate: Optional[str] = None
    scannedImages: Optional[list[str]] = None
    medicines: Optional[list[dict]] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    customerId: Optional[str] = None
    customerName: Optional[str] = None
    phone: Optional[str] = None
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
    dewormingEndDate: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None
    chiefComplaint: Optional[str] = None
    historyExamination: Optional[str] = None
    tentativeDiagnosis: Optional[str] = None
    finalDiagnosis: Optional[str] = None
    treatment: Optional[str] = None
    advice: Optional[str] = None
    temperature: Optional[str] = None
    cmm: Optional[str] = None
    heartRate: Optional[str] = None
    breathingRate: Optional[str] = None
    pulseRate: Optional[str] = None
    weight: Optional[str] = None
    doctorFee: Optional[float] = None
    reviewDate: Optional[str] = None
    scannedImages: Optional[list[str]] = None
    medicines: Optional[list[dict]] = None


class Appointment(AppointmentBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
