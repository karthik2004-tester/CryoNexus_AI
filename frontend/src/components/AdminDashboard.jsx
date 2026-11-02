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
  const karnatakaHubs = [
    {
      id: "hub1",
      name: "Nelamangala Central Depot (Bengaluru)",
      location: "Bengaluru Rural",
      capacity: 78,
      tempDeep: -22,
      tempChilled: 4.1,
      power: "Online (Solar + Grid)",
      genStatus: "100% Ready",
      freeBays: 6,
      status: "optimal",
    },
    {
      id: "hub2",
      name: "Mysuru Industrial Cold Hub",
      location: "Mysuru Hebbal",
      capacity: 62,
      tempDeep: -20,
      tempChilled: 3.8,
      power: "Grid Normal",
      genStatus: "Standby 100%",
      freeBays: 4,
      status: "optimal",
    },
    {
      id: "hub3",
      name: "Hubballi Junction Cold Center",
      location: "Dharwad Hubballi",
      capacity: 84,
      tempDeep: -18,
      tempChilled: 4.3,
      power: "Online (Dual Feed)",
      genStatus: "100% Ready",
      freeBays: 2,
      status: "optimal",
    },
    {
      id: "hub4",
      name: "Belagavi Western Depot",
      location: "Belagavi Industrial",
      capacity: 51,
      tempDeep: -21,
      tempChilled: 3.9,
      power: "Grid Normal",
      genStatus: "Standby 100%",
      freeBays: 5,
      status: "optimal",
    },
    {
      id: "hub5",
      name: "Kalaburagi Northern Hub",
      location: "Kalaburagi Central",
      capacity: 73,
      tempDeep: -22,
      tempChilled: 3.5,
      power: "Aux Generator Active",
      genStatus: "Operating",
      freeBays: 3,
      status: "warning",
    },
    {
      id: "hub6",
      name: "Mangaluru Coastal Cold Hub",
      location: "Mangaluru Port",
      capacity: 65,
      tempDeep: -25,
      tempChilled: 4.2,
      power: "Online (Grid)",
      genStatus: "Standby 100%",
      freeBays: 4,
      status: "optimal",
    },
  ];

  // User database state
  const initialUsers = [
    {
      id: "adm_01",
      name: "Dr. Rajeshwar Hegde",
      email: "rajeshwar.director@cryonexus.io",
      role: "admin",
      accountType: "admin",
      organization: "Karnataka State Cold-Chain Directorate",
      status: "Active",
      createdAt: "2026-01-10",
    },
    {
      id: "usr_01",
      name: "Karthik Kumar",
      email: "karthik.ops@cryonexus.io",
      role: "manager",
      accountType: "user",
      organization: "Karnataka Central Cold Depot",
      status: "Active",
      createdAt: "2026-02-14",
    },
    {
      id: "usr_02",
      name: "Dr. Priya Rao",
      email: "priya.vaccines@health.kar.gov.in",
      role: "safety",
      accountType: "user",
      organization: "State Immunization Cold-Chain Hub",
      status: "Active",
      createdAt: "2026-02-20",
    },
    {
      id: "usr_03",
      name: "Ramesh Gowda",
      email: "ramesh.fleet@cryonexus.io",
      role: "dispatcher",
      accountType: "user",
      organization: "NH-48 Fleet Dispatch Hub",
      status: "Active",
      createdAt: "2026-03-01",
    },
  ];

  const [usersList, setUsersList] = useState(() => {
    try {
      const stored = localStorage.getItem("cryo_users_db");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge avoiding duplicate emails
          const emails = new Set(parsed.map((p) => p.email.toLowerCase()));
          const extra = initialUsers.filter((u) => !emails.has(u.email.toLowerCase()));
          return [...extra, ...parsed];
        }
      }
    } catch {
      // fallback
    }
    return initialUsers;
  });

  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Save users to localStorage when modified
  const saveUsersDb = (updated) => {
    setUsersList(updated);
    try {
      localStorage.setItem("cryo_users_db", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleStatus = (userId) => {
    const updated = usersList.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsersDb(updated);
    onShowToast("User status changed.");
  };

  // Fleet Safety Governance Policy State
  const [maxDrift, setMaxDrift] = useState(2.5);
  const [batteryAlarm, setBatteryAlarm] = useState(35);
  const [detourRadius, setDetourRadius] = useState(50);
  const [autoSms, setAutoSms] = useState(true);

  const handleSavePolicy = () => {
    onShowToast(t.toastPolicySaved);
  };

  // Incidents Center State
  const [incidents, setIncidents] = useState([
    {
      id: "inc-01",
      title: t.incidentOverheat,
      vehicle: "KA-04-CR-8821",
      driver: "Ramesh Kumar",
      severity: "High",
      time: "12 mins ago",
      status: "Open",
    },
    {
      id: "inc-02",
      title: t.incidentLandslide,
      vehicle: "KA-19-CR-3109",
      driver: "Anand Poojary",
      severity: "Medium",
      time: "48 mins ago",
      status: "Open",
    },
    {
      id: "inc-03",
      title: t.incidentBattery,
      vehicle: "KA-25-CR-4412",
      driver: "Suresh Nayak",
      severity: "Low",
      time: "1h 15m ago",
      status: "Resolved",
    },
  ]);

  const handleResolveIncident = (incId) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incId ? { ...i, status: "Resolved" } : i))
    );
    onShowToast(t.toastIncidentResolved);
  };

  // Broadcast Alert Modal State
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setBroadcastOpen(false);
    setBroadcastMsg("");
    onShowToast(t.toastBroadcastSent);
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
            <span>{t.totalShipments}</span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            24 Trucks
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            100% Telematics Live
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>{t.totalDoses}</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            142,500
          </p>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            WHO Certified Corridors
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>{t.depotsOnline}</span>
            <Warehouse className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            6 / 6 Hubs
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            99.8% Uptime SLA
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>{t.criticalExcursions}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            1 Alert
          </p>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Divert Advisory Active
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
              Real-time environmental chamber & auxiliary generator status across Karnataka.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200/60">
            6 Karnataka Hubs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {karnatakaHubs.map((hub) => (
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
                    hub.status === "warning" ? "bg-amber-500 ring-4 ring-amber-500/20" : "bg-emerald-500 ring-4 ring-emerald-500/20"
                  }`}
                />
              </div>

              {/* Capacity meter */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">{t.depotCapacity}:</span>
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

              {/* Chamber temps & power */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Chamber Temp</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">
                    {hub.tempChilled}°C / {hub.tempDeep}°C
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t.depotBays}</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {hub.freeBays} Free
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Power className="w-3 h-3 text-purple-500" />
                  {hub.power}
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {hub.genStatus}
                </span>
              </div>
            </div>
          ))}
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
              {filteredUsers.map((u) => {
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
                        {isAdmin ? "State Fleet Director" : (t.roles[u.role] || u.role)}
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
                          onClick={() => handleToggleStatus(u.id)}
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
              })}
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
              Triggers auto-reroute when cargo drifts beyond threshold.
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
          {incidents.map((inc) => {
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
                      Vehicle: {inc.vehicle} • Driver: {inc.driver} • {inc.time}
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
          })}
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
                    Transmits high-priority alert to all 24 Karnataka reefer trucks.
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
                  Alert Message (VHF / SMS Broadcast)
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
