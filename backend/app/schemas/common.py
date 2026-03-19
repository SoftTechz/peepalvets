from pydantic import BaseModel
from typing import Any


class SuccessResponse(BaseModel):
    status: str = "success"
    message: str
    data: Any = None


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    detail: str = None


class PaginatedResponse(BaseModel):
    status: str = "success"
    message: str
    data: list
    total: int
    page: int
    page_size: int
