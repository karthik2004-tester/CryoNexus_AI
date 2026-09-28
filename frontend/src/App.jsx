import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CloudSnow,
  Gauge,
  Globe2,
  MapPin,
  Menu,
  Mic,
  Package,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  Truck,
  Volume2,
  Warehouse,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import karnatakaLocations from "./data/karnatakaLocations";

/* ---------------------------------------------------------
   LANGUAGE
--------------------------------------------------------- */

const LANGUAGES = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "kn", label: "ಕನ್ನಡ", speech: "kn-IN" },
  { code: "ta", label: "தமிழ்", speech: "ta-IN" },
  { code: "te", label: "తెలుగు", speech: "te-IN" },
];

const TEXT = {
  en: {
    brandSub: "Cold-chain recovery intelligence",
    controlCenter: "CONTROL CENTER",
    recoveryOverview: "Recovery Overview",
    liveSituation: "Live Situation",
    recoveryAnalysis: "Recovery Analysis",
    simulation: "What-if Simulation",
    history: "Decision History",
    operationalState: "Operational State",
    guidance: "Operational Guidance",
    verified: "Verified",
    operational: "System operational",
    ready: "READY FOR LIVE INPUT",
    title: "Cold-chain recovery",
    titleAccent: " intelligence",
    description:
      "Turn a changing cold-chain situation into a clear, verified recovery decision.",
    emergency: "Emergency update",
    activeShipment: "Active shipment",
    temperature: "Temperature",
    currentDelay: "Current delay",
    planStatus: "Plan status",
    awaiting: "Awaiting analysis",
    enterSituation: "Enter situation",
    shipmentDetails: "Shipment details",
    operationalSituation: "Current operational situation",
    shipmentId: "Shipment ID",
    vehicleId: "Vehicle ID",
    product: "Product",
    quantity: "Quantity",
    requiredTemp: "Required temperature",
    currentTemp: "Current temperature",
    fuel: "Fuel level",
    delay: "Delay",
    refrigeration: "Refrigeration",
    working: "Working",
    partial: "Partially Functional",
    failed: "Failed",
    disruption: "What is happening?",
    source: "Source",
    destination: "Destination",
    district: "District",
    taluk: "Taluk",
    location: "Exact location",
    operator: "Operator",
    chooseDistrict: "Choose district",
    chooseTaluk: "Choose taluk",
    enterLocation: "Enter location / landmark",
    analyze: "Analyze situation",
    analyzing: "Analyzing situation...",
    voice: "Voice input",
    listening: "Listening...",
    stop: "Stop",
    route: "Current route",
    recovery: "Recovery decision",
    alternatives: "Recovery alternatives",
    why: "Why this plan?",
    scenario: "Scenario simulator",
    runScenario: "Run scenario",
    running: "Running scenario...",
    emergencyTitle: "Report a major change",
    emergencyDescription:
      "Describe the new condition. The recovery plan will be reassessed using the updated situation.",
    submitEmergency: "Replan recovery",
    cancel: "Cancel",
    dynamic: "DYNAMIC REPLANNING",
    replanTitle: "Updating the recovery situation",
    replanText:
      "The current condition is being reassessed and a new recovery path is being prepared.",
    complete: "Recovery plan updated",
    historyTitle: "Recent decisions",
    controlled: "Controlled",
    elevated: "Elevated",
    critical: "Critical",
    available: "Available",
    unavailable: "Unavailable",
    routeFeasible: "Route feasible",
    capacity: "Capacity",
    delayImpact: "Delay impact",
    temperatureStatus: "Temperature status",
    currentStrategy: "CURRENT STRATEGY",
    divert: "Divert to",
    continueRoute: "Continue current route",
    reroute: "Reroute vehicle",
    transfer: "Transfer vehicle",
    coldStorage: "Emergency cold storage",
    hold: "Hold shipment",
    noPlan: "No verified recovery action yet",
    noPlanText:
      "Enter the current operational situation to generate a recovery decision.",
    emergencyLogged: "Emergency update recorded",
    sourceDestination: "Source → Destination",
    map: "Route situation",
    decisionTimeline: "Decision timeline",
    operationalRisk: "Operational risk",
    currentState: "Current state",
    simulationResult: "Simulation result",
    safer: "Lower exposure",
    risk: "Higher exposure",
  },

  hi: {
    brandSub: "कोल्ड-चेन रिकवरी इंटेलिजेंस",
    controlCenter: "नियंत्रण केंद्र",
    recoveryOverview: "रिकवरी अवलोकन",
    liveSituation: "वर्तमान स्थिति",
    recoveryAnalysis: "रिकवरी विश्लेषण",
    simulation: "परिदृश्य सिमुलेशन",
    history: "निर्णय इतिहास",
    operationalState: "परिचालन स्थिति",
    guidance: "परिचालन मार्गदर्शन",
    verified: "सत्यापित",
    operational: "सिस्टम सक्रिय",
    ready: "लाइव इनपुट के लिए तैयार",
    title: "कोल्ड-चेन रिकवरी",
    titleAccent: " इंटेलिजेंस",
    description:
      "बदलती कोल्ड-चेन स्थिति को स्पष्ट और सत्यापित रिकवरी निर्णय में बदलें।",
    emergency: "आपातकालीन अपडेट",
    activeShipment: "सक्रिय शिपमेंट",
    temperature: "तापमान",
    currentDelay: "वर्तमान देरी",
    planStatus: "योजना स्थिति",
    awaiting: "विश्लेषण बाकी",
    enterSituation: "स्थिति दर्ज करें",
    shipmentDetails: "शिपमेंट विवरण",
    operationalSituation: "वर्तमान परिचालन स्थिति",
    shipmentId: "शिपमेंट ID",
    vehicleId: "वाहन ID",
    product: "उत्पाद",
    quantity: "मात्रा",
    requiredTemp: "आवश्यक तापमान",
    currentTemp: "वर्तमान तापमान",
    fuel: "ईंधन स्तर",
    delay: "देरी",
    refrigeration: "रेफ्रिजरेशन",
    working: "सही",
    partial: "आंशिक रूप से कार्यशील",
    failed: "खराब",
    disruption: "क्या हो रहा है?",
    source: "प्रस्थान",
    destination: "गंतव्य",
    district: "जिला",
    taluk: "तालुक",
    location: "सटीक स्थान",
    operator: "ऑपरेटर",
    chooseDistrict: "जिला चुनें",
    chooseTaluk: "तालुक चुनें",
    enterLocation: "स्थान / लैंडमार्क दर्ज करें",
    analyze: "स्थिति का विश्लेषण करें",
    analyzing: "स्थिति का विश्लेषण हो रहा है...",
    voice: "वॉइस इनपुट",
    listening: "सुन रहा है...",
    stop: "रोकें",
    route: "वर्तमान मार्ग",
    recovery: "रिकवरी निर्णय",
    alternatives: "रिकवरी विकल्प",
    why: "यह योजना क्यों?",
    scenario: "परिदृश्य सिमुलेटर",
    runScenario: "परिदृश्य चलाएं",
    running: "परिदृश्य चल रहा है...",
    emergencyTitle: "बड़ा बदलाव रिपोर्ट करें",
    emergencyDescription:
      "नई स्थिति बताएं। अपडेट की गई स्थिति के आधार पर रिकवरी योजना का फिर से मूल्यांकन होगा।",
    submitEmergency: "रिकवरी फिर से योजना बनाएं",
    cancel: "रद्द करें",
    dynamic: "डायनामिक रीप्लानिंग",
    replanTitle: "रिकवरी स्थिति अपडेट हो रही है",
    replanText:
      "वर्तमान स्थिति का फिर से मूल्यांकन किया जा रहा है और नई रिकवरी योजना तैयार की जा रही है।",
    complete: "रिकवरी योजना अपडेट हुई",
    historyTitle: "हाल के निर्णय",
    controlled: "नियंत्रित",
    elevated: "बढ़ा हुआ",
    critical: "गंभीर",
    available: "उपलब्ध",
    unavailable: "अनुपलब्ध",
    routeFeasible: "मार्ग संभव",
    capacity: "क्षमता",
    delayImpact: "देरी प्रभाव",
    temperatureStatus: "तापमान स्थिति",
    currentStrategy: "वर्तमान रणनीति",
    divert: "यहाँ भेजें",
    continueRoute: "वर्तमान मार्ग जारी रखें",
    reroute: "वाहन का मार्ग बदलें",
    transfer: "वाहन बदलें",
    coldStorage: "आपातकालीन कोल्ड स्टोरेज",
    hold: "शिपमेंट रोकें",
    noPlan: "अभी कोई सत्यापित रिकवरी निर्णय नहीं",
    noPlanText:
      "रिकवरी निर्णय बनाने के लिए वर्तमान परिचालन स्थिति दर्ज करें।",
    emergencyLogged: "आपातकालीन अपडेट दर्ज हुआ",
    sourceDestination: "प्रस्थान → गंतव्य",
    map: "मार्ग स्थिति",
    decisionTimeline: "निर्णय टाइमलाइन",
    operationalRisk: "परिचालन जोखिम",
    currentState: "वर्तमान स्थिति",
    simulationResult: "सिमुलेशन परिणाम",
    safer: "कम जोखिम",
    risk: "अधिक जोखिम",
  },

  kn: {
    brandSub: "ಕೋಲ್ಡ್-ಚೈನ್ ರಿಕವರಿ ಇಂಟೆಲಿಜೆನ್ಸ್",
    controlCenter: "ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
    recoveryOverview: "ರಿಕವರಿ ಅವಲೋಕನ",
    liveSituation: "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",
    recoveryAnalysis: "ರಿಕವರಿ ವಿಶ್ಲೇಷಣೆ",
    simulation: "ಪರಿಸ್ಥಿತಿ ಸಿಮ್ಯುಲೇಶನ್",
    history: "ನಿರ್ಧಾರ ಇತಿಹಾಸ",
    operationalState: "ಕಾರ್ಯಾಚರಣೆಯ ಸ್ಥಿತಿ",
    guidance: "ಕಾರ್ಯಾಚರಣೆ ಮಾರ್ಗದರ್ಶನ",
    verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    operational: "ಸಿಸ್ಟಮ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    ready: "ಲೈವ್ ಇನ್‌ಪುಟ್‌ಗೆ ಸಿದ್ಧ",
    title: "ಕೋಲ್ಡ್-ಚೈನ್ ರಿಕವರಿ",
    titleAccent: " ಇಂಟೆಲಿಜೆನ್ಸ್",
    description:
      "ಬದಲಾಗುತ್ತಿರುವ ಕೋಲ್ಡ್-ಚೈನ್ ಪರಿಸ್ಥಿತಿಯನ್ನು ಸ್ಪಷ್ಟ ಮತ್ತು ಪರಿಶೀಲಿತ ರಿಕವರಿ ನಿರ್ಧಾರವಾಗಿ ಪರಿವರ್ತಿಸಿ.",
    emergency: "ತುರ್ತು ಅಪ್‌ಡೇಟ್",
    activeShipment: "ಸಕ್ರಿಯ ಶಿಪ್‌ಮೆಂಟ್",
    temperature: "ತಾಪಮಾನ",
    currentDelay: "ಪ್ರಸ್ತುತ ವಿಳಂಬ",
    planStatus: "ಯೋಜನೆ ಸ್ಥಿತಿ",
    awaiting: "ವಿಶ್ಲೇಷಣೆ ಬಾಕಿ",
    enterSituation: "ಸ್ಥಿತಿ ನಮೂದಿಸಿ",
    shipmentDetails: "ಶಿಪ್‌ಮೆಂಟ್ ವಿವರಗಳು",
    operationalSituation: "ಪ್ರಸ್ತುತ ಕಾರ್ಯಾಚರಣೆಯ ಸ್ಥಿತಿ",
    shipmentId: "ಶಿಪ್‌ಮೆಂಟ್ ID",
    vehicleId: "ವಾಹನ ID",
    product: "ಉತ್ಪನ್ನ",
    quantity: "ಪ್ರಮಾಣ",
    requiredTemp: "ಅಗತ್ಯ ತಾಪಮಾನ",
    currentTemp: "ಪ್ರಸ್ತುತ ತಾಪಮಾನ",
    fuel: "ಇಂಧನ ಮಟ್ಟ",
    delay: "ವಿಳಂಬ",
    refrigeration: "ರೆಫ್ರಿಜರೇಶನ್",
    working: "ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ",
    partial: "ಭಾಗಶಃ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ",
    failed: "ವಿಫಲವಾಗಿದೆ",
    disruption: "ಏನು ನಡೆಯುತ್ತಿದೆ?",
    source: "ಮೂಲ",
    destination: "ಗಮ್ಯಸ್ಥಾನ",
    district: "ಜಿಲ್ಲೆ",
    taluk: "ತಾಲೂಕು",
    location: "ನಿಖರ ಸ್ಥಳ",
    operator: "ಆಪರೇಟರ್",
    chooseDistrict: "ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ",
    chooseTaluk: "ತಾಲೂಕು ಆಯ್ಕೆಮಾಡಿ",
    enterLocation: "ಸ್ಥಳ / ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ ನಮೂದಿಸಿ",
    analyze: "ಸ್ಥಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ಸ್ಥಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    voice: "ವಾಯ್ಸ್ ಇನ್‌ಪುಟ್",
    listening: "ಕೇಳುತ್ತಿದೆ...",
    stop: "ನಿಲ್ಲಿಸಿ",
    route: "ಪ್ರಸ್ತುತ ಮಾರ್ಗ",
    recovery: "ರಿಕವರಿ ನಿರ್ಧಾರ",
    alternatives: "ರಿಕವರಿ ಆಯ್ಕೆಗಳು",
    why: "ಈ ಯೋಜನೆ ಏಕೆ?",
    scenario: "ಪರಿಸ್ಥಿತಿ ಸಿಮ್ಯುಲೇಟರ್",
    runScenario: "ಪರಿಸ್ಥಿತಿ ಚಲಾಯಿಸಿ",
    running: "ಪರಿಸ್ಥಿತಿ ಚಲಿಸುತ್ತಿದೆ...",
    emergencyTitle: "ಪ್ರಮುಖ ಬದಲಾವಣೆಯನ್ನು ವರದಿ ಮಾಡಿ",
    emergencyDescription:
      "ಹೊಸ ಪರಿಸ್ಥಿತಿಯನ್ನು ತಿಳಿಸಿ. ನವೀಕರಿಸಿದ ಸ್ಥಿತಿಯ ಆಧಾರದ ಮೇಲೆ ರಿಕವರಿ ಯೋಜನೆಯನ್ನು ಮರುಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತದೆ.",
    submitEmergency: "ರಿಕವರಿಯನ್ನು ಮರುಯೋಜಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    dynamic: "ಡೈನಾಮಿಕ್ ರಿಪ್ಲಾನಿಂಗ್",
    replanTitle: "ರಿಕವರಿ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ",
    replanText:
      "ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಯನ್ನು ಮರುಮೌಲ್ಯಮಾಪನ ಮಾಡಿ ಹೊಸ ರಿಕವರಿ ಮಾರ್ಗವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ.",
    complete: "ರಿಕವರಿ ಯೋಜನೆ ನವೀಕರಿಸಲಾಗಿದೆ",
    historyTitle: "ಇತ್ತೀಚಿನ ನಿರ್ಧಾರಗಳು",
    controlled: "ನಿಯಂತ್ರಿತ",
    elevated: "ಹೆಚ್ಚಾಗಿದೆ",
    critical: "ಗಂಭೀರ",
    available: "ಲಭ್ಯವಿದೆ",
    unavailable: "ಲಭ್ಯವಿಲ್ಲ",
    routeFeasible: "ಮಾರ್ಗ ಸಾಧ್ಯ",
    capacity: "ಸಾಮರ್ಥ್ಯ",
    delayImpact: "ವಿಳಂಬದ ಪರಿಣಾಮ",
    temperatureStatus: "ತಾಪಮಾನ ಸ್ಥಿತಿ",
    currentStrategy: "ಪ್ರಸ್ತುತ ತಂತ್ರ",
    divert: "ಇಲ್ಲಿಗೆ ತಿರುಗಿಸಿ",
    continueRoute: "ಪ್ರಸ್ತುತ ಮಾರ್ಗ ಮುಂದುವರಿಸಿ",
    reroute: "ವಾಹನದ ಮಾರ್ಗ ಬದಲಿಸಿ",
    transfer: "ವಾಹನ ಬದಲಿಸಿ",
    coldStorage: "ತುರ್ತು ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್",
    hold: "ಶಿಪ್‌ಮೆಂಟ್ ತಡೆಹಿಡಿಯಿರಿ",
    noPlan: "ಇನ್ನೂ ಪರಿಶೀಲಿತ ರಿಕವರಿ ನಿರ್ಧಾರವಿಲ್ಲ",
    noPlanText:
      "ರಿಕವರಿ ನಿರ್ಧಾರವನ್ನು ರಚಿಸಲು ಪ್ರಸ್ತುತ ಕಾರ್ಯಾಚರಣೆಯ ಸ್ಥಿತಿಯನ್ನು ನಮೂದಿಸಿ.",
    emergencyLogged: "ತುರ್ತು ಅಪ್‌ಡೇಟ್ ದಾಖಲಿಸಲಾಗಿದೆ",
    sourceDestination: "ಮೂಲ → ಗಮ್ಯಸ್ಥಾನ",
    map: "ಮಾರ್ಗದ ಸ್ಥಿತಿ",
    decisionTimeline: "ನಿರ್ಧಾರ ಟೈಮ್‌ಲೈನ್",
    operationalRisk: "ಕಾರ್ಯಾಚರಣೆಯ ಅಪಾಯ",
    currentState: "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",
    simulationResult: "ಸಿಮ್ಯುಲೇಶನ್ ಫಲಿತಾಂಶ",
    safer: "ಕಡಿಮೆ ಅಪಾಯ",
    risk: "ಹೆಚ್ಚಿನ ಅಪಾಯ",
  },

  ta: {
    brandSub: "குளிர்சங்கிலி மீட்பு நுண்ணறிவு",
    controlCenter: "கட்டுப்பாட்டு மையம்",
    recoveryOverview: "மீட்பு மேலோட்டம்",
    liveSituation: "தற்போதைய நிலை",
    recoveryAnalysis: "மீட்பு பகுப்பாய்வு",
    simulation: "சூழ்நிலை சிமுலேஷன்",
    history: "முடிவு வரலாறு",
    operationalState: "செயல்பாட்டு நிலை",
    guidance: "செயல்பாட்டு வழிகாட்டி",
    verified: "சரிபார்க்கப்பட்டது",
    operational: "சிஸ்டம் செயல்பாட்டில்",
    ready: "நேரடி உள்ளீட்டிற்கு தயார்",
    title: "குளிர்சங்கிலி மீட்பு",
    titleAccent: " நுண்ணறிவு",
    description:
      "மாறும் குளிர்சங்கிலி நிலையை தெளிவான மற்றும் சரிபார்க்கப்பட்ட மீட்பு முடிவாக மாற்றுங்கள்.",
    emergency: "அவசர புதுப்பிப்பு",
    activeShipment: "செயலில் உள்ள சரக்கு",
    temperature: "வெப்பநிலை",
    currentDelay: "தற்போதைய தாமதம்",
    planStatus: "திட்ட நிலை",
    awaiting: "பகுப்பாய்வு நிலுவையில்",
    enterSituation: "நிலையை உள்ளிடுங்கள்",
    shipmentDetails: "சரக்கு விவரங்கள்",
    operationalSituation: "தற்போதைய செயல்பாட்டு நிலை",
    shipmentId: "சரக்கு ID",
    vehicleId: "வாகன ID",
    product: "தயாரிப்பு",
    quantity: "அளவு",
    requiredTemp: "தேவையான வெப்பநிலை",
    currentTemp: "தற்போதைய வெப்பநிலை",
    fuel: "எரிபொருள் நிலை",
    delay: "தாமதம்",
    refrigeration: "குளிரூட்டல்",
    working: "செயல்பாட்டில்",
    partial: "பகுதியளவில் செயல்பாட்டில்",
    failed: "செயலிழந்தது",
    disruption: "என்ன நடக்கிறது?",
    source: "மூலம்",
    destination: "இலக்கு",
    district: "மாவட்டம்",
    taluk: "தாலுகா",
    location: "துல்லியமான இடம்",
    operator: "ஆபரேட்டர்",
    chooseDistrict: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்",
    chooseTaluk: "தாலுகாவைத் தேர்ந்தெடுக்கவும்",
    enterLocation: "இடம் / அடையாளத்தை உள்ளிடவும்",
    analyze: "நிலையை பகுப்பாய்வு செய்",
    analyzing: "நிலை பகுப்பாய்வு செய்யப்படுகிறது...",
    voice: "குரல் உள்ளீடு",
    listening: "கேட்கிறது...",
    stop: "நிறுத்து",
    route: "தற்போதைய பாதை",
    recovery: "மீட்பு முடிவு",
    alternatives: "மீட்பு விருப்பங்கள்",
    why: "இந்த திட்டம் ஏன்?",
    scenario: "சூழ்நிலை சிமுலேட்டர்",
    runScenario: "சூழ்நிலையை இயக்கவும்",
    running: "சூழ்நிலை இயங்குகிறது...",
    emergencyTitle: "முக்கிய மாற்றத்தைப் பதிவு செய்க",
    emergencyDescription:
      "புதிய நிலையை விவரிக்கவும். புதுப்பிக்கப்பட்ட நிலையின் அடிப்படையில் மீட்பு திட்டம் மீண்டும் மதிப்பிடப்படும்.",
    submitEmergency: "மீட்பை மீண்டும் திட்டமிடு",
    cancel: "ரத்து செய்",
    dynamic: "டைனமிக் ரீபிளானிங்",
    replanTitle: "மீட்பு நிலை புதுப்பிக்கப்படுகிறது",
    replanText:
      "தற்போதைய நிலை மீண்டும் மதிப்பிடப்பட்டு புதிய மீட்பு பாதை தயாரிக்கப்படுகிறது.",
    complete: "மீட்பு திட்டம் புதுப்பிக்கப்பட்டது",
    historyTitle: "சமீபத்திய முடிவுகள்",
    controlled: "கட்டுப்பாட்டில்",
    elevated: "உயர்ந்தது",
    critical: "முக்கியமானது",
    available: "கிடைக்கிறது",
    unavailable: "கிடைக்கவில்லை",
    routeFeasible: "பாதை சாத்தியம்",
    capacity: "திறன்",
    delayImpact: "தாமத தாக்கம்",
    temperatureStatus: "வெப்பநிலை நிலை",
    currentStrategy: "தற்போதைய உத்தி",
    divert: "இங்கே திருப்பவும்",
    continueRoute: "தற்போதைய பாதையைத் தொடரவும்",
    reroute: "வாகன பாதையை மாற்றவும்",
    transfer: "வாகனத்தை மாற்றவும்",
    coldStorage: "அவசர குளிர்சேமிப்பு",
    hold: "சரக்கை நிறுத்தவும்",
    noPlan: "இன்னும் சரிபார்க்கப்பட்ட மீட்பு முடிவு இல்லை",
    noPlanText:
      "மீட்பு முடிவை உருவாக்க தற்போதைய செயல்பாட்டு நிலையை உள்ளிடவும்.",
    emergencyLogged: "அவசர புதுப்பிப்பு பதிவு செய்யப்பட்டது",
    sourceDestination: "மூலம் → இலக்கு",
    map: "பாதை நிலை",
    decisionTimeline: "முடிவு காலவரிசை",
    operationalRisk: "செயல்பாட்டு ஆபத்து",
    currentState: "தற்போதைய நிலை",
    simulationResult: "சிமுலேஷன் முடிவு",
    safer: "குறைந்த ஆபத்து",
    risk: "அதிக ஆபத்து",
  },

  te: {
    brandSub: "కోల్డ్-చైన్ రికవరీ ఇంటెలిజెన్స్",
    controlCenter: "నియంత్రణ కేంద్రం",
    recoveryOverview: "రికవరీ అవలోకనం",
    liveSituation: "ప్రస్తుత పరిస్థితి",
    recoveryAnalysis: "రికవరీ విశ్లేషణ",
    simulation: "పరిస్థితి సిమ్యులేషన్",
    history: "నిర్ణయ చరిత్ర",
    operationalState: "ఆపరేషన్ స్థితి",
    guidance: "ఆపరేషన్ మార్గదర్శకం",
    verified: "ధృవీకరించబడింది",
    operational: "సిస్టమ్ సక్రియంగా ఉంది",
    ready: "లైవ్ ఇన్‌పుట్‌కు సిద్ధం",
    title: "కోల్డ్-చైన్ రికవరీ",
    titleAccent: " ఇంటెలిజెన్స్",
    description:
      "మారుతున్న కోల్డ్-చైన్ పరిస్థితిని స్పష్టమైన మరియు ధృవీకరించిన రికవరీ నిర్ణయంగా మార్చండి.",
    emergency: "అత్యవసర నవీకరణ",
    activeShipment: "సక్రియ షిప్‌మెంట్",
    temperature: "ఉష్ణోగ్రత",
    currentDelay: "ప్రస్తుత ఆలస్యం",
    planStatus: "ప్లాన్ స్థితి",
    awaiting: "విశ్లేషణ పెండింగ్‌లో ఉంది",
    enterSituation: "పరిస్థితిని నమోదు చేయండి",
    shipmentDetails: "షిప్‌మెంట్ వివరాలు",
    operationalSituation: "ప్రస్తుత ఆపరేషన్ పరిస్థితి",
    shipmentId: "షిప్‌మెంట్ ID",
    vehicleId: "వాహన ID",
    product: "ఉత్పత్తి",
    quantity: "పరిమాణం",
    requiredTemp: "అవసరమైన ఉష్ణోగ్రత",
    currentTemp: "ప్రస్తుత ఉష్ణోగ్రత",
    fuel: "ఇంధన స్థాయి",
    delay: "ఆలస్యం",
    refrigeration: "రిఫ్రిజరేషన్",
    working: "పనిచేస్తోంది",
    partial: "పాక్షికంగా పనిచేస్తోంది",
    failed: "విఫలమైంది",
    disruption: "ఏం జరుగుతోంది?",
    source: "మూలం",
    destination: "గమ్యం",
    district: "జిల్లా",
    taluk: "తాలూకా",
    location: "ఖచ్చితమైన స్థానం",
    operator: "ఆపరేటర్",
    chooseDistrict: "జిల్లాను ఎంచుకోండి",
    chooseTaluk: "తాలూకాను ఎంచుకోండి",
    enterLocation: "స్థానం / ల్యాండ్‌మార్క్ నమోదు చేయండి",
    analyze: "పరిస్థితిని విశ్లేషించండి",
    analyzing: "పరిస్థితిని విశ్లేషిస్తోంది...",
    voice: "వాయిస్ ఇన్‌పుట్",
    listening: "వింటోంది...",
    stop: "ఆపండి",
    route: "ప్రస్తుత మార్గం",
    recovery: "రికవరీ నిర్ణయం",
    alternatives: "రికవరీ ఎంపికలు",
    why: "ఈ ప్లాన్ ఎందుకు?",
    scenario: "సన్నివేశ సిమ్యులేటర్",
    runScenario: "సన్నివేశాన్ని అమలు చేయండి",
    running: "సన్నివేశం నడుస్తోంది...",
    emergencyTitle: "ముఖ్యమైన మార్పును నివేదించండి",
    emergencyDescription:
      "కొత్త పరిస్థితిని వివరించండి. నవీకరించిన స్థితి ఆధారంగా రికవరీ ప్లాన్ మళ్లీ అంచనా వేయబడుతుంది.",
    submitEmergency: "రికవరీని మళ్లీ ప్లాన్ చేయండి",
    cancel: "రద్దు చేయండి",
    dynamic: "డైనమిక్ రీప్లానింగ్",
    replanTitle: "రికవరీ పరిస్థితి నవీకరించబడుతోంది",
    replanText:
      "ప్రస్తుత పరిస్థితిని మళ్లీ అంచనా వేసి కొత్త రికవరీ మార్గాన్ని సిద్ధం చేస్తున్నారు.",
    complete: "రికవరీ ప్లాన్ నవీకరించబడింది",
    historyTitle: "ఇటీవలి నిర్ణయాలు",
    controlled: "నియంత్రిత",
    elevated: "పెరిగింది",
    critical: "తీవ్రమైన",
    available: "అందుబాటులో ఉంది",
    unavailable: "అందుబాటులో లేదు",
    routeFeasible: "మార్గం సాధ్యమే",
    capacity: "సామర్థ్యం",
    delayImpact: "ఆలస్యం ప్రభావం",
    temperatureStatus: "ఉష్ణోగ్రత స్థితి",
    currentStrategy: "ప్రస్తుత వ్యూహం",
    divert: "ఇక్కడికి మళ్లించండి",
    continueRoute: "ప్రస్తుత మార్గాన్ని కొనసాగించండి",
    reroute: "వాహన మార్గాన్ని మార్చండి",
    transfer: "వాహనాన్ని మార్చండి",
    coldStorage: "అత్యవసర కోల్డ్ స్టోరేజ్",
    hold: "షిప్‌మెంట్‌ను నిలిపివేయండి",
    noPlan: "ఇంకా ధృవీకరించిన రికవరీ నిర్ణయం లేదు",
    noPlanText:
      "రికవరీ నిర్ణయం రూపొందించడానికి ప్రస్తుత ఆపరేషన్ పరిస్థితిని నమోదు చేయండి.",
    emergencyLogged: "అత్యవసర నవీకరణ నమోదు చేయబడింది",
    sourceDestination: "మూలం → గమ్యం",
    map: "మార్గం పరిస్థితి",
    decisionTimeline: "నిర్ణయ టైమ్‌లైన్",
    operationalRisk: "ఆపరేషన్ ప్రమాదం",
    currentState: "ప్రస్తుత స్థితి",
    simulationResult: "సిమ్యులేషన్ ఫలితం",
    safer: "తక్కువ ప్రమాదం",
    risk: "ఎక్కువ ప్రమాదం",
  },
};

