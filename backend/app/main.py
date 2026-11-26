import asyncio
import hashlib
import hmac
import os
import secrets

import httpx
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, update, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import engine
from app.recovery_engine import analyze_recovery
from app.ai_engine import generate_response
from app.models import (
    Base,
    BroadcastAlert,
    Depot,
    Incident,
    FleetPolicy,
    Shipment,
    BatteryReading,
    TelemetryReading,
    User,
    UserSession,
    RecoveryApproval,
    DecisionHistory,
)
from app.schemas import (
    AccountLogin,
    AccountResponse,
    AccountSignup,
    AccountStatusUpdate,
    BatteryReadingCreate,
    BatteryReadingResponse,
    BroadcastAlertCreate,
    BroadcastAlertResponse,
    DecisionHistoryCreate,
    DecisionHistoryResponse,
    DepotResponse,
    DetourValidationRequest,
    DetourValidationResponse,
    FleetPolicyResponse,
    FleetPolicyUpdate,
    IncidentCreate,
    IncidentResponse,
    LoginResponse,
    ShipmentCreate,
    ShipmentResponse,
    ShipmentAssignmentUpdate,
    ShipmentLocationUpdate,
    ShipmentOperationalUpdate,
    TelemetryReadingCreate,
    TelemetryReadingResponse,
    RecoveryAnalysisRequest,
    RecoveryAnalysisResponse,
    RecoveryApprovalCreate,
    RecoveryApprovalResponse,
    AIChatRequest,
    AIChatResponse,
)

app = FastAPI(
    title="CryoNexus AI API",
    description="Backend API for the CryoNexus project",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    # Creates tables that do not already exist, including the new users table.
    Base.metadata.create_all(bind=engine)


def get_db():
    with Session(engine) as session:
        yield session


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    iterations = 310_000
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return f"pbkdf2_sha256${iterations}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_text, salt_text, expected_digest = stored_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False

        actual_digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_text),
            int(iterations_text),
        ).hex()
        return hmac.compare_digest(actual_digest, expected_digest)
    except (ValueError, TypeError):
        return False

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Sign in is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_hash = hashlib.sha256(
        credentials.credentials.encode("utf-8")
    ).hexdigest()

    now = datetime.now(timezone.utc)
    session = db.scalar(
        select(UserSession).where(
            UserSession.token_hash == token_hash,
            UserSession.revoked_at.is_(None),
            UserSession.expires_at > now,
        )
    )

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Your login has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return session


