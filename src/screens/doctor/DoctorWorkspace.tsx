import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowLeft,
  FileText,
  Home,
  Hospital,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react-native";
import {
  acknowledgeEmergencyAlert,
  getEmergencyAlerts,
  getSharedReports,
} from "../../api/maternaAPI";
import { createAndShareProfileReport } from "../../utils/profileReport";

type DoctorView = "home" | "patients" | "reports" | "profile";
type RiskLevel = "Critical" | "High" | "Moderate" | "Stable";

interface Props {
  theme: "dark" | "light";
  onLogout: () => void;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  week: number;
  county: string;
  phone: string;
  email: string;
  emergencyContact: string;
  risk: RiskLevel;
  riskColor: string;
  factor: string;
  vitals: {
    heartRate: number;
    oxygen: number;
    temperature: number;
    respiration: number;
    bloodPressure: string;
  };
}

const PATIENTS: Patient[] = [
  {
    id: "patient_001",
    name: "Maya Johnson",
    age: 28,
    week: 28,
    county: "Desha",
    phone: "870-555-0142",
    email: "maya.johnson@example.com",
    emergencyContact: "John Johnson, 870-555-0108",
    risk: "Stable",
    riskColor: "#22C55E",
    factor: "No risk factors detected",
    vitals: {
      heartRate: 77,
      oxygen: 99,
      temperature: 98.4,
      respiration: 15,
      bloodPressure: "115/74",
    },
  },
  {
    id: "patient_002",
    name: "Maria Gonzalez",
    age: 32,
    week: 34,
    county: "Jefferson",
    phone: "870-555-0194",
    email: "maria.gonzalez@example.com",
    emergencyContact: "Luis Gonzalez, 870-555-0170",
    risk: "Critical",
    riskColor: "#e11d48",
    factor: "Severe hypertension and low oxygen",
    vitals: {
      heartRate: 119,
      oxygen: 92,
      temperature: 100.2,
      respiration: 22,
      bloodPressure: "163/109",
    },
  },
  {
    id: "patient_003",
    name: "Tanya Williams",
    age: 25,
    week: 22,
    county: "Phillips",
    phone: "870-555-0127",
    email: "tanya.williams@example.com",
    emergencyContact: "Denise Williams, 870-555-0188",
    risk: "High",
    riskColor: "#d97706",
    factor: "Early hypertension pattern",
    vitals: {
      heartRate: 92,
      oxygen: 96,
      temperature: 99.1,
      respiration: 18,
      bloodPressure: "139/90",
    },
  },
];

