from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------------------------------------------------------
# Allowed values
# ---------------------------------------------------------

RoleType = Literal["USER", "ADMIN"]

CategoryType = Literal[
    "PIPE_LEAK",
    "BROKEN_TAP",
    "TANK_OVERFLOW",
    "DAMAGED_PIPELINE",
    "WATER_CONTAMINATION",
    "DRAINAGE_PROBLEM",
    "NO_WATER_SUPPLY",
    "PUBLIC_WATER_WASTAGE",
    "OTHER",
]

PriorityType = Literal[
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]

StatusType = Literal[
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
]


# ---------------------------------------------------------
# Authentication schemas
# ---------------------------------------------------------

class UserRegister(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    phone: str = Field(
        min_length=7,
        max_length=20,
    )

    email: EmailStr | None = None

    password: str = Field(
        min_length=6,
        max_length=128,
    )

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str):
        value = value.strip()

        if len(value) < 2:
            raise ValueError("Name must contain at least 2 characters")

        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str):
        # Remove common formatting characters
        cleaned = (
            value.replace(" ", "")
            .replace("-", "")
            .replace("(", "")
            .replace(")", "")
        )

        # Allow international format such as +919876543210
        if cleaned.startswith("+"):
            digits = cleaned[1:]
        else:
            digits = cleaned

        if not digits.isdigit():
            raise ValueError("Phone number must contain only digits")

        if len(digits) < 7 or len(digits) > 15:
            raise ValueError(
                "Phone number must contain between 7 and 15 digits"
            )

        return cleaned


class UserLogin(BaseModel):
    phone: str
    password: str

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, value: str):
        return (
            value.strip()
            .replace(" ", "")
            .replace("-", "")
            .replace("(", "")
            .replace(")", "")
        )


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: EmailStr | None
    role: RoleType
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    user_id: int
    name: str
    role: RoleType


# ---------------------------------------------------------
# Water report schemas
# ---------------------------------------------------------

class ReportResponse(BaseModel):
    id: int
    user_id: int

    description: str | None

    # We intentionally do NOT return image_data.
    # Frontend loads the image from:
    # GET /api/reports/{id}/image

    image_type: str

    latitude: float
    longitude: float

    severity_rating: int

    category: CategoryType
    priority: PriorityType
    status: StatusType

    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class ReportStatusUpdate(BaseModel):
    status: StatusType


# ---------------------------------------------------------
# Admin schemas
# ---------------------------------------------------------

class AdminReportResponse(ReportResponse):
    citizen_name: str | None = None
    citizen_phone: str | None = None


class AdminStatsResponse(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    critical: int
