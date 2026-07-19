const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const calculateRisk = require("./riskCalculator");

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (key && process.env[key] === undefined) {
        process.env[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Environment loading is best-effort; explicit process env still wins.
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));

const app = express();
const router = express.Router();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataFile =
  process.env.MATERNA_DATA_FILE ||
  (isServerless
    ? path.join(os.tmpdir(), "materna-store.json")
    : path.join(__dirname, "data", "materna-store.json"));

const doctorUser = process.env.MATERNA_DOCTOR_USER || "doctor";
const doctorPassword = process.env.MATERNA_DOCTOR_PASSWORD || "";

const defaultState = {
  patients: {
    patient_001: {
      id: "patient_001",
      name: "Maya Johnson",
      pregnancy_week: 28,
      risk_level: "Stable",
      last_seen_at: null,
    },
  },
  readings: {},
  conversations: {},
  doctorSessions: {},
  sharedReports: [],
  emergencyAlerts: [],
  latestVitals: {
    heartRate: 0,
    bloodPressure: "",
    oxygen: 0,
    temperature: 0,
    respiration: 0,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    if (!fs.existsSync(dataFile)) return clone(defaultState);
    return { ...clone(defaultState), ...JSON.parse(fs.readFileSync(dataFile, "utf8")) };
  } catch {
    return clone(defaultState);
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

function updateState(mutator) {
  const state = loadState();
  const result = mutator(state);
  saveState(state);
  return result;
}

function requireDoctor(req, res, next) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const session = loadState().doctorSessions[token];
  if (!token || !session) {
    return res.status(401).json({
      success: false,
      message: "Doctor authentication required.",
    });
  }
  next();
}

function normalizeVitals(input = {}) {
  return {
    heartRate: Number(input.heartRate ?? input.heart_rate ?? 0),
    bloodPressure: input.bloodPressure || input.blood_pressure || "",
    oxygen: Number(input.oxygen ?? input.spo2 ?? input.spO2 ?? 0),
    temperature: Number(input.temperature ?? 0),
    respiration: Number(input.respiration ?? input.respiratory_rate ?? 0),
    hrv: input.hrv ?? input.hrv_rmssd ?? null,
    gsr: input.gsr ?? null,
    motion: input.motion ?? null,
    fall: Boolean(input.fall ?? input.fall_detected ?? false),
  };
}

function upsertPatient(state, patientId, patientName, pregnancyWeek, riskLevel) {
  const current = state.patients[patientId] || {};
  state.patients[patientId] = {
    id: patientId,
    name: patientName || current.name || "Materna patient",
    pregnancy_week: pregnancyWeek ?? current.pregnancy_week ?? null,
    risk_level: riskLevel || current.risk_level || "Stable",
    last_seen_at: new Date().toISOString(),
  };
  return state.patients[patientId];
}

function careGuideReply(message = "") {
  const lower = message.toLowerCase();
  const urgent = [
    "chest pain",
    "can't breathe",
    "cannot breathe",
    "bleeding",
    "severe headache",
    "blurry",
    "vision",
    "not moving",
  ];

  if (urgent.some((term) => lower.includes(term))) {
    return {
      response:
        "That can be a warning sign in pregnancy. Please contact your provider now, go to the nearest hospital, or call 911 if symptoms feel severe.",
      alert: true,
    };
  }

  if (lower.includes("swelling")) {
    return {
      response:
        "Sudden swelling in the face, hands, or legs can be important during pregnancy. Rest, hydrate, and contact your care team today if it is new, severe, or paired with headache or vision changes.",
      alert: true,
    };
  }

  if (lower.includes("nausea") || lower.includes("vomit")) {
    return {
      response:
        "Nausea can be common in pregnancy. Try small meals and fluids. If you cannot keep liquids down for 24 hours, call your provider.",
      alert: false,
    };
  }

  return {
    response:
      "I can help you think through pregnancy symptoms and next steps. Tell me what you are feeling, when it started, and whether it is getting better or worse.",
    alert: false,
  };
}

app.use(
  cors({
    origin: process.env.MATERNA_ALLOWED_ORIGIN || true,
  })
);
app.use(express.json({ limit: "1mb" }));

router.get("/", (_req, res) => {
  res.json({
    success: true,
    status: "Materna API running",
    storage: isServerless ? "serverless-temp" : "file",
  });
});

router.post("/doctor/session", (req, res) => {
  if (!doctorPassword) {
    return res.status(503).json({
      success: false,
      message: "Doctor authentication is not configured.",
    });
  }

  const username = String(req.body.username || "");
  const password = String(req.body.password || "");

  if (username !== doctorUser || password !== doctorPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid doctor credentials.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const session = {
    token,
    username,
    created_at: new Date().toISOString(),
  };

  updateState((state) => {
    state.doctorSessions[token] = session;
  });

  res.status(201).json({ success: true, session });
});

router.delete("/doctor/session", requireDoctor, (req, res) => {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  updateState((state) => {
    delete state.doctorSessions[token];
  });
  res.json({ success: true });
});

router.post("/risk", (req, res) => {
  try {
    res.json({ success: true, risk: calculateRisk(req.body || {}) });
  } catch {
    res.status(500).json({
      success: false,
      message: "Risk calculation failed.",
    });
  }
});

router.post("/vitals", (req, res) => {
  const vitals = normalizeVitals(req.body);
  updateState((state) => {
    state.latestVitals = vitals;
  });
  res.json({
    success: true,
    message: "Vitals updated successfully.",
    vitals,
  });
});

router.get("/vitals", (_req, res) => {
  res.json({
    success: true,
    vitals: loadState().latestVitals,
  });
});

router.post("/ingest", (req, res) => {
  const patientId = req.body.patient_id;
  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: "Patient ID is required.",
    });
  }

  const reading = {
    id: `reading-${Date.now()}`,
    patient_id: patientId,
    patient_name: req.body.patient_name || "Materna patient",
    gestational_weeks: req.body.gestational_weeks ?? null,
    timestamp: req.body.timestamp || new Date().toISOString(),
    sensors: normalizeVitals(req.body.sensors),
  };

  updateState((state) => {
    upsertPatient(
      state,
      patientId,
      reading.patient_name,
      reading.gestational_weeks,
      reading.sensors.fall ? "Critical" : undefined
    );
    state.latestVitals = reading.sensors;
    state.readings[patientId] = [reading, ...(state.readings[patientId] || [])].slice(0, 500);
  });

  res.status(201).json({ success: true, reading });
});