const DEMO_REPORTS = PATIENTS.map((patient, index) => {
  const highRisk = patient.risk === "Critical" || patient.risk === "High";
  const receivedAt = new Date(Date.now() - (index + 1) * 45 * 60 * 1000);

  return {
    id: `demo-report-${patient.id}`,
    patient_id: patient.id,
    demo: true,
    received_at: receivedAt.toISOString(),
    profile: {
      fullName: patient.name,
      dateOfBirth:
        patient.id === "patient_001"
          ? "04/18/1998"
          : patient.id === "patient_002"
          ? "09/07/1993"
          : "02/14/2001",
      county: patient.county,
      age: String(patient.age),
      weightLbs:
        patient.id === "patient_001"
          ? "148"
          : patient.id === "patient_002"
          ? "162"
          : "139",
      heightFt: "5",
      heightIn:
        patient.id === "patient_001"
          ? "4"
          : patient.id === "patient_002"
          ? "5"
          : "6",
      pregnancyWeek: String(patient.week),
      pregnancyWeekRecordedAt: receivedAt.toISOString(),
      previousPregnancies:
        patient.id === "patient_001"
          ? "1"
          : patient.id === "patient_002"
          ? "2"
          : "0",
      medications:
        patient.id === "patient_002"
          ? "Labetalol and prenatal vitamin"
          : "Prenatal vitamin",
      emergencyContact: patient.emergencyContact,
      preferredHospital:
        patient.id === "patient_001"
          ? "Delta Memorial Hospital"
          : "Jefferson Regional Medical Center",
      hasMiscarriage: patient.id === "patient_002",
      hasHighBP: highRisk,
      hasDiabetes: patient.id === "patient_002",
      hasAnemia: patient.id === "patient_003",
      hasCSection: patient.id === "patient_002",
      shareWithDoctor: true,
      updatedAt: receivedAt.toISOString(),
    },
    bracelet: {
      connected: true,
      battery: 78 - index * 8,
      lastSynced: `${index + 1} min ago`,
    },
    vitals: {
      heartRate: {
        title: "Heart rate",
        value: String(patient.vitals.heartRate),
        unit: "bpm",
        status: highRisk ? "danger" : "normal",
      },
      hrv: {
        title: "HRV",
        value: highRisk ? "28" : "60",
        unit: "ms",
        status: highRisk ? "warning" : "normal",
      },
      bloodPressure: {
        title: "Blood pressure",
        value: patient.vitals.bloodPressure,
        unit: "mmHg",
        status: highRisk ? "danger" : "normal",
      },
      oxygen: {
        title: "Oxygen SpO2",
        value: String(patient.vitals.oxygen),
        unit: "%",
        status: patient.vitals.oxygen < 95 ? "danger" : "normal",
      },
      skinTemp: {
        title: "Skin temperature",
        value: String(patient.vitals.temperature),
        unit: "F",
        status: patient.vitals.temperature >= 100 ? "warning" : "normal",
      },
      respiration: {
        title: "Respiration",
        value: String(patient.vitals.respiration),
        unit: "/min",
        status: patient.vitals.respiration > 20 ? "warning" : "normal",
      },
    },
    risk: {
      level:
        patient.risk === "Critical"
          ? "Red"
          : patient.risk === "High"
          ? "Yellow"
          : "Green",
      message:
        patient.risk === "Critical"
          ? "Urgent"
          : patient.risk === "High"
          ? "Needs review"
          : "All clear",
      confidence: highRisk ? "94%" : "97%",
      color: patient.riskColor,
      headline: highRisk
        ? "Clinical review recommended."
        : "Vitals remain within the expected range.",
      description: patient.factor,
      pattern: highRisk ? patient.factor : null,
      action: highRisk
        ? "Contact patient and review current readings"
        : "Continue routine monitoring",
    },
    earlyRiskAssessment: {
      level: highRisk ? "High" : "Routine",
      color: patient.riskColor,
      reasons: highRisk ? [patient.factor] : [],
      assessedAt: receivedAt.toISOString(),
      disclaimer:
        "Early review flag based on patient-entered profile and bracelet signals. It is not a diagnosis.",
    },
    chatSignals: [],
  };
});

function mergeReports(liveReports: any[]) {
  const livePatientIds = new Set(
    liveReports.map((report) => report.patient_id)
  );
  return [
    ...liveReports,
    ...DEMO_REPORTS.filter(
      (report) => !livePatientIds.has(report.patient_id)
    ),
  ];
}

