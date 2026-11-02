/**
 * CryoNexus AI - Multi-Lingual Humanized Recovery Decision Engine
 * Returns verified, human-centered instructions in English, Hindi, Kannada, Tamil, or Telugu.
 */

const DECISION_TRANSLATIONS = {
  en: {
    transferFailed: {
      title: "Cross-Dock / Transfer Vehicle",
      confidence: "High Priority",
      urgency: "Immediate Action (Within 45 mins)",
      reason: "Refrigeration cooling unit is completely offline. Ambient cabin warming will rapidly spoil cargo. Directing driver to rendezvous with backup refrigerated vehicle TRK-B09.",
      driverInstruction: "Turn on hazard lights. Safely pull over at the nearest toll plaza service bay. Keep cargo doors tightly sealed until the backup reefer truck arrives.",
      hubInstruction: "Prepare Bay 2 with portable temperature logger. Crew standby for rapid pallet transfer.",
      riskLevel: "Critical",
    },
    coldStorage: (tempGap) => ({
      title: "Divert to Emergency Cold Hub",
      confidence: "High Priority",
      urgency: "Immediate Diversion (ETA 25 mins)",
      reason: `Cargo temperature is ${tempGap > 0 ? `+${tempGap}` : tempGap}°C higher than safe target. Continued highway transit risks total spoilage. Divert to Nelamangala Highway Recovery Hub.`,
      driverInstruction: "Take Exit 7 toward Nelamangala Highway Recovery Hub. Dock 4 is pre-notified and expecting your arrival. Safe driver rest lounge available.",
      hubInstruction: "Pre-chill cold bay to -20°C. Station quality control officer for instant core probe sampling upon vehicle dock.",
      riskLevel: "Critical",
    }),
    reroute: (delay) => ({
      title: "Reroute Vehicle via Bypass Corridor",
      confidence: "Recommended",
      urgency: "Action Required (Next Interchange)",
      reason: `Current traffic delay of ${delay} hours significantly exhausts thermal holdover reserves. Diverting through the rural bypass corridor cuts travel time by ~2.8 hours.`,
      driverInstruction: "Switch navigation to the designated State Highway bypass corridor to avoid the major highway jam. Maintain steady reefer throttle.",
      hubInstruction: "Update expected arrival window to +3 hours. Inform receiving clinic / store management.",
      riskLevel: "Elevated",
    }),
    hold: (fuel) => ({
      title: "Hold & Secure Shipment",
      confidence: "Safety Precaution",
      urgency: "Action Required (Within 15 mins)",
      reason: `Fuel reserves (${fuel}%) are dangerously low to sustain both vehicle propulsion and the refrigeration compressor unit. Holding avoids roadside engine stall.`,
      driverInstruction: "Pull into the certified 24/7 service station at Milestone 42. Refuel vehicle while keeping generator running. Do not shut off refrigeration.",
      hubInstruction: "Dispatch fuel confirmation escort if vehicle cannot reach refueling depot within 20 minutes.",
      riskLevel: "Elevated",
    }),
    transferPartial: {
      title: "Cross-Dock / Transfer Vehicle",
      confidence: "Proactive Protection",
      urgency: "Plan Staged (Within 60 mins)",
      reason: "Refrigeration cooling is operating below nominal threshold. Moving cargo to an optimal refrigerated unit prevents compounding thermal stress.",
      driverInstruction: "Coordinate with dispatch. Drive at steady cruising speed to Nelamangala Transfer Point. Dock 2 ready.",
      hubInstruction: "Backup reefer trailer connected to shore power ready for cargo shift.",
      riskLevel: "Elevated",
    },
    continue: {
      title: "Continue Scheduled Route",
      confidence: "High Assurance",
      urgency: "Routine Monitoring",
      reason: "Cargo temperature, fuel capacity, transit timeline, and cooling performance are all within verified safe tolerances.",
      driverInstruction: "Proceed along normal journey itinerary. Next automated temperature check in 30 minutes. Drive safely.",
      hubInstruction: "Receiving dock scheduled for normal arrival window. Automated offloading crew scheduled.",
      riskLevel: "Controlled",
    },
  },

  hi: {
    transferFailed: {
      title: "दूसरे वाहन में कार्गो बदलें",
      confidence: "उच्च प्राथमिकता",
      urgency: "तत्काल कार्रवाई (45 मिनट के भीतर)",
      reason: "रेफ्रिजरेशन कूलिंग यूनिट पूरी तरह बंद हो गई है। केबिन का बढ़ता तापमान माल को तेजी से खराब कर देगा। चालक को बैकअप रेफ्रिजरेटेड वाहन TRK-B09 से मिलने का निर्देश दिया गया है।",
      driverInstruction: "हैजार्ड लाइट चालू करें। निकटतम टोल प्लाजा सर्विस बे पर सुरक्षित रूप से रुकें। जब तक बैकअप ट्रक न पहुंचे, कार्गो के दरवाजे कसकर बंद रखें।",
      hubInstruction: "पोर्टेबल तापमान लॉगर के साथ बे 2 तैयार करें। त्वरित पैलेट स्थानांतरण के लिए कर्मचारी तैयार हैं।",
      riskLevel: "गंभीर",
    },
    coldStorage: (tempGap) => ({
      title: "आपातकालीन कोल्ड स्टोरेज में भेजें",
      confidence: "उच्च प्राथमिकता",
      urgency: "तत्काल मार्ग परिवर्तन (अनुमानित 25 मिनट)",
      reason: `कार्गो का तापमान सुरक्षित लक्ष्य से ${tempGap > 0 ? `+${tempGap}` : tempGap}°C अधिक है। आगे का सफर माल को पूरी तरह नष्ट कर सकता है। नेलमंगला हाईवे रिकवरी हब की ओर मोड़ें।`,
      driverInstruction: "नेलमंगला हाईवे रिकवरी हब के लिए एग्जिट 7 लें। डॉक 4 को पहले से सूचित कर दिया गया है। सुरक्षित चालक विश्राम लाउंज उपलब्ध है।",
      hubInstruction: "कोल्ड बे को -20°C पर पहले से ठंडा करें। वाहन आने पर तत्काल तापमान जांच के लिए गुणवत्ता अधिकारी तैनात करें।",
      riskLevel: "गंभीर",
    }),
    reroute: (delay) => ({
      title: "बाईपास कॉरिडोर के रास्ते वाहन मोड़ें",
      confidence: "अनुशंसित",
      urgency: "कार्रवाई आवश्यक (अगला इंटरचेंज)",
      reason: `${delay} घंटे की वर्तमान देरी थर्मल बैकअप को समाप्त कर रही है। ग्रामीण बाईपास कॉरिडोर से यात्रा समय में लगभग 2.8 घंटे की बचत होगी।`,
      driverInstruction: "हाईवे जाम से बचने के लिए नेविगेशन को निर्धारित स्टेट हाईवे बाईपास पर बदलें। रेफ्रिजरेशन की गति स्थिर रखें।",
      hubInstruction: "आगमन समय को +3 घंटे अपडेट करें। प्राप्तकर्ता अस्पताल या डिपो प्रबंधन को सूचित करें।",
      riskLevel: "बढ़ा हुआ",
    }),
    hold: (fuel) => ({
      title: "शिपमेंट सुरक्षित रोकें",
      confidence: "सुरक्षा सावधानी",
      urgency: "कार्रवाई आवश्यक (15 मिनट के भीतर)",
      reason: `ईंधन का स्तर (${fuel}%) वाहन और कूलिंग कंप्रेसर दोनों को चलाने के लिए खतरनाक रूप से कम है। रोकने से बीच सड़क पर वाहन बंद होने का खतरा टल जाएगा।`,
      driverInstruction: "माइलस्टोन 42 पर प्रमाणित 24/7 पेट्रोल पंप पर रुकें। जनरेटर चालू रखते हुए ईंधन भरवाएं। कूलिंग बंद न करें।",
      hubInstruction: "यदि वाहन 20 मिनट के भीतर रिफ्यूलिंग डिपो तक नहीं पहुंचता है तो बैकअप ईंधन वैन भेजें।",
      riskLevel: "बढ़ा हुआ",
    }),
    transferPartial: {
      title: "दूसरे वाहन में कार्गो बदलें",
      confidence: "सक्रिय सुरक्षा",
      urgency: "योजना तैयार (60 मिनट के भीतर)",
      reason: "रेफ्रिजरेशन कूलिंग सामान्य से कम कार्य कर रही है। माल को सर्वोत्तम वाहन में स्थानांतरित करने से थर्मल तनाव से बचाव होगा।",
      driverInstruction: "डिस्पैच के साथ समन्वय करें। स्थिर गति से नेलमंगला ट्रांसफर पॉइंट की ओर बढ़ें। डॉक 2 तैयार है।",
      hubInstruction: "बैकअप रेफ्रिजरेटेड ट्रेलर बिजली आपूर्ति से जुड़ा तैयार है।",
      riskLevel: "बढ़ा हुआ",
    },
    continue: {
      title: "वर्तमान मार्ग जारी रखें",
      confidence: "पूर्ण आश्वासन",
      urgency: "नियमित निगरानी",
      reason: "कार्गो तापमान, ईंधन स्तर, यात्रा समय और कूलिंग प्रदर्शन सभी सुरक्षित सीमा के भीतर हैं।",
      driverInstruction: "सामान्य यात्रा कार्यक्रम के अनुसार आगे बढ़ें। 30 मिनट में अगला स्वचालित तापमान परीक्षण होगा। सुरक्षित ड्राइव करें।",
      hubInstruction: "प्राप्तकर्ता डॉक सामान्य समय पर तैयार है। अनलोडिंग दल निर्धारित है।",
      riskLevel: "नियंत्रित",
    },
  },

  kn: {
    transferFailed: {
      title: "ಬೇರೆ ವಾಹನಕ್ಕೆ ಸರಕು ವರ್ಗಾಯಿಸಿ",
      confidence: "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ",
      urgency: "ತಕ್ಷಣದ ಕ್ರಮ (45 ನಿಮಿಷಗಳ ಒಳಗೆ)",
      reason: "ರೆಫ್ರಿಜರೇಶನ್ ಕೂಲಿಂಗ್ ಘಟಕ ಸಂಪೂರ್ಣ ಸ್ಥಗಿತಗೊಂಡಿದೆ. ಕ್ಯಾಬಿನ್‌ನ ಬಿಸಿಯಾಗುವಿಕೆಯು ಸರಕನ್ನು ಶೀಘ್ರವಾಗಿ ಹಾಳುಮಾಡುತ್ತದೆ. ಬ್ಯಾಕಪ್ ವಾಹನ TRK-B09 ಜತೆ ಭೇಟಿಯಾಗಲು ಚಾಲಕರಿಗೆ ನಿರ್ದೇಶಿಸಲಾಗಿದೆ.",
      driverInstruction: "ಹಜಾರ್ಡ್ ದೀಪಗಳನ್ನು ಆನ್ ಮಾಡಿ. ಹತ್ತಿರದ ಟೋಲ್ ಪ್ಲಾಜಾ ಸರ್ವಿಸ್ ಬೇಯಲ್ಲಿ ವಾಹನ ನಿಲ್ಲಿಸಿ. ಬ್ಯಾಕಪ್ ವಾಹನ ಬರುವವರೆಗೆ ಸರಕಿನ ಬಾಗಿಲುಗಳನ್ನು ತೆರೆಯಬೇಡಿ.",
      hubInstruction: "ತಾಪಮಾನ ಲಾಗರ್‌ನೊಂದಿಗೆ ಬೇ 2 ಸಿದ್ಧಪಡಿಸಿ. ತ್ವರಿತ ಸರಕು ವರ್ಗಾವಣೆಗೆ ಸಿಬ್ಬಂದಿ ಸನ್ನದ್ಧರಾಗಿದ್ದಾರೆ.",
      riskLevel: "ಗಂಭೀರ",
    },
    coldStorage: (tempGap) => ({
      title: "ತುರ್ತು ಕೋಲ್ಡ್ ಹಬ್‌ಗೆ ಕಳುಹಿಸಿ",
      confidence: "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ",
      urgency: "ತಕ್ಷಣದ ತಿರುವು (ಅಂದಾಜು 25 ನಿಮಿಷ)",
      reason: `ಸರಕಿನ ತಾಪಮಾನವು ಸುರಕ್ಷಿತ ಗುರಿಗಿಂತ ${tempGap > 0 ? `+${tempGap}` : tempGap}°C ಹೆಚ್ಚಾಗಿದೆ. ಮುಂದುವರಿದರೆ ಸರಕು ಸಂಪೂರ್ಣ ಹಾಳಾಗಬಹುದು. ನೆಲಮಂಗಲ ಹೆದ್ದಾರಿ ಕೋಲ್ಡ್ ಹಬ್‌ಗೆ ತಿರುಗಿಸಿ.`,
      driverInstruction: "ನೆಲಮಂಗಲ ಹೆದ್ದಾರಿ ರಿಕವರಿ ಹಬ್‌ಗೆ ಎಕ್ಸಿಟ್ 7 ತೆಗೆದುಕೊಳ್ಳಿ. ಡಾಕ್ 4 ಸಿದ್ಧವಾಗಿದ್ದು ನಿಮ್ಮ ಆಗಮನವನ್ನು ಎದುರುನೋಡುತ್ತಿದೆ. ಚಾಲಕರ ವಿಶ್ರಾಂತಿ ಲಾಂಜ್ ಲಭ್ಯವಿದೆ.",
      hubInstruction: "ಕೋಲ್ಡ್ ಕೊಠಡಿಯನ್ನು -20°C ಗೆ ಮೊದಲೇ ತಂಪಾಗಿಸಿ. ವಾಹನ ತಲುಪಿದ ತಕ್ಷಣ ಮಾದರಿ ತಪಾಸಣೆಗೆ ಗುಣಮಟ್ಟ ನಿಯಂತ್ರಣ ಅಧಿಕಾರಿಯನ್ನು ನಿಯೋಜಿಸಿ.",
      riskLevel: "ಗಂಭೀರ",
    }),
    reroute: (delay) => ({
      title: "ಬೈಪಾಸ್ ಕಾರಿಡಾರ್ ಮೂಲಕ ವಾಹನ ಮಾರ್ಗ ಬದಲಿಸಿ",
      confidence: "ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
      urgency: "ಕ್ರಮ ಅಗತ್ಯವಿದೆ (ಮುಂದಿನ ಇಂಟರ್‌ಚೇಂಜ್)",
      reason: `${delay} ಗಂಟೆಗಳ ಪ್ರಸ್ತುತ ರಸ್ತೆ ವಿಳಂಬವು ತಂಪಿನ ಬ್ಯಾಕಪ್ ರಕ್ಷಣೆಯನ್ನು ತಗ್ಗಿಸುತ್ತಿದೆ. ಗ್ರಾಮೀಣ ಬೈಪಾಸ್ ಮೂಲಕ ಸಂಚರಿಸುವುದರಿಂದ ಸುಮಾರು 2.8 ಗಂಟೆ ಸಮಯ ಉಳಿತಾಯವಾಗಲಿದೆ.`,
      driverInstruction: "ಹೆದ್ದಾರಿ ಜಾಮ್ ತಪ್ಪಿಸಲು ಗೊತ್ತುಪಡಿಸಿದ ರಾಜ್ಯ ಹೆದ್ದಾರಿ ಬೈಪಾಸ್‌ಗೆ ನ್ಯಾವಿಗೇಷನ್ ಬದಲಾಯಿಸಿ. ಸ್ಥಿರ ವೇಗದಲ್ಲಿ ಚಲಿಸಿ.",
      hubInstruction: "ಆಗಮನ ಸಮಯವನ್ನು +3 ಗಂಟೆಗಳಿಗೆ ನವೀಕರಿಸಿ. ಸ್ವೀಕರಿಸುವ ಆಸ್ಪತ್ರೆ ಅಥವಾ ಗೋದಾಮಿಗೆ ಮಾಹಿತಿ ನೀಡಿ.",
      riskLevel: "ಹೆಚ್ಚಿದ ಅಪಾಯ",
    }),
    hold: (fuel) => ({
      title: "ಸರಕನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ತಡೆಹಿಡಿಯಿರಿ",
      confidence: "ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆ",
      urgency: "ಕ್ರಮ ಅಗತ್ಯವಿದೆ (15 ನಿಮಿಷಗಳ ಒಳಗೆ)",
      reason: `ಇಂಧನ ಮಟ್ಟ (${fuel}%) ವಾಹನ ಮತ್ತು ಕೂಲಿಂಗ್ ಕಂಪ್ರೆಸರ್ ಎರಡನ್ನೂ ಚಲಾಯಿಸಲು ಅತ್ಯಂತ ಕಡಿಮೆಯಾಗಿದೆ. ವಾಹನ ನಿಲ್ಲಿಸುವುದರಿಂದ ರಸ್ತೆ ಮಧ್ಯೆ ಎಂಜಿನ್ ಆಫ್ ಆಗುವುದು ತಪ್ಪುತ್ತದೆ.`,
      driverInstruction: "ಮೈಲಿಗಲ್ಲು 42 ರಲ್ಲಿರುವ 24/7 ಇಂಧನ ಕೇಂದ್ರಕ್ಕೆ ವಾಹನ ಚಲಾಯಿಸಿ. ಜನರೇಟರ್ ಆನ್ ಇರಿಸಿ ಇಂಧನ ತುಂಬಿಸಿ. ರೆಫ್ರಿಜರೇಶನ್ ಆಫ್ ಮಾಡಬೇಡಿ.",
      hubInstruction: "ವಾಹನ 20 ನಿಮಿಷಗಳಲ್ಲಿ ತಲುಪದಿದ್ದರೆ ಬ್ಯಾಕಪ್ ಇಂಧನ ವ್ಯಾನ್ ಕಳುಹಿಸಿ.",
      riskLevel: "ಹೆಚ್ಚಿದ ಅಪಾಯ",
    }),
    transferPartial: {
      title: "ಬೇರೆ ವಾಹನಕ್ಕೆ ಸರಕು ವರ್ಗಾಯಿಸಿ",
      confidence: "ಮುನ್ನೆಚ್ಚರಿಕೆ ರಕ್ಷಣೆ",
      urgency: "ಯೋಜನೆ ಸಿದ್ಧವಾಗಿದೆ (60 ನಿಮಿಷಗಳ ಒಳಗೆ)",
      reason: "ರೆಫ್ರಿಜರೇಶನ್ ಕೂಲಿಂಗ್ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಕಡಿಮೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ. ಉತ್ತಮ ವಾಹನಕ್ಕೆ ವರ್ಗಾಯಿಸುವುದರಿಂದ ಸರಕಿನ ಗುಣಮಟ್ಟ ರಕ್ಷಿಸಬಹುದು.",
      driverInstruction: "ರವಾನೆದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ. ನೆಲಮಂಗಲ ವರ್ಗಾವಣೆ ಕೇಂದ್ರಕ್ಕೆ ಸ್ಥಿರ ವೇಗದಲ್ಲಿ ಚಲಿಸಿ. ಡಾಕ್ 2 ಸಿದ್ಧವಾಗಿದೆ.",
      hubInstruction: "ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಹೊಂದಿರುವ ಬ್ಯಾಕಪ್ ವಾಹನ ಸಿದ್ಧವಾಗಿದೆ.",
      riskLevel: "ಹೆಚ್ಚಿದ ಅಪಾಯ",
    },
    continue: {
      title: "ಪ್ರಸ್ತುತ ಮಾರ್ಗ ಮುಂದುವರಿಸಿ",
      confidence: "ಉತ್ತಮ ಭರವಸೆ",
      urgency: "ನಿಯಮಿತ ಮೇಲ್ವಿಚಾರಣೆ",
      reason: "ಸರಕಿನ ತಾಪಮಾನ, ಇಂಧನ ಮಟ್ಟ, ಸಂಚಾರ ಸಮಯ ಮತ್ತು ಕೂಲಿಂಗ್ ಕಾರ್ಯಕ್ಷಮತೆ ಎಲ್ಲವೂ ಸುರಕ್ಷಿತ ಮಿತಿಯಲ್ಲಿವೆ.",
      driverInstruction: "ನಿಗದಿತ ಮಾರ್ಗದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ. 30 ನಿಮಿಷಗಳಲ್ಲಿ ಮುಂದಿನ ಸ್ವಯಂಚಾಲಿತ ತಾಪಮಾನ ತಪಾಸಣೆ ನಡೆಯಲಿದೆ. ಸುರಕ್ಷಿತವಾಗಿ ಚಲಿಸಿ.",
      hubInstruction: "ಸ್ವೀಕರಿಸುವ ಡಾಕ್ ನಿಗದಿತ ಸಮಯಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ. ಸರಕು ಇಳಿಸುವ ಸಿಬ್ಬಂದಿ ಸಿದ್ಧರಾಗಿದ್ದಾರೆ.",
      riskLevel: "ನಿಯಂತ್ರಿತ",
    },
  },

  ta: {
    transferFailed: {
      title: "மாற்று வாகனத்திற்கு மாற்றவும்",
      confidence: "உயர் முன்னுரிமை",
      urgency: "உடனடி நடவடிக்கை (45 நிமிடங்களுக்குள்)",
      reason: "குளிரூட்டும் சாதனம் முற்றிலும் செயலிழந்துள்ளது. வெப்பநிலை உயர்வு சரக்குகளை விரைவாக சேதப்படுத்தும். மாற்று வாகனம் TRK-B09 உடன் இணையுமாறு ஓட்டுநர் அறிவுறுத்தப்படுகிறார்.",
      driverInstruction: "அபாய விளக்குகளை இயக்கவும். அருகிலுள்ள டோல் பிளாசா சேவை பகுதியில் பாதுகாப்பாக நிறுத்தவும். மாற்று வாகனம் வரும் வரை கதவுகளை இறுக்கமாக மூடி வைக்கவும்.",
      hubInstruction: "வெப்பநிலை பதிவு கருவியுடன் தளம் 2 ஐ தயார் செய்யவும். விரைவான மாற்றத்திற்கு பணியாளர்கள் தயார்.",
      riskLevel: "கடுமையானது",
    },
    coldStorage: (tempGap) => ({
      title: "அவசர குளிர் மையத்திற்கு அனுப்பவும்",
      confidence: "உயர் முன்னுரிமை",
      urgency: "உடனடி திருப்பம் (25 நிமிடங்களுக்குள்)",
      reason: `சரக்கின் வெப்பநிலை பாதுகாப்பான அளவை விட ${tempGap > 0 ? `+${tempGap}` : tempGap}°C அதிகமாக உள்ளது. பயணத்தை தொடர்ந்தால் சரக்கு பாழாகும். நெலமங்கலா நெடுஞ்சாலை குளிர் மையத்திற்கு திருப்பிவிடவும்.`,
      driverInstruction: "நெலமங்கலா மையத்திற்கு எக்சிட் 7 வழியே செல்லவும். தளம் 4 உங்களுக்காக முன்பதிவு செய்யப்பட்டுள்ளது. ஓட்டுநர் ஓய்வறை வசதி உள்ளது.",
      hubInstruction: "குளிர் அறையை -20°C வரை முன்கூட்டியே குளிரூட்டவும். வாகனம் வந்தவுடன் ஆய்வு செய்ய அதிகாரியை நியமிக்கவும்.",
      riskLevel: "கடுமையானது",
    }),
    reroute: (delay) => ({
      title: "பைபாஸ் பாதை வழியாக வாகனத்தை மாற்றவும்",
      confidence: "பரிந்துரைக்கப்பட்டது",
      urgency: "நடவடிக்கை தேவை (அடுத்த சந்திப்பு)",
      reason: `${delay} மணி நேர தாமதம் குளிர் சேமிப்பு திறனை குறைக்கிறது. பைபாஸ் பாதையில் செல்வது பயண நேரத்தை சுமார் 2.8 மணி நேரம் குறைக்கும்.`,
      driverInstruction: "நெடுஞ்சாலை நெரிசலை தவிர்க்க மாநில நெடுஞ்சாலை பைபாஸ் பாதைக்கு மாறவும். சீரான வேகத்தை பராமரிக்கவும்.",
      hubInstruction: "வருகை நேரத்தை +3 மணி நேரமாக புதுப்பிக்கவும். மருத்துவமனை அல்லது கிடங்கிற்கு தகவல் தெரிவிக்கவும்.",
      riskLevel: "உயர்ந்த ஆபத்து",
    }),
    hold: (fuel) => ({
      title: "சரக்கை பாதுகாப்பாக நிறுத்தி வைக்கவும்",
      confidence: "பாதுகாப்பு முன்னெச்சரிக்கை",
      urgency: "நடவடிக்கை தேவை (15 நிமிடங்களுக்குள்)",
      reason: `எரிபொருள் அளவு (${fuel}%) வாகனம் மற்றும் குளிரூட்டல் இரண்டிற்கும் ஆபத்தான முறையில் குறைவாக உள்ளது. நிறுத்துவது நடுவழியில் வாகனம் நிற்பதை தவிர்க்கும்.`,
      driverInstruction: "மைல்கல் 42 இல் உள்ள 24/7 பெட்ரோல் நிலையத்தில் பாதுகாப்பாக நிறுத்தவும். ஜெனரேட்டரை இயக்கியவாறு எரிபொருள் நிரப்பவும்.",
      hubInstruction: "வாகனம் 20 நிமிடங்களில் சென்றடையவில்லை என்றால் எரிபொருள் வாகனத்தை அனுப்பவும்.",
      riskLevel: "உயர்ந்த ஆபத்து",
    }),
    transferPartial: {
      title: "மாற்று வாகனத்திற்கு மாற்றவும்",
      confidence: "முன்னெச்சரிக்கை பாதுகாப்பு",
      urgency: "திட்டம் தயார் (60 நிமிடங்களுக்குள்)",
      reason: "குளிரூட்டல் சாதனம் இயல்பை விட குறைவாக செயல்படுகிறது. சரக்கை உகந்த வாகனத்திற்கு மாற்றுவது வெப்ப அழுத்தத்தைத் தடுக்கும்.",
      driverInstruction: "அனுப்புநருடன் ஒருங்கிணைக்கவும். நெலமங்கலா பரிமாற்ற மையத்திற்கு சீரான வேகத்தில் செல்லவும். தளம் 2 தயார்.",
      hubInstruction: "மின்சார இணைப்புடன் கூடிய மாற்று வாகனம் தயார் நிலையில் உள்ளது.",
      riskLevel: "உயர்ந்த ஆபத்து",
    },
    continue: {
      title: "தற்போதைய பாதையை தொடரவும்",
      confidence: "உயர் உறுதி",
      urgency: "வழக்கமான கண்காணிப்பு",
      reason: "வெப்பநிலை, எரிபொருள், பயண நேரம் மற்றும் குளிரூட்டும் செயல்பாடு அனைத்தும் பாதுகாப்பான வரம்பிற்குள் உள்ளன.",
      driverInstruction: "திட்டமிட்ட பாதையில் செல்லவும். 30 நிமிடங்களில் அடுத்த தானியங்கி சோதனை நடைபெறும். பாதுகாப்பாக இயக்கவும்.",
      hubInstruction: "பெறும் தளம் வழக்கமான நேரத்தில் தயாராக உள்ளது. சரக்கு இறக்கும் பணியாளர்கள் தயார்.",
      riskLevel: "கட்டுப்பாட்டில்",
    },
  },

  te: {
    transferFailed: {
      title: "మరో వాహనానికి సరుకు బదిలీ చేయండి",
      confidence: "అత్యధిక ప్రాధాన్యత",
      urgency: "తక్షణ చర్య (45 నిమిషాల్లో)",
      reason: "రిఫ్రిజిరేషన్ కూలింగ్ యూనిట్ పూర్తిగా ఆగిపోయింది. క్యాబిన్ ఉష్ణోగ్రత పెరిగి సరుకు త్వరగా పాడవుతుంది. బ్యాకప్ వాహనం TRK-B09 వద్దకు వెళ్లాలని డ్రైవర్‌ను ఆదేశించారు.",
      driverInstruction: "హజార్డ్ లైట్లు ఆన్ చేయండి. సమీప టోల్ ప్లాజా సర్వీస్ బే వద్ద సురక్షితంగా ఆగండి. బ్యాకప్ వాహనం వచ్చే వరకు తలుపులు తెరవవద్దు.",
      hubInstruction: "పోర్టబుల్ ఉష్ణోగ్రత లాగర్‌తో బే 2 సిద్ధం చేయండి. వేగవంతమైన బదిలీ కోసం సిబ్బంది సిద్ధంగా ఉన్నారు.",
      riskLevel: "తీవ్రమైనది",
    },
    coldStorage: (tempGap) => ({
      title: "అత్యవసర కోల్డ్ హబ్‌కు పంపండి",
      confidence: "అత్యధిక ప్రాధాన్యత",
      urgency: "తక్షణ మళ్లింపు (25 నిమిషాల్లో)",
      reason: `సరుకు ఉష్ణోగ్రత సురక్షిత పరిమితి కంటే ${tempGap > 0 ? `+${tempGap}` : tempGap}°C ఎక్కువగా ఉంది. ప్రయాణం కొనసాగిస్తే మొత్తం సరుకు పాడవుతుంది. నెలమంగల హైవే కోల్డ్ హబ్‌కు మళ్లించండి.`,
      driverInstruction: "నెలమంగల హైవే కోల్డ్ హబ్ కోసం ఎగ్జిట్ 7 తీసుకోండి. డాక్ 4 సిద్ధంగా ఉంది. డ్రైవర్ రెస్ట్ లాంజ్ అందుబాటులో ఉంది.",
      hubInstruction: "కోల్డ్ రూమ్‌ను -20°C వరకు ముందస్తుగా చల్లబరచండి. వాహనం రాగానే తనిఖీకి అధికారిని నియమించండి.",
      riskLevel: "తీవ్రమైనది",
    }),
    reroute: (delay) => ({
      title: "బైపాస్ కారిడార్ ద్వారా రూట్ మార్చండి",
      confidence: "సిఫార్సు చేయబడింది",
      urgency: "చర్య అవసరం (తదుపరి మలుపు)",
      reason: `${delay} గంటల ట్రాఫిక్ ఆలస్యం కూలింగ్ రిజర్వ్‌లను తగ్గిస్తోంది. బైపాస్ కారిడార్ ద్వారా ప్రయాణించడం వల్ల సుమారు 2.8 గంటల సమయం ఆదా అవుతుంది.`,
      driverInstruction: "హైవే జామ్‌ను నివారించడానికి రాష్ట్ర రహదారి బైపాస్‌కు నావిగేషన్ మార్చండి. స్థిరమైన వేగంతో నడపండి.",
      hubInstruction: "రాక సమయాన్ని +3 గంటలకు అప్‌డేట్ చేయండి. ఆసుపత్రి లేదా డిపో యాజమాన్యానికి సమాచారం ఇవ్వండి.",
      riskLevel: "పెరిగిన ప్రమాదం",
    }),
    hold: (fuel) => ({
      title: "షిప్‌మెంట్‌ను సురక్షితంగా నిలిపివేయండి",
      confidence: "భద్రతా ముందస్తు జాగ్రత్త",
      urgency: "చర్య అవసరం (15 నిమిషాల్లో)",
      reason: `ఇంధన స్థాయి (${fuel}%) వాహనం మరియు కూలింగ్ కంప్రెసర్ రెండింటికీ ప్రమాదకరంగా తక్కువగా ఉంది. ఆపడం వల్ల రహదారిపై వాహనం ఆగిపోకుండా నిరోధించవచ్చు.`,
      driverInstruction: "మైలురాయి 42 వద్ద ఉన్న 24/7 పెట్రోల్ పంపు వద్ద సురక్షితంగా ఆపండి. జనరేటర్‌ను నడుపుతూ ఇంధనం నింపండి.",
      hubInstruction: "వాహనం 20 నిమిషాల్లో చేరకపోతే ఇంధన సహాయ వాహనాన్ని పంపండి.",
      riskLevel: "పెరిగిన ప్రమాదం",
    }),
    transferPartial: {
      title: "మరో వాహనానికి సరుకు బదిలీ చేయండి",
      confidence: "ముందస్తు రక్షణ",
      urgency: "ప్రణాళిక సిద్ధం (60 నిమిషాల్లో)",
      reason: "కూలింగ్ యూనిట్ సామర్థ్యం తగ్గింది. సరుకును సరైన వాహనానికి మార్చడం వల్ల నాణ్యత దెబ్బతినకుండా కాపాడవచ్చు.",
      driverInstruction: "డిస్పాచర్‌తో సమన్వయం చేసుకోండి. నెలమంగల బదిలీ కేంద్రానికి స్థిరమైన వేగంతో నడపండి. డాక్ 2 సిద్ధం.",
      hubInstruction: "విద్యుత్ సరఫరాకు అనుసంధానించబడిన బ్యాకప్ వాహనం సిద్ధంగా ఉంది.",
      riskLevel: "పెరిగిన ప్రమాదం",
    },
    continue: {
      title: "ప్రస్తుత మార్గాన్ని కొనసాగించండి",
      confidence: "పూర్తి భరోసా",
      urgency: "సాధారణ పర్యవేక్షణ",
      reason: "ఉష్ణోగ్రత, ఇంధనం, ప్రయాణ సమయం మరియు కూలింగ్ పనితీరు అన్నీ సురక్షిత పరిమితుల్లో ఉన్నాయి.",
      driverInstruction: "షెడ్యూల్ ప్రకారం కొనసాగించండి. 30 నిమిషాల్లో తదుపరి ఆటోమేటెడ్ పరీక్ష ఉంటుంది. సురక్షితంగా నడపండి.",
      hubInstruction: "రిసీవింగ్ డాక్ సాధారణ సమయానికి సిద్ధంగా ఉంది. అన్‌లోడింగ్ సిబ్బంది సిద్ధం.",
      riskLevel: "నియంత్రిత",
    },
  },
};