def get_current_user(
    login_session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    
    user = db.get(User, login_session.user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Account not found.")
    if user.status != "Active":
        raise HTTPException(
            status_code=403,
            detail="This account is suspended.",
        )
    return user


def get_admin_user(
    current_user: User = Depends(get_current_user),
):
    if current_user.account_type != "admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator access is required.",
        )
    return current_user

def verify_shipment_access(shipment: Shipment, current_user: User):
    if (
        current_user.account_type != "admin"
        and shipment.assigned_operator_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this shipment.",
        )


@app.get("/shipments/{shipment_code}/eta")
async def calculate_shipment_eta(
    shipment_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    verify_shipment_access(shipment, current_user)

    if not shipment.origin_location or not shipment.destination_location:
        raise HTTPException(
            status_code=400,
            detail="Shipment origin or destination is missing.",
        )

    origin = ", ".join(
        value for value in [
            shipment.origin_location,
            shipment.origin_taluk,
            shipment.origin_district,
            "Karnataka",
            "India",
        ] if value
    )

    destination = ", ".join(
        value for value in [
            shipment.destination_location,
            shipment.destination_taluk,
            shipment.destination_district,
            "Karnataka",
            "India",
        ] if value
    )

    headers = {
        "User-Agent": "CryoNexusAI/1.0 (shipment ETA calculation)"
    }

    try:
        async with httpx.AsyncClient(
            timeout=20.0,
            headers=headers,
        ) as client:

            async def geocode(location, taluk, district):
                search_locations = [
                    location,
                    f"{taluk}, {district}, Karnataka, India",
                    f"{district}, Karnataka, India",
                ]

                for search_location in search_locations:
                    if not search_location or "None" in search_location:
                        continue

                    response = await client.get(
                        "https://nominatim.openstreetmap.org/search",
                        params={
                            "q": search_location,
                            "format": "jsonv2",
                            "limit": 1,
                        },
                    )

                    response.raise_for_status()
                    results = response.json()

                    if results:
                        return (
                            float(results[0]["lon"]),
                            float(results[0]["lat"]),
                        )

                    await asyncio.sleep(1)

                return None

            origin_coordinates = await geocode(
                origin,
                shipment.origin_taluk,
                shipment.origin_district,
            )

            await asyncio.sleep(1)

            destination_coordinates = await geocode(
                destination,
                shipment.destination_taluk,
                shipment.destination_district,
            )

            if not origin_coordinates or not destination_coordinates:
                raise HTTPException(
                    status_code=404,
                    detail="Could not find coordinates for the shipment locations.",
                )

            route_response = await client.get(
                f"https://router.project-osrm.org/route/v1/driving/"
                f"{origin_coordinates[0]},{origin_coordinates[1]};"
                f"{destination_coordinates[0]},{destination_coordinates[1]}",
                params={
                    "overview": "false",
                    "steps": "false",
                },
            )

            route_response.raise_for_status()
            route_data = route_response.json()

            if route_data.get("code") != "Ok" or not route_data.get("routes"):
                raise HTTPException(
                    status_code=404,
                    detail="No road route could be calculated.",
                )

            route = route_data["routes"][0]

            distance_km = round(route["distance"] / 1000, 2)
            duration_minutes = round(route["duration"] / 60)

            hours = duration_minutes // 60
            minutes = duration_minutes % 60

            eta_label = (
                f"{hours} hr {minutes} min"
                if hours > 0
                else f"{minutes} min"
            )

            return {
                "shipment_code": shipment.shipment_code,
                "origin": origin,
                "destination": destination,
                "distance_km": distance_km,
                "duration_minutes": duration_minutes,
                "eta": eta_label,
                "traffic_included": False,
                "route_provider": "OpenStreetMap / OSRM",
            }

    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="The external route service is temporarily unavailable.",
        )


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CryoNexus AI API",
    }

@app.post("/ai/chat", response_model=AIChatResponse)
def ai_chat(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        answer = generate_response(
            request.message,
            request.max_tokens,
        )

        return AIChatResponse(response=answer)

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Local AI model is unavailable.",
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Local AI service is temporarily unavailable.",
        )

@app.post("/auth/signup", response_model=AccountResponse, status_code=201)
def signup(
    account_data: AccountSignup,
    db: Session = Depends(get_db),
):
    if account_data.account_type == "admin":
        configured_code = os.getenv("ADMIN_SIGNUP_CODE", "")
        submitted_code = account_data.admin_passcode or ""

        if not configured_code or not hmac.compare_digest(
            submitted_code,
            configured_code,
        ):
            raise HTTPException(
                status_code=403,
                detail="Admin signup code is invalid or not configured.",
            )

    account = User(
        name=account_data.name,
        email=account_data.email,
        password_hash=hash_password(account_data.password),
        role="admin" if account_data.account_type == "admin" else account_data.role,
        account_type=account_data.account_type,
        organization=account_data.organization.strip()
        or (
            "Karnataka State Cold-Chain Directorate"
            if account_data.account_type == "admin"
            else "Karnataka Cold Logistics"
        ),
    )

    db.add(account)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    db.refresh(account)
    return account


@app.post("/auth/login", response_model=LoginResponse)
def login(
    credentials: AccountLogin,
    db: Session = Depends(get_db),
):
    statement = select(User).where(
        User.email == credentials.email,
        User.account_type == credentials.account_type,
    )
    account = db.scalar(statement)

    if account is None or not verify_password(
        credentials.password,
        account.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Email or password is incorrect.",
        )
    if account.status != "Active":
        raise HTTPException(
            status_code=403,
            detail="This account is suspended.",
        )

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)

    login_session = UserSession(
        user_id=account.id,
        token_hash=hashlib.sha256(token.encode("utf-8")).hexdigest(),
        expires_at=expires_at,
    )
    db.add(login_session)
    db.commit()

    account_data = AccountResponse.model_validate(account).model_dump()

    return {
        **account_data,
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at,
    }

