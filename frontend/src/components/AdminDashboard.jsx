import {
  getAdminAccounts,
  updateAdminAccountStatus,
  createAdminBroadcast,
  getAdminBroadcasts,
  getShipments,
  addBatteryReading,
  getBatteryReadings,
  assignShipmentVehicle,
  validateShipmentDetour,
  getDepots,
  getFleetPolicy,
  saveFleetPolicy,
  getAdminIncidents,
  resolveAdminIncident
} from "../api";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Cpu,
  Filter,
  KeyRound,
  Megaphone,
  Package,
  Plus,
  Power,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Thermometer,
  Trash2,
  Truck,
  UserCheck,
  UserCog,
  Users,
  Warehouse,
  X,
  Zap,
} from "lucide-react";

export default function AdminDashboard({
  t,
  language,
  currentUser,
  onShowToast,
  navigate,
}) {
  // Hub Telemetry state
  const [karnatakaHubs, setKarnatakaHubs] = useState([]);
  const [depotsLoading, setDepotsLoading] = useState(true);
  const [depotsError, setDepotsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getDepots()
      .then((depots) => {
        if (!cancelled) setKarnatakaHubs(depots);
      })
      .catch(() => {
        if (!cancelled) setDepotsError("Could not load depot records.");
      })
      .finally(() => {
        if (!cancelled) setDepotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);
  

     // User accounts loaded from the admin-only backend endpoint
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    getAdminAccounts()
      .then((accounts) => {
        if (!cancelled) setUsersList(accounts);
      })
      .catch((error) => {
        if (cancelled) return;

        if (error.response?.status === 401) {
          setUsersError("Your session expired. Sign in again as an admin.");
        } else if (error.response?.status === 403) {
          setUsersError("Admin access is required to view accounts.");
        } else {
          setUsersError("Could not load accounts. Check that the backend is running.");
        }
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleStatus = async (user) => {
  const nextStatus = user.status === "Active" ? "Suspended" : "Active";

  try {
    const updatedAccount = await updateAdminAccountStatus(user.id, nextStatus);

    setUsersList((previousUsers) =>
      previousUsers.map((item) =>
        item.id === updatedAccount.id ? updatedAccount : item
      )
    );

    onShowToast(`Account status changed to ${nextStatus}.`);
  } catch (error) {
    if (error.response?.status === 401) {
      onShowToast("Your session expired. Sign in again as an admin.");
    } else if (error.response?.status === 403) {
      onShowToast("Admin access is required to change account status.");
    } else if (error.response?.status === 400) {
       onShowToast(error.response.data.detail);
    } else {
      onShowToast("Could not update account status. Check that the backend is running.");
    }
  }
};

const [shipmentsList, setShipmentsList] = useState([]);
const [shipmentsLoading, setShipmentsLoading] = useState(true);
const [shipmentsError, setShipmentsError] = useState("");
const [batteryShipmentCode, setBatteryShipmentCode] = useState("");
const [batteryPercent, setBatteryPercent] = useState("");
const [batteryNote, setBatteryNote] = useState("");
const [batteryLoading, setBatteryLoading] = useState(false);
const [batteryMessage, setBatteryMessage] = useState("");
const [batteryError, setBatteryError] = useState("");

// Vehicle and driver assignment
const [assignmentShipmentCode, setAssignmentShipmentCode] = useState("");
const [assignmentVehicleId, setAssignmentVehicleId] = useState("");
const [assignmentDriverName, setAssignmentDriverName] = useState("");
const [assignmentLoading, setAssignmentLoading] = useState(false);
const [assignmentOperatorId, setAssignmentOperatorId] = useState("");

// Battery reading history
const [historyShipmentCode, setHistoryShipmentCode] = useState("");
const [batteryHistory, setBatteryHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState("");

// Detour validation
const [detourShipmentCode, setDetourShipmentCode] = useState("");
const [detourDepotId, setDetourDepotId] = useState("");
const [detourDistance, setDetourDistance] = useState("");
const [detourLoading, setDetourLoading] = useState(false);
const [detourResult, setDetourResult] = useState(null);
const [detourError, setDetourError] = useState("");

useEffect(() => {
  let cancelled = false;

  getShipments()
    .then((shipments) => {
      if (!cancelled) setShipmentsList(shipments);
    })
    .catch(() => {
      if (!cancelled) {
        setShipmentsError("Could not load shipments.");
      }
    })
    .finally(() => {
      if (!cancelled) setShipmentsLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);
  
    // Fleet Safety Governance Policy settings from the backend
  const [maxDrift, setMaxDrift] = useState(2.5);
  const [batteryAlarm, setBatteryAlarm] = useState(35);
  const [detourRadius, setDetourRadius] = useState(50);
  const [autoSms, setAutoSms] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policySaving, setPolicySaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getFleetPolicy()
      .then((policy) => {
        if (cancelled) return;
        setMaxDrift(policy.max_temp_drift);
        setBatteryAlarm(policy.battery_alarm_percent);
        setDetourRadius(policy.max_detour_radius_km);
        setAutoSms(policy.auto_sms);
      })
      .catch((error) => {
        if (cancelled) return;

        if (error.response?.status === 401) {
          onShowToast("Your session expired. Sign in again as an admin.");
        } else if (error.response?.status === 403) {
          onShowToast("Admin access is required to load fleet policy.");
        } else {
          onShowToast("Could not load fleet policy from the backend.");
        }
      })
      .finally(() => {
        if (!cancelled) setPolicyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onShowToast]);

  const handleSavePolicy = async () => {
    setPolicySaving(true);

    try {
      const savedPolicy = await saveFleetPolicy({
        max_temp_drift: maxDrift,
        battery_alarm_percent: batteryAlarm,
        max_detour_radius_km: detourRadius,
        auto_sms: autoSms,
      });

      setMaxDrift(savedPolicy.max_temp_drift);
      setBatteryAlarm(savedPolicy.battery_alarm_percent);
      setDetourRadius(savedPolicy.max_detour_radius_km);
      setAutoSms(savedPolicy.auto_sms);
      onShowToast("Fleet policy saved to the database.");
    } catch (error) {
      if (error.response?.status === 401) {
        onShowToast("Your session expired. Sign in again as an admin.");
      } else if (error.response?.status === 403) {
        onShowToast("Admin access is required to save fleet policy.");
      } else {
        onShowToast("Could not save fleet policy. Check the backend connection.");
      }
    } finally {
      setPolicySaving(false);
    }
  };
  
  // Submit Reefer Battery Reading
  
const handleAddBatteryReading = async (e) => {
  e.preventDefault();

  setBatteryMessage("");
  setBatteryError("");

  if (!batteryShipmentCode || batteryPercent === "") {
    setBatteryError("Please select a shipment and enter battery percentage.");
    return;
  }

  const percentage = Number(batteryPercent);

  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    setBatteryError("Battery percentage must be between 0 and 100.");
    return;
  }

  try {
    setBatteryLoading(true);

    const response = await addBatteryReading(
      batteryShipmentCode,
      percentage,
      batteryNote
    );

    setBatteryMessage(
      `Battery reading saved successfully: ${response.battery_percent}%.`
    );

    setBatteryPercent("");
    setBatteryNote("");

    // Refresh the incident list separately
    try {
      const updatedIncidents = await getAdminIncidents();
      setIncidents(updatedIncidents);
    } catch {
      onShowToast("Battery reading saved, but incident list could not refresh.");
    }

  } catch (error) {
    setBatteryError(
      error.response?.data?.detail || "Failed to save battery reading."
    );
  } finally {
    setBatteryLoading(false);
  }
};

// Assign vehicle and driver to a shipment
const handleAssignVehicle = async (e) => {
  e.preventDefault();

  if (
  !assignmentShipmentCode ||
  !assignmentVehicleId.trim() ||
  !assignmentDriverName.trim() ||
  !assignmentOperatorId
) {
  onShowToast("Please complete all assignment fields.");
  return;
}

  try {
    setAssignmentLoading(true);

const updatedShipment = await assignShipmentVehicle(
  assignmentShipmentCode,
  assignmentVehicleId.trim(),
  assignmentDriverName.trim(),
  assignmentOperatorId
);

setAssignmentShipmentCode("");
setAssignmentVehicleId("");
setAssignmentDriverName("");
setAssignmentOperatorId("");

    setShipmentsList((previous) =>
      previous.map((shipment) =>
        shipment.shipment_code === updatedShipment.shipment_code
          ? updatedShipment
          : shipment
      )
    );

    

    // Refresh incidents so their vehicle and driver details are updated
    try {
      const updatedIncidents = await getAdminIncidents();
      setIncidents(updatedIncidents);
    } catch {
      onShowToast("Assignment saved, but incidents could not refresh.");
    }

    onShowToast("Vehicle and driver assigned successfully.");
  } catch (error) {
    onShowToast(
      error.response?.data?.detail || "Could not assign vehicle and driver."
    );
  } finally {
    setAssignmentLoading(false);
  }
};


// Load battery reading history
const handleLoadBatteryHistory = async () => {
  if (!historyShipmentCode) {
    setHistoryError("Please select a shipment.");
    return;
  }

  try {
    setHistoryLoading(true);
    setHistoryError("");

    const readings = await getBatteryReadings(historyShipmentCode);
    setBatteryHistory(readings);
  } catch (error) {
    setHistoryError(
      error.response?.data?.detail || "Could not load battery history."
    );
    setBatteryHistory([]);
  } finally {
    setHistoryLoading(false);
  }
};


// Validate proposed depot diversion
const handleValidateDetour = async (e) => {
  e.preventDefault();

  setDetourError("");
  setDetourResult(null);

  if (!detourShipmentCode || !detourDepotId || detourDistance === "") {
    setDetourError("Please complete all detour fields.");
    return;
  }

  const distance = Number(detourDistance);

  if (!Number.isFinite(distance) || distance < 0) {
    setDetourError("Enter a valid non-negative detour distance.");
    return;
  }

  try {
    setDetourLoading(true);

    const result = await validateShipmentDetour(
      detourShipmentCode,
      detourDepotId,
      distance
    );

    setDetourResult(result);
  } catch (error) {
    setDetourError(
      error.response?.data?.detail || "Could not validate the detour."
    );
  } finally {
    setDetourLoading(false);
  }
};

  // Incidents Center State
  const [incidents, setIncidents] = useState([]);
const [incidentsLoading, setIncidentsLoading] = useState(true);
const [incidentsError, setIncidentsError] = useState("");

useEffect(() => {
  let cancelled = false;

  getAdminIncidents()
    .then((items) => {
      if (!cancelled) setIncidents(items);
    })
    .catch(() => {
      if (!cancelled) {
        setIncidentsError("Could not load incidents from the database.");
      }
    })
    .finally(() => {
      if (!cancelled) setIncidentsLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);

const handleResolveIncident = async (incidentId) => {
  try {
    const updatedIncident = await resolveAdminIncident(incidentId);

    setIncidents((previous) =>
      previous.map((incident) =>
        incident.id === updatedIncident.id ? updatedIncident : incident
      )
    );

    onShowToast("Incident resolved and saved to the database.");
  } catch (error) {
    if (error.response?.status === 401) {
      onShowToast("Your session expired. Sign in again as an admin.");
    } else if (error.response?.status === 403) {
      onShowToast("Admin access is required to resolve incidents.");
    } else {
      onShowToast("Could not resolve the incident.");
    }
  }
};

  // Broadcast Alert State
const [broadcastOpen, setBroadcastOpen] = useState(false);
const [broadcastMsg, setBroadcastMsg] = useState("");

const [broadcasts, setBroadcasts] = useState([]);
const [broadcastsLoading, setBroadcastsLoading] = useState(true);
const [broadcastsError, setBroadcastsError] = useState("");

// Load existing broadcast history
useEffect(() => {
  let cancelled = false;

  getAdminBroadcasts()
    .then((items) => {
      if (!cancelled) {
        setBroadcasts(items);
      }
    })
    .catch(() => {
      if (!cancelled) {
        setBroadcastsError("Could not load broadcast history.");
      }
    })
    .finally(() => {
      if (!cancelled) {
        setBroadcastsLoading(false);
      }
    });

  return () => {
    cancelled = true;
  };
}, []);

// Create a new broadcast alert
const handleSendBroadcast = async (e) => {
  e.preventDefault();

  const message = broadcastMsg.trim();

  if (!message) return;

  try {
    const newBroadcast = await createAdminBroadcast(message);

    // Add the new alert to history immediately
    setBroadcasts((previous) => [
      newBroadcast,
      ...previous,
    ]);

    setBroadcastOpen(false);
    setBroadcastMsg("");

    onShowToast("Fleet alert saved to the database.");
  } catch (error) {
    if (error.response?.status === 401) {
      onShowToast("Your session expired. Sign in again as an admin.");
    } else if (error.response?.status === 403) {
      onShowToast("Admin access is required to save a fleet alert.");
    } else {
      onShowToast("Could not save the fleet alert.");
    }
  }
};

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.organization?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.accountType === "admin") ||
      (roleFilter === "user" && u.accountType !== "admin");
    return matchesSearch && matchesRole;
  });


  const aboveTargetCount = shipmentsList.filter((shipment) => {
    if (
      shipment.current_temp_c == null ||
      shipment.required_temp_c == null
    ) {
      return false;
    }

    const currentTemp = Number(shipment.current_temp_c);
    const requiredTemp = Number(shipment.required_temp_c);

    return (
      Number.isFinite(currentTemp) &&
      Number.isFinite(requiredTemp) &&
      Math.abs(currentTemp - requiredTemp) > maxDrift
    );
  }).length;

  const totalCargoKg = shipmentsList.reduce((total, shipment) => {
    const quantity = Number(shipment.quantity_kg);

    return Number.isFinite(quantity) && quantity > 0
      ? total + quantity
      : total;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Executive Fleet Command Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white shadow-xl shadow-purple-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-2xl rounded-l-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-400/20 border border-purple-300/30 text-purple-200 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                {t.adminDashboard}
              </span>
              <span className="text-xs text-purple-200">
                • {t.operational}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Karnataka Cold-Chain Command & Control
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
              {t.adminDashboardSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setBroadcastOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>{t.broadcastAlert}</span>
            </button>
          </div>
        </div>
      </div>

      {/* State-Level Telemetry KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Total Shipments</span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {shipmentsLoading
                ? "Loading..."
                : shipmentsError
                ? "Unavailable"
                : `${shipmentsList.length} Shipments`}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {shipmentsError || "Records loaded from the database"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Cargo Quantity (kg)</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
             {shipmentsLoading
                ? "Loading..."
                : shipmentsError
                   ? "Unavailable"
                    : `${totalCargoKg.toLocaleString()} kg`}
          </p>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            Total quantity recorded for these shipments
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>{t.depotsOnline}</span>
            <Warehouse className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {depotsLoading
  ? "Loading..."
  : depotsError
    ? "Unavailable"
    : `${karnatakaHubs.filter((hub) => hub.status === "optimal").length} Operational`}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Based on depot status records
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
           <span>Shipments Above Target</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {shipmentsLoading
               ? "Loading..."
               : shipmentsError
                   ? "Unavailable"
                   : `${aboveTargetCount} Above Target`}
          </p>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Based on current temperature vs. target
          </span>
        </div>
      </div>

      {/* Karnataka Cold Storage Hub Telemetry Grid */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.depotTelemetry}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Depot environmental and generator records stored in the database.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200/60">
            {depotsLoading ? "Loading..." : `${karnatakaHubs.length} Karnataka Hubs`}
          </span>
        </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {depotsLoading ? (
    <p className="text-xs text-slate-500">Loading depot records...</p>
  ) : depotsError ? (
    <p className="text-xs text-rose-600">{depotsError}</p>
  ) : karnatakaHubs.length === 0 ? (
    <p className="text-xs text-slate-500">No depot records found.</p>
  ) : (
    karnatakaHubs.map((hub) => (
      <div
        key={hub.id}
        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80 space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {hub.name}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {hub.location}
            </span>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              hub.status === "warning"
                ? "bg-amber-500 ring-4 ring-amber-500/20"
                : "bg-emerald-500 ring-4 ring-emerald-500/20"
            }`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
            <span className="text-slate-500 dark:text-slate-400">
              {t.depotCapacity}:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {hub.capacity}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                hub.capacity > 80
                  ? "bg-amber-500"
                  : "bg-blue-600 dark:bg-blue-500"
              }`}
              style={{ width: `${hub.capacity}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">Chamber Temp</span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold">
              {hub.temp_chilled}°C / {hub.temp_deep}°C
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">{t.depotBays}</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              {hub.free_bays} Free
            </strong>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
          <span className="flex items-center gap-1">
            <Power className="w-3 h-3 text-purple-500" />
            {hub.power}
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {hub.gen_status}
          </span>
        </div>
      </div>
    ))
  )}
</div>
  </div>

   
{/* Reefer Battery Monitoring */}
<div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">

  <div>
    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
      Reefer Battery Monitoring
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Record vehicle battery levels and automatically generate incidents when battery levels fall below the fleet policy threshold.
    </p>
  </div>

  <form onSubmit={handleAddBatteryReading} className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Select Shipment
      </label>

      <select
        required
        value={batteryShipmentCode}
        onChange={(e) => setBatteryShipmentCode(e.target.value)}
        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
      >
        <option value="">Choose a shipment</option>
        {shipmentsList.map((shipment) => (
          <option key={shipment.id} value={shipment.shipment_code}>
            {shipment.shipment_code} - {shipment.product}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Battery Percentage (%)
      </label>

      <input
        type="number"
        required
        min="0"
        max="100"
        step="0.1"
        value={batteryPercent}
        onChange={(e) => setBatteryPercent(e.target.value)}
        placeholder="Enter battery level (0-100)"
        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
      />
    </div>

    <div className="md:col-span-2">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Note (Optional)
      </label>

      <input
        type="text"
        value={batteryNote}
        onChange={(e) => setBatteryNote(e.target.value)}
        placeholder="Enter battery observation"
        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
      />
    </div>

    <div className="md:col-span-2 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-xs text-slate-500">
        Configured alert threshold: {batteryAlarm}%
      </p>

      <button
        type="submit"
        disabled={batteryLoading || shipmentsLoading}
        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
      >
        {batteryLoading ? "Saving..." : "Submit Battery Reading"}
      </button>
    </div>

  </form>

  {batteryMessage && (
    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
      {batteryMessage}
    </div>
  )}

  {batteryError && (
    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
      {batteryError}
    </div>
  )}

</div>

{/* Shipment Operations */}
<div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6">

  <div>
    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
      Shipment Operations
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Manage vehicle assignments, review battery history and validate depot diversions.
    </p>
  </div>

  {/* Vehicle and Driver Assignment */}
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-4">

    <div className="flex items-center gap-2">
      <Truck className="w-4 h-4 text-purple-500" />
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
        Vehicle and Driver Assignment
      </h4>
    </div>

    <form onSubmit={handleAssignVehicle} className="grid grid-cols-1 md:grid-cols-3 gap-3">

      <select
        required
        value={assignmentShipmentCode}
        onChange={(e) => setAssignmentShipmentCode(e.target.value)}
        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
      >
        <option value="">Select shipment</option>
        {shipmentsList.map((shipment) => (
          <option key={shipment.id} value={shipment.shipment_code}>
            {shipment.shipment_code}
          </option>
        ))}
      </select>

      <input
        required
        type="text"
        value={assignmentVehicleId}
        onChange={(e) => setAssignmentVehicleId(e.target.value)}
        placeholder="Vehicle ID (e.g. TRK-015)"
        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
      />

      <input
        required
        type="text"
        value={assignmentDriverName}
        onChange={(e) => setAssignmentDriverName(e.target.value)}
        placeholder="Driver name"
        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
      />

      <div>
  <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
    Assign Operator
  </label>

  <select
    value={assignmentOperatorId}
    onChange={(e) => setAssignmentOperatorId(e.target.value)}
    required
    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
  >
    <option value="">Select an operator</option>

    {usersList
      .filter(
        (user) =>
          user.accountType === "user" &&
          user.status === "Active"
      )
      .map((user) => (
        <option key={user.id} value={user.id}>
          {user.name} (ID: {user.id})
        </option>
      ))}
  </select>
</div>

      <div className="md:col-span-3 flex justify-end">
        <button
          type="submit"
          disabled={assignmentLoading || shipmentsLoading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold"
        >
          {assignmentLoading ? "Assigning..." : "Assign Vehicle and Driver"}
        </button>
      </div>

    </form>

    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
        Current Shipment Assignments
      </p>

      {shipmentsList.length === 0 ? (
        <p className="text-xs text-slate-500">No shipments available.</p>
      ) : (
        shipmentsList.map((shipment) => (
          <div
            key={shipment.id}
            className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {shipment.shipment_code}
            </span>

            <span className="text-slate-500">
              Vehicle: {shipment.vehicle_id || "Unassigned"}
            </span>

            <span className="text-slate-500">
              Driver: {shipment.driver_name || "Unassigned"}
            </span>
          </div>
        ))
      )}
    </div>
  </div>


  {/* Battery Reading History */}
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-4">

    <div className="flex items-center gap-2">
      <Zap className="w-4 h-4 text-amber-500" />
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
        Battery Reading History
      </h4>
    </div>

    <div className="flex flex-col sm:flex-row gap-3">

      <select
        value={historyShipmentCode}
        onChange={(e) => {
          setHistoryShipmentCode(e.target.value);
          setBatteryHistory([]);
          setHistoryError("");
        }}
        className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
      >
        <option value="">Select shipment</option>
        {shipmentsList.map((shipment) => (
          <option key={shipment.id} value={shipment.shipment_code}>
            {shipment.shipment_code}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleLoadBatteryHistory}
        disabled={historyLoading || !historyShipmentCode}
        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold"
      >
        {historyLoading ? "Loading..." : "View History"}
      </button>

    </div>

    {historyError && (
      <p className="text-xs text-rose-600">{historyError}</p>
    )}

    {!historyLoading && batteryHistory.length === 0 && !historyError && (
      <p className="text-xs text-slate-500">
        Select a shipment to view its battery readings.
      </p>
    )}

    {batteryHistory.length > 0 && (
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-xs">
          <thead className="bg-white dark:bg-slate-800 text-slate-500">
            <tr>
              <th className="p-3">Battery</th>
              <th className="p-3">Source</th>
              <th className="p-3">Note</th>
              <th className="p-3">Recorded At</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {batteryHistory.map((reading) => (
              <tr key={reading.id}>
                <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                  {reading.battery_percent}%
                </td>
                <td className="p-3 text-slate-500">{reading.source}</td>
                <td className="p-3 text-slate-500">
                  {reading.note || "—"}
                </td>
                <td className="p-3 text-slate-500">
                  {new Date(reading.recorded_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

  </div>


  {/* Detour Validation */}
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-4">

    <div className="flex items-center gap-2">
      <RefreshCw className="w-4 h-4 text-blue-500" />
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
        Depot Detour Validation
      </h4>
    </div>

    <p className="text-xs text-slate-500">
      Check whether a proposed diversion is within the configured maximum radius of {detourRadius} km.
    </p>

    <form onSubmit={handleValidateDetour} className="grid grid-cols-1 md:grid-cols-3 gap-3">

      <select
        required
        value={detourShipmentCode}
        onChange={(e) => setDetourShipmentCode(e.target.value)}
        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
      >
        <option value="">Select shipment</option>
        {shipmentsList.map((shipment) => (
          <option key={shipment.id} value={shipment.shipment_code}>
            {shipment.shipment_code}
          </option>
        ))}
      </select>

      <select
        required
        value={detourDepotId}
        onChange={(e) => setDetourDepotId(e.target.value)}
        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
      >
        <option value="">Select destination depot</option>
        {karnatakaHubs.map((hub) => (
          <option key={hub.id} value={hub.id}>
            {hub.name} ({hub.id})
          </option>
        ))}
      </select>

      <input
        required
        type="number"
        min="0"
        step="0.1"
        value={detourDistance}
        onChange={(e) => setDetourDistance(e.target.value)}
        placeholder="Detour distance (km)"
        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
      />

      <div className="md:col-span-3 flex justify-end">
        <button
          type="submit"
          disabled={detourLoading}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold"
        >
          {detourLoading ? "Validating..." : "Validate Detour"}
        </button>
      </div>

    </form>

    {detourError && (
      <p className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300">
        {detourError}
      </p>
    )}

    {detourResult && (
      <div className={`p-4 rounded-xl border ${
        detourResult.permitted
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
          : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
      }`}>
        <p className={`text-sm font-bold ${
          detourResult.permitted ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
        }`}>
          {detourResult.permitted ? "Diversion Permitted" : "Diversion Rejected"}
        </p>

        <p className="text-xs mt-2 text-slate-600 dark:text-slate-300">
          Proposed distance: {detourResult.detour_distance_km} km
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Maximum allowed: {detourResult.maximum_allowed_km} km
        </p>

        <p className="text-xs mt-2 font-medium text-slate-700 dark:text-slate-200">
          {detourResult.message}
        </p>
      </div>
    )}

  </div>

</div>

      {/* Personnel & Access Management Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.userManagement}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.userManagementSub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={t.searchUsers}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-44 sm:w-56"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">{t.filterAll}</option>
              <option value="admin">Admins</option>
              <option value="user">Operators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t.tableUser}</th>
                <th className="py-3 px-4">{t.tableRole}</th>
                <th className="py-3 px-4">{t.tableOrg}</th>
                <th className="py-3 px-4">{t.tableType}</th>
                <th className="py-3 px-4">{t.tableStatus}</th>
                <th className="py-3 px-4 text-right">{t.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
  {usersLoading ? (
    <tr>
      <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
        Loading accounts...
      </td>
    </tr>
  ) : usersError ? (
    <tr>
      <td colSpan={6} className="py-6 px-4 text-center text-rose-600">
        {usersError}
      </td>
    </tr>
  ) : filteredUsers.length === 0 ? (
    <tr>
      <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
        No accounts found.
      </td>
    </tr>
  ) : (
    filteredUsers.map((u) => {
      const isAdmin = u.accountType === "admin";
      const isSuspended = u.status === "Suspended";

      return (
        <tr
          key={u.id}
          className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
        >
          <td className="py-3 px-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                  isAdmin
                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                    : "bg-gradient-to-tr from-blue-600 to-cyan-600"
                }`}
              >
                {u.name?.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <strong className="block font-semibold text-slate-900 dark:text-slate-100">
                  {u.name}
                </strong>
                <span className="text-[11px] text-slate-400 block">
                  {u.email}
                </span>
              </div>
            </div>
          </td>

          <td className="py-3 px-4">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {isAdmin
                ? "State Fleet Director"
                : t.roles[u.role] || u.role}
            </span>
          </td>

          <td className="py-3 px-4">
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px] block">
              {u.organization || "State Cold Chain"}
            </span>
          </td>

          <td className="py-3 px-4">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isAdmin
                  ? "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  : "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {isAdmin ? t.adminBadge : t.userBadge}
            </span>
          </td>

          <td className="py-3 px-4">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isSuspended
                  ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                  : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {isSuspended ? t.statusSuspended : t.statusActive}
            </span>
          </td>

          <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleToggleStatus(u)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                  isSuspended
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100"
                }`}
              >
                {t.toggleStatus}
              </button>
            </div>
          </td>
        </tr>
      );
    })
  )}
</tbody>
          </table>
        </div>
      </div>

      {/* Cold-Chain Fleet Safety Governance Policy Thresholds */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.policyEditor}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.policyEditorSub}
            </p>
          </div>
          <button
            onClick={handleSavePolicy}
            disabled={policyLoading || policySaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.savePolicy}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Max Excursion Slider */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                {t.maxTempExcursion}
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                +{maxDrift}°C
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={maxDrift}
              onChange={(e) => setMaxDrift(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[10px] text-slate-400">
              Creates an incident when temperature drift exceeds this threshold.
            </p>
          </div>

          {/* Battery Alarm */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                {t.reeferBatteryAlarm}
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {batteryAlarm}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="5"
              value={batteryAlarm}
              onChange={(e) => setBatteryAlarm(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[10px] text-slate-400">
              Low battery alert threshold for reefer secondary generators.
            </p>
          </div>

          {/* Max Detour Radius */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                {t.maxDetourRadius}
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {detourRadius} km
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="10"
              value={detourRadius}
              onChange={(e) => setDetourRadius(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[10px] text-slate-400">
              Permitted diversion radius to cold depots along highway corridors.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
  <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
    <input
      type="checkbox"
      checked={autoSms}
      disabled={policyLoading || policySaving}
      onChange={(e) => setAutoSms(e.target.checked)}
      className="h-4 w-4 accent-purple-600"
    />
    Automatic SMS preference
  </label>
  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
    This preference is saved, but this laptop-only setup does not send SMS.
  </p>
</div>
      </div>

      {/* Incident & Emergency Center */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.incidentCenter}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active road alarms and temperature excursion cases in Karnataka.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {incidents.filter((i) => i.status === "Open").length} Pending Action
          </span>
        </div>

        <div className="space-y-2.5">
          {incidentsLoading ? (
    <p className="text-sm text-slate-500">Loading incidents...</p>
  ) : incidentsError ? (
    <p className="text-sm text-rose-600">{incidentsError}</p>
  ) : incidents.length === 0 ? (
    <p className="text-sm text-slate-500">No incidents recorded.</p>
  ) : (
          incidents.map((inc) => {
            const isResolved = inc.status === "Resolved";
            return (
              <div
                key={inc.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isResolved
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40"
                        : "bg-rose-100 text-rose-600 dark:bg-rose-950/40"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-slate-900 dark:text-slate-100">
                      {inc.title}
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Vehicle: {inc.vehicle || "Unassigned"} • Driver: {inc.driver || "Unassigned"} • {inc.time || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                    }`}
                  >
                    {inc.status}
                  </span>
                  {!isResolved && (
                    <button
                      onClick={() => handleResolveIncident(inc.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {t.resolveIncident}
                    </button>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Broadcast Alert History */}
<div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">

  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
        Broadcast Alert History
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Previously created fleet announcements stored in the database.
      </p>
    </div>

    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
      {broadcasts.length} Alerts
    </span>
  </div>

  <div className="space-y-3">
    {broadcastsLoading ? (
      <p className="text-sm text-slate-500">
        Loading broadcast history...
      </p>
    ) : broadcastsError ? (
      <p className="text-sm text-rose-600">
        {broadcastsError}
      </p>
    ) : broadcasts.length === 0 ? (
      <p className="text-sm text-slate-500">
        No broadcast alerts have been created yet.
      </p>
    ) : (
      broadcasts.map((alert) => (
        <div
          key={alert.id}
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">
                {alert.message}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
                <span>Alert ID: #{alert.id}</span>

                <span>
                  Created by User ID: {alert.created_by_user_id}
                </span>

                <span>
                  <Clock3 className="w-3 h-3 inline mr-1" />
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>

      {/* Broadcast Alert Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.broadcastAlert}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Creates a fleet announcement record. No SMS or radio message is sent.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBroadcastOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fleet Alert Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder={t.broadcastPlaceholder}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  {t.sendBroadcast}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