export default function DoctorWorkspace({ theme, onLogout }: Props) {
  const dark = theme === "dark";
  const c = dark ? colors.dark : colors.light;
  const [view, setView] = useState<DoctorView>("home");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<any[]>(DEMO_REPORTS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const announcedAlertIds = React.useRef<Set<string>>(new Set());
  const acknowledgedAlertIds = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (selectedPatient) {
          setSelectedPatient(null);
          setView("patients");
          return true;
        }

        if (view !== "home") {
          setView("home");
          return true;
        }

        onLogout();
        return true;
      }
    );

    return () => subscription.remove();
  }, [onLogout, selectedPatient, view]);

  useEffect(() => {
    async function refreshReports() {
      const next = await getSharedReports();
      if (Array.isArray(next)) {
        setReports(mergeReports(next));
      }
    }
    refreshReports();
    const interval = setInterval(refreshReports, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function refreshEmergencyAlerts() {
      const next = await getEmergencyAlerts();
      if (!Array.isArray(next)) return;

      const visibleAlerts = next.filter(
        (item) => !acknowledgedAlertIds.current.has(item.id)
      );
      setEmergencyAlerts(visibleAlerts);
      const newest = visibleAlerts.find(
        (item) => !announcedAlertIds.current.has(item.id)
      );
      if (newest) {
        announcedAlertIds.current.add(newest.id);
        Alert.alert(
          "EMERGENCY ALERT",
          `${newest.patient_name} activated emergency response.\n${newest.location || "Location unavailable"}`,
          [
            { text: "View dashboard", onPress: () => setView("home") },
            {
              text: "Acknowledge",
              onPress: () => handleAcknowledgeEmergency(newest.id),
            },
          ]
        );
      }
    }

    refreshEmergencyAlerts();
    const interval = setInterval(refreshEmergencyAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  async function handleAcknowledgeEmergency(alertId: string) {
    acknowledgedAlertIds.current.add(alertId);
    setEmergencyAlerts((current) =>
      current.filter((item) => item.id !== alertId)
    );
    await acknowledgeEmergencyAlert(alertId);
  }

  const filteredPatients = useMemo(
    () =>
      PATIENTS.map((patient) => {
        const report = reports.find((item) => item.patient_id === patient.id);
        const assessment = report?.earlyRiskAssessment;
        if (!assessment || assessment.level === "Routine") return patient;
        return {
          ...patient,
          risk: assessment.level === "High" ? "High" : "Moderate",
          riskColor: assessment.color,
          factor:
            assessment.reasons?.join(" · ") ||
            "Patient profile or Materna chat requires review",
        } as Patient;
      }).filter((patient) =>
        patient.name.toLowerCase().includes(search.toLowerCase())
      ),
    [reports, search]
  );

  const dashboardPatients = useMemo(
    () =>
      PATIENTS.map((patient) => {
        const report = reports.find((item) => item.patient_id === patient.id);
        const assessment = report?.earlyRiskAssessment;
        if (!assessment || assessment.level === "Routine") return patient;
        return {
          ...patient,
          risk: assessment.level === "High" ? "High" : "Moderate",
          riskColor: assessment.color,
          factor:
            assessment.reasons?.join(" · ") ||
            "Patient profile or Materna chat requires review",
        } as Patient;
      }),
    [reports]
  );

  function openPatient(patient: Patient) {
    setSelectedPatient(patient);
    setView("patients");
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <DoctorHeader c={c} onLogout={onLogout} />

      {emergencyAlerts.map((emergency) => (
        <View key={emergency.id} style={styles.liveEmergency}>
          <View style={{ flex: 1 }}>
            <Text style={styles.liveEmergencyLabel}>EMERGENCY ACTIVATED</Text>
            <Text style={styles.liveEmergencyName}>
              {emergency.patient_name}
              {emergency.pregnancy_week
                ? ` · Week ${emergency.pregnancy_week}`
                : ""}
            </Text>
            <Text style={styles.liveEmergencyMeta}>
              {emergency.location || "Location unavailable"} ·{" "}
              {emergency.created_at
                ? new Date(emergency.created_at).toLocaleTimeString()
                : "Just now"}
            </Text>
          </View>
          <Pressable
            style={styles.acknowledgeButton}
            onPress={() => handleAcknowledgeEmergency(emergency.id)}
          >
            <Text style={styles.acknowledgeText}>Acknowledge</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.content}>
        {selectedPatient ? (
          <PatientDetail
            patient={selectedPatient}
            report={reports.find((item) => item.patient_id === selectedPatient.id)}
            c={c}
            onBack={() => setSelectedPatient(null)}
          />
        ) : view === "home" ? (
          <HomeView patients={dashboardPatients} reports={reports} c={c} openPatient={openPatient} />
        ) : view === "patients" ? (
          <PatientsView
            patients={filteredPatients}
            search={search}
            setSearch={setSearch}
            c={c}
            openPatient={openPatient}
          />
        ) : view === "reports" ? (
          <ReportsView reports={reports} c={c} />
        ) : (
          <DoctorProfileView c={c} />
        )}
      </View>

      {!selectedPatient && (
        <DoctorBottomNav view={view} setView={setView} c={c} />
      )}
    </SafeAreaView>
  );
}

function DoctorHeader({ c, onLogout }: { c: any; onLogout: () => void }) {
  return (
    <View style={[styles.header, { borderBottomColor: c.border }]}>
      <View>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={[styles.brand, { color: c.text }]}>MATERNA</Text>
          <Text style={styles.portalBadge}>Doctor</Text>
        </View>
        <Text style={[styles.doctorName, { color: c.text }]}>Dr. Aisha Patel</Text>
        <Text style={[styles.doctorMeta, { color: c.muted }]}>
          OB-GYN · Delta Memorial Hospital
        </Text>
      </View>
      <Pressable style={[styles.logout, { borderColor: c.border }]} onPress={onLogout}>
        <Text style={[styles.logoutText, { color: c.muted }]}>Logout</Text>
      </Pressable>
    </View>
  );
}

function HomeView({
  patients,
  reports,
  c,
  openPatient,
}: {
  patients: Patient[];
  reports: any[];
  c: any;
  openPatient: (patient: Patient) => void;
}) {
  const critical = patients.filter(
    (patient) => patient.risk === "Critical" || patient.risk === "High"
  );
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={[styles.pageTitle, { color: c.text }]}>Clinical overview</Text>
      <Text style={[styles.pageSubtitle, { color: c.muted }]}>
        Live priorities and recently shared information
      </Text>

      <View style={styles.statRow}>
        <Stat label="Patients" value={patients.length} color="#6c63ff" c={c} />
        <Stat label="Critical" value={critical.length} color="#e11d48" c={c} />
        <Stat label="Reports" value={reports.length} color="#22C55E" c={c} />
      </View>

      {critical.map((patient) => (
        <Pressable
          key={patient.id}
          style={styles.alertCard}
          onPress={() => openPatient(patient)}
        >
          <Text style={styles.alertLabel}>
            {patient.risk === "Critical" ? "URGENT REVIEW" : "HIGH-RISK REVIEW"}
          </Text>
          <Text style={styles.alertTitle}>{patient.name}</Text>
          <Text style={styles.alertBody}>
            {patient.factor} · BP {patient.vitals.bloodPressure} · SpO2 {patient.vitals.oxygen}%
          </Text>
        </Pressable>
      ))}

      <SectionTitle title="Priority patients" c={c} />
      {patients.slice(0, 3).map((patient) => (
        <PatientRow key={patient.id} patient={patient} c={c} onPress={() => openPatient(patient)} />
      ))}

      <SectionTitle title="Recent reports" c={c} />
      {reports.length === 0 ? (
        <EmptyState text="No patient reports received yet." c={c} />
      ) : (
        reports.slice(0, 3).map((report) => (
          <ReportRow key={report.id} report={report} c={c} />
        ))
      )}
    </ScrollView>
  );
}

function PatientsView({
  patients,
  search,
  setSearch,
  c,
  openPatient,
}: {
  patients: Patient[];
  search: string;
  setSearch: (value: string) => void;
  c: any;
  openPatient: (patient: Patient) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={[styles.pageTitle, { color: c.text }]}>Patients</Text>
      <Text style={[styles.pageSubtitle, { color: c.muted }]}>
        Contact details, pregnancy status, vitals, and reports
      </Text>
      <TextInput
        style={[styles.search, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        value={search}
        onChangeText={setSearch}
        placeholder="Search patients"
        placeholderTextColor={c.muted}
      />
      {patients.map((patient) => (
        <PatientRow key={patient.id} patient={patient} c={c} onPress={() => openPatient(patient)} />
      ))}
    </ScrollView>
  );
}

function ReportsView({ reports, c }: { reports: any[]; c: any }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={[styles.pageTitle, { color: c.text }]}>Report history</Text>
      <Text style={[styles.pageSubtitle, { color: c.muted }]}>
        Patient-approved profiles and bracelet snapshots
      </Text>
      {reports.length === 0 ? (
        <EmptyState text="Reports will appear here after patients share them." c={c} />
      ) : (
        reports.map((report) => <ReportRow key={report.id} report={report} c={c} expanded />)
      )}
    </ScrollView>
  );
}

function PatientDetail({
  patient,
  report,
  c,
  onBack,
}: {
  patient: Patient;
  report: any;
  c: any;
  onBack: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Pressable style={styles.backRow} onPress={onBack}>
        <ArrowLeft size={18} color={c.purple} />
        <Text style={[styles.backText, { color: c.purple }]}>Patients</Text>
      </Pressable>

      <View style={styles.patientDetailHeader}>
        <View style={[styles.largeAvatar, { borderColor: patient.riskColor }]}>
          <Text style={[styles.largeAvatarText, { color: patient.riskColor }]}>
            {patient.name.split(" ").map((part) => part[0]).join("")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.detailName, { color: c.text }]}>{patient.name}</Text>
          <Text style={[styles.detailMeta, { color: c.muted }]}>
            Age {patient.age} · Week {patient.week} · {patient.county} County
          </Text>
        </View>
        <Text style={[styles.riskText, { color: patient.riskColor }]}>{patient.risk}</Text>
      </View>

      <View style={styles.quickActions}>
        <QuickAction icon={Phone} label="Call" color="#22C55E" onPress={() => Linking.openURL(`tel:${patient.phone.replace(/\D/g, "")}`)} />
        <QuickAction icon={MessageCircle} label="Message" color="#6c63ff" onPress={() => Linking.openURL(`sms:${patient.phone.replace(/\D/g, "")}`)} />
        <QuickAction icon={Mail} label="Email" color="#d97706" onPress={() => Linking.openURL(`mailto:${patient.email}`)} />
      </View>

      <InfoSection title="Contact information" c={c}>
        <InfoLine icon={UserRound} label="Date of birth" value={report?.profile?.dateOfBirth || "Not provided"} c={c} />
        <InfoLine icon={Phone} label="Patient phone" value={patient.phone} c={c} />
        <InfoLine icon={Mail} label="Email" value={patient.email} c={c} />
        <InfoLine icon={UserRound} label="Emergency contact" value={report?.profile?.emergencyContact || patient.emergencyContact} c={c} />
        <InfoLine icon={MapPin} label="Preferred care" value={report?.profile?.preferredHospital || "Not provided"} c={c} />
      </InfoSection>

      <InfoSection title="Current vitals" c={c}>
        <View style={styles.vitalsGrid}>
          {[
            ["Heart rate", `${patient.vitals.heartRate} bpm`],
            ["Blood pressure", patient.vitals.bloodPressure],
            ["Oxygen", `${patient.vitals.oxygen}%`],
            ["Temperature", `${patient.vitals.temperature} F`],
            ["Respiration", `${patient.vitals.respiration}/min`],
          ].map(([label, value]) => (
            <View key={label} style={[styles.vitalBox, { borderColor: c.border }]}>
              <Text style={[styles.vitalValue, { color: c.text }]}>{value}</Text>
              <Text style={[styles.vitalLabel, { color: c.muted }]}>{label}</Text>
            </View>
          ))}
        </View>
      </InfoSection>

      <InfoSection title="Risk and pregnancy history" c={c}>
        {report?.earlyRiskAssessment ? (
          <View
            style={[
              styles.riskReview,
              { borderColor: report.earlyRiskAssessment.color || patient.riskColor },
            ]}
          >
            <Text
              style={[
                styles.riskReviewTitle,
                { color: report.earlyRiskAssessment.color || patient.riskColor },
              ]}
            >
              {report.earlyRiskAssessment.level === "High"
                ? "HIGH-RISK REVIEW FLAG"
                : "CLINICAL REVIEW FLAG"}
            </Text>
            {(report.earlyRiskAssessment.reasons || []).map((reason: string) => (
              <Text key={reason} style={[styles.bodyText, { color: c.text }]}>
                • {reason}
              </Text>
            ))}
            <Text style={[styles.riskDisclaimer, { color: c.muted }]}>
              {report.earlyRiskAssessment.disclaimer}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.bodyText, { color: patient.riskColor }]}>{patient.factor}</Text>
        <Text style={[styles.bodyText, { color: c.text }]}>
          Previous pregnancies: {report?.profile?.previousPregnancies || "Not provided"}
        </Text>
        <Text style={[styles.bodyText, { color: c.text }]}>
          Medications: {report?.profile?.medications || "None reported"}
        </Text>
      </InfoSection>

      <InfoSection title="Report history" c={c}>
        {report ? <ReportRow report={report} c={c} expanded /> : <EmptyState text="No report shared by this patient." c={c} />}
      </InfoSection>
    </ScrollView>
  );
}

function DoctorProfileView({ c }: { c: any }) {
  const [editing, setEditing] = useState(false);
  const [doctor, setDoctor] = useState({
    name: "Dr. Aisha Patel",
    age: "38",
    specialty: "Obstetrics and Gynecology",
    hospital: "Delta Memorial Hospital",
    phone: "870-555-0110",
    email: "aisha.patel@deltamemorial.org",
    license: "AR Medical License 27419",
  });

  function field(label: string, key: keyof typeof doctor) {
    return (
      <View style={styles.profileField} key={key}>
        <Text style={[styles.profileLabel, { color: c.muted }]}>{label}</Text>
        {editing ? (
          <TextInput
            style={[styles.profileInput, { borderColor: c.border, color: c.text }]}
            value={doctor[key]}
            onChangeText={(value) => setDoctor((current) => ({ ...current, [key]: value }))}
          />
        ) : (
          <Text style={[styles.profileValue, { color: c.text }]}>{doctor[key]}</Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.profileHeading}>
        <View style={styles.doctorAvatar}>
          <Stethoscope size={28} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: c.text }]}>{doctor.name}</Text>
          <Text style={[styles.pageSubtitle, { color: c.muted }]}>{doctor.specialty}</Text>
        </View>
      </View>
      <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
        {field("Full name", "name")}
        {field("Age", "age")}
        {field("Specialty", "specialty")}
        {field("Hospital", "hospital")}
        {field("Phone", "phone")}
        {field("Email", "email")}
        {field("License", "license")}
      </View>
      <Pressable style={styles.editButton} onPress={() => setEditing((value) => !value)}>
        <Text style={styles.editButtonText}>{editing ? "Save profile" : "Edit profile"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function ReportRow({ report, c, expanded = false }: { report: any; c: any; expanded?: boolean }) {
  async function openPdf() {
    if (!report.profile || !report.vitals || !report.bracelet || !report.risk) return;
    await createAndShareProfileReport(report.profile, {
      bracelet: report.bracelet,
      vitals: report.vitals,
      risk: report.risk,
      mother: {
        name: report.profile.fullName || "Patient",
        pregnancyWeek: Number(report.profile.pregnancyWeek) || 0,
      },
    } as any, report.earlyRiskAssessment);
  }

  return (
    <View style={[styles.reportCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.reportTop}>
        <FileText size={18} color="#22C55E" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.reportName, { color: c.text }]}>
            {report.profile?.fullName || "Patient report"}
          </Text>
          <Text style={[styles.reportTime, { color: c.muted }]}>
            {report.received_at ? new Date(report.received_at).toLocaleString() : "Received"}
          </Text>
        </View>
        <Text style={report.demo ? styles.sampleBadge : styles.liveBadge}>
          {report.demo ? "SAMPLE" : "LIVE"}
        </Text>
      </View>
      {expanded && report.risk && (
        <Text style={[styles.reportSummary, { color: report.risk.color || c.text }]}>
          {report.risk.level} · {report.risk.message}
        </Text>
      )}
      {report.earlyRiskAssessment?.level === "High" && (
        <View style={styles.reportRiskFlag}>
          <Text style={styles.reportRiskFlagText}>HIGH-RISK REVIEW</Text>
          <Text style={styles.reportRiskReason}>
            {(report.earlyRiskAssessment.reasons || []).join(" · ")}
          </Text>
        </View>
      )}
      <Pressable style={[styles.reportButton, { borderColor: c.purple }]} onPress={openPdf}>
        <Text style={[styles.reportButtonText, { color: c.purple }]}>Open PDF summary</Text>
      </Pressable>
    </View>
  );
}

function PatientRow({ patient, c, onPress }: { patient: Patient; c: any; onPress: () => void }) {
  return (
    <Pressable style={[styles.patientCard, { backgroundColor: c.card, borderColor: c.border, borderLeftColor: patient.riskColor }]} onPress={onPress}>
      <View style={[styles.avatar, { borderColor: patient.riskColor }]}>
        <Text style={[styles.avatarText, { color: patient.riskColor }]}>
          {patient.name.split(" ").map((part) => part[0]).join("")}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.patientName, { color: c.text }]}>{patient.name}</Text>
        <Text style={[styles.patientMeta, { color: c.muted }]}>
          Week {patient.week} · {patient.county} County
        </Text>
      </View>
      <Text style={[styles.riskText, { color: patient.riskColor }]}>{patient.risk}</Text>
    </Pressable>
  );
}

function DoctorBottomNav({ view, setView, c }: { view: DoctorView; setView: (view: DoctorView) => void; c: any }) {
  const items = [
    { key: "home" as const, label: "Home", icon: Home },
    { key: "patients" as const, label: "Patients", icon: Users },
    { key: "reports" as const, label: "Reports", icon: FileText },
    { key: "profile" as const, label: "Profile", icon: UserRound },
  ];
  return (
    <View style={[styles.bottomNav, { backgroundColor: c.card, borderTopColor: c.border }]}>
      {items.map((item) => {
        const active = view === item.key;
        const Icon = item.icon;
        return (
          <Pressable key={item.key} style={styles.navItem} onPress={() => setView(item.key)}>
            <Icon size={21} color={active ? c.purple : c.muted} />
            <Text style={[styles.navLabel, { color: active ? c.purple : c.muted }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Stat({ label, value, color, c }: { label: string; value: number; color: string; c: any }) {
  return (
    <View style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, c }: { title: string; c: any }) {
  return <Text style={[styles.sectionTitle, { color: c.text }]}>{title}</Text>;
}

function EmptyState({ text, c }: { text: string; c: any }) {
  return (
    <View style={[styles.empty, { borderColor: c.border }]}>
      <Text style={[styles.emptyText, { color: c.muted }]}>{text}</Text>
    </View>
  );
}

function QuickAction({ icon: Icon, label, color, onPress }: any) {
  return (
    <Pressable style={[styles.quickAction, { borderColor: color }]} onPress={onPress}>
      <Icon size={18} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function InfoSection({ title, c, children }: { title: string; c: any; children: React.ReactNode }) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={[styles.infoTitle, { color: c.purple }]}>{title}</Text>
      {children}
    </View>
  );
}

function InfoLine({ icon: Icon, label, value, c }: any) {
  return (
    <View style={styles.infoLine}>
      <Icon size={16} color={c.muted} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: c.muted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: c.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const colors = {
  dark: {
    background: "#05070A",
    card: "#101418",
    border: "#242B33",
    text: "#F8FAFC",
    muted: "#94A3B8",
    purple: "#6c63ff",
  },
  light: {
    background: "#F8FAFC",
    card: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    muted: "#64748B",
    purple: "#5b52e8",
  },
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  liveEmergency: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#b91c1c", borderBottomColor: "#fb7185", borderBottomWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  liveEmergencyLabel: { color: "#fecdd3", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  liveEmergencyName: { color: "#ffffff", fontSize: 14, fontWeight: "900", marginTop: 2 },
  liveEmergencyMeta: { color: "#fee2e2", fontSize: 10, marginTop: 2 },
  acknowledgeButton: { borderColor: "#ffffff", borderWidth: 1, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 7 },
  acknowledgeText: { color: "#ffffff", fontSize: 9, fontWeight: "900" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
  brand: { fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  portalBadge: { color: "#6c63ff", fontSize: 9, fontWeight: "800" },
  doctorName: { fontSize: 17, fontWeight: "800", marginTop: 5 },
  doctorMeta: { fontSize: 11, marginTop: 2 },
  logout: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7, alignSelf: "center" },
  logoutText: { fontSize: 11, fontWeight: "700" },
  scroll: { padding: 14, paddingBottom: 28 },
  pageTitle: { fontSize: 22, fontWeight: "900" },
  pageSubtitle: { fontSize: 12, marginTop: 3, marginBottom: 16 },
  statRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12 },
  statValue: { fontSize: 24, fontWeight: "900" },
  statLabel: { fontSize: 10, marginTop: 2 },
  alertCard: { backgroundColor: "#35070d", borderColor: "#e11d48", borderWidth: 1, borderRadius: 8, padding: 13, marginTop: 12 },
  alertLabel: { color: "#fb7185", fontSize: 9, fontWeight: "900" },
  alertTitle: { color: "#ffffff", fontSize: 15, fontWeight: "800", marginTop: 4 },
  alertBody: { color: "#fecdd3", fontSize: 11, lineHeight: 16, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginTop: 20, marginBottom: 9 },
  patientCard: { flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderLeftWidth: 4, borderRadius: 8, padding: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 12, fontWeight: "900" },
  patientName: { fontSize: 14, fontWeight: "800" },
  patientMeta: { fontSize: 10, marginTop: 3 },
  riskText: { fontSize: 10, fontWeight: "900" },
  search: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  reportCard: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 9 },
  reportTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  reportName: { fontSize: 13, fontWeight: "800" },
  reportTime: { fontSize: 9, marginTop: 2 },
  liveBadge: { color: "#22C55E", fontSize: 9, fontWeight: "900" },
  sampleBadge: { color: "#d97706", fontSize: 9, fontWeight: "900" },
  reportSummary: { fontSize: 11, fontWeight: "700", marginTop: 10 },
  reportButton: { borderWidth: 1, borderRadius: 7, alignItems: "center", paddingVertical: 8, marginTop: 10 },
  reportButtonText: { fontSize: 10, fontWeight: "800" },
  reportRiskFlag: { marginTop: 9, borderLeftWidth: 3, borderLeftColor: "#e11d48", paddingLeft: 8 },
  reportRiskFlagText: { color: "#e11d48", fontSize: 9, fontWeight: "900" },
  reportRiskReason: { color: "#fb7185", fontSize: 9, lineHeight: 13, marginTop: 3 },
  empty: { borderWidth: 1, borderRadius: 8, padding: 18, alignItems: "center" },
  emptyText: { fontSize: 12, textAlign: "center" },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 15 },
  backText: { fontSize: 12, fontWeight: "800" },
  patientDetailHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  largeAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  largeAvatarText: { fontSize: 16, fontWeight: "900" },
  detailName: { fontSize: 19, fontWeight: "900" },
  detailMeta: { fontSize: 11, marginTop: 3 },
  quickActions: { flexDirection: "row", gap: 8, marginBottom: 12 },
  quickAction: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderRadius: 8, paddingVertical: 9 },
  quickActionText: { fontSize: 10, fontWeight: "800" },
  sectionCard: { borderWidth: 1, borderRadius: 8, padding: 13, marginBottom: 10 },
  infoTitle: { fontSize: 11, fontWeight: "900", textTransform: "uppercase", marginBottom: 9 },
  infoLine: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 },
  infoLabel: { fontSize: 9, textTransform: "uppercase" },
  infoValue: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  vitalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  vitalBox: { width: "31%", borderWidth: 1, borderRadius: 7, padding: 8 },
  vitalValue: { fontSize: 13, fontWeight: "900" },
  vitalLabel: { fontSize: 9, marginTop: 3 },
  bodyText: { fontSize: 12, lineHeight: 18, marginBottom: 5 },
  riskReview: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  riskReviewTitle: { fontSize: 10, fontWeight: "900", marginBottom: 7 },
  riskDisclaimer: { fontSize: 9, lineHeight: 13, marginTop: 5 },
  profileHeading: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  doctorAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#6c63ff", alignItems: "center", justifyContent: "center" },
  profileField: { marginBottom: 13 },
  profileLabel: { fontSize: 9, textTransform: "uppercase", fontWeight: "700" },
  profileValue: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  profileInput: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8, marginTop: 4 },
  editButton: { backgroundColor: "#6c63ff", borderRadius: 8, alignItems: "center", paddingVertical: 12 },
  editButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 30,
    minHeight: 78,
  },
  navItem: { flex: 1, alignItems: "center", gap: 4 },
  navLabel: { fontSize: 9, fontWeight: "700" },
});
