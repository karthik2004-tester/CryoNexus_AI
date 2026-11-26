import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Globe2,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Truck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { LANGUAGES } from "../data/translations";

export default function Header({
  t,
  language,
  setLanguage,
  operator,
  currentUser,
  onOpenAuth,
  onLogout,
  onNavigate,
  theme,
  toggleTheme,
  onOpenEmergency,
  mobileMenu,
  setMobileMenu,
  onShowToast,
}) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roleKeys = [
    { key: "manager", label: t.roles.manager },
    { key: "dispatcher", label: t.roles.dispatcher },
    { key: "safety", label: t.roles.safety },
    { key: "depot", label: t.roles.depot },
    { key: "auditor", label: t.roles.auditor },
  ];

  const isAdmin = currentUser?.accountType === "admin";

  // Resolve current active role label in the selected language
  const activeRoleObj = roleKeys.find((r) => r.key === operator) || roleKeys[0];
  const activeRoleLabel = isAdmin ? t.adminBadge : activeRoleObj.label;

  const userDisplayName = currentUser ? currentUser.name : activeRoleLabel;
  const userInitials = (currentUser?.name || activeRoleLabel)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 header-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all ${
              isAdmin
                ? "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20 ring-2 ring-purple-500/30"
                : "bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/20 ring-2 ring-blue-500/30"
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight font-sans brand-title">
                {t.brandName.slice(0, 4)}<span className="text-blue-500">{t.brandName.slice(4)}</span>
              </span>
              <span
                className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  isAdmin
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                {isAdmin ? "Admin v2.4" : "AI v2.4"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.brandTag}
            </p>
          </div>
        </div>

        {/* Center: System Status */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>{t.operational}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            {t.corridorsLabel}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Emergency Report Trigger */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-sm shadow-rose-600/30 transition-all duration-150 cursor-pointer"
            title={t.emergency}
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span className="hidden md:inline">{t.emergency}</span>
            <span className="md:hidden">{t.emergencyShort}</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200">
            <Globe2 className="w-4 h-4 text-blue-500 mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((item) => (
                <option key={item.code} value={item.code} className="dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={`${t.themeToggleTitle} (${theme === "light" ? t.themeNight : t.themeDay})`}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Operator Profile / Auth Dropdown */}
          <div className="relative">
            {currentUser ? (
              /* Logged In Operator Chip */
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-[10px] ${
                    isAdmin
                      ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                      : "bg-gradient-to-tr from-blue-600 to-indigo-600"
                  }`}
                >
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left max-w-[120px] truncate">
                  <div className="flex items-center gap-1">
                    <span className="block font-semibold truncate leading-none mb-0.5">
                      {userDisplayName}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-1 rounded inline-block leading-none ${
                      isAdmin
                        ? "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                        : "text-slate-400"
                    }`}
                  >
                    {isAdmin ? t.adminBadge : activeRoleLabel}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              /* Not Logged In - Quick Login/Signup Trigger */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth("login", "user")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.signIn}</span>
                </button>
                <button
                  onClick={() => onOpenAuth("signup", "user")}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <span>{t.signUp}</span>
                </button>
              </div>
            )}

            {/* Profile & Role Management Menu */}
            {showRoleDropdown && currentUser && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* User Summary */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm ${
                        isAdmin
                          ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {currentUser.name}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            isAdmin
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                          }`}
                        >
                          {isAdmin ? t.adminBadge : t.userBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                      {currentUser.organization && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5">
                          {currentUser.organization}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dashboard Shortcut */}
                <div className="px-2 pt-2">
                  {isAdmin ? (
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        if (onNavigate) onNavigate("admin_dashboard");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                      <span>{t.adminDashboard}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        if (onNavigate) onNavigate("user_dashboard");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t.userDashboard}</span>
                    </button>
                  )}
                </div>

                {/* Official Assigned Clearance Card (Locked to User's Authorized Role) */}
                <div className="px-3 py-2.5 mx-2 my-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Clearance
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {activeRoleLabel}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Clearance managed by State Fleet Administration
                  </span>
                </div>

                {/* Logout Button */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/60 px-2">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.signOut}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
