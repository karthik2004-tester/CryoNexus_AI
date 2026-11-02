import {
  AlertTriangle,
  Check,
  Mic,
  Radio,
  RefreshCw,
  Volume2,
  X,
} from "lucide-react";

export default function EmergencyModal({
  t,
  open,
  onClose,
  emergencyText,
  setEmergencyText,
  replanning,
  onSubmit,
  isListening,
  startVoiceInput,
}) {
  if (!open) return null;

  const quickIncidents = t.incidents || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {replanning ? (
          /* Replanning Animated State */
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-md">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                {t.dynamic}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t.replanTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {t.replanText}
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{t.replanStep1}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{t.replanStep2}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.replanStep3}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Input State */
          <>
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    {t.emergency}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t.emergencyTitle}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.emergencyDescription}
            </p>

            {/* Quick incident suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t.commonIncidents}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickIncidents.map((txt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEmergencyText(txt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left"
                  >
                    + {txt}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice & Textarea */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows="4"
                  value={emergencyText}
                  onChange={(e) => setEmergencyText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 leading-relaxed pr-12"
                  placeholder={t.emergencyPlaceholder}
                />

                <button
                  type="button"
                  onClick={() => startVoiceInput("emergency")}
                  className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                  }`}
                  title={t.voice}
                >
                  {isListening ? (
                    <Volume2 className="w-4 h-4 animate-bounce" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              </div>

              {isListening && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  {t.listeningEmergency}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={onSubmit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.submitEmergency}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