/* ---------------------------------------------------------
   DEFAULT DATA
--------------------------------------------------------- */

const initialForm = {
  shipmentId: "CNX-2026-1047",
  vehicleId: "TRK-T17",
  product: "Frozen Vegetables",
  quantity: "2000",
  requiredTemp: "-18",
  currentTemp: "-10",
  fuel: "45",
  delay: "4",
  refrigeration: "Partially Functional",

  sourceDistrict: "Tumakuru",
  sourceTaluk: "Tumakuru",
  sourceLocation: "Tumakuru industrial area",

  destinationDistrict: "Bengaluru Urban",
  destinationTaluk: "Bengaluru South",
  destinationLocation: "Bengaluru cold-storage facility",

  disruption:
    "Refrigeration malfunction combined with traffic delay on the current route.",
};

const districtCoordinates = {
  Bagalkote: [16.17, 75.67],
  Ballari: [15.14, 76.92],
  Belagavi: [15.85, 74.5],
  "Bengaluru Rural": [13.23, 77.71],
  "Bengaluru Urban": [12.97, 77.59],
  Bidar: [17.91, 77.52],
  Chamarajanagar: [11.92, 76.94],
  Chikkaballapura: [13.43, 77.73],
  Chikkamagaluru: [13.32, 75.77],
  Chitradurga: [14.23, 76.4],
  "Dakshina Kannada": [12.87, 74.88],
  Davanagere: [14.47, 75.92],
  Dharwad: [15.46, 75.01],
  Gadag: [15.43, 75.63],
  Hassan: [13.0, 76.1],
  Haveri: [14.8, 75.4],
  Kalaburagi: [17.33, 76.84],
  Kodagu: [12.42, 75.74],
  Kolar: [13.14, 78.13],
  Koppal: [15.35, 76.15],
  Mandya: [12.52, 76.9],
  Mysuru: [12.3, 76.65],
  Raichur: [16.21, 77.36],
  "Bengaluru South (Ramanagara)": [12.72, 77.28],
  Shivamogga: [13.93, 75.57],
  Tumakuru: [13.34, 77.1],
  Udupi: [13.34, 74.75],
  "Uttara Kannada": [14.8, 74.13],
  Vijayapura: [16.83, 75.71],
  Vijayanagara: [15.23, 76.05],
  Yadgir: [16.77, 77.14],
};