@app.post("/shipments", response_model=ShipmentResponse, status_code=201)
def create_shipment(
    shipment_data: ShipmentCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    shipment = Shipment(**shipment_data.model_dump())
    db.add(shipment)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A shipment with that code already exists.",
        )

    db.refresh(shipment)
    return shipment


@app.get("/shipments", response_model=list[ShipmentResponse])
def list_shipments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    statement = select(Shipment)

    # Admin can view all shipments
    if current_user.account_type != "admin":
        statement = statement.where(
            Shipment.assigned_operator_id == current_user.id
        )

    statement = statement.order_by(Shipment.id)

    return db.scalars(statement).all()


@app.get("/operator/dashboard-summary")
def get_operator_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Get shipments assigned to the logged-in operator
    shipments = db.scalars(
        select(Shipment).where(
            Shipment.assigned_operator_id == current_user.id
        )
    ).all()

    total_shipments = len(shipments)

    # 2. Get fleet policy
    policy = db.get(FleetPolicy, 1)

    max_temp_drift = (
        policy.max_temp_drift if policy else 2.5
    )

    battery_threshold = (
        policy.battery_alarm_percent if policy else 35
    )

    compliant_count = 0
    assessed_count = 0
    battery_values = []
    low_battery_count = 0
    open_incident_count = 0

    # 3. Analyse each assigned shipment
    for shipment in shipments:

        # Latest temperature reading
        latest_temperature = db.scalar(
            select(TelemetryReading)
            .where(
                TelemetryReading.shipment_id == shipment.id
            )
            .order_by(TelemetryReading.recorded_at.desc())
            .limit(1)
        )

        if latest_temperature is not None:
            assessed_count += 1

            deviation = abs(
                latest_temperature.temperature_c
                - shipment.required_temp_c
            )

            if deviation <= max_temp_drift:
                compliant_count += 1

        # Latest battery reading
        latest_battery = db.scalar(
            select(BatteryReading)
            .where(
                BatteryReading.shipment_id == shipment.id
            )
            .order_by(BatteryReading.recorded_at.desc())
            .limit(1)
        )

        if latest_battery is not None:
            battery_values.append(
                latest_battery.battery_percent
            )

            if latest_battery.battery_percent < battery_threshold:
                low_battery_count += 1

        # Open incidents associated with this shipment
        incidents = db.scalars(
    select(Incident).where(
        Incident.status == "Open",
        or_(
            Incident.shipment_id == shipment.id,
            (
                Incident.shipment_id.is_(None)
                & Incident.title.contains(
                    f"Shipment {shipment.shipment_code}"
                )
            ),
        ),
    )
).all()

        open_incident_count += len(incidents)

    # 4. Calculate temperature compliance percentage
    temperature_compliance = (
        round((compliant_count / assessed_count) * 100, 2)
        if assessed_count > 0
        else None
    )

    # 5. Calculate average latest battery percentage
    average_battery = (
        round(sum(battery_values) / len(battery_values), 2)
        if battery_values
        else None
    )

    # 6. Return dashboard summary
    return {
        "total_shipments": total_shipments,
        "temperature_compliance": temperature_compliance,
        "temperature_assessed": assessed_count,
        "open_incidents": open_incident_count,
        "average_battery": average_battery,
        "battery_monitored": len(battery_values),
        "low_battery_shipments": low_battery_count,
    }



