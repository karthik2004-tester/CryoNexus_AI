import { useState } from "react";
import {
  ArrowRight,
  MapPin,
  Mic,
  Package,
  Sparkles,
  Thermometer,
  Truck,
  Volume2,
} from "lucide-react";
import { samplePresets } from "../data/mockData";

export default function SituationPanel({
  t,
  form,
  setForm,
  updateForm,
  changeDistrict,
  sourceDistricts,
  sourceTaluks,
  destinationTaluks,
  startVoiceInput,
  stopVoiceInput,
  isListening,
  startAnalysis,
  onShowToast,
}) {
  const [selectedPreset, setSelectedPreset] = useState("");

  const handleApplyPreset = (preset) => {
    setForm(preset.form);
    const label = t[preset.key] || preset.name;
    setSelectedPreset(preset.id);
    onShowToast(`${t.toastPresetLoaded} ${label}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Sample Presets */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {t.shipmentDetails}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.operationalSituation}
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t.karnatakaCoverage}
          </span>
        </div>

        {/* Quick Presets for Rapid Testing */}
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
            {t.quickScenarios}
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset) => {
              const label = t[preset.key] || preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    selectedPreset === preset.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30 font-semibold"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-6">
        {/* Section 1: Cargo & Vehicle Identification */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>{t.sec1Title}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.shipmentId} *
              </label>
              <input
                type="text"
                value={form.shipmentId}
                onChange={(e) => updateForm("shipmentId", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="e.g. CNX-2026-1047"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.vehicleId} *
              </label>
              <input
                type="text"
                value={form.vehicleId}
                onChange={(e) => updateForm("vehicleId", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="e.g. TRK-T17 (Driver Name)"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.product} *
              </label>
              <input
                type="text"
                value={form.product}
                onChange={(e) => updateForm("product", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="e.g. Vital Vaccines, Insulin, Dairy"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.quantity}
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => updateForm("quantity", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="e.g. 2400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Temperature, Fuel, and Machine Telemetry */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            <span>{t.sec2Title}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.requiredTemp} (°C) *
              </label>
              <input
                type="number"
                step="0.5"
                value={form.requiredTemp}
                onChange={(e) => updateForm("requiredTemp", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="-18"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.currentTemp} (°C) *
              </label>
              <input
                type="number"
                step="0.5"
                value={form.currentTemp}
                onChange={(e) => updateForm("currentTemp", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="-10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.fuel} (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.fuel}
                onChange={(e) => updateForm("fuel", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="45"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.delay} (hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.delay}
                onChange={(e) => updateForm("delay", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                placeholder="4"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t.refrigeration}
              </label>
              <select
                value={form.refrigeration}
                onChange={(e) => updateForm("refrigeration", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium cursor-pointer"
              >
                <option value="Optimal / Working">{t.working}</option>
                <option value="Partially Compromised">{t.partial}</option>
                <option value="Complete Unit Failure">{t.failed}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Karnataka Cascading Geography */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{t.sec3Title}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {t.originDetails}
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">{t.district}</label>
                  <select
                    value={form.sourceDistrict}
                    onChange={(e) => changeDistrict("source", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100"
                  >
                    {sourceDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">{t.taluk}</label>
                  <select
                    value={form.sourceTaluk}
                    onChange={(e) => updateForm("sourceTaluk", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100"
                  >
                    {sourceTaluks.map((taluk) => (
                      <option key={taluk} value={taluk}>{taluk}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">{t.location}</label>
                <input
                  type="text"
                  value={form.sourceLocation}
                  onChange={(e) => updateForm("sourceLocation", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-medium"
                  placeholder={t.enterLocation}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t.destinationDetails}
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">{t.district}</label>
                  <select
                    value={form.destinationDistrict}
                    onChange={(e) => changeDistrict("destination", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100"
                  >
                    {sourceDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">{t.taluk}</label>
                  <select
                    value={form.destinationTaluk}
                    onChange={(e) => updateForm("destinationTaluk", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100"
                  >
                    {destinationTaluks.map((taluk) => (
                      <option key={taluk} value={taluk}>{taluk}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">{t.location}</label>
                <input
                  type="text"
                  value={form.destinationLocation}
                  onChange={(e) => updateForm("destinationLocation", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-medium"
                  placeholder={t.enterLocation}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Road Situation & Voice Input */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>{t.sec4Title}</span>
            </label>

            <button
              type="button"
              onClick={() => startVoiceInput("disruption")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {isListening ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>{t.listening}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t.voice}</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows="3"
            value={form.disruption}
            onChange={(e) => updateForm("disruption", e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 leading-relaxed font-sans"
            placeholder={t.disruptionPlaceholder}
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={startAnalysis}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-blue-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.analyze}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
