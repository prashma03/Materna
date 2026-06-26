const express = require("express");
const cors = require("cors");
const calculateRisk = require("./riskCalculator");

const app = express();

app.use(cors());
app.use(express.json());

const DOCTOR_AUTH = `Basic ${Buffer.from("doctor:maternaai2024").toString("base64")}`;
let sharedReports = [];
let emergencyAlerts = [];

function requireDoctor(req, res, next) {
  if (req.headers.authorization !== DOCTOR_AUTH) {
    return res.status(401).json({
      success: false,
      message: "Doctor authentication required.",
    });
  }
  next();
}

// Store latest patient vitals
let patientVitals = {
  heartRate: 0,
  bloodPressure: "",
  oxygen: 0,
  temperature: 0,
  respiration: 0,
};

// Test route
app.get("/", (_req, res) => {
  res.json({
    status: "Materna Backend Running",
  });
});

// Risk calculator
app.post("/risk", (req, res) => {
  try {
    const patientData = req.body;

    const result = calculateRisk(patientData);

    res.json({
      success: true,
      risk: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Risk calculation failed.",
    });
  }
});

// Update patient vitals
app.post("/vitals", (req, res) => {
  const {
    heartRate,
    bloodPressure,
    oxygen,
    temperature,
    respiration,
  } = req.body;

  patientVitals = {
    heartRate: heartRate || 0,
    bloodPressure: bloodPressure || "",
    oxygen: oxygen || 0,
    temperature: temperature || 0,
    respiration: respiration || 0,
  };

  res.json({
    success: true,
    message: "Vitals updated successfully",
    vitals: patientVitals,
  });
});

// Doctor dashboard gets latest vitals
app.get("/vitals", (_req, res) => {
  res.json({
    success: true,
    vitals: patientVitals,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Patient shares a maternal profile and bracelet snapshot with the linked doctor.
app.post("/reports", (req, res) => {
  const {
    patient_id,
    profile,
    vitals,
    bracelet,
    risk,
    earlyRiskAssessment,
    chatSignals,
  } = req.body;

  if (!patient_id || !profile || profile.shareWithDoctor !== true) {
    return res.status(400).json({
      success: false,
      message: "Patient consent and profile data are required.",
    });
  }

  const report = {
    id: `report-${Date.now()}`,
    patient_id,
    profile,
    vitals: vitals || null,
    bracelet: bracelet || null,
    risk: risk || null,
    earlyRiskAssessment: earlyRiskAssessment || null,
    chatSignals: chatSignals || [],
    received_at: new Date().toISOString(),
  };

  sharedReports = [
    report,
    ...sharedReports.filter((item) => item.patient_id !== patient_id),
  ].slice(0, 50);

  res.status(201).json({ success: true, report });
});

// Doctor dashboard receives newly shared reports.
app.get("/reports", requireDoctor, (_req, res) => {
  res.json({ success: true, reports: sharedReports });
});

// Patient emergency activation is delivered to every linked doctor dashboard.
app.post("/emergency-alerts", (req, res) => {
  const {
    patient_id,
    patient_name,
    pregnancy_week,
    location,
    vitals,
  } = req.body;

  if (!patient_id) {
    return res.status(400).json({
      success: false,
      message: "Patient ID is required.",
    });
  }

  const alert = {
    id: `emergency-${Date.now()}`,
    patient_id,
    patient_name: patient_name || "Materna patient",
    pregnancy_week: pregnancy_week || null,
    location: location || "Location unavailable",
    vitals: vitals || null,
    status: "active",
    created_at: new Date().toISOString(),
    acknowledged_at: null,
  };

  emergencyAlerts = [alert, ...emergencyAlerts].slice(0, 50);
  res.status(201).json({ success: true, alert });
});

app.get("/emergency-alerts", requireDoctor, (_req, res) => {
  res.json({
    success: true,
    alerts: emergencyAlerts.filter((alert) => alert.status === "active"),
  });
});

app.post(
  "/emergency-alerts/:alertId/acknowledge",
  requireDoctor,
  (req, res) => {
    const alert = emergencyAlerts.find(
      (item) => item.id === req.params.alertId
    );
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Emergency alert not found.",
      });
    }

    alert.status = "acknowledged";
    alert.acknowledged_at = new Date().toISOString();
    res.json({ success: true, alert });
  }
);
