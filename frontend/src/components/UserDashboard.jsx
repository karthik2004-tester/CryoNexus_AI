import { useState } from "react";
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

export default function UserDashboard({
  t,
  language,
  currentUser,
  operator,
  onSelectShipment,
  onCallDriver,
  onShowToast,
  navigate,
}) {
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Pre-configured active shipments monitored in Karnataka
  const assignedShipments = [
    {
      id: "COVAXIN-BLR-09",
      product: "Covaxin (BBV152)",
      category: "vaccine",
      source: "Bengaluru (Nelamangala)",
      destination: "Mysuru Hub",
      temp: 4.2,
      targetTemp: 4.0,
      minTemp: 2.0,
      maxTemp: 8.0,
      battery: 88,
      driver: "Ramesh Kumar",
      phone: "+91 98450 12345",
      vehicleId: "KA-04-CR-8821",
      delay: 0,
      distanceKm: 42,
      eta: "45 mins",
      status: "optimal",
      priority: "Normal",
    },
    {
      id: "INSULIN-HUB-14",
      product: "Human Insulin (rDNA)",
      category: "biologics",
      source: "Hubballi Junction",
      destination: "Belagavi Depot",
      temp: 5.8,
      targetTemp: 4.0,
      minTemp: 2.0,
      maxTemp: 8.0,
      battery: 62,
      driver: "Suresh Nayak",
      phone: "+91 98451 67890",
      vehicleId: "KA-25-CR-4412",
      delay: 1.5,
      distanceKm: 68,
      eta: "1h 10m",
      status: "warning",
      priority: "Attention",
    },
    {
      id: "POLIO-KLB-02",
      product: "bOPV Polio Vaccine",
      category: "vaccine",
      source: "Kalaburagi Hub",
      destination: "Raichur Sub-Depot",
      temp: 3.1,
      targetTemp: 4.0,
      minTemp: 2.0,
      maxTemp: 8.0,
      battery: 94,
      driver: "Manjunath K.",
      phone: "+91 98452 34567",
      vehicleId: "KA-32-CR-9011",
      delay: 0,
      distanceKm: 110,
      eta: "2h 20m",
      status: "optimal",
      priority: "Normal",
    },
    {
      id: "RABIES-MNG-07",
      product: "Rabies Immunoglobulin",
      category: "biologics",
      source: "Mangaluru Coastal Hub",
      destination: "Hassan Depot",
      temp: -18.5,
      targetTemp: -20.0,
      minTemp: -25.0,
      maxTemp: -15.0,
      battery: 71,
      driver: "Anand Poojary",
      phone: "+91 98453 98765",
      vehicleId: "KA-19-CR-3109",
      delay: 0.5,
      distanceKm: 135,
      eta: "3h 05m",
      status: "optimal",
      priority: "Sub-Zero",
    },
  ];

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
            <span>{t.dosesMonitored}</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            28,400
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            +3,200 today
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>{t.complianceRate}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            99.6%
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            WHO Grade A Safe
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>{t.avgResponseTime}</span>
            <Clock3 className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            1.8 min
          </p>
          <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
            Target &lt; 5 mins
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>{t.activeCorridorsCount}</span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            4 Reefer Corridors
          </p>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
            Karnataka NH-48 / 75
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
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs ${
                        isWarning
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>{s.temp}°C</span>
                    </div>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Target: {s.targetTemp}°C
                    </span>
                  </div>
                </div>

                {/* Route corridor */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="truncate">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Route Corridor
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {s.source} ➔ {s.destination}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      ETA
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {s.eta}
                    </span>
                  </div>
                </div>

                {/* Sub metrics & Driver */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-4 h-4 text-emerald-500" />
                    <span>Battery: <strong>{s.battery}%</strong></span>
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
