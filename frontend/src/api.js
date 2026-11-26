import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

const TOKEN_KEY = "cryonexus_access_token";

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

function toFrontendAccount(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    accountType: account.account_type,
    organization: account.organization,
    status: account.status,
    createdAt: account.created_at,
  };
}

export async function getShipments() {
  const response = await api.get("/shipments");
  return response.data;
}


export async function getShipmentEta(shipmentCode) {
  const response = await api.get(
    `/shipments/${encodeURIComponent(shipmentCode)}/eta`
  );

  return response.data;
}


export async function getDepots() {
  const response = await api.get("/depots");
  return response.data;
}

export async function createShipment(shipmentData) {
  const response = await api.post("/shipments", shipmentData);
  return response.data;
}

export async function getTemperatureReadings(shipmentCode) {
  const response = await api.get(
    `/shipments/${encodeURIComponent(shipmentCode)}/readings`
  );
  return response.data;
}

export async function addTemperatureReading(shipmentCode, readingData) {
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/readings`,
    readingData
  );
  return response.data;
}

export async function registerAccount(accountData) {
  await api.post("/auth/signup", accountData);

  // Sign in after signup so protected API requests have a token.
  const response = await api.post("/auth/login", {
    email: accountData.email,
    password: accountData.password,
    account_type: accountData.account_type,
  });

  saveToken(response.data.access_token);
  return toFrontendAccount(response.data);
}

export async function loginAccount(credentials) {
  const response = await api.post("/auth/login", credentials);

  saveToken(response.data.access_token);
  return toFrontendAccount(response.data);
}

export async function getAdminAccounts() {
  const response = await api.get("/admin/accounts");
  return response.data.map(toFrontendAccount);
}

export async function updateAdminAccountStatus(userId, status) {
  const response = await api.patch(
    `/admin/accounts/${userId}/status`,
    { status }
  );
  return toFrontendAccount(response.data);
}

export async function getFleetPolicy() {
  const response = await api.get("/admin/fleet-policy");
  return response.data;
}

export async function saveFleetPolicy(policyData) {
  const response = await api.put("/admin/fleet-policy", policyData);
  return response.data;
}

function toFrontendIncident(incident) {
  return {
    id: incident.id,
    title: incident.title,
    vehicle: incident.vehicle_id,
    driver: incident.driver_name,
    severity: incident.severity,
    time: new Date(incident.created_at).toLocaleString(),
    status: incident.status,
  };
}

export async function getAdminIncidents() {
  const response = await api.get("/admin/incidents");
  return response.data.map(toFrontendIncident);
}

export async function resolveAdminIncident(incidentId) {
  const response = await api.patch(
    `/admin/incidents/${incidentId}/resolve`
  );
  return toFrontendIncident(response.data);
}

export async function createAdminBroadcast(message) {
  const response = await api.post("/admin/broadcast-alerts", { message });
  return response.data;
}

export async function getAdminBroadcasts() {
  const response = await api.get("/admin/broadcast-alerts");
  return response.data;
}

export async function createHubPreAlert(shipmentCode, message) {
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/hub-pre-alert`,
    { message }
  );

  return response.data;
}


export async function addBatteryReading(
  shipmentCode,
  batteryPercent,
  note = ""
) {
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/battery-readings`,
    {
      battery_percent: Number(batteryPercent),
      note,
    }
  );

  return response.data;
}


export async function getBatteryReadings(shipmentCode) {
  const response = await api.get(
    `/shipments/${encodeURIComponent(shipmentCode)}/battery-readings`
  );
  return response.data;
}

export async function assignShipmentVehicle(
  shipmentCode,
  vehicleId,
  driverName,
  assignedOperatorId
) {
  const response = await api.patch(
    `/admin/shipments/${encodeURIComponent(shipmentCode)}/assignment`,
    {
      vehicle_id: vehicleId,
      driver_name: driverName,
      assigned_operator_id:
        assignedOperatorId === "" || assignedOperatorId == null
          ? null
          : Number(assignedOperatorId),
    }
  );

  return response.data;
}

export async function validateShipmentDetour(
  shipmentCode,
  depotId,
  detourDistanceKm
) {
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/validate-detour`,
    {
      depot_id: depotId,
      detour_distance_km: Number(detourDistanceKm),
    }
  );

  return response.data;
}

export async function getOperatorDashboardSummary() {
  const response = await api.get("/operator/dashboard-summary");
  return response.data;
}


export async function reportShipmentIncident(shipmentCode, incidentData) {
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/incidents`,
    {
      incident_type: incidentData.incident_type,
      description: incidentData.description,
      severity: incidentData.severity,
    }
  );

  return response.data;
}


export async function analyzeShipmentRecovery(
  shipmentCode,
  recoveryData
) {
  
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/analyze-recovery`,
    {
      shipment_code: shipmentCode,
      disruption_type: recoveryData.disruption_type,
      disruption_description: recoveryData.disruption_description,
      additional_delay_hours: Number(
        recoveryData.additional_delay_hours ?? 0
      ),
      simulated_battery_percent:
        recoveryData.simulated_battery_percent == null
          ? null
          : Number(recoveryData.simulated_battery_percent),
      simulated_temperature_c:
      recoveryData.simulated_temperature_c == null
    ? null
    : Number(recoveryData.simulated_temperature_c),
    }
  );

  return response.data;
}

export async function approveRecoveryPlan(
  shipmentCode,
  recommendedAction,
  notes = ""
) {
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/recovery-approval`,
    {
      recommended_action: recommendedAction,
      notes,
    }
  );

  return response.data;
}

export async function getRecoveryApproval(shipmentCode) {
  const response = await api.get(
    `/shipments/${encodeURIComponent(shipmentCode)}/recovery-approval`
  );

  return response.data;
}


export async function createDecisionHistory(shipmentCode, entry) {
  const response = await api.post(
    `/shipments/${encodeURIComponent(shipmentCode)}/decision-history`,
    {
      decision: entry.decision,
      reason: entry.reason,
      source: entry.source || "local",
      risk_level: entry.risk_level ?? null,
      risk_score: entry.risk_score ?? null,
    }
  );

  return response.data;
}

export async function getDecisionHistory() {
  const response = await api.get("/decision-history");

  return response.data.map((item) => ({
    id: item.id,
    shipmentCode: item.shipment_code,
    decision: item.decision,
    reason: item.reason,
    source: item.source,
    riskLevel: item.risk_level,
    riskScore: item.risk_score,
    userId: item.user_id,
    time: new Date(item.created_at).toLocaleString(),
    createdAt: item.created_at,
  }));
}
