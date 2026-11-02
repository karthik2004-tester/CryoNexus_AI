import {
  Check,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function AnalysisPanel({
  t,
  analysisStep,
  analyzing,
}) {
  const stagesList = t.stages || [];
  const progressPercent = Math.min(
    100,
    Math.round(((analysisStep + 1) / stagesList.length) * 100)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
          {analyzing ? (
            <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
          ) : (
            <Sparkles className="w-7 h-7 text-blue-600" />
          )}
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {t.recoveryAnalysis}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analyzing ? t.analyzing : t.pipelineComplete}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            {t.pipelineDesc}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              {t.checkpoint} {Math.min(stagesList.length, analysisStep + 1)} {t.of} {stagesList.length}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-700/60">
        {stagesList.map((stage, index) => {
          const isDone = index < analysisStep;
          const isCurrent = index === analysisStep && analyzing;
          const isPending = index > analysisStep;
          const stageTitle = stage.title;
          const stageNote = stage.note;

          return (
            <div
              key={index}
              className={`py-3.5 first:pt-0 last:pb-0 flex items-start gap-4 transition-all duration-200 ${
                isCurrent
                  ? "bg-blue-50/50 dark:bg-blue-950/20 px-3 rounded-xl"
                  : isPending
                  ? "opacity-50"
                  : ""
              }`}
            >
              {/* Icon badge */}
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Text info */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-xs sm:text-sm font-semibold ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : isDone
                        ? "text-slate-800 dark:text-slate-100"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {stageTitle}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                      {t.stageAnalyzing}
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {t.stageVerified}
                    </span>
                  )}
                </div>
                {stageNote && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stageNote}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