const warehouses = [
  {
    id: "A",
    name: "Bengaluru Cold Hub",
    city: "Bengaluru",
    distance: 35,
    capacity: 82,
    position: [13.02, 77.585],
  },
  {
    id: "B",
    name: "Nelamangala Recovery Hub",
    city: "Nelamangala",
    distance: 70,
    capacity: 64,
    position: [13.1, 77.392],
  },
  {
    id: "C",
    name: "Hassan Cold Facility",
    city: "Hassan",
    distance: 110,
    capacity: 91,
    position: [13.0068, 76.1],
  },
];

const stages = [
  "Validating current situation",
  "Building recovery state",
  "Reviewing relevant guidance",
  "Assessing disruption impact",
  "Generating recovery alternatives",
  "Evaluating route feasibility",
  "Checking operational constraints",
  "Comparing scenarios",
  "Verifying recovery plan",
];

function MapCenter({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 8);
  }, [center, map]);

  return null;
}

/* ---------------------------------------------------------
   DECISION ENGINE
--------------------------------------------------------- */

function calculateRecovery(form) {
  const currentTemp = Number(form.currentTemp);
  const requiredTemp = Number(form.requiredTemp);
  const delay = Number(form.delay);
  const fuel = Number(form.fuel);

  const tempGap = currentTemp - requiredTemp;

  if (form.refrigeration === "Failed") {
    return {
      key: "transfer",
      title: "Transfer vehicle",
      confidence: "High",
      reason:
        "The refrigeration condition is no longer dependable. Moving the shipment to another controlled vehicle reduces continued temperature exposure.",
    };
  }

  if (tempGap >= 8) {
    return {
      key: "coldStorage",
      title: "Emergency cold storage",
      confidence: "High",
      reason:
        "The current temperature is substantially above the required range. Immediate controlled storage reduces exposure while a new transport plan is prepared.",
    };
  }

  if (delay >= 6) {
    return {
      key: "reroute",
      title: "Reroute vehicle",
      confidence: "Medium",
      reason:
        "The current delay is large enough to increase delivery exposure. A route change can reduce expected delay.",
    };
  }

  if (fuel < 20) {
    return {
      key: "hold",
      title: "Hold shipment",
      confidence: "Medium",
      reason:
        "Fuel availability is becoming restrictive. Holding the shipment avoids committing to a route that may not be completed safely.",
    };
  }

  if (form.refrigeration === "Partially Functional") {
    return {
      key: "transfer",
      title: "Transfer vehicle",
      confidence: "High",
      reason:
        "Partial refrigeration creates continued temperature risk. A vehicle transfer provides a more controlled recovery path.",
    };
  }

  return {
    key: "continue",
    title: "Continue current route",
    confidence: "Medium",
    reason:
      "Current temperature, delay, fuel and refrigeration conditions remain within the modeled operating range.",
  };
}

