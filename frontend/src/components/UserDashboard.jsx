import { useCallback, useEffect, useState } from "react";
import {
  addTemperatureReading,
  getShipments,
  getShipmentEta,
  getTemperatureReadings,
  addBatteryReading,
  getBatteryReadings,
  getOperatorDashboardSummary,
  reportShipmentIncident,
} from "../api";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Battery,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileSpreadsheet,
  HeartHandshake,
  Navigation,
  Package,
  PhoneCall,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Truck,
  UserCheck,
} from "lucide-react";

const getTemperatureStatus = (temperature, targetTemperature) => {
  if (
    temperature === null ||
    temperature === undefined ||
    temperature === "" ||
    targetTemperature === null ||
    targetTemperature === undefined ||
    targetTemperature === ""
  ) {
    return "unknown";
  }

  const current = Number(temperature);
  const target = Number(targetTemperature);

  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return "unknown";
  }

  const deviation = Math.abs(current - target);

  if (deviation >= 5) return "critical";
  if (deviation > 2.5) return "warning";

  return "compliant";
};

const LOW_BATTERY_THRESHOLD = 30;

const getBatteryStatus = (battery) => {
  if (
    battery === null ||
    battery === undefined ||
    battery === "" ||
    battery === "—"
  ) {
    return "unknown";
  }

  const value = Number(battery);

  if (!Number.isFinite(value)) {
    return "unknown";
  }

  if (value <= LOW_BATTERY_THRESHOLD) {
    return "low";
  }

  return "normal";
};

