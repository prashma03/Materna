export type RiskLevel = "Green" | "Yellow" | "Red";

export type SensorData = typeof greenScenario;

const greenScenario = {
  bracelet: {
    connected: true,
    battery: 84,
    lastSynced: "2 min ago",
  },
  mother: {
    name: "Maya",
    pregnancyWeek: 28,
  },
  vitals: {
    heartRate: { title: "Heart rate", value: "77", unit: "bpm", status: "normal" },
    hrv: { title: "HRV", value: "60", unit: "ms", status: "normal" },
    bloodPressure: { title: "Blood pressure", value: "115/74", unit: "mmHg", status: "normal" },
    oxygen: { title: "Oxygen SpO₂", value: "99", unit: "%", status: "normal" },
    skinTemp: { title: "Skin temp", value: "98.4", unit: "°F", status: "normal" },
    respiration: { title: "Respiration", value: "15", unit: "/min", status: "normal" },
  },
  risk: {
    level: "Green" as RiskLevel,
    message: "All clear",
    confidence: "97%",
    color: "#22C55E",
    headline: "Everything looks healthy.",
    description: "Materna sees stable vitals in your normal range. Nothing for you to do — keep living your day.",
    pattern: null,
    action: "No action needed",
  },
};

const yellowScenario: SensorData = {
  bracelet: {
    connected: true,
    battery: 84,
    lastSynced: "2 min ago",
  },
  mother: {
    name: "Maya",
    pregnancyWeek: 28,
  },
  vitals: {
    heartRate: { title: "Heart rate", value: "92", unit: "bpm", status: "warning" },
    hrv: { title: "HRV", value: "38", unit: "ms", status: "warning" },
    bloodPressure: { title: "Blood pressure", value: "139/90", unit: "mmHg", status: "warning" },
    oxygen: { title: "Oxygen SpO₂", value: "96", unit: "%", status: "normal" },
    skinTemp: { title: "Skin temp", value: "99.1", unit: "°F", status: "warning" },
    respiration: { title: "Respiration", value: "18", unit: "/min", status: "normal" },
  },
  risk: {
    level: "Yellow" as RiskLevel,
    message: "Heads up",
    confidence: "88%",
    color: "#EAB308",
    headline: "Something's trending the wrong way.",
    description: "Your blood pressure and heart rate have been climbing for several hours — an early preeclampsia pattern. Not an emergency, but worth a check.",
    pattern: "Early hypertension pattern",
    action: "Message your care navigator for a same-day telehealth check-in",
  },
};

const redScenario: SensorData = {
  bracelet: {
    connected: true,
    battery: 84,
    lastSynced: "2 min ago",
  },
  mother: {
    name: "Maya",
    pregnancyWeek: 28,
  },
  vitals: {
    heartRate: { title: "Heart rate", value: "119", unit: "bpm", status: "danger" },
    hrv: { title: "HRV", value: "18", unit: "ms", status: "danger" },
    bloodPressure: { title: "Blood pressure", value: "163/109", unit: "mmHg", status: "danger" },
    oxygen: { title: "Oxygen SpO₂", value: "92", unit: "%", status: "danger" },
    skinTemp: { title: "Skin temp", value: "100.2", unit: "°F", status: "danger" },
    respiration: { title: "Respiration", value: "22", unit: "/min", status: "danger" },
  },
  risk: {
    level: "Red" as RiskLevel,
    message: "Urgent",
    confidence: "95%",
    color: "#EF4444",
    headline: "Get to care now.",
    description: "Severe high blood pressure with falling oxygen — a serious preeclampsia warning. Materna has already alerted your care team and emergency contact.",
    pattern: "Severe hypertension + low oxygen",
    action: "Care team + Maya notified · transport offered to Pine Bluff hub",
  },
};

export const scenarios = {
  Green: greenScenario,
  Yellow: yellowScenario,
  Red: redScenario,
};

// Default export — change "Green" to "Yellow" or "Red" to demo other states
export const sampleSensorData = greenScenario;