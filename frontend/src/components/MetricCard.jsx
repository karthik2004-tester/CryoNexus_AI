export default function MetricCard({
  icon,
  label,
  value,
  detail,
  accent = "blue",
  status,
}) {
  const accentColors = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/40",
    orange: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/40",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/40",
    green: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/40",
    rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/40",
  };

  const statusBadges = {
    Controlled: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Elevated: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse",
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${accentColors[accent] || accentColors.blue}`}>
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </span>
          {status && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                statusBadges[status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {status}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {detail}
        </p>
      </div>
    </div>
  );
}