router.get("/patients", requireDoctor, (_req, res) => {
  const state = loadState();
  res.json({
    success: true,
    patients: Object.values(state.patients),
  });
});

router.get("/history/:patientId", requireDoctor, (req, res) => {
  const hours = Number(req.query.hours || 24);
  const cutoff = Date.now() - Math.max(hours, 1) * 60 * 60 * 1000;
  const readings = (loadState().readings[req.params.patientId] || []).filter((reading) => {
    const timestamp = new Date(reading.timestamp).getTime();
    return Number.isFinite(timestamp) && timestamp >= cutoff;
  });
  res.json({ success: true, readings });
});

router.post("/assist", (req, res) => {
  const patientId = req.body.patient_id || "patient_001";
  const message = String(req.body.message || "");
  const reply = careGuideReply(message);
  const conversation = {
    id: `conversation-${Date.now()}`,
    patient_id: patientId,
    user_message: message,
    response: reply.response,
    alert: reply.alert,
    risk_level: req.body.risk_level || null,
    sensors: req.body.sensors || null,
    timestamp: new Date().toISOString(),
  };

  updateState((state) => {
    upsertPatient(state, patientId, req.body.patient_name, null, reply.alert ? "High" : undefined);
    state.conversations[patientId] = [
      conversation,
      ...(state.conversations[patientId] || []),
    ].slice(0, 100);
  });

  res.status(201).json({ success: true, ...reply, conversation });
});

router.get("/conversations/:patientId", requireDoctor, (req, res) => {
  res.json({
    success: true,
    conversations: loadState().conversations[req.params.patientId] || [],
  });
});

router.post("/reports", (req, res) => {
  const { patient_id, profile } = req.body;
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
    vitals: req.body.vitals || null,
    bracelet: req.body.bracelet || null,
    risk: req.body.risk || null,
    earlyRiskAssessment: req.body.earlyRiskAssessment || null,
    chatSignals: req.body.chatSignals || [],
    received_at: new Date().toISOString(),
  };

  updateState((state) => {
    upsertPatient(
      state,
      patient_id,
      profile.fullName,
      Number(profile.pregnancyWeek) || null,
      report.earlyRiskAssessment?.level || undefined
    );
    state.sharedReports = [
      report,
      ...state.sharedReports.filter((item) => item.patient_id !== patient_id),
    ].slice(0, 50);
  });

  res.status(201).json({ success: true, report });
});

router.get("/reports", requireDoctor, (_req, res) => {
  res.json({ success: true, reports: loadState().sharedReports });
});

router.post("/emergency-alerts", (req, res) => {
  if (!req.body.patient_id) {
    return res.status(400).json({
      success: false,
      message: "Patient ID is required.",
    });
  }

  const alert = {
    id: `emergency-${Date.now()}`,
    patient_id: req.body.patient_id,
    patient_name: req.body.patient_name || "Materna patient",
    pregnancy_week: req.body.pregnancy_week || null,
    location: req.body.location || "Location unavailable",
    vitals: req.body.vitals || null,
    status: "active",
    created_at: new Date().toISOString(),
    acknowledged_at: null,
  };

  updateState((state) => {
    upsertPatient(state, alert.patient_id, alert.patient_name, alert.pregnancy_week, "Critical");
    state.emergencyAlerts = [alert, ...state.emergencyAlerts].slice(0, 50);
  });

  res.status(201).json({ success: true, alert });
});

router.get("/emergency-alerts", requireDoctor, (_req, res) => {
  res.json({
    success: true,
    alerts: loadState().emergencyAlerts.filter((alert) => alert.status === "active"),
  });
});

router.post("/emergency-alerts/:alertId/acknowledge", requireDoctor, (req, res) => {
  let nextAlert = null;
  updateState((state) => {
    const alert = state.emergencyAlerts.find((item) => item.id === req.params.alertId);
    if (!alert) return;
    alert.status = "acknowledged";
    alert.acknowledged_at = new Date().toISOString();
    nextAlert = alert;
  });

  if (!nextAlert) {
    return res.status(404).json({
      success: false,
      message: "Emergency alert not found.",
    });
  }

  res.json({ success: true, alert: nextAlert });
});

app.use("/", router);
app.use("/api", router);

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Materna API running on port ${port}`);
  });
}

module.exports = app;
