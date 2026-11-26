from datetime import datetime
from typing import Literal
from pydantic import Field


from pydantic import BaseModel, ConfigDict, field_validator


class ShipmentCreate(BaseModel):
    shipment_code: str
    product: str
    current_temp_c: float
    required_temp_c: float
    status: str = "active"
    vehicle_id: str | None = None
    driver_name: str | None = None
    product_category: str | None = None
    quantity_kg: float | None = Field(default=None, gt=0)
    fuel_level_percent: float | None = Field(default=None, ge=0, le=100)
    estimated_delay_hours: float | None = Field(default=None, ge=0)
    refrigeration_status: str | None = None
    origin_district: str | None = None
    origin_taluk: str | None = None
    origin_location: str | None = None
    destination_district: str | None = None
    destination_taluk: str | None = None
    destination_location: str | None = None
    disruption_description: str | None = None


class ShipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shipment_code: str
    product: str
    current_temp_c: float
    required_temp_c: float
    status: str
    created_at: datetime
    vehicle_id: str | None
    driver_name: str | None
    assigned_operator_id: int | None
    product_category: str | None
    quantity_kg: float | None
    fuel_level_percent: float | None
    estimated_delay_hours: float | None
    refrigeration_status: str | None
    origin_district: str | None
    origin_taluk: str | None
    origin_location: str | None
    destination_district: str | None
    destination_taluk: str | None
    destination_location: str | None
    disruption_description: str | None

class ShipmentLocationUpdate(BaseModel):
    origin_district: str | None = None
    origin_taluk: str | None = None
    origin_location: str | None = None
    destination_district: str | None = None
    destination_taluk: str | None = None
    destination_location: str | None = None

class ShipmentOperationalUpdate(BaseModel):
    product_category: str | None = None
    quantity_kg: float | None = Field(default=None, gt=0)
    fuel_level_percent: float | None = Field(default=None, ge=0, le=100)
    estimated_delay_hours: float | None = Field(default=None, ge=0)
    refrigeration_status: str | None = None
    disruption_description: str | None = None


class AccountSignup(BaseModel):
    name: str
    email: str
    password: str
    role: Literal["manager", "dispatcher", "safety", "depot", "auditor"] = "manager"
    account_type: Literal["user", "admin"] = "user"
    organization: str = ""
    admin_passcode: str | None = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or email.startswith("@") or email.endswith("@"):
            raise ValueError("Enter a valid email address.")
        return email

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Name is required.")
        return name

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return value


class AccountLogin(BaseModel):
    email: str
    password: str
    account_type: Literal["user", "admin"] = "user"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    account_type: str
    organization: str
    status: str
    created_at: datetime

class AccountStatusUpdate(BaseModel):
    status: Literal["Active", "Suspended"]

class LoginResponse(AccountResponse):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime

class TelemetryReadingCreate(BaseModel):
    temperature_c: float
    note: str | None = None


class TelemetryReadingResponse(BaseModel):
    id: int
    shipment_code: str
    temperature_c: float
    source: str
    note: str | None
    recorded_at: datetime

class BatteryReadingCreate(BaseModel):
    battery_percent: float = Field(ge=0, le=100)
    note: str | None = None


class BatteryReadingResponse(BaseModel):
    id: int
    shipment_code: str
    battery_percent: float
    source: str
    note: str | None
    recorded_at: datetime

class DepotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    location: str
    capacity: float
    temp_deep: float
    temp_chilled: float
    power: str
    gen_status: str
    free_bays: int
    status: str

class FleetPolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    max_temp_drift: float
    battery_alarm_percent: float
    max_detour_radius_km: float
    auto_sms: bool
    updated_at: datetime


class FleetPolicyUpdate(BaseModel):
    max_temp_drift: float = Field(ge=1.0, le=5.0)
    battery_alarm_percent: float = Field(ge=20, le=50)
    max_detour_radius_km: float = Field(ge=20, le=100)
    auto_sms: bool

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    vehicle_id: str
    driver_name: str
    severity: str
    status: str
    created_at: datetime
    resolved_at: datetime | None

