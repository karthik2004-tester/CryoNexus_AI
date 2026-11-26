
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  createShipment,
  analyzeShipmentRecovery,
  createHubPreAlert,
  approveRecoveryPlan,
  getRecoveryApproval,
  createDecisionHistory,
  getDecisionHistory,
} from "./api";

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
  // Theme state
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

  // Language and role state
  const [language, setLanguage] = useState("en");
  const [operator, setOperator] = useState("manager");

  const t = TEXT[language] || TEXT.en;

  const selectedLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  // User authentication state
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

  // Navigation state
  const [activeView, setActiveView] = useState(() => {
    const user = (() => {
      try {
        const saved = localStorage.getItem("cryo_user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

    if (user?.accountType === "admin") return "admin_dashboard";
    if (user) return "user_dashboard";
    return "overview";
  });

  const [mobileMenu, setMobileMenu] = useState(false);

  // Toast notification
  const [toast, setToast] = useState("");

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.__cryoToast);

    window.__cryoToast = window.setTimeout(() => {
      setToast("");
    }, 3500);
  }, []);

  // Login and signup
  const handleLogin = (user) => {
    setCurrentUser(user);

    if (user.role) {
      setOperator(user.role);
    }

    localStorage.setItem("cryo_user", JSON.stringify(user));

    if (user.accountType === "admin") {
      setActiveView("admin_dashboard");
    } else {
      setActiveView("user_dashboard");
    }
  };

  const handleSignup = (user) => {
    setCurrentUser(user);

    if (user.role) {
      setOperator(user.role);
    }

    localStorage.setItem("cryo_user", JSON.stringify(user));

    if (user.accountType === "admin") {
      setActiveView("admin_dashboard");
    } else {
      setActiveView("user_dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView("overview");
    localStorage.removeItem("cryo_user");
    showToast(t.toastLogoutSuccess);
  };

  const openAuth = (mode = "login", accountType = "user") => {
    setAuthInitialMode(mode);
    setAuthAccountType(accountType);
    setAuthModalOpen(true);
  };

  // Sync operator role from user
  useEffect(() => {
    if (currentUser?.role) {
      setOperator(currentUser.role);
    }
  }, [currentUser]);

  // Shipment and situation state
  const [form, setForm] = useState(initialForm);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [decision, setDecision] = useState(null);

  // What-if simulation state
  const [simulationTemp, setSimulationTemp] = useState(0);
  const [simulationDelay, setSimulationDelay] = useState(4);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Recovery approval state
  const [recoveryApproval, setRecoveryApproval] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Emergency modal state
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyText, setEmergencyText] = useState("");
  const [replanning, setReplanning] = useState(false);

  // Driver call modal state
  const [driverModalOpen, setDriverModalOpen] = useState(false);

  // Decision history state
  const [decisionHistory, setDecisionHistory] = useState([]);

  // Save decision to backend history
  const saveDecisionRecord = async (
    shipmentCode,
    result,
    source = "local"
  ) => {
    try {
      if (!shipmentCode || !result) return;

      const savedRecord = await createDecisionHistory(shipmentCode, {
        decision: result.title,
        reason: result.reason,
        source,
        risk_level: result.riskLevel ?? result.risk_level ?? null,
        risk_score: result.riskScore ?? result.risk_score ?? null,
      });

      setDecisionHistory((prev) => [
        {
          id: savedRecord.id,
          shipmentCode: savedRecord.shipment_code,
          decision: savedRecord.decision,
          reason: savedRecord.reason,
          source: savedRecord.source,
          riskLevel: savedRecord.risk_level,
          riskScore: savedRecord.risk_score,
          userId: savedRecord.user_id,
          time: new Date(savedRecord.created_at).toLocaleString(),
          createdAt: savedRecord.created_at,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Decision history save failed:", error);
      showToast("Decision generated, but history could not be saved.");
    }
  };

  // Load decision history for the logged-in user
  useEffect(() => {
    if (!currentUser) {
      setDecisionHistory([]);
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      try {
        const records = await getDecisionHistory();

        if (!cancelled) {
          setDecisionHistory(records);
        }
      } catch (error) {
        console.error("Failed to load decision history:", error);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.accountType]);

  // Load recovery approval when shipment changes
  useEffect(() => {
    let cancelled = false;

    const loadApproval = async () => {
      const shipmentCode = String(form.shipmentId || "").trim();

      setRecoveryApproval(null);

      if (!shipmentCode) return;

      try {
        const approval = await getRecoveryApproval(shipmentCode);

        if (!cancelled) {
          setRecoveryApproval(approval);
        }
      } catch (error) {
        console.error("Could not load recovery approval:", error);
      }
    };

    loadApproval();

    return () => {
      cancelled = true;
    };
  }, [form.shipmentId]);

  // Recalculate localized decision text without losing backend results
  useEffect(() => {
    if (hasAnalysis) {
      setDecision((previous) => {
        const localDecision = calculateRecovery(form, language);

        if (previous?.riskScore === undefined) {
          return localDecision;
        }

        return {
          ...localDecision,
          title: previous.title,
          reason: previous.reason,
          riskScore: previous.riskScore,
          riskLevel: previous.riskLevel,
          recommendedAction: previous.recommendedAction,
          alternativeActions: previous.alternativeActions,
          temperatureStatus: previous.temperatureStatus,
          batteryStatus: previous.batteryStatus,
          estimatedTotalDelayHours: previous.estimatedTotalDelayHours,
          analysisStatus: previous.analysisStatus,
        };
      });
    }
  }, [language]);

  // Selected cold hub
  const [selectedWarehouse, setSelectedWarehouse] = useState("B");

  const currentWarehouse =
    warehouses.find((item) => item.id === selectedWarehouse) || warehouses[0];

  // Quick select shipment from User Dashboard
  const handleSelectShipment = (shipment) => {
    console.log("Selected shipment:", shipment);

    const updated = {
      ...form,
      shipmentId: shipment.id,
      product: shipment.product,
      cargoCategory: shipment.category || form.cargoCategory,
      currentTemp: shipment.temp ?? "",
      requiredTemp: shipment.targetTemp ?? "",
      fuel: shipment.fuel ?? "",
      delay: shipment.delay ?? "",
      refrigeration: shipment.refrigeration || "",
      vehicleId: shipment.vehicleId || form.vehicleId,
      driverName: shipment.driver || form.driverName,
      distanceKm: shipment.distanceKm ?? null,
    };

    const result = calculateRecovery(updated, language);

    setForm(updated);

    setSimulationTemp(
      shipment.temp !== null && shipment.temp !== undefined
        ? Number(shipment.temp)
        : 0
    );

    setSimulationResult(null);
    setDecision(result);
    setHasAnalysis(true);

    saveDecisionRecord(shipment.id, result, "local");

    setActiveView("overview");
    showToast(`Loaded shipment ${shipment.id} for recovery analysis.`);
  };

  // Sync shipment data with the top metric strip
  const handleShipmentDataLoaded = (shipment) => {
    console.log("APP CALLBACK FUNCTION EXECUTED", shipment);

    setForm((prev) => ({
      ...prev,
      shipmentId: shipment.id,
      product: shipment.product,
      cargoCategory: shipment.category || prev.cargoCategory,
      currentTemp: shipment.temp ?? "",
      requiredTemp: shipment.targetTemp ?? "",
      fuel: shipment.fuel ?? prev.fuel,
      delay: shipment.delay ?? "",
      refrigeration: shipment.refrigeration || prev.refrigeration,
      vehicleId: shipment.vehicleId || prev.vehicleId,
      driverName: shipment.driver || prev.driverName,
    }));

    setSimulationTemp(
      shipment.temp !== null && shipment.temp !== undefined
        ? Number(shipment.temp)
        : 0
    );

    setSimulationResult(null);
  };

  // Load latest form changes
  const updateForm = (key, value) => {
    console.log("FORM FIELD UPDATED:", key, "=", value);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Voice speech recognition
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

  // Text-to-speech
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
  const destinationTaluks =
    karnatakaLocations?.[form.destinationDistrict] || [];

  const changeDistrict = (type, value) => {
    const taluks = karnatakaLocations?.[value] || [];

    if (type === "source") {
      setForm((prev) => ({
        ...prev,
        sourceDistrict: value,
        sourceTaluk: taluks[0] || "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        destinationDistrict: value,
        destinationTaluk: taluks[0] || "",
      }));
    }
  };

  // Save shipment to backend
  const handleSaveShipment = async () => {
    const shipmentCode = String(form.shipmentId ?? "").trim();
    const product = String(form.product ?? "").trim();

    const currentTempText = String(form.currentTemp ?? "").trim();
    const requiredTempText = String(form.requiredTemp ?? "").trim();

    const currentTemp =
      currentTempText === "" ? Number.NaN : Number(currentTempText);

    const requiredTemp =
      requiredTempText === "" ? Number.NaN : Number(requiredTempText);

    const parseOptionalNumber = (value) => {
      const text = String(value ?? "").trim();

      if (!text || text === "—") return null;

      const number = Number(text);
      return Number.isFinite(number) ? number : Number.NaN;
    };

    const quantityKg = parseOptionalNumber(form.quantity);
    const fuelLevelPercent = parseOptionalNumber(form.fuel);
    const estimatedDelayHours = parseOptionalNumber(form.delay);

    if (
      !shipmentCode ||
      !product ||
      !Number.isFinite(currentTemp) ||
      !Number.isFinite(requiredTemp)
    ) {
      showToast("Enter a shipment ID, product, and valid temperatures.");
      return;
    }

    if (
      Number.isNaN(quantityKg) ||
      Number.isNaN(fuelLevelPercent) ||
      Number.isNaN(estimatedDelayHours) ||
      (quantityKg !== null && quantityKg <= 0) ||
      (fuelLevelPercent !== null &&
        (fuelLevelPercent < 0 || fuelLevelPercent > 100)) ||
      (estimatedDelayHours !== null && estimatedDelayHours < 0)
    ) {
      showToast("Check quantity, fuel level, and delay values.");
      return;
    }

    const rawVehicle = form.vehicleId?.trim() || "";
    const driverMatch = rawVehicle.match(/\(Driver:\s*([^)]+)\)/i);

    const vehicleId = rawVehicle
      .replace(/\s*\(Driver:\s*[^)]+\)/i, "")
      .trim();

    try {
      const savedShipment = await createShipment({
        shipment_code: shipmentCode,
        product,
        current_temp_c: currentTemp,
        required_temp_c: requiredTemp,
        status: "active",
        vehicle_id: vehicleId || null,
        driver_name: driverMatch?.[1]?.trim() || null,
        product_category: form.productCategory || null,
        quantity_kg: quantityKg,
        fuel_level_percent: fuelLevelPercent,
        estimated_delay_hours: estimatedDelayHours,
        refrigeration_status: form.refrigeration || null,
        origin_district: form.sourceDistrict || null,
        origin_taluk: form.sourceTaluk || null,
        origin_location: form.sourceLocation || null,
        destination_district: form.destinationDistrict || null,
        destination_taluk: form.destinationTaluk || null,
        destination_location: form.destinationLocation || null,
        disruption_description: form.disruption?.trim() || null,
      });

      showToast(`Shipment ${savedShipment.shipment_code} saved.`);
      setActiveView("user_dashboard");
    } catch (error) {
      if (error.response?.status === 401) {
        showToast("Please sign in again before saving a shipment.");
      } else if (error.response?.status === 409) {
        showToast("That shipment ID already exists. Enter a different ID.");
      } else {
        showToast(
          "Could not save shipment. Check that the backend is running."
        );
      }
    }
  };

  // Temperature risk assessment
  const temperatureRisk = useMemo(() => {
    if (
      form.currentTemp === "" ||
      form.currentTemp == null ||
      form.requiredTemp === "" ||
      form.requiredTemp == null
    ) {
      return "Unknown";
    }

    const current = Number(form.currentTemp);
    const required = Number(form.requiredTemp);

    if (!Number.isFinite(current) || !Number.isFinite(required)) {
      return "Unknown";
    }

    if (current <= required) return "Controlled";
    if (current <= required + 6) return "Elevated";

    return "Critical";
  }, [form.currentTemp, form.requiredTemp]);

  // Leaflet map center and coordinates
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

  // Step-by-step recovery analysis
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
          try {
            console.log("FORM VALUES BEFORE RECOVERY:", {
              currentTemp: form.currentTemp,
              requiredTemp: form.requiredTemp,
              refrigeration: form.refrigeration,
              delay: form.delay,
              fuel: form.fuel,
            });

            const result = calculateRecovery(form, language);

            setDecision(result);
            setHasAnalysis(true);
            setAnalysisStep(totalStages - 1);
            setAnalyzing(false);

            saveDecisionRecord(form.shipmentId, result, "local");

            setActiveView("overview");
            showToast(t.toastPlanVerified);
          } catch (error) {
            console.error("Recovery plan generation failed:", error);

            setAnalyzing(false);
            setHasAnalysis(false);
            setAnalysisStep(-1);
            setActiveView("input");

            showToast("Recovery plan generation failed. Please try again.");
          }
        }, 420);
      }
    }, 380);
  };

  // Backend-connected what-if simulation
  const runSimulation = async () => {
    if (!form.shipmentId) {
      showToast("Select a shipment before running the simulation.");
      return;
    }

    setSimulationRunning(true);
    setSimulationResult(null);

    try {
      const result = await analyzeShipmentRecovery(form.shipmentId, {
        disruption_type: "temperature_rise",
        disruption_description:
          "What-if simulation: evaluating a hypothetical shipment temperature and additional delivery delay.",
        additional_delay_hours: Number(simulationDelay),
        simulated_battery_percent: null,
        simulated_temperature_c: Number(simulationTemp),
      });

      setSimulationResult({
        ...result,
        isHighExposure:
          result.risk_level === "High" ||
          result.risk_level === "Critical",
      });
    } catch (error) {
      console.error("Simulation failed:", error);

      setSimulationResult({
        error:
          error.response?.data?.detail ||
          "Unable to complete the simulation. Please try again.",
      });
    } finally {
      setSimulationRunning(false);
    }
  };

  // Approve the currently generated recovery plan
  const handleApproveRecovery = async () => {
    const shipmentCode = String(form.shipmentId || "").trim();

    const recommendedAction = String(
      decision?.recommendedAction || decision?.title || ""
    ).trim();

    if (!shipmentCode || !recommendedAction) {
      showToast("Generate a recovery plan before approving it.");
      return;
    }

    if (recoveryApproval?.status === "Approved") {
      showToast("This recovery plan is already approved.");
      return;
    }

    setApprovalLoading(true);

    try {
      const approval = await approveRecoveryPlan(
        shipmentCode,
        recommendedAction,
        "Approved from the CryoNexus recovery dashboard."
      );

      setRecoveryApproval(approval);
      showToast("Recovery plan approved successfully.");
    } catch (error) {
      console.error("Recovery approval failed:", error);

      if (error.response?.status === 401) {
        showToast("Session expired. Please sign in again.");
      } else if (error.response?.status === 403) {
        showToast("You are not authorized to approve this shipment.");
      } else if (error.response?.status === 404) {
        showToast("Shipment not found.");
      } else {
        showToast(
          error.response?.data?.detail ||
            "Could not approve the recovery plan."
        );
      }
    } finally {
      setApprovalLoading(false);
    }
  };

  // Backend-connected emergency replanning
  const handleEmergency = async () => {
    const description = emergencyText.trim();

    if (!description) {
      showToast(t.toastRequiredFields);
      return;
    }

    const text = description.toLowerCase();

    // Identify disruption category
    let disruptionType = null;

    if (/depot|warehouse|cold storage unavailable|hub unavailable/.test(text)) {
      disruptionType = "depot_unavailable";
    } else if (
      /refriger|cooling|compressor|reefer|freez|cold storage|unit failure/.test(
        text
      )
    ) {
      disruptionType = "refrigeration_failure";
    } else if (
      /vehicle breakdown|truck breakdown|vehicle stopped|engine failure|vehicle failure/.test(
        text
      )
    ) {
      disruptionType = "vehicle_breakdown";
    } else if (/battery|power failure|power drop|low power/.test(text)) {
      disruptionType = "battery_drop";
    } else if (
      /route|road block|blocked road|traffic jam|diversion/.test(text)
    ) {
      disruptionType = "route_blockage";
    } else if (/temperature|temp|hot|warm|heat|rise|spoil/.test(text)) {
      disruptionType = "temperature_rise";
    } else if (/delay|late|hours|standstill|jam|stuck/.test(text)) {
      disruptionType = "shipment_delay";
    }

    if (!disruptionType) {
      showToast(
        "Describe the disruption clearly, such as vehicle breakdown, refrigeration failure, battery drop, or route blockage."
      );
      return;
    }

    // Extract additional delay
    const delayMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i);

    const additionalDelay = delayMatch ? Number(delayMatch[1]) : 0;

    // Extract battery percentage
    const batteryMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);

    const simulatedBattery = batteryMatch
      ? Number(batteryMatch[1])
      : null;

    console.log("Battery extraction debug:", {
      description,
      batteryMatch,
      simulatedBattery,
    });

    const shipmentCode = String(form.shipmentId || "").trim();

    if (!shipmentCode) {
      showToast("Select or enter a valid shipment ID first.");
      return;
    }

    setReplanning(true);

    try {
      const analysis = await analyzeShipmentRecovery(shipmentCode, {
        disruption_type: disruptionType,
        disruption_description: description,
        additional_delay_hours: additionalDelay,
        simulated_battery_percent: simulatedBattery,
      });

      const updated = {
        ...form,
        disruption: `${form.disruption || ""} | ${description}`,
      };

      // Preserve dashboard decision fields and add backend assessment
      const existingDecision = calculateRecovery(updated, language);

      const result = {
        ...existingDecision,
        title: `${analysis.risk_level} Risk Recovery Plan`,
        reason: analysis.recommendation_reason,
        recommendedAction: analysis.recommended_action,
        alternativeActions: analysis.alternative_actions,
        riskLevel: analysis.risk_level,
        riskScore: analysis.risk_score,
        temperatureStatus: analysis.temperature_status,
        batteryStatus: analysis.battery_status,
        estimatedTotalDelayHours: analysis.estimated_total_delay_hours,
        analysisStatus: analysis.analysis_status,
      };

      setForm(updated);
      setDecision(result);
      setHasAnalysis(true);
      setEmergencyOpen(false);

      await saveDecisionRecord(shipmentCode, result, "backend");

      setEmergencyText("");
      setActiveView("overview");
      showToast("Backend recovery assessment completed successfully.");
    } catch (error) {
      console.error("Recovery analysis failed:", error);

      if (error.response?.status === 401) {
        showToast("Session expired. Please sign in again.");
      } else if (error.response?.status === 403) {
        showToast("You are not authorized to analyze this shipment.");
      } else if (error.response?.status === 404) {
        showToast("Shipment not found. Check the shipment ID.");
      } else {
        showToast(
          error.response?.data?.detail ||
            "Recovery analysis failed. Check the backend and try again."
        );
      }
    } finally {
      setReplanning(false);
    }
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

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Sidebar */}
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

        {/* Content */}
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
                temperatureRisk === "Unknown"
                  ? "orange"
                  : temperatureRisk === "Critical"
                    ? "rose"
                    : temperatureRisk === "Elevated"
                      ? "orange"
                      : "green"
              }
              status={
                temperatureRisk === "Unknown"
                  ? "Unknown"
                  : temperatureRisk === "Critical"
                    ? t.critical
                    : temperatureRisk === "Elevated"
                      ? t.elevated
                      : t.controlled
              }
            />

            <MetricCard
              icon={<Clock3 className="w-4 h-4" />}
              label={t.currentDelay}
              value={form.delay != null ? `${form.delay} hrs` : "Not recorded"}
              detail={
                form.delay != null
                  ? Number(form.delay) > 5
                    ? t.significantJam
                    : t.normalTransit
                  : "Delay information unavailable"
              }
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

          {/* User Dashboard */}
          {activeView === "user_dashboard" && (
            <UserDashboard
              t={t}
              language={language}
              currentUser={currentUser}
              operator={operator}
              onSelectShipment={handleSelectShipment}
              onShipmentDataLoaded={handleShipmentDataLoaded}
              onCallDriver={() => setDriverModalOpen(true)}
              onShowToast={showToast}
              navigate={setActiveView}
            />
          )}

          {/* Admin Dashboard - role protected */}
          {currentUser?.accountType === "admin" &&
            activeView === "admin_dashboard" && (
              <AdminDashboard
                t={t}
                language={language}
                currentUser={currentUser}
                onShowToast={showToast}
                navigate={setActiveView}
              />
            )}

          {/* Overview */}
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
              onNotifyHub={async () => {
                try {
                  const hubName =
                    currentWarehouse.names?.[language] ||
                    currentWarehouse.name;

                  const message = [
                    "RECEIVING HUB PRE-ALERT",
                    `Shipment: ${form.shipmentId}`,
                    `Receiving Hub: ${hubName}`,
                    `Product: ${form.product}`,
                    `Current Temperature: ${form.currentTemp}°C`,
                    `Required Temperature: ${form.requiredTemp}°C`,
                    `Estimated Delay: ${form.delay || "Not specified"} hours`,
                    `Recovery Recommendation: ${
                      decision?.title || "Pending assessment"
                    }`,
                    `Reason: ${decision?.reason || "Not available"}`,
                  ].join("\n");

                  await createHubPreAlert(form.shipmentId, message);

                  showToast(`${t.toastHubNotified} (${hubName})`);
                } catch (error) {
                  console.error("Hub pre-alert failed:", error);

                  showToast(
                    error.response?.data?.detail ||
                      "Could not create hub pre-alert."
                  );
                }
              }}
              onSpeakText={speakText}
              onApproveRecovery={handleApproveRecovery}
              recoveryApproval={recoveryApproval}
              approvalLoading={approvalLoading}
            />
          )}

          {/* Situation Input */}
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
              isListening={isListening}
              startAnalysis={startAnalysis}
              saveShipment={handleSaveShipment}
              onShowToast={showToast}
            />
          )}

          {/* Analysis */}
          {activeView === "analysis" && (
            <AnalysisPanel
              t={t}
              analysisStep={analysisStep}
              analyzing={analyzing}
            />
          )}

          {/* Simulation */}
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

          {/* Decision History */}
          {activeView === "history" && (
            <HistoryPanel
              t={t}
              history={decisionHistory}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Authentication Modal */}
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

      {/* Driver Contact Modal */}
      <DriverCallModal
        t={t}
        open={driverModalOpen}
        onClose={() => setDriverModalOpen(false)}
        vehicleId={form.vehicleId}
        driverName={form.driverName}
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