function ShipmentReadings({ shipment, onReadingSaved, onShowToast, onSummaryRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [temperature, setTemperature] = useState("");
  const [note, setNote] = useState("");
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    getTemperatureReadings(shipment.id)
      .then((data) => {
        if (!cancelled) setReadings(data);
      })
      .catch((requestError) => {
        if (cancelled) return;

        const message =
          requestError.response?.status === 401
            ? "Please sign in again to view readings."
            : "Could not load the reading history.";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, shipment.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = Number(temperature);
    if (temperature.trim() === "" || !Number.isFinite(value)) {
      setError("Enter a valid temperature.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const savedReading = await addTemperatureReading(shipment.id, {
        temperature_c: value,
        note: note.trim() || null,
      });

      onReadingSaved(savedReading.temperature_c);
      setTemperature("");
      setNote("");

      const updatedHistory = await getTemperatureReadings(shipment.id);
      setReadings(updatedHistory);
      await onSummaryRefresh?.();
      onShowToast("Operator-entered temperature reading saved.");
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? "Please sign in again before adding a reading."
          : "Could not save the reading. Check the backend and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
      >
        {isOpen ? "Hide temperature readings" : "Temperature readings"}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Readings are entered by an operator; they are not live sensor data.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(event) => setTemperature(event.target.value)}
              placeholder="Temperature °C"
              aria-label="Temperature in degrees Celsius"
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            />
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Note (optional)"
              aria-label="Optional reading note"
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
            >
              {saving ? "Saving..." : "Add reading"}
            </button>
          </form>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}

          {loading ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loading history...
            </p>
          ) : readings.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No readings recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {reading.temperature_c}°C
                    {reading.note ? ` · ${reading.note}` : ""}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Operator-entered ·{" "}
                    {new Date(reading.recorded_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function ShipmentBatteryReadings({ shipmentCode, onBatteryUpdate, onSummaryRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [readings, setReadings] = useState([]);
  const [battery, setBattery] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadReadings() {
    try {
      setError("");
      const data = await getBatteryReadings(shipmentCode);

      setReadings(data);

      if (data.length > 0) {
        onBatteryUpdate?.(shipmentCode, data[0].battery_percent);
      } else {
        onBatteryUpdate?.(shipmentCode, null);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load battery readings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  setLoading(true);
  loadReadings();
}, [shipmentCode]);

  async function handleSubmit(event) {
    event.preventDefault();

    const value = Number(battery);

    if (
      battery.trim() === "" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    ) {
      setError("Enter a battery percentage between 0 and 100.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await addBatteryReading(shipmentCode, value, note.trim() || "");

      setBattery("");
      setNote("");

      await loadReadings();
      await onSummaryRefresh?.();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to save battery reading."
      );
    } finally {
      setSaving(false);
    }
  }

  const latestReading = readings[0];
  const batteryStatus = getBatteryStatus(
  latestReading?.battery_percent
);

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
      <button
  type="button"
  onClick={() => setIsOpen((open) => !open)}
  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
>
  {isOpen ? "Hide battery monitoring" : "Reefer battery monitoring"}
</button>

      {isOpen && (
      <div className="mt-3 space-y-3">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Battery readings are entered by an operator; they are not live sensor data.
        </p>

        {loading ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading battery history...
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
  <div className="text-xs text-slate-700 dark:text-slate-200">
    Latest battery:{" "}
    <strong
      className={
        batteryStatus === "low"
          ? "text-rose-600 dark:text-rose-400"
          : "text-emerald-600 dark:text-emerald-400"
      }
    >
      {latestReading
        ? `${latestReading.battery_percent}%`
        : "No readings recorded"}
    </strong>
  </div>

  {batteryStatus === "low" && (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
      LOW BATTERY WARNING
    </span>
  )}

  {batteryStatus === "normal" && (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
      BATTERY NORMAL
    </span>
  )}
</div>

            {latestReading && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Last recorded:{" "}
                {new Date(latestReading.recorded_at).toLocaleString()}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={battery}
                onChange={(event) => setBattery(event.target.value)}
                placeholder="Battery %"
                aria-label="Battery percentage"
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
              />

              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Note (optional)"
                aria-label="Optional battery reading note"
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
              />

              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
              >
                {saving ? "Saving..." : "Add reading"}
              </button>
            </form>

            {readings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Recent battery history
                </h4>

                {readings.slice(0, 5).map((reading) => (
                  <div
                    key={reading.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {reading.battery_percent}%
                      {reading.note ? ` · ${reading.note}` : ""}
                    </span>

                    <span className="text-slate-500 dark:text-slate-400">
                      Operator-entered ·{" "}
                      {new Date(reading.recorded_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>
      )}
    </div>
  );
}

function ShipmentIncidentReport({
  shipmentCode,
  onSummaryRefresh,
  onShowToast,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [incidentType, setIncidentType] = useState("Vehicle Breakdown");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("High");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (description.trim().length < 5) {
      setError("Please enter at least 5 characters describing the incident.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await reportShipmentIncident(shipmentCode, {
        incident_type: incidentType,
        description: description.trim(),
        severity,
      });

      setDescription("");
      setIncidentType("Vehicle Breakdown");
      setSeverity("High");

      await onSummaryRefresh?.();

      onShowToast?.("Incident reported successfully.");
      setIsOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        (err.response?.status === 401
          ? "Your session has expired. Please sign in again."
          : "Unable to report the incident. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
          setError("");
        }}
        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
      >
        {isOpen ? "Hide incident report" : "Report an incident"}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Report a shipment-related operational issue to the administration.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={incidentType}
              onChange={(event) => setIncidentType(event.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="Vehicle Breakdown">Vehicle Breakdown</option>
              <option value="Refrigeration Failure">Refrigeration Failure</option>
              <option value="Route Blockage">Route Blockage</option>
              <option value="Temperature Excursion">Temperature Excursion</option>
              <option value="Battery Failure">Battery Failure</option>
              <option value="Shipment Delay">Shipment Delay</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="Low">Low Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="High">High Severity</option>
              <option value="Critical">Critical Severity</option>
            </select>
          </div>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what happened..."
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 resize-y"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              {description.length}/1000 characters
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
            >
              {saving ? "Submitting..." : "Submit incident"}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function UserDashboard({
  t,
  language,
  currentUser,
  operator,
  onSelectShipment,
  onShipmentDataLoaded,
  onCallDriver,
  onShowToast,
  navigate,
}) {
  const [isOnDuty, setIsOnDuty] = useState(true);

  const [assignedShipments, setAssignedShipments] = useState([]);
  const [shipmentLoadError, setShipmentLoadError] = useState("");
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [summaryLoadError, setSummaryLoadError] = useState("");

  
useEffect(() => {
  let cancelled = false;

  async function loadShipmentsAndEta() {
    try {
      const shipments = await getShipments();

      if (cancelled) return;

      const dashboardShipments = shipments.map((shipment) => {
        const temperatureStatus = getTemperatureStatus(
          shipment.current_temp_c,
          shipment.required_temp_c
        );

        return {
          id: shipment.shipment_code,
          product: shipment.product,
          category: shipment.product_category || "General",
          source: shipment.origin_location || "Not provided",
          destination: shipment.destination_location || "Not provided",
          temp: shipment.current_temp_c,
          targetTemp: shipment.required_temp_c,
          temperatureStatus,
          battery: "—",
          fuel: shipment.fuel_level_percent ?? "",
          delay: shipment.estimated_delay_hours ?? "",
          refrigeration: shipment.refrigeration_status || "",
          driver: shipment.driver_name || "Unassigned",
          phone: "",
          vehicleId: shipment.vehicle_id || "Unassigned",
          distanceKm: null,
          eta: "Calculating...",
          status:
            shipment.status === "warning"
              ? "warning"
              : shipment.status === "active"
              ? "optimal"
              : shipment.status,
          priority: shipment.status,
        };
      });

      setAssignedShipments(dashboardShipments);

      if (dashboardShipments.length > 0) {
        onShipmentDataLoaded?.(dashboardShipments[0]);
      }

      setShipmentLoadError("");

      // Fetch actual road distance and ETA for each shipment.
      for (const shipment of dashboardShipments) {
  try {
    const etaData = await getShipmentEta(shipment.id);

    if (cancelled) return;

    setAssignedShipments((previous) =>
      previous.map((item) =>
        item.id === shipment.id
          ? {
              ...item,
              distanceKm: etaData.distance_km,
              eta: etaData.eta,
            }
          : item
      )
    );
  } catch (etaError) {
    console.error(
      `ETA calculation failed for ${shipment.id}:`,
      etaError
    );

    if (cancelled) return;

    setAssignedShipments((previous) =>
      previous.map((item) =>
        item.id === shipment.id
          ? {
              ...item,
              distanceKm: null,
              eta: "Unavailable",
            }
          : item
      )
    );
  }
}
    } catch (error) {
      if (cancelled) return;

      console.error("SHIPMENT FETCH ERROR:", error);

      setShipmentLoadError(
        "Could not load shipments. Check that the backend is running."
      );
    }
  }

  loadShipmentsAndEta();

  return () => {
    cancelled = true;
  };
}, []);

  const refreshDashboardSummary = useCallback(async () => {
    try {
      const summary = await getOperatorDashboardSummary();
      setDashboardSummary(summary);
      setSummaryLoadError("");
    } catch {
      setSummaryLoadError("Could not load dashboard summary.");
    }
  }, []);

  useEffect(() => {
    refreshDashboardSummary();
  }, [refreshDashboardSummary]);

  // Pre-configured active shipments monitored in Karnataka
  
  const radioFeed = [
    {
      time: "11:42 AM",
      vehicle: "KA-04-CR-8821",
      driver: "Ramesh Kumar",
      type: "normal",
      text: t.pingNormal,
    },
    {
      time: "11:28 AM",
      vehicle: "KA-25-CR-4412",
      driver: "Suresh Nayak",
      type: "warning",
      text: t.pingWarning,
    },
    {
      time: "10:55 AM",
      vehicle: "KA-19-CR-3109",
      driver: "Anand Poojary",
      type: "divert",
      text: t.pingDivert,
    },
  ];

  const handleInspect = (shipment) => {
    if (onSelectShipment) {
      onSelectShipment(shipment);
    }
  };

  const handleIssuePass = (shipmentId) => {
    onShowToast(`${t.toastSafetyPass} (${shipmentId})`);
  };

  const handleExportManifest = () => {
    onShowToast(t.toastManifest);
  };

  const operatorRoleLabel = t.roles[operator] || t.roles.manager;
  const displayName = currentUser ? currentUser.name : "Operator";

  return (
    <div className="space-y-6">
      {/* Personalized Operator Greeting Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-2xl rounded-l-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                {operatorRoleLabel}
              </span>
              {currentUser?.organization && (
                <span className="text-xs text-blue-100 hidden sm:inline">
                  • {currentUser.organization}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {t.welcomeOperator} {displayName}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              {t.userDashboardSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isOnDuty
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{isOnDuty ? t.shiftActive : t.shiftStandby}</span>
            </button>
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              {t.shiftDuration}
            </div>
          </div>
        </div>
      </div>

      {/* Operator Shift KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Assigned Shipments</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {dashboardSummary?.total_shipments ?? "Loading..."}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Assigned to your account
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Temperature Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {dashboardSummary?.temperature_compliance != null
      ? `${dashboardSummary.temperature_compliance}%`
      : "—"}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {dashboardSummary
      ? `${dashboardSummary.temperature_assessed} shipment(s) assessed`
      : "Loading readings..."}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Open Incidents</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
             {dashboardSummary?.open_incidents ?? "—"}
          </p>
          <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
             {dashboardSummary
      ? dashboardSummary.open_incidents > 0
        ? "Requires attention"
        : "No open incidents"
      : "Loading incidents..."}
          </span>
        </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
       <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
    <span>Average Battery</span>
    <Battery className="w-4 h-4 text-purple-500" />
  </div>

  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
    {dashboardSummary?.average_battery != null
      ? `${dashboardSummary.average_battery}%`
      : "—"}
  </p>

  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
    {dashboardSummary
      ? `${dashboardSummary.battery_monitored} monitored · ${dashboardSummary.low_battery_shipments} below threshold`
      : "Loading battery data..."}
  </span>
      </div>
      </div>
      {/* Operator Quick Action Shortcuts */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.quickActions}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click operational triggers for cold-chain safety.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => navigate("input")}
            className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{t.actionQuickReroute}</span>
          </button>

          <button
            onClick={onCallDriver}
            className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.actionDriverCall}</span>
          </button>

          <button
            onClick={() => handleIssuePass("COVAXIN-BLR-09")}
            className="flex items-center gap-2 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <FileCheck2 className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{t.actionSafetyPass}</span>
          </button>

          <button
            onClick={handleExportManifest}
            className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/60 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t.actionManifest}</span>
          </button>
        </div>
      </div>

      {/* Assigned Shipments Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.myShipments}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.myShipmentsSub}
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {assignedShipments.length} Active
          </span>
        </div>

        

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedShipments.map((s) => {
            const isWarning = s.status === "warning";
            const isTempCritical = s.temperatureStatus === "critical";
const isTempWarning = s.temperatureStatus === "warning";

const temperatureBadgeClass =
  isTempCritical
    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
    : isTempWarning
    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
    : s.temperatureStatus === "unknown"
    ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
    : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800";

const temperatureStatusLabel = isTempCritical
  ? "CRITICAL EXCURSION"
  : isTempWarning
  ? "TEMPERATURE WARNING"
  : s.temperatureStatus === "unknown"
  ? "TEMPERATURE UNKNOWN"
  : "TEMPERATURE COMPLIANT";
            return (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isWarning
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                          : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {s.id}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isWarning
                              ? "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {s.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {s.product}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
  <div
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs ${temperatureBadgeClass}`}
  >
    <Thermometer className="w-3.5 h-3.5" />
    <span>
  {s.temp === null || s.temp === undefined || s.temp === ""
    ? "—"
    : `${s.temp}°C`}
</span>
  </div>

  <span className="block text-[10px] font-semibold mt-0.5 text-right text-slate-500 dark:text-slate-400">
    {temperatureStatusLabel}
  </span>

  <span className="block text-[10px] text-slate-400 mt-0.5">
    Target: {s.targetTemp}°C
  </span>
  </div>
</div>

                {/* Route corridor */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-3">
  <div className="truncate min-w-0">
    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
      Route Corridor
    </span>
    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
      {s.source} ➔ {s.destination}
    </span>
  </div>

  <div className="flex items-center gap-4 shrink-0 text-right">
    <div>
      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
        Distance
      </span>
      <span className="font-bold text-slate-800 dark:text-slate-200">
        {s.distanceKm != null ? `${s.distanceKm} km` : "—"}
      </span>
    </div>

    <div>
      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
        ETA
      </span>
      <span className="font-bold text-blue-600 dark:text-blue-400">
        {s.eta}
      </span>
    </div>
  </div>
</div>

                
{/* Sub metrics, Vehicle & Driver */}
<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
  <div className="flex items-center gap-1.5">
  <Clock3 className="w-4 h-4 text-amber-500" />
  <span>
    Route Delay:{" "}
    <strong className="text-slate-800 dark:text-slate-200">
      {s.delay === null || s.delay === undefined || s.delay === ""
        ? "Not recorded"
        : `${s.delay} hrs`}
    </strong>
  </span>
</div>
  <div className="flex items-center gap-1.5">
  <Battery
    className={`w-4 h-4 ${
      getBatteryStatus(s.battery) === "low"
        ? "text-rose-500"
        : getBatteryStatus(s.battery) === "unknown"
        ? "text-slate-400"
        : "text-emerald-500"
    }`}
  />

  <span>
    Battery:{" "}
    <strong
      className={
        getBatteryStatus(s.battery) === "low"
          ? "text-rose-600 dark:text-rose-400"
          : ""
      }
    >
      {s.battery === "—" ? "Not recorded" : `${s.battery}%`}
    </strong>

    {getBatteryStatus(s.battery) === "low" && (
      <span className="ml-1 text-rose-600 dark:text-rose-400 font-bold">
        (LOW)
      </span>
    )}
  </span>
</div>

  <div className="flex items-center gap-1.5">
    <Truck className="w-4 h-4 text-purple-500" />
    <span>
      Vehicle: <strong>{s.vehicleId}</strong>
    </span>
  </div>

  <div className="flex items-center gap-1.5">
    <UserCheck className="w-4 h-4 text-blue-500" />
    <span>{s.driver}</span>
  </div>
</div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => handleInspect(s)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>{t.inspectReroute}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onCallDriver}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.actionDriverCall}</span>
                  </button>
                </div>
                <ShipmentReadings
  shipment={s}
  onReadingSaved={(temperature) => {
  setAssignedShipments((previous) =>
    previous.map((item) => {
      if (item.id !== s.id) return item;

      return {
        ...item,
        temp: temperature,
        temperatureStatus: getTemperatureStatus(
          temperature,
          item.targetTemp
        ),
      };
    })
  );
}}
  onShowToast={onShowToast}
  onSummaryRefresh={refreshDashboardSummary}
/>

<ShipmentBatteryReadings
  shipmentCode={s.id}
  onBatteryUpdate={(shipmentCode, batteryPercent) => {
    setAssignedShipments((previous) =>
      previous.map((item) =>
        item.id === shipmentCode
          ? {
              ...item,
              battery: batteryPercent ?? "—",
            }
          : item
      )
    );
  }}
  onSummaryRefresh={refreshDashboardSummary}
/>

<ShipmentIncidentReport
  shipmentCode={s.id}
  onSummaryRefresh={refreshDashboardSummary}
  onShowToast={onShowToast}
/>

              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Radio & Telemetry Log */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.recentRadioPings}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">
            Live Stream
          </span>
        </div>

        <div className="space-y-2">
          {radioFeed.map((rf, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[11px] text-slate-400 shrink-0">
                  {rf.time}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                  {rf.vehicle} ({rf.driver}):
                </span>
                <span className="text-slate-600 dark:text-slate-300 truncate">
                  {rf.text}
                </span>
              </div>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  rf.type === "warning"
                    ? "bg-amber-500"
                    : rf.type === "divert"
                    ? "bg-purple-500"
                    : "bg-emerald-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
