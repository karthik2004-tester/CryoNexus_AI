import {
  Activity,
  BarChart3,
  Clock3,
  HeartHandshake,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  UserCheck,
} from "lucide-react";

export default function Sidebar({
  t,
  activeView,
  setActiveView,
  form,
  hasAnalysis,
  analyzing,
  mobileMenu,
  setMobileMenu,
  onCallDriver,
  currentUser,
  onOpenAuth,
  onLogout,
}) {
  const isAdmin = currentUser?.accountType === "admin";

  const navItems = [
    isAdmin
      ? {
          id: "admin_dashboard",
          label: t.adminDashboard,
          icon: ShieldCheck,
          badge: t.adminBadge,
          badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        }
      : {
          id: "user_dashboard",
          label: t.userDashboard,
          icon: LayoutDashboard,
          badge: t.userBadge,
          badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        },
    {
      id: "overview",
      label: t.recoveryOverview,
      icon: Activity,
      badge: hasAnalysis ? t.readyBadge : null,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "input",
      label: t.liveSituation,
      icon: Package,
    },
    {
      id: "analysis",
      label: t.recoveryAnalysis,
      icon: Sparkles,
      live: analyzing,
    },
    {
      id: "simulation",
      label: t.simulation,
      icon: BarChart3,
    },
    {
      id: "history",
      label: t.history,
      icon: Clock3,
    },
  ];

  const handleSelect = (id) => {
    setActiveView(id);
    setMobileMenu(false);
  };

  return (
    <aside
      className={`sidebar-nav ${
        mobileMenu ? "block fixed inset-y-18 left-0 z-50 w-72 shadow-2xl" : "hidden md:block"
      } w-64 shrink-0 transition-all duration-200`}
    >
      <div className="h-full flex flex-col justify-between py-6 px-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 rounded-2xl md:rounded-none overflow-y-auto">
        {/* Navigation list */}
        <div className="space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.controlCenter}
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? "text-white"
                            : item.live
                            ? "text-blue-500 animate-spin"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.live && (
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    )}
                    {item.badge && !isActive && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Shipment Human Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t.activeShipment}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasAnalysis ? "bg-emerald-500 ring-4 ring-emerald-500/20" : "bg-amber-500 ring-4 ring-amber-500/20"
                }`}
              />
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {form.shipmentId}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {form.vehicleId}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.planStatus}:</span>
              <span
                className={`font-semibold ${
                  hasAnalysis ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {hasAnalysis ? t.verified : t.awaiting}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Driver Care & Helpline + Mobile Auth */}
        <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          {/* Mobile Auth Box (Only shown on small screens when mobileMenu is open) */}
          <div className="md:hidden pt-1">
            {currentUser ? (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                      currentUser.accountType === "admin"
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {currentUser.name}
                      </p>
                      <span
                        className={`text-[9px] font-extrabold px-1 rounded ${
                          currentUser.accountType === "admin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                        }`}
                      >
                        {currentUser.accountType === "admin" ? t.adminBadge : t.userBadge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.signOut}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    onOpenAuth("login", "user");
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.signIn}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    onOpenAuth("signup", "user");
                  }}
                  className="flex items-center justify-center py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <span>{t.signUp}</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onCallDriver}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.callDriver}</span>
          </button>

          <div className="px-2 py-1 text-center text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-500 inline" />
            <span>{t.driverCareFooter}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