@app.post(
    "/shipments/{shipment_code}/analyze-recovery",
    response_model=RecoveryAnalysisResponse,
)
def analyze_shipment_recovery(
    shipment_code: str,
    request: RecoveryAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Verify that the requested shipment exists
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    # 2. Verify shipment access
    verify_shipment_access(shipment, current_user)

    # 3. Ensure the request matches the URL shipment
    if request.shipment_code != shipment_code:
        raise HTTPException(
            status_code=400,
            detail="Shipment code in request does not match URL.",
        )

    # 4. Retrieve the latest temperature reading
    latest_temperature = db.scalar(
        select(TelemetryReading)
        .where(
            TelemetryReading.shipment_id == shipment.id
        )
        .order_by(TelemetryReading.recorded_at.desc())
        .limit(1)
    )

    # 5. Retrieve the latest battery reading
    latest_battery = db.scalar(
        select(BatteryReading)
        .where(
            BatteryReading.shipment_id == shipment.id
        )
        .order_by(BatteryReading.recorded_at.desc())
        .limit(1)
    )

    # 6. Retrieve fleet policy
    policy = db.get(FleetPolicy, 1)

    max_temp_drift = (
        policy.max_temp_drift if policy else 2.5
    )

    battery_alarm_percent = (
        policy.battery_alarm_percent if policy else 35
    )

    # 7. Run the recovery assessment
    result = analyze_recovery(
        shipment=shipment,
        disruption_type=request.disruption_type,
        disruption_description=request.disruption_description,
        additional_delay_hours=request.additional_delay_hours,
        simulated_battery_percent=request.simulated_battery_percent,
        latest_temperature=latest_temperature,
        latest_battery=latest_battery,
        max_temp_drift=max_temp_drift,
        battery_alarm_percent=battery_alarm_percent,
        simulated_temperature_c=request.simulated_temperature_c,
    )

    # 8. Return the recovery assessment
    return result


@app.post(
    "/shipments/{shipment_code}/hub-pre-alert",
    response_model=BroadcastAlertResponse,
    status_code=201,
)
def create_hub_pre_alert(
    shipment_code: str,
    alert_data: BroadcastAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify that the shipment exists
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    # Verify that the logged-in user can access this shipment
    verify_shipment_access(shipment, current_user)

    # Save the hub pre-alert using the existing alert table
    alert = BroadcastAlert(
        message=alert_data.message,
        created_by_user_id=current_user.id,
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert

@app.post(
    "/shipments/{shipment_code}/recovery-approval",
    response_model=RecoveryApprovalResponse,
    status_code=201,
)
def approve_recovery_plan(
    shipment_code: str,
    approval_data: RecoveryApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    verify_shipment_access(shipment, current_user)

    approval = RecoveryApproval(
        shipment_id=shipment.id,
        recommended_action=approval_data.recommended_action,
        status="Approved",
        approved_by_user_id=current_user.id,
        approved_at=datetime.now(timezone.utc),
        notes=approval_data.notes,
    )

    db.add(approval)
    db.commit()
    db.refresh(approval)

    return approval


@app.get(
    "/shipments/{shipment_code}/recovery-approval",
    response_model=RecoveryApprovalResponse | None,
)
def get_recovery_approval(
    shipment_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    verify_shipment_access(shipment, current_user)

    approval = db.scalar(
        select(RecoveryApproval)
        .where(RecoveryApproval.shipment_id == shipment.id)
        .order_by(RecoveryApproval.created_at.desc())
    )

    return approval


@app.post(
    "/shipments/{shipment_code}/decision-history",
    response_model=DecisionHistoryResponse,
    status_code=201,
)
def create_decision_history(
    shipment_code: str,
    history_data: DecisionHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.scalar(
        select(Shipment).where(Shipment.shipment_code == shipment_code)
    )

    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found.")

    verify_shipment_access(shipment, current_user)

    record = DecisionHistory(
        shipment_id=shipment.id,
        user_id=current_user.id,
        decision=history_data.decision,
        reason=history_data.reason,
        source=history_data.source,
        risk_level=history_data.risk_level,
        risk_score=history_data.risk_score,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "shipment_id": record.shipment_id,
        "user_id": record.user_id,
        "shipment_code": shipment.shipment_code,
        "decision": record.decision,
        "reason": record.reason,
        "source": record.source,
        "risk_level": record.risk_level,
        "risk_score": record.risk_score,
        "created_at": record.created_at,
    }


@app.get(
    "/decision-history",
    response_model=list[DecisionHistoryResponse],
)
def list_decision_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    statement = (
        select(DecisionHistory, Shipment.shipment_code)
        .join(
            Shipment,
            DecisionHistory.shipment_id == Shipment.id,
        )
    )

    if current_user.account_type != "admin":
        statement = statement.where(
            Shipment.assigned_operator_id == current_user.id
        )

    statement = statement.order_by(
        DecisionHistory.created_at.desc()
    )

    rows = db.execute(statement).all()

    return [
        {
            "id": record.id,
            "shipment_id": record.shipment_id,
            "user_id": record.user_id,
            "shipment_code": shipment_code,
            "decision": record.decision,
            "reason": record.reason,
            "source": record.source,
            "risk_level": record.risk_level,
            "risk_score": record.risk_score,
            "created_at": record.created_at,
        }
        for record, shipment_code in rows
    ]


@app.post(
    "/shipments/{shipment_code}/readings",
    response_model=TelemetryReadingResponse,
    status_code=201,
)
def add_temperature_reading(
    shipment_code: str,
    reading_data: TelemetryReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Find the shipment
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found."
        )
    verify_shipment_access(shipment, current_user)

    

    # 2. Retrieve fleet policy
    policy = db.get(FleetPolicy, 1)

    # Use the default threshold if no policy exists yet
    max_temp_drift = (
        policy.max_temp_drift if policy is not None else 2.5
    )

    # 3. Create temperature reading
    reading = TelemetryReading(
        shipment_id=shipment.id,
        temperature_c=reading_data.temperature_c,
        source="operator",
        note=reading_data.note,
    )

    # 4. Update shipment's current temperature
    shipment.current_temp_c = reading_data.temperature_c

    # 5. Calculate temperature deviation
    temperature_deviation = abs(
        reading_data.temperature_c - shipment.required_temp_c
    )

    # 6. Check whether temperature exceeds policy
    if temperature_deviation > max_temp_drift:

        incident_title = (
            f"Temperature excursion detected - "
            f"Shipment {shipment.shipment_code}"
        )

        # 7. Check for an existing open incident
        existing_incident = db.scalar(
            select(Incident).where(
                Incident.title == incident_title,
                Incident.status == "Open",
            )
        )

        # 8. Create incident only if no open incident exists
        if existing_incident is None:

            severity = (
                "Critical"
                if temperature_deviation >= max_temp_drift * 2
                else "High"
            )

            incident = Incident(
            shipment_id=shipment.id,
            title=incident_title,
            vehicle_id=shipment.vehicle_id or "Unassigned",
            driver_name=shipment.driver_name or "Unassigned",
            severity=severity,
            status="Open",
       )

            db.add(incident)

    # 9. Save reading, shipment update and incident together
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # 10. Return telemetry response
    return {
        "id": reading.id,
        "shipment_code": shipment.shipment_code,
        "temperature_c": reading.temperature_c,
        "source": reading.source,
        "note": reading.note,
        "recorded_at": reading.recorded_at,
    }


@app.get(
    "/shipments/{shipment_code}/readings",
    response_model=list[TelemetryReadingResponse],
)
def list_temperature_readings(
    shipment_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.scalar(
        select(Shipment).where(Shipment.shipment_code == shipment_code)
    )

    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found.")

    verify_shipment_access(shipment, current_user)

    statement = (
        select(TelemetryReading)
        .where(TelemetryReading.shipment_id == shipment.id)
        .order_by(TelemetryReading.recorded_at.desc())
    )

    readings = db.scalars(statement).all()

    return [
        {
            "id": reading.id,
            "shipment_code": shipment.shipment_code,
            "temperature_c": reading.temperature_c,
            "source": reading.source,
            "note": reading.note,
            "recorded_at": reading.recorded_at,
        }
        for reading in readings
    ]


@app.patch(
    "/admin/shipments/{shipment_code}/assignment",
    response_model=ShipmentResponse,
)
def assign_shipment_vehicle(
    shipment_code: str,
    assignment_data: ShipmentAssignmentUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    # Update vehicle and driver
    shipment.vehicle_id = assignment_data.vehicle_id
    shipment.driver_name = assignment_data.driver_name

    # Update operator only if the field was provided
    if "assigned_operator_id" in assignment_data.model_fields_set:

        operator_id = assignment_data.assigned_operator_id

        if operator_id is not None:
            operator = db.get(User, operator_id)

            if operator is None or operator.account_type != "user":
                raise HTTPException(
                    status_code=404,
                    detail="Operator account not found.",
                )

            if operator.status != "Active":
                raise HTTPException(
                    status_code=400,
                    detail="Cannot assign shipment to a suspended operator.",
                )

        shipment.assigned_operator_id = operator_id

    # Synchronize existing open incidents for this shipment
    open_incidents = db.scalars(
        select(Incident).where(
            Incident.status == "Open",
            Incident.title.contains(
                f"Shipment {shipment.shipment_code}"
            ),
        )
    ).all()

    for incident in open_incidents:
        incident.vehicle_id = shipment.vehicle_id or "Unassigned"
        incident.driver_name = shipment.driver_name or "Unassigned"

    # Save shipment and incident changes together
    db.commit()
    db.refresh(shipment)

    return shipment

@app.patch(
    "/admin/shipments/{shipment_code}/location",
    response_model=ShipmentResponse,
)
def update_shipment_location(
    shipment_code: str,
    location_data: ShipmentLocationUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    location_fields = location_data.model_dump(exclude_unset=True)

    for field, value in location_fields.items():
        setattr(shipment, field, value)

    db.commit()
    db.refresh(shipment)

    return shipment


@app.patch(
    "/admin/shipments/{shipment_code}/operational-details",
    response_model=ShipmentResponse,
)
def update_shipment_operational_details(
    shipment_code: str,
    update_data: ShipmentOperationalUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    # Update only fields included in the request
    operational_fields = update_data.model_dump(exclude_unset=True)

    if not operational_fields:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update.",
        )

    for field, value in operational_fields.items():
        setattr(shipment, field, value)

    db.commit()
    db.refresh(shipment)

    return shipment



@app.post(
    "/shipments/{shipment_code}/battery-readings",
    response_model=BatteryReadingResponse,
    status_code=201,
)
def add_battery_reading(
    shipment_code: str,
    reading_data: BatteryReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
): 
    

    # 1. Find the shipment
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )
    verify_shipment_access(shipment, current_user)
    # 2. Retrieve fleet policy
    policy = db.get(FleetPolicy, 1)

    battery_threshold = (
        policy.battery_alarm_percent if policy is not None else 35
    )

    # 3. Create battery reading
    reading = BatteryReading(
        shipment_id=shipment.id,
        battery_percent=reading_data.battery_percent,
        source="operator",
        note=reading_data.note,
    )

    # 4. Check whether battery is below threshold
    if reading_data.battery_percent < battery_threshold:

        incident_title = (
            f"Reefer battery low - Shipment {shipment.shipment_code}"
        )

        # 5. Avoid duplicate open incidents
        existing_incident = db.scalar(
            select(Incident).where(
                Incident.title == incident_title,
                Incident.status == "Open",
            )
        )

        if existing_incident is None:

            severity = (
                "Critical"
                if reading_data.battery_percent <= battery_threshold / 2
                else "High"
            )

            incident = Incident(
    shipment_id=shipment.id,
    title=incident_title,
    vehicle_id=shipment.vehicle_id or "Unassigned",
    driver_name=shipment.driver_name or "Unassigned",
    severity=severity,
    status="Open",
)
            db.add(incident)

    # 6. Save reading and incident
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # 7. Return response
    return {
        "id": reading.id,
        "shipment_code": shipment.shipment_code,
        "battery_percent": reading.battery_percent,
        "source": reading.source,
        "note": reading.note,
        "recorded_at": reading.recorded_at,
    }

@app.post(
    "/shipments/{shipment_code}/incidents",
    response_model=IncidentResponse,
    status_code=201,
)
def report_shipment_incident(
    shipment_code: str,
    payload: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    shipment = db.scalar(
        select(Shipment).where(Shipment.shipment_code == shipment_code)
    )

    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found.")

    verify_shipment_access(shipment, current_user)

    incident = Incident(
        shipment_id=shipment.id,
        reported_by_user_id=current_user.id,
        title=f"{payload.incident_type} - Shipment {shipment.shipment_code}",
        description=payload.description,
        vehicle_id=shipment.vehicle_id or "Unassigned",
        driver_name=shipment.driver_name or "Unassigned",
        severity=payload.severity,
        status="Open",
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident

@app.post(
    "/shipments/{shipment_code}/validate-detour",
    response_model=DetourValidationResponse,
)
def validate_shipment_detour(
    shipment_code: str,
    detour_data: DetourValidationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )
    verify_shipment_access(shipment, current_user)
    depot = db.get(Depot, detour_data.depot_id)

    if depot is None:
        raise HTTPException(
            status_code=404,
            detail="Depot not found.",
        )

    policy = db.get(FleetPolicy, 1)

    maximum_allowed = (
        policy.max_detour_radius_km
        if policy is not None
        else 50.0
    )

    permitted = (
        detour_data.detour_distance_km <= maximum_allowed
    )

    return {
        "shipment_code": shipment.shipment_code,
        "depot_id": depot.id,
        "detour_distance_km": detour_data.detour_distance_km,
        "maximum_allowed_km": maximum_allowed,
        "permitted": permitted,
        "message": (
            "Diversion permitted."
            if permitted
            else "Diversion rejected: maximum detour radius exceeded."
        ),
    }

@app.get(
    "/shipments/{shipment_code}/battery-readings",
    response_model=list[BatteryReadingResponse],
)
def list_battery_readings(
    shipment_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.scalar(
        select(Shipment).where(
            Shipment.shipment_code == shipment_code
        )
    )

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )
    verify_shipment_access(shipment, current_user)
    readings = db.scalars(
        select(BatteryReading)
        .where(BatteryReading.shipment_id == shipment.id)
        .order_by(BatteryReading.recorded_at.desc())
    ).all()

    return [
        {
            "id": reading.id,
            "shipment_code": shipment.shipment_code,
            "battery_percent": reading.battery_percent,
            "source": reading.source,
            "note": reading.note,
            "recorded_at": reading.recorded_at,
        }
        for reading in readings
    ]

@app.patch(
    "/admin/accounts/{user_id}/status",
    response_model=AccountResponse,
)
def update_account_status(
    user_id: int,
    status_data: AccountStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    account = db.get(User, user_id)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found.")

    if account.id == admin.id and status_data.status == "Suspended":
        raise HTTPException(
            status_code=400,
            detail="You cannot suspend your own admin account.",
        )

    account.status = status_data.status

    if status_data.status == "Suspended":
        db.execute(
            update(UserSession)
            .where(
                UserSession.user_id == account.id,
                UserSession.revoked_at.is_(None),
            )
            .values(revoked_at=datetime.now(timezone.utc))
        )

    db.commit()
    db.refresh(account)
    return account

@app.get("/admin/accounts", response_model=list[AccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    statement = select(User).order_by(User.id)
    return db.scalars(statement).all()
@app.get("/depots", response_model=list[DepotResponse])
def list_depots(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    statement = select(Depot).order_by(Depot.id)
    return db.scalars(statement).all()

@app.get("/admin/fleet-policy", response_model=FleetPolicyResponse)
def get_fleet_policy(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    policy = db.get(FleetPolicy, 1)

    if policy is None:
        policy = FleetPolicy(id=1)
        db.add(policy)
        db.commit()
        db.refresh(policy)

    return policy

@app.get(
    "/admin/incidents",
    response_model=list[IncidentResponse],
)
def list_admin_incidents(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    statement = select(Incident).order_by(Incident.created_at.desc())
    return db.scalars(statement).all()


@app.patch(
    "/admin/incidents/{incident_id}/resolve",
    response_model=IncidentResponse,
)
def resolve_admin_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    incident = db.get(Incident, incident_id)

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found.")

    incident.status = "Resolved"
    incident.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(incident)
    return incident

@app.put("/admin/fleet-policy", response_model=FleetPolicyResponse)
def save_fleet_policy(
    policy_data: FleetPolicyUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    policy = db.get(FleetPolicy, 1)

    if policy is None:
        policy = FleetPolicy(id=1)
        db.add(policy)

    policy.max_temp_drift = policy_data.max_temp_drift
    policy.battery_alarm_percent = policy_data.battery_alarm_percent
    policy.max_detour_radius_km = policy_data.max_detour_radius_km
    policy.auto_sms = policy_data.auto_sms

    db.commit()
    db.refresh(policy)
    return policy

@app.post(
    "/admin/broadcast-alerts",
    response_model=BroadcastAlertResponse,
    status_code=201,
)
def create_admin_broadcast(
    alert_data: BroadcastAlertCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    alert = BroadcastAlert(
        message=alert_data.message,
        created_by_user_id=admin.id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@app.get(
    "/admin/broadcast-alerts",
    response_model=list[BroadcastAlertResponse],
)
def list_admin_broadcasts(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    statement = (
        select(BroadcastAlert)
        .order_by(BroadcastAlert.created_at.desc())
    )

    return db.scalars(statement).all()
