import { useEffect } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  HeartHandshake,
  MapPin,
  Package,
  PhoneCall,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Volume2,
  Warehouse,
} from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { warehouses } from "../data/mockData";

function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 8);
    }
  }, [center, map]);
  return null;
}

export default function Overview({
  t,
  language,
  form,
  decision,
  selectedWarehouse,
  setSelectedWarehouse,
  currentWarehouse,
  routeCenter,
  routeCoordinates,
  temperatureRisk,
  navigate,
  hasAnalysis,
  onCallDriver,
  onNotifyHub,
  onSpeakText,
}) {
  if (!hasAnalysis) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-blue-500/10 via-slate-50 to-indigo-50/20 dark:from-blue-950/30 dark:via-slate-900/60 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-900/40 p-8 sm:p-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="max-w-xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {t.ready}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t.title}
            <span className="text-blue-600 dark:text-blue-400">{t.titleAccent}</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.description}
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate("input")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/30 active:scale-95 transition-all cursor-pointer text-sm"
          >
            <Package className="w-4 h-4" />
            <span>{t.enterSituation}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const options = [
    {
      key: "continue",
      icon: Route,
      title: t.continueRoute,
      detail: t.continueRouteDetail,
    },
    {
      key: "reroute",
      icon: RefreshCw,
      title: t.reroute,
      detail: t.rerouteDetail,
    },
    {
      key: "transfer",
      icon: Truck,
      title: t.transfer,
      detail: t.transferDetail,
    },
    {
      key: "coldStorage",
      icon: Warehouse,
      title: t.coldStorage,
      detail: t.coldStorageDetail,
    },
  ];

  const handleSpeak = () => {
    if (onSpeakText && decision) {
      const speech = `${decision.title}. ${decision.reason} ${t.driverActionPlan}: ${decision.driverInstruction || ""}`;
      onSpeakText(speech);
    }
  };

  const localizedRiskLabel =
    temperatureRisk === "Critical"
      ? t.critical
      : temperatureRisk === "Elevated"
      ? t.elevated
      : t.controlled;

  return (
    <div className="space-y-6">
      {/* Upper Grid: Recommended Recovery & Human Driver Care */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Recovery Decision (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {t.recovery}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.currentStrategy}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title={t.speakPlan}
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.speakPlan}</span>
              </button>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
                {t.verified}
              </span>
            </div>
          </div>

          {/* Main Strategy Headline */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
              <Route className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                {decision?.urgency || t.actionRequired}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                {decision?.title || t.noPlan}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {t.routeCorridor} <strong className="font-semibold text-slate-800 dark:text-slate-100">{form.sourceDistrict} ({form.sourceTaluk})</strong> → <strong className="font-semibold text-slate-800 dark:text-slate-100">{form.destinationDistrict} ({form.destinationTaluk})</strong>
              </p>
            </div>
          </div>

          {/* Justification & Why this plan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t.why}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {decision?.reason || t.noPlanText}
            </p>
          </div>

          {/* Metric Reasons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.temperatureStatus}</span>
              <span className={`text-xs font-bold ${temperatureRisk === "Critical" ? "text-rose-600" : temperatureRisk === "Elevated" ? "text-amber-600" : "text-emerald-600"}`}>
                {localizedRiskLabel}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.capacity}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {currentWarehouse ? `${currentWarehouse.capacity}% ${t.free}` : `82% ${t.free}`}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.routeFeasible}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t.yesVerified}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.delayImpact}</span>
              <span className={`text-xs font-bold ${Number(form.delay) > 5 ? "text-amber-600" : "text-slate-800 dark:text-slate-200"}`}>
                {Number(form.delay) > 5 ? t.significant : t.tolerable}
              </span>
            </div>
          </div>
        </div>

        {/* Human Driver & Cargo Care Card (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.driverCare}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {t.driverSupportActive}
              </span>
            </div>

            {/* Driver Instructions */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Truck className="w-4 h-4" />
                <span>{t.driverActionPlan} ({form.vehicleId}):</span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                {decision?.driverInstruction || t.continueRouteDetail}
              </p>
            </div>

            {/* Receiving Hub Preparation */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Warehouse className="w-4 h-4 text-blue-500" />
                <span>{t.receivingHubTask}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {decision?.hubInstruction || `${t.receivingHubTask} Ready`}
              </p>
            </div>

            {/* Quick Contact Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={onCallDriver}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t.callDriver}</span>
              </button>

              <button
                onClick={onNotifyHub}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>{t.notifyHub}</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{t.preservedFreshness}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {decision?.preservationScore || 94}% {t.estimated}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Interactive Leaflet Map & Operational State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.map}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                {t.corridorsSub}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {t.liveOSM}
              </span>
            </div>
          </div>

          {/* Leaflet Container */}
          <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 z-0">
            <MapContainer
              center={routeCenter}
              zoom={8}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <MapCenter center={routeCenter} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route Polyline */}
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: "#2563eb",
                  weight: 5,
                  opacity: 0.85,
                  dashArray: "8, 4",
                }}
              />

              {/* Origin Marker */}
              <CircleMarker
                center={routeCoordinates[0]}
                radius={9}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.9,
                  weight: 3,
                }}
              >
                <Popup>
                  <div className="text-xs font-sans space-y-1">
                    <strong className="text-blue-600 font-bold block">{t.originPoint}</strong>
                    <span>{form.sourceDistrict} ({form.sourceTaluk})</span>
                    <p className="text-slate-500">{form.sourceLocation}</p>
                  </div>
                </Popup>
              </CircleMarker>

              {/* Destination Marker */}
              <CircleMarker
                center={routeCoordinates[routeCoordinates.length - 1]}
                radius={9}
                pathOptions={{
                  color: "#059669",
                  fillColor: "#10b981",
                  fillOpacity: 0.9,
                  weight: 3,
                }}
              >
                <Popup>
                  <div className="text-xs font-sans space-y-1">
                    <strong className="text-emerald-600 font-bold block">{t.destinationDepot}</strong>
                    <span>{form.destinationDistrict} ({form.destinationTaluk})</span>
                    <p className="text-slate-500">{form.destinationLocation}</p>
                  </div>
                </Popup>
              </CircleMarker>

              {/* Cold Hub Markers */}
              {warehouses.map((hub) => {
                const hubName = hub.names?.[language] || hub.name;
                return (
                  <CircleMarker
                    key={hub.id}
                    center={hub.position}
                    radius={7}
                    pathOptions={{
                      color: selectedWarehouse === hub.id ? "#d97706" : "#64748b",
                      fillColor: selectedWarehouse === hub.id ? "#f59e0b" : "#94a3b8",
                      fillOpacity: 0.85,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedWarehouse(hub.id),
                    }}
                  >
                    <Popup>
                      <div className="text-xs font-sans space-y-1">
                        <strong className="text-amber-600 font-bold block">{hubName}</strong>
                        <p>{t.capacity}: {hub.capacity}% {t.free}</p>
                        <p>{hub.docksAvailable} {t.docksReady}</p>
                        <p className="text-[10px] text-slate-500">{t.contact} {hub.manager} ({hub.phone})</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Floating Quick Route Card */}
            <div className="absolute bottom-3 left-3 z-[1000] p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-800 dark:text-slate-100 font-bold">
                  {form.sourceDistrict} → {form.destinationDistrict}
                </strong>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {t.currentDelay}: {form.delay} hrs | {t.fuel}: {form.fuel}%
                </span>
              </div>
            </div>
          </div>

          {/* Warehouse Selection Bar */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t.regionalHubs}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {warehouses.map((hub) => {
                const hubName = hub.names?.[language] || hub.name;
                const hubCity = hub.cities?.[language] || hub.city;
                return (
                  <button
                    key={hub.id}
                    onClick={() => setSelectedWarehouse(hub.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                      selectedWarehouse === hub.id
                        ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 font-semibold"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{hubCity}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{hub.capacity}% {t.free}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{hubName}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operational State & Temperature Gauge (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.operationalState}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">{t.liveTelemetry}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">{t.vehicleId}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{form.vehicleId}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">{t.product}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{form.product}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">{t.temperature}:</span>
                <span className={`font-bold ${temperatureRisk === "Critical" ? "text-rose-600" : temperatureRisk === "Elevated" ? "text-amber-600" : "text-emerald-600"}`}>
                  {form.currentTemp}°C ({t.targetLabel} {form.requiredTemp}°C)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">{t.currentDelay}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{form.delay} hrs</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">{t.fuel}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{form.fuel}%</span>
              </div>
            </div>

            {/* Human Temperature Visualizer */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{t.temperatureStatus}</span>
                <span className={`font-bold ${temperatureRisk === "Critical" ? "text-rose-600" : temperatureRisk === "Elevated" ? "text-amber-600" : "text-emerald-600"}`}>
                  {localizedRiskLabel}
                </span>
              </div>

              {/* Visual Bar */}
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    temperatureRisk === "Critical"
                      ? "bg-rose-500"
                      : temperatureRisk === "Elevated"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(15, ((Number(form.currentTemp) + 30) / 35) * 100)
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{t.deepFreeze}</span>
                <span className="font-bold text-blue-500">{form.requiredTemp}°C {t.targetLabel}</span>
                <span>{t.chilled}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("simulation")}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <span>{t.openScenarioTester}</span>
          </button>
        </div>
      </div>

      {/* Evaluated Alternatives Grid */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.alternatives}
            </h3>
          </div>
          <span className="text-xs text-slate-400">{t.verifiedByEngine}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = decision?.key === opt.key;
            return (
              <div
                key={opt.key}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500"
                    : "bg-slate-50/40 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/70 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                      {t.selectedBadge}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {opt.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {opt.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
