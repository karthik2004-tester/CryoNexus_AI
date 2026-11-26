
import {
  Check,
  Clock3,
  Download,
} from "lucide-react";

export default function HistoryPanel({
  t,
  history,
  onShowToast,
}) {
  const handleExport = () => {
    if (history.length === 0) {
      onShowToast(t.toastNoRecords);
      return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(history, null, 2)
    )}`;

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `cryonexus-decisions-${Date.now()}.json`
    );

    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast(t.toastAuditExported);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock3 className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {t.history}
            </span>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.historyTitle}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Persistent recovery decision audit trail
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportAudit}</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm">
        {history.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto">
              <Clock3 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.emptyHistoryTitle}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t.emptyHistoryDesc}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {history.map((item, index) => (
              <div
                key={item.id || `${item.time}-${index}`}
                className="py-4 first:pt-0 last:pb-0 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.decision}
                    </h4>

                    <time className="text-xs text-slate-400 font-medium">
                      {item.time}
                    </time>
                  </div>

                  {item.shipmentCode && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      Shipment: {item.shipmentCode}
                    </p>
                  )}

                  {item.riskLevel && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      Risk: {item.riskLevel}
                      {item.riskScore != null
                        ? ` (${item.riskScore}%)`
                        : ""}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
