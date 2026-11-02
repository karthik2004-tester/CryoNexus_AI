import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gauge,
  Play,
  RefreshCw,
  Sliders,
  Thermometer,
} from "lucide-react";

export default function SimulationPanel({
  t,
  form,
  simulationTemp,
  simulationDelay,
  setSimulationTemp,
  setSimulationDelay,
  simulationRunning,
  simulationResult,
  runSimulation,
}) {
  const isHighExposure =
    simulationTemp > Number(form.requiredTemp) + 8 || simulationDelay > 6;
  const calculatedRiskScore = isHighExposure ? 78 : 36;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {t.simulation}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.scenario}
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {t.simulationHeroDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Interactive Controls */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>{t.stressParams}</span>
            </h3>
            <span className="text-xs text-slate-400">{t.dragToAdjust}</span>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                {t.currentTemp}
              </span>
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                {simulationTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="5"
              value={simulationTemp}
              onChange={(e) => setSimulationTemp(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{t.safeDeepFreeze}</span>
              <span>{t.targetLabel} {form.requiredTemp}°C</span>
              <span>{t.warmSpoilage}</span>
            </div>
          </div>

          {/* Delay Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-purple-500" />
                {t.delay}
              </span>
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                {simulationDelay} hrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={simulationDelay}
              onChange={(e) => setSimulationDelay(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{t.onTime}</span>
              <span>{t.delayWarning}</span>
              <span>{t.delayCritical}</span>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={runSimulation}
            disabled={simulationRunning}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {simulationRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.running}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{t.runScenario}</span>
              </>
            )}
          </button>

          {/* Dynamic Result Box */}
          {simulationResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                simulationResult.isHighExposure
                  ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200"
                  : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200"
              }`}
            >
              {simulationResult.isHighExposure ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <strong className="text-xs sm:text-sm font-bold block">
                  {simulationResult.isHighExposure ? t.simHighExposureTitle : t.simLowerExposureTitle}
                </strong>
                <p className="text-xs leading-relaxed opacity-90">
                  {simulationResult.isHighExposure ? t.simHighExposureMsg : t.simLowerExposureMsg}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Operational Risk Evaluation */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                <span>{t.operationalRisk}</span>
              </h3>
              <span className="text-xs text-slate-400">{t.hypoStatus}</span>
            </div>

            {/* Circular Risk Score Display */}
            <div className="my-6 text-center space-y-2">
              <div
                className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 shadow-inner ${
                  isHighExposure
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                    : "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span className="text-3xl font-extrabold tracking-tight">
                  {calculatedRiskScore}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {isHighExposure ? t.highRisk : t.controlled}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.riskProbabilityDesc}
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  {t.temperatureStatus}
                </span>
                <strong
                  className={`text-xs font-bold ${
                    simulationTemp <= Number(form.requiredTemp)
                      ? "text-emerald-600"
                      : simulationTemp <= Number(form.requiredTemp) + 6
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {simulationTemp <= Number(form.requiredTemp)
                    ? t.controlled
                    : simulationTemp <= Number(form.requiredTemp) + 6
                    ? t.elevated
                    : t.critical}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  {t.delayImpact}
                </span>
                <strong
                  className={`text-xs font-bold ${
                    simulationDelay <= 3
                      ? "text-emerald-600"
                      : simulationDelay <= 5
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {simulationDelay <= 3
                    ? t.lowImpact
                    : simulationDelay <= 5
                    ? t.moderateImpact
                    : t.severeDelay}
                </strong>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300">
            <strong>{t.humanGuidanceNote}</strong> {t.humanGuidanceText}
          </div>
        </div>
      </div>
    </div>
  );
}
