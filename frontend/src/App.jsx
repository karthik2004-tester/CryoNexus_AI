import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Package,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Truck,
  Volume2,
  Warehouse,
} from "lucide-react";

import { LANGUAGES, TEXT } from "./data/translations";
import {
  districtCoordinates,
  initialForm,
  warehouses,
} from "./data/mockData";
import karnatakaLocations from "./data/karnatakaLocations";
import { calculateRecovery } from "./utils/decisionEngine";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MetricCard from "./components/MetricCard";
import Overview from "./components/Overview";
import SituationPanel from "./components/SituationPanel";
import AnalysisPanel from "./components/AnalysisPanel";
import SimulationPanel from "./components/SimulationPanel";
import HistoryPanel from "./components/HistoryPanel";
import EmergencyModal from "./components/EmergencyModal";
import DriverCallModal from "./components/DriverCallModal";
import AuthModal from "./components/AuthModal";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  // Theme state: defaults to light (warm human look), supports dark slate mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cryo_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("cryo_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Language & Role State
  const [language, setLanguage] = useState("en");
  const [operator, setOperator] = useState("manager"); // manager, dispatcher, safety, depot, auditor
  const t = TEXT[language] || TEXT.en;
  const selectedLanguage = LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("cryo_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("login");
  const [authAccountType, setAuthAccountType] = useState("user");

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role) setOperator(user.role);
    localStorage.setItem("cryo_user", JSON.stringify(user));
    if (user.accountType === "admin") {
      setActiveView("admin_dashboard");
    } else {
      setActiveView("user_dashboard");
    }
  };

  const handleSignup = (user) => {
    setCurrentUser(user);
    if (user.role) setOperator(user.role);
    localStorage.setItem("cryo_user", JSON.stringify(user));
    if (user.accountType === "admin") {
      setActiveView("admin_dashboard");
    } else {
      setActiveView("user_dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cryo_user");
    showToast(t.toastLogoutSuccess);
  };

  const openAuth = (mode = "login", accountType = "user") => {
    setAuthInitialMode(mode);
    setAuthAccountType(accountType);
    setAuthModalOpen(true);
  };

  // Sync operator role from user if user changes
  useEffect(() => {
    if (currentUser?.role) {
      setOperator(currentUser.role);
    }
  }, [currentUser]);

  // Navigation State: defaults to user_dashboard if logged in as user, admin_dashboard if admin, or overview
  const [activeView, setActiveView] = useState(() => {
    const user = currentUser;
    if (user?.accountType === "admin") return "admin_dashboard";
    return "overview";
  });
  const [mobileMenu, setMobileMenu] = useState(false);

  // Quick select shipment from User Dashboard
  const handleSelectShipment = (shipment) => {
    setForm((prev) => {
      const updated = {
        ...prev,
        shipmentId: shipment.id,
        product: shipment.product,
        cargoCategory: shipment.category || "vaccine",
        currentTemp: shipment.temp,
        requiredTemp: shipment.targetTemp,
        batterySoC: shipment.battery,
        delay: shipment.delay,
        vehicleId: shipment.vehicleId,
        driverName: shipment.driver,
        distanceKm: shipment.distanceKm,
      };
      setDecision(calculateRecovery(updated, language));
      setHasAnalysis(true);
      return updated;
    });
    setActiveView("overview");
    showToast(`Loaded payload ${shipment.id} for AI analysis.`);
  };

  // Shipment & Situation State
  const [form, setForm] = useState(initialForm);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [decision, setDecision] = useState(null);

  // Re-calculate active decision text when language changes so UI is 100% in selected language
  useEffect(() => {
    if (hasAnalysis) {
      setDecision(calculateRecovery(form, language));
    }
  }, [language]);

  // What-if Simulation State
  const [simulationTemp, setSimulationTemp] = useState(-10);
  const [simulationDelay, setSimulationDelay] = useState(4);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Emergency Modal State
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyText, setEmergencyText] = useState("");
  const [replanning, setReplanning] = useState(false);

  // Driver Call Modal State
  const [driverModalOpen, setDriverModalOpen] = useState(false);

  // Decision History
  const [decisionHistory, setDecisionHistory] = useState([]);

  // Selected Cold Hub
  const [selectedWarehouse, setSelectedWarehouse] = useState("B");
  const currentWarehouse = warehouses.find((item) => item.id === selectedWarehouse) || warehouses[0];

  // Toast Notification
  const [toast, setToast] = useState("");
  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__cryoToast);
    window.__cryoToast = window.setTimeout(() => {
      setToast("");
    }, 3500);
  };

  // Voice Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startVoiceInput = (target = "disruption") => {
    if (isListening) {
      stopVoiceInput();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast(t.toastVoiceUnsupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage.speech || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      if (target === "emergency") {
        setEmergencyText(transcript);
      } else {
        updateForm("disruption", transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast(t.toastVoiceError);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text-To-Speech (TTS)
  const speakText = (textToSpeak) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedLanguage.speech || "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      showToast(t.toastReadingAloud);
    } else {
      showToast(t.toastTtsUnsupported);
    }
  };

  // Geographic calculations
  const sourceDistricts = Object.keys(karnatakaLocations || {});
  const sourceTaluks = karnatakaLocations?.[form.sourceDistrict] || [];
  const destinationTaluks = karnatakaLocations?.[form.destinationDistrict] || [];

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const changeDistrict = (type, value) => {
    if (type === "source") {
      const taluks = karnatakaLocations?.[value] || [];
      setForm((prev) => ({
        ...prev,
        sourceDistrict: value,
        sourceTaluk: taluks[0] || "",
      }));
    } else {
      const taluks = karnatakaLocations?.[value] || [];
      setForm((prev) => ({
        ...prev,
        destinationDistrict: value,
        destinationTaluk: taluks[0] || "",
      }));
    }
  };

  // Temperature risk assessment
  const temperatureRisk = useMemo(() => {
    const current = Number(form.currentTemp);
    const required = Number(form.requiredTemp);

    if (current <= required) return "Controlled";
    if (current <= required + 6) return "Elevated";
    return "Critical";
  }, [form.currentTemp, form.requiredTemp]);

  // Leaflet map center & coordinates
  const routeCenter = useMemo(() => {
    const source =
      districtCoordinates[form.sourceDistrict] || districtCoordinates.Tumakuru;
    const destination =
      districtCoordinates[form.destinationDistrict] ||
      districtCoordinates["Bengaluru Urban"];

    return [
      (source[0] + destination[0]) / 2,
      (source[1] + destination[1]) / 2,
    ];
  }, [form.sourceDistrict, form.destinationDistrict]);

  const routeCoordinates = useMemo(() => {
    const source =
      districtCoordinates[form.sourceDistrict] || districtCoordinates.Tumakuru;
    const destination =
      districtCoordinates[form.destinationDistrict] ||
      districtCoordinates["Bengaluru Urban"];

    const mid = [
      (source[0] + destination[0]) / 2 + 0.12,
      (source[1] + destination[1]) / 2,
    ];

    return [source, mid, destination];
  }, [form.sourceDistrict, form.destinationDistrict]);

  // Step-by-step Recovery Analysis
  const startAnalysis = () => {
    if (
      !form.shipmentId ||
      !form.product ||
      !form.currentTemp ||
      !form.requiredTemp ||
      !form.sourceDistrict ||
      !form.destinationDistrict
    ) {
      showToast(t.toastRequiredFields);
      setActiveView("input");
      return;
    }

    setAnalyzing(true);
    setHasAnalysis(false);
    setDecision(null);
    setAnalysisStep(0);
    setActiveView("analysis");

    const totalStages = t.stages?.length || 9;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step < totalStages) {
        setAnalysisStep(step);
      } else {
        window.clearInterval(timer);
        window.setTimeout(() => {
          const result = calculateRecovery(form, language);
          setDecision(result);
          setHasAnalysis(true);
          setAnalyzing(false);
          setAnalysisStep(totalStages - 1);

          setDecisionHistory((prev) => [
            {
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              decision: result.title,
              reason: result.reason,
            },
            ...prev,
          ]);

          setActiveView("overview");
          showToast(t.toastPlanVerified);
        }, 400);
      }
    }, 380);
  };

  // What-If Simulation
  const runSimulation = () => {
    setSimulationRunning(true);
    setSimulationResult(null);

    window.setTimeout(() => {
      const temp = Number(simulationTemp);
      const delay = Number(simulationDelay);
      const isHighExposure = temp > Number(form.requiredTemp) + 8 || delay > 6;

      setSimulationResult({
        isHighExposure,
      });
      setSimulationRunning(false);
    }, 850);
  };

  // Dynamic Emergency Replanning
  const handleEmergency = () => {
    if (!emergencyText.trim()) {
      showToast(t.toastRequiredFields);
      return;
    }

    setReplanning(true);
    const text = emergencyText.toLowerCase();

    window.setTimeout(() => {
      const updated = {
        ...form,
        disruption: `${form.disruption} | ${emergencyText}`,
        refrigeration:
          /refriger|cooling|compressor|reefer|freeze|unit|रेफ्रिज|कूलिंग|ರೆಫ್ರಿಜ|ಕೂಲಿಂಗ್|குளிரூ|రిఫ్రిజి/.test(text)
            ? "Complete Unit Failure"
            : form.refrigeration,
        currentTemp:
          /temperature|temp|hot|warm|heat|rise|spoil|तापमान|ಗರಿಷ್ಠ|ತಾಪಮಾನ|சூடு|வெப்ப|వేడి|ఉష్ణో/.test(text)
            ? String(Number(form.currentTemp) + 4)
            : form.currentTemp,
        delay:
          /delay|traffic|blocked|road|hours|standstill|jam|देरी|जाम|ವಿಳಂಬ|ಜಾಮ್|தாமதம்|நெரிசல்|ఆలస్యం|జామ్/.test(text)
            ? String(Math.max(Number(form.delay), 7))
            : form.delay,
      };

      const result = calculateRecovery(updated, language);

      setForm(updated);
      setDecision(result);
      setHasAnalysis(true);
      setReplanning(false);
      setEmergencyOpen(false);

      setDecisionHistory((prev) => [
        {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          decision: result.title,
          reason: result.reason,
        },
        ...prev,
      ]);

      setEmergencyText("");
      setActiveView("overview");
      showToast(t.toastEmergencyVerified);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        t={t}
        language={language}
        setLanguage={setLanguage}
        operator={operator}
        currentUser={currentUser}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
        onNavigate={setActiveView}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenEmergency={() => setEmergencyOpen(true)}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        onShowToast={showToast}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          t={t}
          activeView={activeView}
          setActiveView={setActiveView}
          form={form}
          hasAnalysis={hasAnalysis}
          analyzing={analyzing}
          mobileMenu={mobileMenu}
          setMobileMenu={setMobileMenu}
          onCallDriver={() => setDriverModalOpen(true)}
          currentUser={currentUser}
          onOpenAuth={openAuth}
          onLogout={handleLogout}
        />

        {/* Content Body */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              icon={<Truck className="w-4 h-4" />}
              label={t.activeShipment}
              value={form.shipmentId}
              detail={form.product}
              accent="blue"
            />

            <MetricCard
              icon={<Thermometer className="w-4 h-4" />}
              label={t.temperature}
              value={`${form.currentTemp}°C`}
              detail={`${t.targetLabel} ${form.requiredTemp}°C`}
              accent={
                temperatureRisk === "Critical"
                  ? "rose"
                  : temperatureRisk === "Elevated"
                  ? "orange"
                  : "green"
              }
              status={
                temperatureRisk === "Critical"
                  ? t.critical
                  : temperatureRisk === "Elevated"
                  ? t.elevated
                  : t.controlled
              }
            />

            <MetricCard
              icon={<Clock3 className="w-4 h-4" />}
              label={t.currentDelay}
              value={`${form.delay} hrs`}
              detail={Number(form.delay) > 5 ? t.significantJam : t.normalTransit}
              accent="purple"
            />

            <MetricCard
              icon={<ShieldCheck className="w-4 h-4" />}
              label={t.planStatus}
              value={hasAnalysis ? t.verified : t.awaiting}
              detail={hasAnalysis ? t.actionReady : t.awaitingInput}
              accent={hasAnalysis ? "green" : "orange"}
            />
          </div>

          {/* Views */}
          {activeView === "user_dashboard" && (
            <UserDashboard
              t={t}
              language={language}
              currentUser={currentUser}
              operator={operator}
              onSelectShipment={handleSelectShipment}
              onCallDriver={() => setDriverModalOpen(true)}
              onShowToast={showToast}
              navigate={setActiveView}
            />
          )}

          {activeView === "admin_dashboard" && (
            <AdminDashboard
              t={t}
              language={language}
              currentUser={currentUser}
              onShowToast={showToast}
              navigate={setActiveView}
            />
          )}

          {activeView === "overview" && (
            <Overview
              t={t}
              language={language}
              form={form}
              decision={decision}
              selectedWarehouse={selectedWarehouse}
              setSelectedWarehouse={setSelectedWarehouse}
              currentWarehouse={currentWarehouse}
              routeCenter={routeCenter}
              routeCoordinates={routeCoordinates}
              temperatureRisk={temperatureRisk}
              navigate={setActiveView}
              hasAnalysis={hasAnalysis}
              onCallDriver={() => setDriverModalOpen(true)}
              onNotifyHub={() => {
                const hubName = currentWarehouse.names?.[language] || currentWarehouse.name;
                showToast(`${t.toastHubNotified} (${hubName})`);
              }}
              onSpeakText={speakText}
            />
          )}

          {activeView === "input" && (
            <SituationPanel
              t={t}
              form={form}
              setForm={setForm}
              updateForm={updateForm}
              changeDistrict={changeDistrict}
              sourceDistricts={sourceDistricts}
              sourceTaluks={sourceTaluks}
              destinationTaluks={destinationTaluks}
              startVoiceInput={startVoiceInput}
              stopVoiceInput={stopVoiceInput}
              isListening={isListening}
              startAnalysis={startAnalysis}
              onShowToast={showToast}
            />
          )}

          {activeView === "analysis" && (
            <AnalysisPanel
              t={t}
              analysisStep={analysisStep}
              analyzing={analyzing}
            />
          )}

          {activeView === "simulation" && (
            <SimulationPanel
              t={t}
              form={form}
              simulationTemp={simulationTemp}
              simulationDelay={simulationDelay}
              setSimulationTemp={setSimulationTemp}
              setSimulationDelay={setSimulationDelay}
              simulationRunning={simulationRunning}
              simulationResult={simulationResult}
              runSimulation={runSimulation}
            />
          )}

          {activeView === "history" && (
            <HistoryPanel
              t={t}
              history={decisionHistory}
              onClearHistory={() => {
                setDecisionHistory([]);
                showToast(t.toastAuditCleared);
              }}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        t={t}
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        initialAccountType={authAccountType}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onShowToast={showToast}
      />

      {/* Emergency Replanning Modal */}
      <EmergencyModal
        t={t}
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        emergencyText={emergencyText}
        setEmergencyText={setEmergencyText}
        replanning={replanning}
        onSubmit={handleEmergency}
        isListening={isListening}
        startVoiceInput={startVoiceInput}
      />

      {/* Direct Driver Contact Modal */}
      <DriverCallModal
        t={t}
        open={driverModalOpen}
        onClose={() => setDriverModalOpen(false)}
        vehicleId={form.vehicleId}
        onShowToast={showToast}
      />

      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700/40 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
