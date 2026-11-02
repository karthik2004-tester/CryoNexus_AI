import {
  MessageSquare,
  Phone,
  PhoneCall,
  Radio,
  X,
} from "lucide-react";

export default function DriverCallModal({
  t,
  open,
  onClose,
  vehicleId,
  onShowToast,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.directDispatchLink}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.contactDriverTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Driver Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            R
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t.driverName}
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {t.onDuty}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.vehicleLabel} {vehicleId}
            </p>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
              {t.directPhone} +91 98450 77123
            </p>
          </div>
        </div>

        {/* Radio Link Status */}
        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>{t.radioChannel}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {t.signalStrong}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onShowToast(t.toastVoiceConnecting);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>{t.startVoiceCall}</span>
          </button>

          <button
            onClick={() => {
              onShowToast(t.toastSmsSent);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>{t.sendSMS}</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>{t.driverSafetyVerified}</span>
          <span className="text-emerald-600 font-semibold">{t.restStopScheduled}</span>
        </div>
      </div>
    </div>
  );
}
