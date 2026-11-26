from datetime import datetime, timezone

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text

class Base(DeclarativeBase):
    pass


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )
    product: Mapped[str] = mapped_column(String(120))
    current_temp_c: Mapped[float] = mapped_column(Float)
    required_temp_c: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30), default="active")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    vehicle_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    driver_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    assigned_operator_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    product_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    quantity_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    fuel_level_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_delay_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    refrigeration_status: Mapped[str | None] = mapped_column(String(80), nullable=True)
    origin_district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    origin_taluk: Mapped[str | None] = mapped_column(String(100), nullable=True)
    origin_location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    destination_district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    destination_taluk: Mapped[str | None] = mapped_column(String(100), nullable=True)
    destination_location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    disruption_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(30), default="manager")
    account_type: Mapped[str] = mapped_column(String(20), default="user")
    organization: Mapped[str] = mapped_column(String(200), default="")
    status: Mapped[str] = mapped_column(String(30), default="Active")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_id: Mapped[int] = mapped_column(
        ForeignKey("shipments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(20), default="operator")
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

class BatteryReading(Base):
    __tablename__ = "battery_readings"

    id: Mapped[int] = mapped_column(primary_key=True)

    shipment_id: Mapped[int] = mapped_column(
        ForeignKey("shipments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    battery_percent: Mapped[float] = mapped_column(Float, nullable=False)

    source: Mapped[str] = mapped_column(String(20), default="operator")

    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
class Depot(Base):
    __tablename__ = "depots"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    location: Mapped[str] = mapped_column(String(120))
    capacity: Mapped[float] = mapped_column(Float)
    temp_deep: Mapped[float] = mapped_column(Float)
    temp_chilled: Mapped[float] = mapped_column(Float)
    power: Mapped[str] = mapped_column(String(120))
    gen_status: Mapped[str] = mapped_column(String(80))
    free_bays: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="optimal")

class FleetPolicy(Base):
    __tablename__ = "fleet_policies"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    max_temp_drift: Mapped[float] = mapped_column(Float, default=2.5)
    battery_alarm_percent: Mapped[float] = mapped_column(Float, default=35)
    max_detour_radius_km: Mapped[float] = mapped_column(Float, default=50)
    auto_sms: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key=True)

    shipment_id: Mapped[int | None] = mapped_column(
        ForeignKey("shipments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    reported_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    vehicle_id: Mapped[str] = mapped_column(String(120))
    driver_name: Mapped[str] = mapped_column(String(120))

    severity: Mapped[str] = mapped_column(String(30), default="High")
    status: Mapped[str] = mapped_column(String(30), default="Open")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

class BroadcastAlert(Base):
    __tablename__ = "broadcast_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


class RecoveryApproval(Base):
    __tablename__ = "recovery_approvals"

    id: Mapped[int] = mapped_column(primary_key=True)

    shipment_id: Mapped[int] = mapped_column(
        ForeignKey("shipments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    recommended_action: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="Pending",
        nullable=False,
    )

    approved_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


class DecisionHistory(Base):
    __tablename__ = "decision_history"

    id: Mapped[int] = mapped_column(primary_key=True)

    shipment_id: Mapped[int] = mapped_column(
        ForeignKey("shipments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    decision: Mapped[str] = mapped_column(String(200), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)

    source: Mapped[str] = mapped_column(
        String(30),
        default="local",
        nullable=False,
    )

    risk_level: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    risk_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
