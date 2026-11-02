import { useState } from "react";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  UserCheck,
  X,
} from "lucide-react";

export default function AuthModal({
  t,
  open,
  onClose,
  initialMode = "login", // "login" | "signup"
  initialAccountType = "user", // "user" | "admin"
  onLogin,
  onSignup,
  onShowToast,
}) {
  const [accountType, setAccountType] = useState(initialAccountType); // "user" | "admin"
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("manager");
  const [organization, setOrganization] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");

  if (!open) return null;

  const roleOptions = [
    { key: "manager", label: t.roles.manager },
    { key: "dispatcher", label: t.roles.dispatcher },
    { key: "safety", label: t.roles.safety },
    { key: "depot", label: t.roles.depot },
    { key: "auditor", label: t.roles.auditor },
  ];

  const userDemoAccounts = [
    {
      id: "demo1",
      name: "Karthik Kumar",
      email: "karthik.ops@cryonexus.io",
      role: "manager",
      accountType: "user",
      organization: "Karnataka Central Cold Depot",
      label: t.demoUser1,
    },
    {
      id: "demo2",
      name: "Dr. Priya Rao",
      email: "priya.vaccines@health.kar.gov.in",
      role: "safety",
      accountType: "user",
      organization: "State Immunization Cold-Chain Hub",
      label: t.demoUser2,
    },
    {
      id: "demo3",
      name: "Ramesh Gowda",
      email: "ramesh.fleet@cryonexus.io",
      role: "dispatcher",
      accountType: "user",
      organization: "NH-48 Fleet Dispatch Hub",
      label: t.demoUser3,
    },
  ];

  const adminDemoAccount = {
    id: "admin_demo",
    name: "Dr. Rajeshwar Hegde",
    email: "rajeshwar.director@cryonexus.io",
    role: "admin",
    accountType: "admin",
    organization: "Karnataka State Cold-Chain Directorate",
    label: t.demoAdmin,
  };

  const handleQuickLogin = (demo) => {
    onLogin({
      id: demo.id,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      accountType: demo.accountType || (demo.role === "admin" ? "admin" : "user"),
      organization: demo.organization,
    });
    onClose();
    if (demo.accountType === "admin") {
      onShowToast(t.toastAdminLoginSuccess);
    } else {
      onShowToast(`${t.toastLoginSuccess} (${demo.name})`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      onShowToast(t.toastFillAllFields);
      return;
    }
    if (password.length < 6) {
      onShowToast(t.toastPasswordTooShort);
      return;
    }

    // If Admin mode signup or login, check passcode if provided
    if (accountType === "admin" && mode === "signup") {
      const code = adminPasscode.trim().toUpperCase();
      if (code !== "CRYO-ADMIN-2026") {
        onShowToast(t.toastAdminCodeInvalid);
        return;
      }
    }

    // Retrieve local user database
    let usersDb = [];
    try {
      const stored = localStorage.getItem("cryo_users_db");
      if (stored) usersDb = JSON.parse(stored);
    } catch {
      usersDb = [];
    }

    if (mode === "login") {
      const found = usersDb.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          (accountType === "admin" ? u.accountType === "admin" : u.accountType !== "admin")
      );

      const userToLogin = found || {
        id: (accountType === "admin" ? "adm_" : "usr_") + Date.now(),
        name: email.split("@")[0].replace(/[\._]/g, " "),
        email: email.trim(),
        role: accountType === "admin" ? "admin" : role,
        accountType: accountType,
        organization:
          organization ||
          (accountType === "admin"
            ? "Karnataka State Cold-Chain Directorate"
            : "Karnataka Cold Logistics"),
      };

      onLogin(userToLogin);
      onClose();
      if (accountType === "admin") {
        onShowToast(t.toastAdminLoginSuccess);
      } else {
        onShowToast(t.toastUserLoginSuccess);
      }
    } else {
      // Sign Up validation
      if (!name.trim()) {
        onShowToast(t.toastFillAllFields);
        return;
      }

      const newUser = {
        id: (accountType === "admin" ? "adm_" : "usr_") + Date.now(),
        name: name.trim(),
        email: email.trim(),
        role: accountType === "admin" ? "admin" : role,
        accountType: accountType,
        organization:
          organization.trim() ||
          (accountType === "admin"
            ? "Karnataka State Cold-Chain Directorate"
            : "Karnataka Cold Logistics"),
        status: "Active",
        createdAt: new Date().toISOString(),
      };

      // Save to local registry
      try {
        usersDb.push(newUser);
        localStorage.setItem("cryo_users_db", JSON.stringify(usersDb));
      } catch {
        // ignore
      }

      onSignup(newUser);
      onClose();
      if (accountType === "admin") {
        onShowToast(t.toastAdminSignupSuccess);
      } else {
        onShowToast(t.toastSignupSuccess);
      }
    }
  };

  const isAdmin = accountType === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="w-full max-w-md my-auto rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-colors ${
                isAdmin
                  ? "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20"
                  : "bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/20"
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {isAdmin
                    ? mode === "login"
                      ? "Admin Command Sign In"
                      : "Register Fleet Administrator"
                    : mode === "login"
                    ? t.loginTitle
                    : t.signupTitle}
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isAdmin
                      ? "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                      : "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {isAdmin ? t.adminBadge : t.userBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAdmin
                  ? "Full governance over Karnataka hubs, telemetry, and personnel."
                  : mode === "login"
                  ? t.loginSubtitle
                  : t.signupSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Type Switcher (Operator vs Administrator) */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Access Level
          </div>
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAccountType("user")}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                accountType === "user"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t.userTab}</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("admin")}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                accountType === "admin"
                  ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.adminTab}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t.signUp}
          </button>
        </div>

        {/* 1-Click Quick Demo Accounts (Shown on login tab) */}
        {mode === "login" && (
          <div
            className={`p-3 rounded-2xl border space-y-2 ${
              isAdmin
                ? "bg-purple-50/60 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-900/40"
                : "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-900/40"
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isAdmin ? "text-purple-700 dark:text-purple-300" : "text-blue-700 dark:text-blue-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.quickDemoLogin}
            </span>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => handleQuickLogin(adminDemoAccount)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200/60 dark:border-slate-700 hover:border-purple-500 text-left text-xs font-medium text-slate-800 dark:text-slate-200 transition-all hover:shadow-sm cursor-pointer"
              >
                <div className="truncate">
                  <strong className="block font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {adminDemoAccount.label}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                    {adminDemoAccount.organization}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0 ml-2">
                  Admin Sign In
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                {userDemoAccounts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleQuickLogin(d)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700 hover:border-blue-500 text-left text-xs font-medium text-slate-800 dark:text-slate-200 transition-all hover:shadow-sm cursor-pointer"
                  >
                    <div className="truncate">
                      <strong className="block font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {d.label}
                      </strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                        {d.organization}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0 ml-2">
                      {t.signIn}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.fullName} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder={isAdmin ? "e.g. Dr. Rajeshwar Hegde" : "e.g. Ramesh Kumar"}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t.email} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder={isAdmin ? "admin@cryonexus.io" : "operator@cryonexus.io"}
              />
            </div>
          </div>

          {mode === "signup" && !isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.selectRole}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  {roleOptions.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.organization}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder={t.organizationPlaceholder}
                  />
                </div>
              </div>
            </div>
          )}

          {mode === "signup" && isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.adminAccessCode} *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-50/50 dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder={t.adminCodePlaceholder}
                />
              </div>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">
                💡 {t.adminCodeHint}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t.password} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/50 accent-blue-600 cursor-pointer"
              />
              <span>{t.rememberMe}</span>
            </label>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer mt-1 active:scale-95 ${
              isAdmin
                ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {isAdmin
              ? mode === "login"
                ? "Sign In as Administrator"
                : "Register Fleet Administrator"
              : mode === "login"
              ? t.signIn
              : t.signUp}
          </button>
        </form>

        {/* Switch mode footer */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
          {mode === "login" ? (
            <p>
              {t.dontHaveAccount}{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`font-bold hover:underline cursor-pointer ml-1 ${
                  isAdmin ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {t.signUp}
              </button>
            </p>
          ) : (
            <p>
              {t.alreadyHaveAccount}{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`font-bold hover:underline cursor-pointer ml-1 ${
                  isAdmin ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {t.signIn}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
