# ❄️ CryoNexus AI — Intelligent Cold-Chain Care & Recovery Network

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Languages](https://img.shields.io/badge/Languages-5%20Supported-orange.svg)](#-100-multilingual-parity)

> **CryoNexus AI** is an intelligent, human-centered cold-chain monitoring, incident response, and route recovery platform engineered for temperature-sensitive cargo (vaccines, biologics, life-saving pharmaceuticals) across Karnataka logistics corridors.

---

## 📌 Project Overview

When transporting temperature-sensitive medical supplies across highway corridors, unexpected heatwaves, traffic bottlenecks, and compressor failures can spoil millions in vital cargo. **CryoNexus AI** provides real-time situational awareness, multi-variable AI recovery recommendations, dedicated role dashboards, and driver-care communication tools.

---

## ✨ Core Features

### 1. 🔐 Enterprise Role-Based Access Control (RBAC)
* **Separated Sign-In & Sign-Up**: Dedicated access flows for **Operators** and **Administrators**.
* **Permanently Locked Roles**: When an operator registers for a specific role, their account is permanently bound to their verified credentials:
  * **Operations Manager** — Fleet throughput & route planning
  * **Cold-Chain Dispatcher** — Real-time tracking & driver communication
  * **Fleet Safety Officer** — Cold-chain integrity & excursion audits
  * **Warehouse Depot Manager** — Chamber capacities & bay allocations
  * **Quality & Health Auditor** — Compliance ledgers & export manifests
  * **System Administrator** — Executive oversight & state governance *(protected via authorization passcode)*
* **Persistent Sessions**: State persists seamlessly in browser `localStorage` (`cryo_user` and `cryo_users_db`).

---

### 2. 📊 Dedicated Role Dashboards

#### 👤 Operator Dashboard (`UserDashboard`)
* **Personalized Shift Header**: Operator name, role badge, organization, elapsed shift timer, and interactive **Duty Status Toggle** (*Active Duty* 🟢 / *Standby* 🟡).
* **Duty KPIs**: Protected dose tally, cold-chain compliance score (WHO Grade A), average response time, and active corridors supervised.
* **Assigned Payloads Grid**: Live monitoring cards for Karnataka corridors (`COVAXIN-BLR-09`, `INSULIN-HUB-14`, `POLIO-KLB-02`, `RABIES-MNG-07`) with live temperature gauges, battery status, and ETA.
* **1-Click "Inspect & Reroute"**: Instantly loads the payload into the AI decision engine & live route map.
* **Action Shortcuts**: Direct VHF Radio Patch, Issue Digital Compliance Pass, and Export Trip Handover Manifest.
* **Live Driver Telemetry Feed**: Real-time VHF radio check-ins from drivers on NH-48 and NH-75.

#### 🛡️ Admin Command Center (`AdminDashboard`)
* **Executive Fleet Command**: State network health indicator and **"Broadcast Fleet Alert"** trigger.
* **State-Level Telemetry KPIs**: Active Reefer Fleet (24 Trucks), Total Vials in Transit (142,500), Cold Depots Operational (6/6 Hubs, 99.8% SLA), and Unresolved Excursions.
* **Karnataka Cold Storage Hub Telemetry**: Real-time capacity utilization, chilled (4°C) & deep freeze (-22°C) chamber temps, auxiliary generator standby status, and free reefer bays across 6 hubs:
  * **Nelamangala Central Depot (Bengaluru)**
  * **Mysuru Industrial Cold Hub**
  * **Hubballi Junction Depot**
  * **Belagavi Western Depot**
  * **Kalaburagi Northern Hub**
  * **Mangaluru Coastal Cold Hub**
* **Personnel & Access Management**: Searchable and filterable personnel directory with instant account suspension/activation controls.
* **Fleet Safety Governance Policy Editor**: Live calibration sliders for *Max Permissible Temp Drift*, *Critical Battery Alarm %*, and *Max Emergency Depot Detour Radius (km)* with instant deployment.
* **Fleet Incidents & Emergency Center**: Real-time incident logs with resolution actions.
* **Emergency Fleet Broadcast Modal**: Transmits high-priority alerts to all 24 active reefer trucks via simulated VHF/SMS.

---

### 3. 🧠 Multi-Variable AI Recovery Decision Engine
* Analyzes current temperature, ambient temperature, battery state of charge, coolant levels, compressor status, and road disruption severity.
* Categorizes risks (*Controlled*, *Elevated*, *Critical*) and outputs:
  * Primary tactical recovery action
  * Scientific reasoning & preservation score
  * Plain-language driver instruction
  * Receiving depot advance notice

---

### 4. 🗺️ Karnataka Geography & Cascading Mapping
* **Cascading Location Selector**: All 31 Karnataka districts with taluk-level granularity.
* **Interactive Leaflet Route Map**: Visualizes origin, destination, intermediate reefer position, closest cold storage depot, and alternate detour routes.

---

### 5. 🌐 100% Multilingual Parity (5 Languages)
Every element of the interface is translated across all 5 languages with zero missing keys:
* **English (`en`)**
* **हिन्दी (`hi`)** — Hindi
* **ಕನ್ನಡ (`kn`)** — Kannada
* **தமிழ் (`ta`)** — Tamil
* **తెలుగు (`te`)** — Telugu

Includes dynamic language switching, localized decision engine outputs, toasts, and browser Text-to-Speech (TTS) audio narration.

---

### 6. 🤝 Driver Welfare & Accessible Design
* Direct driver contact modal with simulated VHF radio channel patch and turn-by-turn SMS recovery dispatch.
* Voice-to-text emergency reporting via Web Speech API.
* Warm, accessible visual design with **Day Shift** (light) and **Night Dispatch** (dark) theme modes.

---

## 🛠️ Tech Stack

* **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Maps**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
* **Speech Integration**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **State & Persistence**: React Hooks + Browser `localStorage`

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* [Git](https://git-scm.com/)

### Installation & Local Run

```bash
# 1. Clone the repository
git clone https://github.com/<YOUR-USERNAME>/CryoNexus_AI.git
cd CryoNexus_AI

# 2. Navigate to the frontend directory
cd frontend

# 3. Install dependencies
npm install

# 4. Start the local development server
npm run dev
```

Open your browser at `http://localhost:5173` to explore CryoNexus AI.

---

## 👥 Collaborator & Team Workflow

To work effectively with your teammate on GitHub, follow this standard branch workflow:

### 1. Invite Your Teammate
1. Go to your repository on GitHub: `https://github.com/<YOUR-USERNAME>/CryoNexus_AI`.
2. Navigate to **Settings** ➔ **Collaborators** ➔ **Add people**.
3. Enter your teammate's GitHub username or email to send an invite.

### 2. Recommended Branching Strategy
```bash
# Clone the repository (for your teammate)
git clone https://github.com/<YOUR-USERNAME>/CryoNexus_AI.git
cd CryoNexus_AI

# Create a feature branch before making changes
git checkout -b feature/your-feature-name

# Make changes, then stage and commit
git add .
git commit -m "feat: describe your change cleanly"

# Push your feature branch to GitHub
git push -u origin feature/your-feature-name
```
Open a **Pull Request (PR)** on GitHub to review and merge into `main`.

---

## 🔑 Demo Access Profiles

For instant evaluation without filling out registration forms, the following profiles are pre-configured:

| Profile Name | Access Type | Assigned Role | Organization |
| :--- | :--- | :--- | :--- |
| **Dr. Rajeshwar Hegde** | Administrator | State Fleet Director | Karnataka State Cold-Chain Directorate |
| **Karthik Kumar** | Operator | Operations Manager | Karnataka Central Cold Depot |
| **Dr. Priya Rao** | Operator | Fleet Safety Officer | State Immunization Cold-Chain Hub |
| **Ramesh Gowda** | Operator | Cold-Chain Dispatcher | NH-48 Fleet Dispatch Hub |

> 💡 **Admin Sign-Up Passcode**: `CRYO-ADMIN-2026`

---

## 📁 Repository Structure

```text
CryoNexus_AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx    # Executive command center & depot telemetry
│   │   │   ├── UserDashboard.jsx     # Operator shift workspace & assigned payloads
│   │   │   ├── AuthModal.jsx         # User & Admin authentication modal
│   │   │   ├── Header.jsx            # Top navbar, profile status, and language picker
│   │   │   ├── Sidebar.jsx           # Role-gated drawer navigation
│   │   │   ├── Overview.jsx          # Live corridor map & AI decision viewer
│   │   │   ├── SituationPanel.jsx    # Cascade Karnataka district/taluk & sensor inputs
│   │   │   ├── AnalysisPanel.jsx     # AI recovery pipeline progress
│   │   │   ├── SimulationPanel.jsx   # What-if scenario tester
│   │   │   ├── HistoryPanel.jsx      # Audit trail & decision export
│   │   │   ├── EmergencyModal.jsx    # Voice-assisted emergency replanning
│   │   │   ├── DriverCallModal.jsx   # Driver VHF radio & SMS helpline
│   │   │   └── MetricCard.jsx        # Reusable telemetry KPI cards
│   │   ├── data/
│   │   │   ├── karnatakaLocations.js # 31 Karnataka districts & taluks
│   │   │   ├── mockData.js           # Cold depots, presets, initial telemetry
│   │   │   └── translations.js       # Complete 5-language dictionary (324 keys)
│   │   ├── utils/
│   │   │   └── decisionEngine.js     # Multi-variable cold-chain AI logic
│   │   ├── App.jsx                   # Central application state & routing
│   │   ├── App.css
│   │   └── index.css                 # Tailwind utilities & theme tokens
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