class IncidentCreate(BaseModel):
    incident_type: Literal[
        "Vehicle Breakdown",
        "Refrigeration Failure",
        "Route Blockage",
        "Temperature Excursion",
        "Battery Failure",
        "Shipment Delay",
        "Other",
    ]

    description: str = Field(min_length=5, max_length=1000)

    severity: Literal["Low", "Medium", "High", "Critical"] = "High"

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 5:
            raise ValueError("Please provide a meaningful incident description.")
        return value

class BroadcastAlertCreate(BaseModel):
    message: str = Field(min_length=1, max_length=2000)

    @field_validator("message")
    @classmethod
    def trim_and_check_message(cls, value: str) -> str:
        message = value.strip()
        if not message:
            raise ValueError("Alert message cannot be blank.")
        return message


class BroadcastAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    created_by_user_id: int
    created_at: datetime

class ShipmentAssignmentUpdate(BaseModel):
    vehicle_id: str = Field(min_length=1, max_length=120)
    driver_name: str = Field(min_length=1, max_length=120)
    assigned_operator_id: int | None = None

    @field_validator("vehicle_id", "driver_name")
    @classmethod
    def validate_assignment(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


class DetourValidationRequest(BaseModel):
    depot_id: str
    detour_distance_km: float = Field(ge=0)


class DetourValidationResponse(BaseModel):
    shipment_code: str
    depot_id: str
    detour_distance_km: float
    maximum_allowed_km: float
    permitted: bool
    message: str


class RecoveryAnalysisRequest(BaseModel):
    shipment_code: str = Field(min_length=1, max_length=50)
    disruption_type: Literal[
        "vehicle_breakdown",
        "refrigeration_failure",
        "temperature_rise",
        "battery_drop",
        "route_blockage",
        "shipment_delay",
        "depot_unavailable",
    ]
    disruption_description: str = Field(min_length=5, max_length=1000)
    additional_delay_hours: float = Field(default=0, ge=0, le=48)
    simulated_battery_percent: float | None = Field(
        default=None, ge=0, le=100
    )
    simulated_temperature_c: float | None = Field(
        default=None, ge=-100, le=100
    )


class RecoveryAnalysisResponse(BaseModel):
    shipment_code: str
    disruption_type: str
    risk_level: Literal["Low", "Medium", "High", "Critical"]
    risk_score: float
    recommended_action: str
    recommendation_reason: str
    alternative_actions: list[str]
    estimated_total_delay_hours: float
    temperature_status: str
    battery_status: str
    analysis_status: str

class RecoveryApprovalCreate(BaseModel):
    recommended_action: str = Field(
        min_length=3,
        max_length=200,
    )
    notes: str | None = Field(
        default=None,
        max_length=1000,
    )

    @field_validator("recommended_action")
    @classmethod
    def validate_recommended_action(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Recommended action cannot be blank.")
        return value

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value or None
        return value


class RecoveryApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shipment_id: int
    recommended_action: str
    status: str
    approved_by_user_id: int | None
    approved_at: datetime | None
    notes: str | None
    created_at: datetime


class DecisionHistoryCreate(BaseModel):
    decision: str = Field(min_length=3, max_length=200)
    reason: str = Field(min_length=3, max_length=3000)
    source: Literal["local", "backend"] = "local"
    risk_level: str | None = Field(default=None, max_length=30)
    risk_score: float | None = Field(default=None, ge=0, le=100)

    @field_validator("decision", "reason")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


class DecisionHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shipment_id: int
    user_id: int | None
    shipment_code: str
    decision: str
    reason: str
    source: str
    risk_level: str | None
    risk_score: float | None
    created_at: datetime

class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    max_tokens: int = Field(default=256, ge=32, le=512)


class AIChatResponse(BaseModel):
    response: str
    model: str = "Qwen2.5-1.5B-Instruct"
    provider: str = "local"