/* ---------------------------------------------------------
   APP
--------------------------------------------------------- */

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [language, setLanguage] = useState("en");
  const [operator, setOperator] = useState("Operations Manager");

  const [activeView, setActiveView] = useState("overview");

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [hasAnalysis, setHasAnalysis] = useState(false);

  const [decision, setDecision] = useState(null);

  const [simulationTemp, setSimulationTemp] = useState(-10);
  const [simulationDelay, setSimulationDelay] = useState(4);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyText, setEmergencyText] = useState("");
  const [replanning, setReplanning] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [selectedWarehouse, setSelectedWarehouse] = useState("B");

  const [decisionHistory, setDecisionHistory] = useState([]);

  const t = TEXT[language] || TEXT.en;

  const selectedLanguage = LANGUAGES.find((item) => item.code === language);

  const sourceDistricts = Object.keys(karnatakaLocations || {});

  const sourceTaluks =
    karnatakaLocations?.[form.sourceDistrict] || [];

  const destinationTaluks =
    karnatakaLocations?.[form.destinationDistrict] || [];

  const currentWarehouse = warehouses.find(
    (item) => item.id === selectedWarehouse
  );

  const temperatureRisk = useMemo(() => {
    const current = Number(form.currentTemp);
    const required = Number(form.requiredTemp);

    if (current <= required) return "Controlled";
    if (current <= required + 6) return "Elevated";
    return "Critical";
  }, [form.currentTemp, form.requiredTemp]);

  const routeCenter = useMemo(() => {
    const source =
      districtCoordinates[form.sourceDistrict] ||
      districtCoordinates.Tumakuru;

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
      districtCoordinates[form.sourceDistrict] ||
      districtCoordinates.Tumakuru;

    const destination =
      districtCoordinates[form.destinationDistrict] ||
      districtCoordinates["Bengaluru Urban"];

    const mid = [
      (source[0] + destination[0]) / 2 + 0.12,
      (source[1] + destination[1]) / 2,
    ];

    return [source, mid, destination];
  }, [form.sourceDistrict, form.destinationDistrict]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__cryoToast);
    window.__cryoToast = window.setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const changeDistrict = (type, value) => {
    if (type === "source") {
      const taluks = karnatakaLocations?.[value] || [];

      setForm((previous) => ({
        ...previous,
        sourceDistrict: value,
        sourceTaluk: taluks[0] || "",
      }));
    } else {
      const taluks = karnatakaLocations?.[value] || [];

      setForm((previous) => ({
        ...previous,
        destinationDistrict: value,
        destinationTaluk: taluks[0] || "",
      }));
    }
  };

  /* -------------------------------------------------------
     ANALYSIS
  ------------------------------------------------------- */

  const startAnalysis = () => {
    if (
      !form.shipmentId ||
      !form.product ||
      !form.currentTemp ||
      !form.requiredTemp ||
      !form.sourceDistrict ||
      !form.destinationDistrict
    ) {
      showToast("Complete the required situation details first.");
      setActiveView("input");
      return;
    }

    setAnalyzing(true);
    setHasAnalysis(false);
    setDecision(null);
    setAnalysisStep(0);
    setActiveView("analysis");

    let step = 0;

    const timer = window.setInterval(() => {
      step += 1;

      if (step < stages.length) {
        setAnalysisStep(step);
      } else {
        window.clearInterval(timer);

        window.setTimeout(() => {
          const result = calculateRecovery(form);

          setDecision(result);
          setHasAnalysis(true);
          setAnalyzing(false);
          setAnalysisStep(stages.length - 1);

          setDecisionHistory((previous) => [
            {
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              decision: result.title,
              reason: result.reason,
            },
            ...previous,
          ]);

          setActiveView("overview");

          showToast("Recovery plan verified successfully.");
        }, 500);
      }
    }, 420);
  };

  /* -------------------------------------------------------
     VOICE
  ------------------------------------------------------- */

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
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast(
        "Voice input is unavailable in this browser. Please use Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = selectedLanguage?.speech || "en-IN";
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
      showToast("Voice input could not be processed.");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  /* -------------------------------------------------------
     SIMULATION
  ------------------------------------------------------- */

  const runSimulation = () => {
    setSimulationRunning(true);
    setSimulationResult(null);

    window.setTimeout(() => {
      const temp = Number(simulationTemp);
      const delay = Number(simulationDelay);

      let result;

      if (temp > Number(form.requiredTemp) + 8 || delay > 6) {
        result = {
          status: "High exposure",
          message:
            "The scenario increases operational exposure and may require an alternate recovery action.",
        };
      } else {
        result = {
          status: "Lower exposure",
          message:
            "The scenario remains within the modeled recovery range.",
        };
      }

      setSimulationResult(result);
      setSimulationRunning(false);
    }, 1100);
  };

  /* -------------------------------------------------------
     EMERGENCY REPLAN
  ------------------------------------------------------- */

  const handleEmergency = () => {
    if (!emergencyText.trim()) {
      showToast("Enter or speak the emergency update first.");
      return;
    }

    setReplanning(true);

    const text = emergencyText.toLowerCase();

    window.setTimeout(() => {
      const updated = {
        ...form,
        disruption: `${form.disruption} ${emergencyText}`,
        refrigeration:
          /refriger|cooling|compressor|reefer/.test(text)
            ? "Failed"
            : form.refrigeration,
        currentTemp:
          /temperature|temp|hot|warm|heat/.test(text)
            ? String(Number(form.currentTemp) + 4)
            : form.currentTemp,
        delay:
          /delay|traffic|blocked|road|hours/.test(text)
            ? String(Math.max(Number(form.delay), 7))
            : form.delay,
      };

      const result = calculateRecovery(updated);

      setForm(updated);
      setDecision(result);
      setHasAnalysis(true);
      setReplanning(false);
      setEmergencyOpen(false);

      setDecisionHistory((previous) => [
        {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          decision: result.title,
          reason: "Plan updated after emergency condition.",
        },
        ...previous,
      ]);

      setEmergencyText("");
      setActiveView("overview");

      showToast(t.complete);
    }, 1800);
  };

  /* -------------------------------------------------------
     NAV
  ------------------------------------------------------- */

  const navigate = (view) => {
    setActiveView(view);
    setMobileMenu(false);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      {/* HEADER */}
      <header className="topbar">
        <div className="brand-area">
          <div className="brand-mark">
            <div className="brand-orbit orbit-one" />
            <div className="brand-orbit orbit-two" />
            <Truck size={22} strokeWidth={2.2} />
          </div>

          <div>
            <div className="brand-name">
              CRYO<span>NEXUS</span>
            </div>

            <div className="brand-subtitle">
              {t.brandSub}
            </div>
          </div>
        </div>

        <div className="topbar-center">
          <div className="system-status">
            <span className="pulse-dot" />
            {t.operational}
          </div>

          <div className="topbar-divider" />

          <span className="small-muted">
            {operator}
          </span>
        </div>

        <div className="topbar-actions">
          <button className="icon-button">
            <Bell size={18} />
            <span className="notification-dot" />
          </button>

          <div className="language-control top-language">
            <Globe2 size={15} />

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
            >
              {LANGUAGES.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button className="profile-chip">
            <span className="profile-avatar">
              OP
            </span>

            <span className="profile-name">
              {operator}
            </span>

            <ChevronDown size={14} />
          </button>

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenu((value) => !value)
            }
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div
        className={`main-layout ${
          mobileMenu ? "mobile-open" : ""
        }`}
      >
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-label">
            {t.controlCenter}
          </div>

          <NavButton
            active={activeView === "overview"}
            icon={<Activity size={18} />}
            label={t.recoveryOverview}
            onClick={() => navigate("overview")}
          />

          <NavButton
            active={activeView === "input"}
            icon={<Package size={18} />}
            label={t.liveSituation}
            onClick={() => navigate("input")}
          />

          <NavButton
            active={activeView === "analysis"}
            icon={<Sparkles size={18} />}
            label={t.recoveryAnalysis}
            onClick={() => navigate("analysis")}
            live={analyzing}
          />

          <NavButton
            active={activeView === "simulation"}
            icon={<BarChart3 size={18} />}
            label={t.simulation}
            onClick={() => navigate("simulation")}
          />

          <NavButton
            active={activeView === "history"}
            icon={<Clock3 size={18} />}
            label={t.history}
            onClick={() => navigate("history")}
          />

          <div className="sidebar-section">
            <div className="sidebar-label">
              {t.operationalState}
            </div>

            <div className="mini-system-card">
              <div className="mini-system-icon">
                <Truck size={16} />
              </div>

              <div>
                <strong>{t.activeShipment}</strong>
                <span>{form.shipmentId}</span>
              </div>

              <span className="green-dot" />
            </div>

            <div className="mini-system-card">
              <div className="mini-system-icon purple">
                <ShieldCheck size={16} />
              </div>

              <div>
                <strong>{t.planStatus}</strong>
                <span>
                  {hasAnalysis
                    ? t.verified
                    : t.awaiting}
                </span>
              </div>

              <span
                className={
                  hasAnalysis
                    ? "green-dot"
                    : "orange-dot"
                }
              />
            </div>
          </div>

          <div className="sidebar-footer">
            <ShieldCheck size={16} />
            <span>{t.guidance}</span>
          </div>
        </aside>

        {/* MAIN */}
        <main className="content">
          <div className="content-header">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                {t.controlCenter}
              </div>

              <h1>
                {t.title}
                <span>{t.titleAccent}</span>
              </h1>

              <p className="header-description">
                {t.description}
              </p>
            </div>

            <div className="header-actions">
              <div className="operator-control">
                <select
                  value={operator}
                  onChange={(event) =>
                    setOperator(event.target.value)
                  }
                >
                  <option>
                    Operations Manager
                  </option>
                  <option>Dispatcher</option>
                  <option>Fleet Manager</option>
                  <option>Warehouse Manager</option>
                  <option>Supply Chain Manager</option>
                </select>
              </div>

              <button
                className="emergency-button"
                onClick={() =>
                  setEmergencyOpen(true)
                }
              >
                <AlertCircle size={17} />
                {t.emergency}
              </button>
            </div>
          </div>

          {/* METRICS */}
          <div className="metric-row">
            <MetricCard
              icon={<Truck size={18} />}
              label={t.activeShipment}
              value={form.shipmentId}
              detail={form.product}
              accent="blue"
            />

            <MetricCard
              icon={<Thermometer size={18} />}
              label={t.temperature}
              value={`${form.currentTemp}°C`}
              detail={`${t.requiredTemp}: ${form.requiredTemp}°C`}
              accent="orange"
              status={temperatureRisk}
            />

            <MetricCard
              icon={<Clock3 size={18} />}
              label={t.currentDelay}
              value={`${form.delay} hrs`}
              detail={t.delayImpact}
              accent="purple"
            />

            <MetricCard
              icon={<ShieldCheck size={18} />}
              label={t.planStatus}
              value={
                hasAnalysis
                  ? t.verified
                  : t.awaiting
              }
              detail={t.operationalState}
              accent="green"
            />
          </div>

          {/* INPUT */}
          {activeView === "input" && (
            <SituationPanel
              t={t}
              form={form}
              language={language}
              operator={operator}
              updateForm={updateForm}
              changeDistrict={changeDistrict}
              sourceDistricts={sourceDistricts}
              sourceTaluks={sourceTaluks}
              destinationTaluks={destinationTaluks}
              startVoiceInput={startVoiceInput}
              stopVoiceInput={stopVoiceInput}
              isListening={isListening}
              startAnalysis={startAnalysis}
            />
          )}

          {/* ANALYSIS */}
          {activeView === "analysis" && (
            <AnalysisPanel
              t={t}
              stages={stages}
              analysisStep={analysisStep}
              analyzing={analyzing}
            />
          )}

          {/* SIMULATION */}
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

          {/* HISTORY */}
          {activeView === "history" && (
            <HistoryPanel
              t={t}
              history={decisionHistory}
            />
          )}

          {/* OVERVIEW */}
          {activeView === "overview" && (
            <>
              {!hasAnalysis ? (
                <WelcomeCard
                  t={t}
                  onStart={() => navigate("input")}
                />
              ) : (
                <Overview
                  t={t}
                  form={form}
                  decision={decision}
                  selectedWarehouse={selectedWarehouse}
                  setSelectedWarehouse={
                    setSelectedWarehouse
                  }
                  currentWarehouse={currentWarehouse}
                  routeCenter={routeCenter}
                  routeCoordinates={routeCoordinates}
                  temperatureRisk={temperatureRisk}
                  navigate={navigate}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* EMERGENCY MODAL */}
      {emergencyOpen && (
        <div className="modal-backdrop">
          <div className="emergency-modal">
            {replanning ? (
              <div className="replanning-state">
                <div className="replanning-orbit">
                  <RefreshCw
                    size={28}
                    className="spin"
                  />
                </div>

                <div className="welcome-kicker">
                  <Radio size={14} />
                  {t.dynamic}
                </div>

                <h2>{t.replanTitle}</h2>

                <p>{t.replanText}</p>

                <div className="replanning-steps">
                  <span>
                    <Check size={13} />
                    {t.currentState}
                  </span>

                  <span>
                    <Check size={13} />
                    {t.recovery}
                  </span>

                  <span className="loading-step">
                    <RefreshCw
                      size={13}
                      className="spin"
                    />
                    {t.dynamic}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div>
                    <div className="eyebrow">
                      <span className="eyebrow-line orange" />
                      {t.emergency}
                    </div>

                    <h2>{t.emergencyTitle}</h2>
                  </div>

                  <button
                    className="modal-close"
                    onClick={() =>
                      setEmergencyOpen(false)
                    }
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="modal-description">
                  {t.emergencyDescription}
                </p>

                <div className="emergency-input-wrap">
                  <textarea
                    value={emergencyText}
                    onChange={(event) =>
                      setEmergencyText(
                        event.target.value
                      )
                    }
                    placeholder={
                      "Example: refrigeration failed and traffic has increased the delay..."
                    }
                  />

                  <button
                    className={`voice-btn ${
                      isListening ? "listening" : ""
                    }`}
                    onClick={() =>
                      startVoiceInput("emergency")
                    }
                  >
                    {isListening ? (
                      <Volume2 size={17} />
                    ) : (
                      <Mic size={17} />
                    )}
                  </button>
                </div>

                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      setEmergencyOpen(false)
                    }
                  >
                    {t.cancel}
                  </button>

                  <button
                    className="primary-button"
                    onClick={handleEmergency}
                  >
                    <RefreshCw size={16} />
                    {t.submitEmergency}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   COMPONENTS
--------------------------------------------------------- */

function NavButton({
  active,
  icon,
  label,
  onClick,
  live,
}) {
  return (
    <button
      className={`nav-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {live && <span className="nav-live-dot" />}
    </button>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  accent,
  status,
}) {
  return (
    <div className={`metric-card ${accent}`}>
      <div className="metric-top">
        <div className="metric-icon">
          {icon}
        </div>

        {status && (
          <div className="metric-status">
            <span className="status-dot" />
            {status}
          </div>
        )}
      </div>

      <div className="metric-label">
        {label}
      </div>

      <div className="metric-value">
        {value}
      </div>

      <div className="metric-detail">
        {detail}
      </div>
    </div>
  );
}

function SituationPanel({
  t,
  form,
  updateForm,
  changeDistrict,
  sourceDistricts,
  sourceTaluks,
  destinationTaluks,
  startVoiceInput,
  stopVoiceInput,
  isListening,
  startAnalysis,
}) {
  return (
    <section className="input-panel panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-icon">
            <Package size={17} />
          </div>

          <div>
            <div className="panel-eyebrow">
              {t.liveSituation}
            </div>

            <h2>
              {t.operationalSituation}
            </h2>
          </div>
        </div>

        <div className="input-live-pill">
          <span className="pulse-dot" />
          LIVE INPUT
        </div>
      </div>

      <div className="section-divider">
        {t.shipmentDetails}
      </div>

      <div className="field-grid">
        <Field
          label={t.shipmentId}
          value={form.shipmentId}
          onChange={(value) =>
            updateForm("shipmentId", value)
        }
        placeholder="CNX-2026-1047"
      />

      <Field
        label={t.vehicleId}
        value={form.vehicleId}
        onChange={(value) =>
          updateForm("vehicleId", value)
        }
        placeholder="TRK-T17"
      />

      <Field
        label={t.product}
        value={form.product}
        onChange={(value) =>
          updateForm("product", value)
        }
        placeholder="Frozen Vegetables"
      />

      <Field
        label={t.quantity}
        value={form.quantity}
        onChange={(value) =>
          updateForm("quantity", value)
        }
        type="number"
        placeholder="2000"
      />

      <Field
        label={t.requiredTemp}
        value={form.requiredTemp}
        onChange={(value) =>
          updateForm("requiredTemp", value)
        }
        type="number"
        suffix="°C"
      />

      <Field
        label={t.currentTemp}
        value={form.currentTemp}
        onChange={(value) =>
          updateForm("currentTemp", value)
        }
        type="number"
        suffix="°C"
      />

      <Field
        label={t.fuel}
        value={form.fuel}
        onChange={(value) =>
          updateForm("fuel", value)
        }
        type="number"
        suffix="%"
      />

      <Field
        label={t.delay}
        value={form.delay}
        onChange={(value) =>
          updateForm("delay", value)
        }
        type="number"
        suffix="hrs"
      />

      <div className="field">
        <label>{t.refrigeration}</label>

        <select
          value={form.refrigeration}
          onChange={(event) =>
            updateForm(
              "refrigeration",
              event.target.value
            )
          }
        >
          <option value="Working">
            {t.working}
          </option>

          <option value="Partially Functional">
            {t.partial}
          </option>

          <option value="Failed">
            {t.failed}
          </option>
        </select>
      </div>
    </div>

      <div className="section-divider route-divider">
        {t.sourceDestination}
      </div>

      <div className="route-form">
        <LocationBlock
          title={t.source}
          district={form.sourceDistrict}
          taluk={form.sourceTaluk}
          location={form.sourceLocation}
          districts={sourceDistricts}
          taluks={sourceTaluks}
          onDistrict={(value) =>
            changeDistrict("source", value)
          }
          onTaluk={(value) =>
            updateForm("sourceTaluk", value)
          }
          onLocation={(value) =>
            updateForm("sourceLocation", value)
          }
          t={t}
        />

        <div className="route-arrow">
          <ArrowRight size={18} />
        </div>

        <LocationBlock
          title={t.destination}
          district={form.destinationDistrict}
          taluk={form.destinationTaluk}
          location={form.destinationLocation}
          districts={sourceDistricts}
          taluks={destinationTaluks}
          onDistrict={(value) =>
            changeDistrict("destination", value)
          }
          onTaluk={(value) =>
            updateForm(
              "destinationTaluk",
              value
            )
          }
          onLocation={(value) =>
            updateForm(
              "destinationLocation",
              value
            )
          }
          t={t}
        />
      </div>

      <div className="section-divider">
        {t.disruption}
      </div>

      <div className="report-box">
        <textarea
          value={form.disruption}
          onChange={(event) =>
            updateForm(
              "disruption",
              event.target.value
            )
          }
          placeholder={t.disruption}
        />

        <div className="voice-bar">
          <div className="voice-language">
            <Globe2 size={14} />
            <span>
              {t.voice} · {languageNameFromText(form)}
            </span>
          </div>

          <button
            className={`voice-btn ${
              isListening ? "listening" : ""
            }`}
            onClick={() =>
              isListening
                ? stopVoiceInput()
                : startVoiceInput("disruption")
            }
          >
            {isListening ? (
              <>
                <Volume2 size={16} />
                {t.stop}
              </>
            ) : (
              <>
                <Mic size={16} />
                {t.voice}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="analysis-launch">
        <div className="launch-copy">
          <div className="launch-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>
              {t.recoveryAnalysis}
            </strong>

            <span>
              The current situation will be assessed
              and recovery alternatives will be compared.
            </span>
          </div>
        </div>

        <button
          className="primary-button analysis-button"
          onClick={startAnalysis}
        >
          {t.analyze}
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

function languageNameFromText() {
  return "selected language";
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  suffix,
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <div className="input-with-suffix">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        {suffix && (
          <span className="input-suffix">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function LocationBlock({
  title,
  district,
  taluk,
  location,
  districts,
  taluks,
  onDistrict,
  onTaluk,
  onLocation,
  t,
}) {
  return (
    <div className="location-block">
      <div className="location-title">
        <MapPin size={16} />
        <strong>{title}</strong>
      </div>

      <div className="location-fields">
        <div className="field">
          <label>{t.district}</label>

          <select
            value={district}
            onChange={(event) =>
              onDistrict(event.target.value)
            }
          >
            {districts.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>{t.taluk}</label>

          <select
            value={taluk}
            onChange={(event) =>
              onTaluk(event.target.value)
            }
          >
            {taluks.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field full-field">
          <label>{t.location}</label>

          <input
            value={location}
            onChange={(event) =>
              onLocation(event.target.value)
            }
            placeholder={t.enterLocation}
          />
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel({
  t,
  stages,
  analysisStep,
  analyzing,
}) {
  return (
    <section className="analysis-page">
      <div className="analysis-hero panel">
        <div className="analysis-orb">
          <div className="analysis-orb-inner">
            <Sparkles size={28} />
          </div>
        </div>

        <div>
          <div className="panel-eyebrow">
            {t.recoveryAnalysis}
          </div>

          <h2>
            {analyzing
              ? t.analyzing
              : t.verified}
          </h2>

          <p>
            The situation is being evaluated step by
            step so the final recovery action is based
            on the current operational conditions.
          </p>
        </div>
      </div>

      <div className="analysis-stage-grid">
        {stages.map((stage, index) => {
          const completed =
            index < analysisStep;
          const active =
            index === analysisStep;

          return (
            <div
              key={stage}
              className={`analysis-stage ${
                completed ? "completed" : ""
              } ${active ? "active" : ""}`}
            >
              <div className="stage-number">
                {completed ? (
                  <Check size={14} />
                ) : (
                  index + 1
                )}
              </div>

              <div>
                <strong>{stage}</strong>

                <span>
                  {completed
                    ? "Completed"
                    : active
                    ? "In progress"
                    : "Waiting"}
                </span>
              </div>

              {active && (
                <div className="stage-loader" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WelcomeCard({ t, onStart }) {
  return (
    <div className="welcome-card">
      <div className="welcome-graphic">
        <div className="radar-circle radar-one" />
        <div className="radar-circle radar-two" />
        <div className="radar-circle radar-three" />

        <div className="radar-core">
          <Sparkles size={26} />
        </div>
      </div>

      <div className="welcome-copy">
        <div className="welcome-kicker">
          <Zap size={14} />
          {t.ready}
        </div>

        <h2>
          {t.enterSituation}
          <span>.</span>
        </h2>

        <p>
          {t.noPlanText}
        </p>

        <button
          className="primary-button"
          onClick={onStart}
        >
          {t.enterSituation}
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

function Overview({
  t,
  form,
  decision,
  selectedWarehouse,
  setSelectedWarehouse,
  currentWarehouse,
  routeCenter,
  routeCoordinates,
  temperatureRisk,
  navigate,
}) {
  const options = [
    {
      key: "continue",
      icon: <Route size={16} />,
      title: t.continueRoute,
      detail: "Suitable when current conditions remain stable.",
    },
    {
      key: "reroute",
      icon: <RefreshCw size={16} />,
      title: t.reroute,
      detail: "Reduce exposure caused by delay or route disruption.",
    },
    {
      key: "transfer",
      icon: <Truck size={16} />,
      title: t.transfer,
      detail: "Move the shipment to a controlled vehicle.",
    },
    {
      key: "coldStorage",
      icon: <Warehouse size={16} />,
      title: t.coldStorage,
      detail: "Temporarily protect the shipment in controlled storage.",
    },
  ];

  return (
    <div className="dashboard-grid">
      {/* RECOVERY */}
      <section className="panel recovery-panel">
        <PanelHeader
          eyebrow={t.recovery}
          title={t.currentStrategy}
          icon={<Sparkles size={17} />}
          action={
            <span className="verified-pill">
              <Check size={13} />
              {t.verified}
            </span>
          }
        />

        <div className="recovery-main">
          <div className="recovery-icon">
            <Target size={25} />
          </div>

          <div>
            <div className="recommendation-label">
              {t.currentStrategy}
            </div>

            <h3>
              {decision?.title ||
                t.noPlan}
            </h3>

            <p>
              {form.sourceDistrict} →{" "}
              {form.destinationDistrict}
            </p>
          </div>
        </div>

        <div className="reason-grid">
          <Reason
            label={t.temperatureStatus}
            value={temperatureRisk}
          />

          <Reason
            label={t.capacity}
            value={`${currentWarehouse.capacity}% available`}
          />

          <Reason
            label={t.routeFeasible}
            value="Yes"
          />

          <Reason
            label={t.delayImpact}
            value={
              Number(form.delay) > 5
                ? "High"
                : "Acceptable"
            }
          />
        </div>

        <div className="decision-note">
          <ShieldCheck size={17} />

          <div>
            <strong>{t.why}</strong>

            <span>
              {decision?.reason ||
                t.noPlanText}
            </span>
          </div>
        </div>
      </section>

      {/* STATE */}
      <section className="panel state-panel">
        <PanelHeader
          eyebrow={t.currentState}
          title={t.operationalState}
          icon={<Activity size={17} />}
        />

        <div className="state-list">
          <StateRow
            icon={<Truck size={14} />}
            label={t.vehicleId}
            value={form.vehicleId}
          />

          <StateRow
            icon={<Package size={14} />}
            label={t.product}
            value={form.product}
          />

          <StateRow
            icon={<Thermometer size={14} />}
            label={t.temperature}
            value={`${form.currentTemp}°C`}
            warning={
              temperatureRisk === "Critical"
            }
          />

          <StateRow
            icon={<Clock3 size={14} />}
            label={t.delay}
            value={`${form.delay} hrs`}
            warning={Number(form.delay) > 5}
          />

          <StateRow
            icon={<Truck size={14} />}
            label={t.fuel}
            value={`${form.fuel}%`}
          />
        </div>

        <div className="temperature-meter">
          <div className="meter-header">
            <span>
              {t.temperatureStatus}
            </span>

            <strong>
              {temperatureRisk}
            </strong>
          </div>

          <div className="meter-track">
            <div
              className="meter-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    12,
                    ((Number(form.currentTemp) +
                      30) /
                      20) *
                      100
                  )
                )}%`,
              }}
            />
          </div>

          <div className="meter-labels">
            <span>-30°C</span>
            <span>{form.requiredTemp}°C</span>
            <span>0°C</span>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="panel map-panel">
        <PanelHeader
          eyebrow={t.map}
          title={t.route}
          icon={<MapPin size={17} />}
          action={
            <span className="route-status">
              <span className="green-dot" />
              {t.routeFeasible}
            </span>
          }
        />

        <div className="map-wrapper">
          <MapContainer
            center={routeCenter}
            zoom={8}
            scrollWheelZoom={false}
            className="map-container"
          >
            <MapCenter center={routeCenter} />

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#38bdf8",
                weight: 5,
                opacity: 0.85,
              }}
            />

            <CircleMarker
              center={routeCoordinates[0]}
              radius={9}
              pathOptions={{
                color: "#38bdf8",
                fillColor: "#38bdf8",
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                {t.source}: {form.sourceDistrict}
              </Popup>
            </CircleMarker>

            <CircleMarker
              center={
                routeCoordinates[
                  routeCoordinates.length - 1
                ]
              }
              radius={9}
              pathOptions={{
                color: "#4ade80",
                fillColor: "#4ade80",
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                {t.destination}:{" "}
                {form.destinationDistrict}
              </Popup>
            </CircleMarker>
          </MapContainer>

          <div className="map-floating-card">
            <div className="map-floating-icon">
              <Route size={15} />
            </div>

            <div>
              <strong>
                {form.sourceDistrict} →{" "}
                {form.destinationDistrict}
              </strong>

              <span>
                {form.sourceTaluk} →{" "}
                {form.destinationTaluk}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* OPTIONS */}
      <section className="panel alternatives-panel">
        <PanelHeader
          eyebrow={t.alternatives}
          title={t.recovery}
          icon={<Route size={17} />}
        />

        <div className="alternative-list">
          {options.map((option) => {
            const selected =
              decision?.key === option.key;

            return (
              <div
                className={`alternative ${
                  selected ? "selected" : ""
                }`}
                key={option.key}
              >
                <div className="alternative-icon">
                  {option.icon}
                </div>

                <div className="alternative-copy">
                  <strong>
                    {option.title}
                  </strong>

                  <span>
                    {option.detail}
                  </span>
                </div>

                {selected && (
                  <div className="chosen-check">
                    <Check size={13} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FACILITIES */}
      <section className="panel alternatives-panel">
        <PanelHeader
          eyebrow={t.destination}
          title="Recovery facilities"
          icon={<Warehouse size={17} />}
        />

        <div className="facility-list">
          {[
            "A",
            "B",
            "C",
          ].map((id) => {
            const warehouse =
              warehouses.find(
                (item) => item.id === id
              );

            const selected =
              selectedWarehouse === id;

            return (
              <button
                key={id}
                className={`facility ${
                  selected ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedWarehouse(id)
                }
              >
                <div className="facility-icon">
                  <Warehouse size={16} />
                </div>

                <div>
                  <strong>
                    {warehouse.name}
                  </strong>

                  <span>
                    {warehouse.city} ·{" "}
                    {warehouse.distance} km
                  </span>
                </div>

                <div className="facility-capacity">
                  {warehouse.capacity}%
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SIMULATOR */}
      <section className="panel simulation-preview">
        <PanelHeader
          eyebrow={t.simulation}
          title={t.scenario}
          icon={<BarChart3 size={17} />}
        />

        <div className="mini-chart">
          <div className="chart-line">
            <span style={{ height: "34%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "41%" }} />
            <span style={{ height: "68%" }} />
            <span style={{ height: "57%" }} />
            <span style={{ height: "76%" }} />
            <span style={{ height: "62%" }} />
            <span style={{ height: "84%" }} />
          </div>
        </div>

        <button
          className="secondary-button wide-button"
          onClick={() => navigate("simulation")}
        >
          {t.runScenario}
          <ArrowRight size={15} />
        </button>
      </section>

      {/* TIMELINE */}
      <section className="panel timeline-panel">
        <PanelHeader
          eyebrow={t.decisionTimeline}
          title={t.history}
          icon={<Clock3 size={17} />}
        />

        <div className="timeline">
          <TimelineItem
            time="Now"
            title={t.verified}
            detail={decision?.title}
            active
          />

          <TimelineItem
            time="Previous"
            title="Situation assessed"
            detail={`${form.currentTemp}°C · ${form.delay} hrs`}
          />

          <TimelineItem
            time="Initial"
            title="Operational situation received"
            detail={`${form.sourceDistrict} → ${form.destinationDistrict}`}
          />
        </div>
      </section>
    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
  icon,
  action,
}) {
  return (
    <div className="panel-header">
      <div className="panel-title-group">
        <div className="panel-icon">
          {icon}
        </div>

        <div>
          <div className="panel-eyebrow">
            {eyebrow}
          </div>

          <h2>{title}</h2>
        </div>
      </div>

      {action}
    </div>
  );
}

function Reason({ label, value }) {
  return (
    <div className="reason-item">
      <span>{label}</span>
      <strong>
        <Check size={12} />
        {value}
      </strong>
    </div>
  );
}

function StateRow({
  icon,
  label,
  value,
  warning,
}) {
  return (
    <div className="state-row">
      <div className="state-row-left">
        <span className="state-row-icon">
          {icon}
        </span>

        {label}
      </div>

      <strong
        className={
          warning ? "warning-text" : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function TimelineItem({
  time,
  title,
  detail,
  active,
}) {
  return (
    <div className="timeline-item">
      <div
        className={`timeline-dot ${
          active ? "active" : ""
        }`}
      />

      <div className="timeline-content">
        <div className="timeline-top">
          <strong>{title}</strong>
          <span>{time}</span>
        </div>

        <p>{detail}</p>
      </div>
    </div>
  );
}

function SimulationPanel({
  t,
  form,
  simulationTemp,
  simulationDelay,
  setSimulationTemp,
  setSimulationDelay,
  simulationRunning,
  simulationResult,
  runSimulation,
}) {
  return (
    <section className="simulation-page">
      <div className="simulation-hero panel">
        <div className="simulation-icon">
          <BarChart3 size={25} />
        </div>

        <div>
          <div className="panel-eyebrow">
            {t.simulation}
          </div>

          <h2>{t.scenario}</h2>

          <p>
            Adjust the operating conditions and observe
            how the recovery exposure changes.
          </p>
        </div>
      </div>

      <div className="simulation-grid">
        <section className="panel simulator-panel">
          <PanelHeader
            eyebrow={t.currentState}
            title="Change the situation"
            icon={<SlidersIcon />}
          />

          <div className="slider-block">
            <div className="slider-label">
              <span>{t.currentTemp}</span>
              <strong>
                {simulationTemp}°C
              </strong>
            </div>

            <input
              type="range"
              min="-25"
              max="5"
              value={simulationTemp}
              onChange={(event) =>
                setSimulationTemp(
                  Number(event.target.value)
                )
              }
            />
          </div>

          <div className="slider-block">
            <div className="slider-label">
              <span>{t.delay}</span>
              <strong>
                {simulationDelay} hrs
              </strong>
            </div>

            <input
              type="range"
              min="0"
              max="12"
              value={simulationDelay}
              onChange={(event) =>
                setSimulationDelay(
                  Number(event.target.value)
                )
              }
            />
          </div>

          <div className="simulation-current">
            <div>
              <span>{t.temperature}</span>
              <strong>
                {simulationTemp}°C
              </strong>
            </div>

            <div>
              <span>{t.delay}</span>
              <strong>
                {simulationDelay} hrs
              </strong>
            </div>
          </div>

          <button
            className="primary-button wide-button"
            onClick={runSimulation}
            disabled={simulationRunning}
          >
            {simulationRunning ? (
              <>
                <RefreshCw
                  size={16}
                  className="spin"
                />
                {t.running}
              </>
            ) : (
              <>
                <Play size={16} />
                {t.runScenario}
              </>
            )}
          </button>

          {simulationResult && (
            <div
              className={`scenario-result ${
                simulationResult.status ===
                "Lower exposure"
                  ? "safe"
                  : "danger"
              }`}
            >
              {simulationResult.status ===
              "Lower exposure" ? (
                <CheckCircle2 size={20} />
              ) : (
                <XCircle size={20} />
              )}

              <div>
                <strong>
                  {simulationResult.status}
                </strong>

                <span>
                  {simulationResult.message}
                </span>
              </div>
            </div>
          )}
        </section>

        <section className="panel scenario-panel">
          <PanelHeader
            eyebrow={t.simulationResult}
            title={t.operationalRisk}
            icon={<Gauge size={17} />}
          />

          <div className="risk-visual">
            <div
              className="risk-ring"
              style={{
                "--risk":
                  simulationTemp >
                    Number(form.requiredTemp) +
                      8 ||
                  simulationDelay > 6
                    ? "78%"
                    : "36%",
              }}
            >
              <div>
                <strong>
                  {simulationTemp >
                    Number(form.requiredTemp) +
                      8 ||
                  simulationDelay > 6
                    ? "78"
                    : "36"}
                </strong>
                <span>%</span>
              </div>
            </div>
          </div>

          <div className="risk-details">
            <div>
              <span>
                {t.temperatureStatus}
              </span>

              <strong>
                {simulationTemp <=
                Number(form.requiredTemp)
                  ? t.controlled
                  : simulationTemp <=
                    Number(form.requiredTemp) +
                      6
                  ? t.elevated
                  : t.critical}
              </strong>
            </div>

            <div>
              <span>{t.delayImpact}</span>

              <strong>
                {simulationDelay <= 3
                  ? "Low"
                  : simulationDelay <= 5
                  ? "Moderate"
                  : "High"}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function SlidersIcon() {
  return <Activity size={17} />;
}

function HistoryPanel({ t, history }) {
  return (
    <section className="history-page">
      <div className="history-hero panel">
        <div className="simulation-icon">
          <Clock3 size={25} />
        </div>

        <div>
          <div className="panel-eyebrow">
            {t.history}
          </div>

          <h2>{t.historyTitle}</h2>

          <p>
            Previous recovery decisions and operational
            updates are shown here.
          </p>
        </div>
      </div>

      <div className="panel history-list">
        {history.length === 0 ? (
          <div className="empty-history">
            <Clock3 size={28} />
            <strong>
              No recovery decisions yet
            </strong>
            <span>
              Complete a situation analysis to create
              the first decision record.
            </span>
          </div>
        ) : (
          history.map((item, index) => (
            <div
              className="history-item"
              key={`${item.time}-${index}`}
            >
              <div className="history-icon">
                <Check size={16} />
              </div>

              <div>
                <strong>
                  {item.decision}
                </strong>

                <span>{item.reason}</span>
              </div>

              <time>{item.time}</time>
            </div>
          ))
        )}
      </div>
    </section>
  );
}