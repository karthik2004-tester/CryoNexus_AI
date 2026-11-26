
def analyze_recovery(
    shipment,
    disruption_type,
    disruption_description,
    additional_delay_hours,
    simulated_battery_percent,
    latest_temperature,
    latest_battery,
    max_temp_drift,
    battery_alarm_percent,
    simulated_temperature_c=None,
):
    """
    Deterministic recovery assessment using shipment,
    telemetry, battery and fleet-policy data.

    This is the initial rule-based engine.
    AI agent orchestration will be added separately.
    """

    # 1. Determine the latest available temperature
    current_temp = (
    simulated_temperature_c
    if simulated_temperature_c is not None
    else (
        latest_temperature.temperature_c
        if latest_temperature
        else shipment.current_temp_c
    )
)

    temperature_deviation = abs(
        current_temp - shipment.required_temp_c
    )

    temperature_excess = max(
        0,
        temperature_deviation - max_temp_drift
    )

    if temperature_deviation <= max_temp_drift:
        temperature_status = "Within permitted range"
        temperature_risk = 0
    else:
        temperature_status = "Temperature excursion detected"
        temperature_risk = min(40, temperature_excess * 5)

    # 2. Determine battery status
    battery_percent = simulated_battery_percent

    if battery_percent is None and latest_battery is not None:
        battery_percent = latest_battery.battery_percent

    if battery_percent is None:
        battery_status = "Not monitored"
        battery_risk = 0
    elif battery_percent < battery_alarm_percent:
        battery_status = "Below safety threshold"
        battery_risk = 30
    elif battery_percent < battery_alarm_percent + 10:
        battery_status = "Battery level is approaching threshold"
        battery_risk = 15
    else:
        battery_status = "Battery level is normal"
        battery_risk = 0

    # 3. Assess disruption severity
    disruption_risk = {
        "vehicle_breakdown": 25,
        "refrigeration_failure": 35,
        "temperature_rise": 25,
        "battery_drop": 25,
        "route_blockage": 20,
        "shipment_delay": 15,
        "depot_unavailable": 15,
    }

    base_risk = disruption_risk[disruption_type]

    # 4. Assess delivery delay
    existing_delay = shipment.estimated_delay_hours or 0

    total_delay = (
        existing_delay + additional_delay_hours
    )

    delay_risk = min(20, total_delay * 2)

    # 5. Calculate overall risk score
    risk_score = min(
        100,
        round(
            base_risk
            + temperature_risk
            + battery_risk
            + delay_risk,
            2,
        ),
    )

    # 6. Determine risk level
    if risk_score >= 80:
        risk_level = "Critical"
    elif risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # 7. Generate the primary recovery recommendation
    recommendations = {
        "vehicle_breakdown": (
            "Arrange a replacement refrigerated vehicle "
            "and transfer the shipment safely."
        ),
        "refrigeration_failure": (
            "Prioritize cargo transfer to a functioning "
            "refrigerated vehicle or suitable cold-storage facility."
        ),
        "temperature_rise": (
            "Inspect the refrigeration system, monitor cargo "
            "temperature and move the shipment to suitable "
            "cold storage if necessary."
        ),
        "battery_drop": (
            "Arrange reefer battery support or an alternative "
            "refrigerated power source."
        ),
        "route_blockage": (
            "Evaluate an alternative route and verify its "
            "detour distance against fleet policy."
        ),
        "shipment_delay": (
            "Reassess the delivery schedule and identify "
            "a feasible route or transfer option."
        ),
        "depot_unavailable": (
            "Identify another suitable depot with available "
            "capacity before redirecting the shipment."
        ),
    }

    recommended_action = recommendations[disruption_type]

    # 8. Generate alternative actions
    alternative_actions = [
        "Continue temperature monitoring during recovery.",
        "Notify the assigned operator and relevant logistics team.",
        "Reassess shipment risk after the recovery action.",
    ]

    if temperature_risk > 0:
        alternative_actions.append(
            "Prioritize temperature stabilization."
        )

    if battery_risk > 0:
        alternative_actions.append(
            "Arrange battery inspection or replacement."
        )

    if total_delay > 0:
        alternative_actions.append(
            "Update the estimated delivery schedule."
        )

    # 9. Generate explanation
    recommendation_reason = (
        f"Disruption: {disruption_description}. "
        f"Temperature deviation: "
        f"{round(temperature_deviation, 2)}°C. "
        f"Estimated total delay: {round(total_delay, 2)} hours. "
        f"Overall assessed risk: {risk_level}."
    )

    # 10. Return structured recovery assessment
    return {
        "shipment_code": shipment.shipment_code,
        "disruption_type": disruption_type,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommended_action": recommended_action,
        "recommendation_reason": recommendation_reason,
        "alternative_actions": alternative_actions,
        "estimated_total_delay_hours": round(
            total_delay, 2
        ),
        "temperature_status": temperature_status,
        "battery_status": battery_status,
        "analysis_status": "Assessment completed",
        
    }