export function calculateRecovery(form, language = "en") {
  const currentTemp = Number(form.currentTemp);
  const requiredTemp = Number(form.requiredTemp);
  const delay = Number(form.delay);
  const fuel = Number(form.fuel);

  const tempGap = currentTemp - requiredTemp;
  const isFailed =
    form.refrigeration === "Failed" ||
    form.refrigeration === "Complete Unit Failure" ||
    form.refrigeration === "यूनिट पूरी तरह खराब" ||
    form.refrigeration === "ಘಟಕ ಸಂಪೂರ್ಣ ವಿಫಲವಾಗಿದೆ" ||
    form.refrigeration === "சாதனம் பழுதடைந்துள்ளது" ||
    form.refrigeration === "యూనిట్ పూర్తిగా విఫలమైంది";

  const isPartial =
    form.refrigeration === "Partially Functional" ||
    form.refrigeration === "Partially Compromised" ||
    form.refrigeration === "आंशिक रूप से कार्यशील" ||
    form.refrigeration === "ಭಾಗಶಃ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ" ||
    form.refrigeration === "பகுதியளவில் செயல்படுகிறது" ||
    form.refrigeration === "పాక్షికంగా పనిచేస్తోంది";

  const tDict = DECISION_TRANSLATIONS[language] || DECISION_TRANSLATIONS.en;

  // Case 1: Complete Cooling Failure
  if (isFailed) {
    const d = tDict.transferFailed;
    return {
      key: "transfer",
      ...d,
      preservationScore: 92,
    };
  }

  // Case 2: Significant Temperature Rise (>= 8°C above target)
  if (tempGap >= 8) {
    const d = tDict.coldStorage(tempGap);
    return {
      key: "coldStorage",
      ...d,
      preservationScore: 88,
    };
  }

  // Case 3: Prolonged Delay (>= 6 hours)
  if (delay >= 6) {
    const d = tDict.reroute(delay);
    return {
      key: "reroute",
      ...d,
      preservationScore: 94,
    };
  }

  // Case 4: Critical Fuel Depletion (< 20%)
  if (fuel < 20) {
    const d = tDict.hold(fuel);
    return {
      key: "hold",
      ...d,
      preservationScore: 91,
    };
  }

  // Case 5: Partial Refrigeration Degradation
  if (isPartial) {
    const d = tDict.transferPartial;
    return {
      key: "transfer",
      ...d,
      preservationScore: 96,
    };
  }

  // Case 6: Safe & Controlled Condition
  const d = tDict.continue;
  return {
    key: "continue",
    ...d,
    preservationScore: 99,
  };
}
