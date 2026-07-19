import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  Hospital,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Settings,
  Stethoscope,
  TrendingUp,
  UserPlus,
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
type DesktopDoctorView =
  | "dashboard"
  | "patients"
  | "reports"
  | "alerts"
  | "appointments"
  | "carePlans"
  | "messages"
  | "analytics"
  | "settings";
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
    id: `record-report-${patient.id}`,
    patient_id: patient.id,
    seededRecord: true,
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

export default function DoctorWorkspace(props: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1000;

  if (isDesktop) {
    return <DesktopDoctorDashboard onLogout={props.onLogout} />;
  }

  return <MobileDoctorWorkspace {...props} />;
}

function MobileDoctorWorkspace({ theme, onLogout }: Props) {
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

function DesktopDoctorDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<DesktopDoctorView>("dashboard");
  const priorityPatients = [
    { ...PATIENTS[0], status: "Stable", detail: "24 weeks - Due in 16 weeks" },
    { ...PATIENTS[1], status: "High Risk", detail: "32 weeks - Hypertension" },
    { ...PATIENTS[2], status: "High Risk", detail: "28 weeks - Diabetes, G2P1" },
  ];
  const highRiskCards = [
    {
      patient: PATIENTS[1],
      meta: "32 weeks pregnant - BP 160/100 - High Risk",
    },
    {
      patient: PATIENTS[2],
      meta: "28 weeks pregnant - BP 150/95 - Gestational Diabetes",
    },
  ];
  const reports = [
    { name: "Maya Johnson", meta: "May 27, 2025 - Ultra Sound" },
    { name: "Maria Gonzalez", meta: "May 26, 2025 - Lab Report" },
  ];
  const schedule = [
    ["09:00 AM", "Maya Johnson", "Routine Check-up"],
    ["10:30 AM", "Maria Gonzalez", "High Risk Follow-up"],
    ["12:00 PM", "Tanya Williams", "Prenatal Consultation"],
    ["02:30 PM", "Sarah Davis", "Routine Check-up"],
    ["04:00 PM", "Follow-up Reviews", "3 patients"],
  ];
  const alerts = [
    {
      icon: AlertTriangle,
      title: "High risk alert",
      body: "Maria Gonzalez's BP reading is critical",
      color: "#EF4444",
      time: "15m ago",
    },
    {
      icon: ClipboardList,
      title: "Lab results",
      body: "2 new lab reports available",
      color: "#F59E0B",
      time: "1h ago",
    },
    {
      icon: Bell,
      title: "Appointment reminder",
      body: "3 follow-ups due tomorrow",
      color: "#8B5CF6",
      time: "2h ago",
    },
  ];
  const navItems = [
    { key: "dashboard" as const, label: "Dashboard", icon: Home },
    { key: "patients" as const, label: "Patients", icon: Users },
    { key: "reports" as const, label: "Reports", icon: FileText },
    { key: "alerts" as const, label: "Alerts", icon: Bell, badge: "6" },
    { key: "appointments" as const, label: "Appointments", icon: CalendarDays },
    { key: "carePlans" as const, label: "Care Plans", icon: ClipboardList },
    { key: "messages" as const, label: "Messages", icon: MessageSquare },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <SafeAreaView style={desktopDoc.safe}>
      <View style={desktopDoc.shell}>
        <View style={desktopDoc.sidebar}>
          <View style={desktopDoc.brandWrap}>
            <View style={desktopDoc.brandMark}>
              <Stethoscope size={38} color="#02070D" strokeWidth={2.4} />
            </View>
            <View>
              <Text style={desktopDoc.brandTitle}>MATERNA</Text>
              <Text style={desktopDoc.brandSubtitle}>
                Maternal health{"\n"}monitoring for rural Arkansas
              </Text>
            </View>
          </View>

          <View style={desktopDoc.navList}>
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.key}
                {...item}
                active={view === item.key}
                onPress={() => setView(item.key)}
              />
            ))}
          </View>

          <View style={desktopDoc.sidebarBottom}>
            <View style={desktopDoc.doctorCard}>
              <View style={desktopDoc.doctorPhoto}>
                <Text style={desktopDoc.doctorPhotoText}>AP</Text>
              </View>
              <View>
                <Text style={desktopDoc.doctorName}>Dr. Aisha Patel</Text>
                <Text style={desktopDoc.doctorRole}>OB-GYN</Text>
              </View>
            </View>
            <Pressable style={desktopDoc.logoutButton} onPress={onLogout}>
              <LogOut size={17} color="#CBD5E1" />
              <Text style={desktopDoc.logoutText}>Log out</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={desktopDoc.mainScroll}
          contentContainerStyle={desktopDoc.mainContent}
          showsVerticalScrollIndicator={false}
        >
          {view === "dashboard" ? (
            <>
              <View style={desktopDoc.mainColumn}>
                <Text style={desktopDoc.greeting}>Good morning, Dr. Aisha</Text>
                <Text style={desktopDoc.subGreeting}>
                  Here's what's happening with your patients today.
                </Text>

                <Text style={desktopDoc.sectionTitle}>Clinical overview</Text>
                <Text style={desktopDoc.sectionSubtitle}>
                  Live updates and key clinical information
                </Text>

                <View style={desktopDoc.statsGrid}>
                  <DesktopStatCard value="3" label="Patients" caption="New today" color="#3B82F6" icon={Activity} />
                  <DesktopStatCard value="2" label="Critical" caption="Requires attention" color="#F43F5E" icon={Activity} />
                  <DesktopStatCard value="3" label="Improving" caption="On track" color="#22C55E" icon={TrendingUp} />
                  <DesktopStatCard value="16" label="Total active" caption="Under your care" color="#8B5CF6" icon={Users} />
                </View>

                {highRiskCards.map(({ patient, meta }) => (
                  <View key={patient.id} style={desktopDoc.highRiskCard}>
                    <View style={desktopDoc.highRiskIcon}>
                      <AlertTriangle size={25} color="#FB7185" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={desktopDoc.highRiskLabel}>HIGH RISK REVIEW</Text>
                      <Text style={desktopDoc.highRiskName}>{patient.name}</Text>
                      <Text style={desktopDoc.highRiskMeta}>{meta}</Text>
                    </View>
                    <Text style={desktopDoc.criticalPill}>CRITICAL</Text>
                    <ChevronRight size={22} color="#CBD5E1" />
                  </View>
                ))}

                <View style={desktopDoc.sectionHeaderRow}>
                  <Text style={desktopDoc.sectionTitle}>Priority patients</Text>
                  <Pressable onPress={() => setView("patients")}>
                    <Text style={desktopDoc.viewAll}>View all</Text>
                  </Pressable>
                </View>
                <View style={desktopDoc.patientList}>
                  {priorityPatients.map((patient) => (
                    <DesktopPatientRow key={patient.id} patient={patient} />
                  ))}
                </View>

                <View style={desktopDoc.sectionHeaderRow}>
                  <Text style={desktopDoc.sectionTitle}>Recent reports</Text>
                  <Pressable onPress={() => setView("reports")}>
                    <Text style={desktopDoc.viewAll}>View all</Text>
                  </Pressable>
                </View>
                <View style={desktopDoc.reportList}>
                  {reports.map((report) => (
                    <DesktopReportRow key={report.name} report={report} />
                  ))}
                </View>
              </View>

              <View style={desktopDoc.rightRail}>
                <View style={desktopDoc.topTools}>
                  <View style={desktopDoc.dateCard}>
                    <CalendarDays size={21} color="#CBD5E1" />
                    <View>
                      <Text style={desktopDoc.dateText}>May 28, 2025</Text>
                      <Text style={desktopDoc.dateSubtext}>Wednesday</Text>
                    </View>
                  </View>
                  <Pressable style={desktopDoc.bellButton} onPress={() => setView("alerts")}>
                    <Bell size={22} color="#CBD5E1" />
                    <Text style={desktopDoc.bellBadge}>6</Text>
                  </Pressable>
                </View>

                <DesktopPanel title="Today's schedule" action="View calendar" onAction={() => setView("appointments")}>
                  {schedule.map(([time, name, type], index) => (
                    <View key={`${time}-${name}`} style={desktopDoc.scheduleRow}>
                      <Text style={desktopDoc.scheduleTime}>{time}</Text>
                      <View style={desktopDoc.scheduleInfo}>
                        <View
                          style={[
                            desktopDoc.scheduleDot,
                            index === 1 && { backgroundColor: "#F43F5E" },
                          ]}
                        />
                        <View>
                          <Text style={desktopDoc.scheduleName}>{name}</Text>
                          <Text style={desktopDoc.scheduleType}>{type}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </DesktopPanel>

                <DesktopPanel title="Alerts & notifications" action="View all" onAction={() => setView("alerts")}>
                  {alerts.map((alert) => (
                    <DesktopAlertRow key={alert.title} alert={alert} />
                  ))}
                </DesktopPanel>

                <DesktopPanel title="Quick actions">
                  <View style={desktopDoc.quickGrid}>
                    <DesktopQuickAction icon={UserPlus} label="Add new patient" color="#22C55E" onPress={() => setView("patients")} />
                    <DesktopQuickAction icon={MessageSquare} label="Send message" color="#8B5CF6" onPress={() => setView("messages")} />
                    <DesktopQuickAction icon={ClipboardList} label="Create care plan" color="#F59E0B" onPress={() => setView("carePlans")} />
                    <DesktopQuickAction icon={FileText} label="Generate report" color="#3B82F6" onPress={() => setView("reports")} />
                  </View>
                </DesktopPanel>
              </View>
            </>
          ) : (
            <DesktopDoctorSection
              view={view}
              patients={priorityPatients}
              reports={reports}
              alerts={alerts}
              schedule={schedule}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DesktopNavItem({ label, icon: Icon, active, badge, onPress }: any) {
  return (
    <Pressable style={[desktopDoc.navItem, active && desktopDoc.navItemActive]} onPress={onPress}>
      <Icon size={22} color={active ? "#8B5CF6" : "#CBD5E1"} />
      <Text style={[desktopDoc.navText, active && desktopDoc.navTextActive]}>{label}</Text>
      {badge ? <Text style={desktopDoc.navBadge}>{badge}</Text> : null}
    </Pressable>
  );
}

function DesktopStatCard({ value, label, caption, color, icon: Icon }: any) {
  return (
    <View style={[desktopDoc.statCard, { borderColor: `${color}55` }]}>
      <View>
        <Text style={[desktopDoc.statValue, { color }]}>{value}</Text>
        <Text style={desktopDoc.statLabel}>{label}</Text>
        <Text style={desktopDoc.statCaption}>{caption}</Text>
      </View>
      <Icon size={26} color={`${color}AA`} />
    </View>
  );
}

function DesktopPatientRow({ patient }: any) {
  const isStable = patient.status === "Stable";
  const color = isStable ? "#22C55E" : patient.name.includes("Maria") ? "#F43F5E" : "#F59E0B";
  return (
    <View style={[desktopDoc.desktopPatientRow, { borderLeftColor: color }]}>
      <View style={[desktopDoc.desktopAvatar, { borderColor: color }]}>
        <Text style={[desktopDoc.desktopAvatarText, { color }]}>
          {patient.name.split(" ").map((part: string) => part[0]).join("")}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={desktopDoc.desktopPatientName}>{patient.name}</Text>
        <Text style={desktopDoc.desktopPatientMeta}>{patient.detail}</Text>
      </View>
      <Text style={[desktopDoc.desktopPatientStatus, { color }]}>{patient.status}</Text>
      <ChevronRight size={22} color="#CBD5E1" />
    </View>
  );
}

function DesktopReportRow({ report }: any) {
  return (
    <View style={desktopDoc.desktopReportRow}>
      <View style={desktopDoc.reportIcon}>
        <FileText size={22} color="#22C55E" />
      </View>
      <View style={{ flex: 1 }}>
        <View style={desktopDoc.reportTopLine}>
          <View>
            <Text style={desktopDoc.desktopReportName}>{report.name}</Text>
            <Text style={desktopDoc.desktopReportMeta}>{report.meta}</Text>
          </View>
          <Text style={desktopDoc.sampleBadge}>RECORD</Text>
        </View>
        <Pressable style={desktopDoc.desktopReportButton}>
          <FileText size={14} color="#8B5CF6" />
          <Text style={desktopDoc.desktopReportButtonText}>Open PDF summary</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DesktopPanel({ title, action, onAction, children }: any) {
  return (
    <View style={desktopDoc.panel}>
      <View style={desktopDoc.panelHeader}>
        <Text style={desktopDoc.panelTitle}>{title}</Text>
        {action ? (
          <Pressable onPress={onAction}>
            <Text style={desktopDoc.panelAction}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function DesktopAlertRow({ alert }: any) {
  const Icon = alert.icon;
  return (
    <View style={desktopDoc.alertRow}>
      <View style={[desktopDoc.alertIcon, { backgroundColor: `${alert.color}22` }]}>
        <Icon size={20} color={alert.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={desktopDoc.alertTitle}>{alert.title}</Text>
        <Text style={desktopDoc.alertBody}>{alert.body}</Text>
      </View>
      <Text style={desktopDoc.alertTime}>{alert.time}</Text>
      <ChevronRight size={18} color="#64748B" />
    </View>
  );
}

function DesktopQuickAction({ icon: Icon, label, color, onPress }: any) {
  return (
    <Pressable style={desktopDoc.quickAction} onPress={onPress}>
      <Icon size={31} color={color} />
      <Text style={desktopDoc.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function DesktopDoctorSection({ view, patients, reports, alerts, schedule }: any) {
  const config = {
    patients: {
      title: "Patients",
      subtitle: "Contact details, pregnancy status, and active risk flags.",
      icon: Users,
      color: "#22C55E",
    },
    reports: {
      title: "Reports",
      subtitle: "Shared profile reports, labs, and visit summaries.",
      icon: FileText,
      color: "#3B82F6",
    },
    alerts: {
      title: "Alerts",
      subtitle: "Clinical notifications that need timely review.",
      icon: Bell,
      color: "#F43F5E",
    },
    appointments: {
      title: "Appointments",
      subtitle: "Today's clinic schedule and follow-up queue.",
      icon: CalendarDays,
      color: "#8B5CF6",
    },
    carePlans: {
      title: "Care Plans",
      subtitle: "Active patient plans and follow-up tasks.",
      icon: ClipboardList,
      color: "#F59E0B",
    },
    messages: {
      title: "Messages",
      subtitle: "Patient and care-team conversations.",
      icon: MessageSquare,
      color: "#8B5CF6",
    },
    analytics: {
      title: "Analytics",
      subtitle: "Panel trends and outcome signals across your patients.",
      icon: BarChart3,
      color: "#22C55E",
    },
    settings: {
      title: "Settings",
      subtitle: "Clinic profile, notifications, and access preferences.",
      icon: Settings,
      color: "#CBD5E1",
    },
  }[view as Exclude<DesktopDoctorView, "dashboard">];
  const Icon = config.icon;

  return (
    <View style={desktopDoc.contentPage}>
      <View style={desktopDoc.pageHero}>
        <View style={[desktopDoc.pageHeroIcon, { borderColor: `${config.color}66` }]}>
          <Icon size={30} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={desktopDoc.pageTitle}>{config.title}</Text>
          <Text style={desktopDoc.pageSubtitle}>{config.subtitle}</Text>
        </View>
      </View>

      {view === "patients" && (
        <>
          <View style={desktopDoc.pageGrid}>
            <DesktopStatCard value="16" label="Total active" caption="Under your care" color="#8B5CF6" icon={Users} />
            <DesktopStatCard value="2" label="High risk" caption="Needs attention" color="#F43F5E" icon={AlertTriangle} />
            <DesktopStatCard value="3" label="Improving" caption="On track" color="#22C55E" icon={TrendingUp} />
          </View>
          <View style={desktopDoc.pagePanel}>
            {patients.map((patient: any) => (
              <DesktopPatientRow key={patient.id} patient={patient} />
            ))}
          </View>
        </>
      )}

      {view === "reports" && (
        <View style={desktopDoc.pagePanel}>
          {reports.map((report: any) => (
            <DesktopReportRow key={report.name} report={report} />
          ))}
        </View>
      )}

      {view === "alerts" && (
        <View style={desktopDoc.pagePanel}>
          <View style={desktopDoc.reviewBanner}>
            <AlertTriangle size={24} color="#FB7185" />
            <View style={{ flex: 1 }}>
              <Text style={desktopDoc.reviewTitle}>2 critical reviews open</Text>
              <Text style={desktopDoc.reviewBody}>Maria Gonzalez and Tanya Williams need same-day clinical follow-up.</Text>
            </View>
          </View>
          {alerts.map((alert: any) => (
            <DesktopAlertRow key={alert.title} alert={alert} />
          ))}
        </View>
      )}

      {view === "appointments" && (
        <View style={desktopDoc.pagePanel}>
          {schedule.map(([time, name, type]: string[], index: number) => (
            <View key={`${time}-${name}`} style={desktopDoc.scheduleRow}>
              <Text style={desktopDoc.scheduleTime}>{time}</Text>
              <View style={desktopDoc.scheduleInfo}>
                <View style={[desktopDoc.scheduleDot, index === 1 && { backgroundColor: "#F43F5E" }]} />
                <View>
                  <Text style={desktopDoc.scheduleName}>{name}</Text>
                  <Text style={desktopDoc.scheduleType}>{type}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {view === "carePlans" && (
        <View style={desktopDoc.pageGrid}>
          {[
            ["Review BP plan", "Maria Gonzalez needs a hypertension follow-up before end of day.", "#F43F5E"],
            ["Update glucose checks", "Tanya Williams has a diabetes care-plan review due this week.", "#F59E0B"],
            ["Confirm routine plan", "Maya Johnson remains stable with standard prenatal guidance.", "#22C55E"],
          ].map(([title, body, color]) => (
            <View key={title} style={[desktopDoc.pageCard, { borderColor: `${color}66` }]}>
              <ClipboardList size={24} color={color} />
              <Text style={desktopDoc.pageCardTitle}>{title}</Text>
              <Text style={desktopDoc.pageCardBody}>{body}</Text>
            </View>
          ))}
        </View>
      )}

      {view === "messages" && (
        <View style={desktopDoc.pagePanel}>
          {[
            ["Maya Johnson", "Question about prenatal vitamins", "8m ago"],
            ["Care coordinator", "Transportation follow-up for Friday", "42m ago"],
            ["Maria Gonzalez", "Home BP reading uploaded", "1h ago"],
          ].map(([name, body, time]) => (
            <View key={name} style={desktopDoc.messageRow}>
              <View style={desktopDoc.messageAvatar}><Mail size={19} color="#A78BFA" /></View>
              <View style={{ flex: 1 }}>
                <Text style={desktopDoc.messageName}>{name}</Text>
                <Text style={desktopDoc.messageBody}>{body}</Text>
              </View>
              <Text style={desktopDoc.alertTime}>{time}</Text>
              <ChevronRight size={18} color="#64748B" />
            </View>
          ))}
        </View>
      )}

      {view === "analytics" && (
        <View style={desktopDoc.pageGrid}>
          {[
            ["On-track patients", "87%", "#22C55E", "Most patients are following their care plan."],
            ["High-risk follow-ups", "2", "#F43F5E", "Same-day reviews currently open."],
            ["Reports this week", "5", "#3B82F6", "Shared summaries received from patients."],
          ].map(([title, value, color, body]) => (
            <View key={title} style={desktopDoc.pageCard}>
              <Text style={[desktopDoc.analyticsValue, { color }]}>{value}</Text>
              <Text style={desktopDoc.pageCardTitle}>{title}</Text>
              <Text style={desktopDoc.pageCardBody}>{body}</Text>
              <View style={desktopDoc.chartBar}>
                <View style={[desktopDoc.chartFill, { backgroundColor: color, width: value === "87%" ? "87%" : value === "5" ? "55%" : "35%" }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      {view === "settings" && (
        <View style={desktopDoc.pagePanel}>
          {[
            ["Notification preferences", "Manage alert severity and reminder timing"],
            ["Clinic profile", "Delta Memorial Hospital, OB-GYN care team"],
            ["Team access", "Invite nurses and care coordinators"],
            ["Report sharing", "Control patient report and PDF permissions"],
          ].map(([title, body]) => (
            <View key={title} style={desktopDoc.settingsRow}>
              <Settings size={21} color="#CBD5E1" />
              <View style={{ flex: 1 }}>
                <Text style={desktopDoc.messageName}>{title}</Text>
                <Text style={desktopDoc.messageBody}>{body}</Text>
              </View>
              <ChevronRight size={18} color="#64748B" />
            </View>
          ))}
        </View>
      )}
    </View>
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
        <Text style={report.seededRecord ? styles.sampleBadge : styles.liveBadge}>
          {report.seededRecord ? "RECORD" : "LIVE"}
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

const desktopDoc = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#02070D" },
  shell: { flex: 1, flexDirection: "row", backgroundColor: "#02070D" },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: "#1F2937",
    paddingHorizontal: 18,
    paddingVertical: 26,
    backgroundColor: "#050A12",
  },
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 34 },
  brandMark: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17B66A",
  },
  brandTitle: { color: "#F8FAFC", fontSize: 26, fontWeight: "900", letterSpacing: 0 },
  brandSubtitle: { color: "#CBD5E1", fontSize: 12, lineHeight: 18, marginTop: 8 },
  navList: { gap: 8, flex: 1 },
  navItem: {
    minHeight: 52,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  navItemActive: { backgroundColor: "#19163A" },
  navText: { color: "#CBD5E1", fontSize: 16, fontWeight: "600", flex: 1 },
  navTextActive: { color: "#F8FAFC" },
  navBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F43F5E",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    overflow: "hidden",
  },
  sidebarBottom: { gap: 8 },
  doctorCard: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: "#071019",
  },
  doctorPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },
  doctorPhotoText: { color: "#0F172A", fontSize: 15, fontWeight: "900" },
  doctorName: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  doctorRole: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  logoutButton: {
    height: 42,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutText: { color: "#CBD5E1", fontSize: 13, fontWeight: "700" },
  mainScroll: { flex: 1 },
  mainContent: {
    flexGrow: 1,
    flexDirection: "row",
    gap: 34,
    paddingHorizontal: 34,
    paddingTop: 28,
    paddingBottom: 32,
  },
  mainColumn: { flex: 1, maxWidth: 790 },
  greeting: { color: "#FFFFFF", fontSize: 23, fontWeight: "900", marginBottom: 8 },
  subGreeting: { color: "#CBD5E1", fontSize: 14, marginBottom: 32 },
  sectionTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginBottom: 6 },
  sectionSubtitle: { color: "#CBD5E1", fontSize: 13, marginBottom: 18 },
  statsGrid: { flexDirection: "row", gap: 16, marginBottom: 20 },
  statCard: {
    flex: 1,
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#071019",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: { fontSize: 32, fontWeight: "900", lineHeight: 36 },
  statLabel: { color: "#F8FAFC", fontSize: 14, fontWeight: "800", marginTop: 8 },
  statCaption: { color: "#94A3B8", fontSize: 12, marginTop: 9 },
  highRiskCard: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#E11D48",
    borderRadius: 8,
    backgroundColor: "#2A0810",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  highRiskIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#57101B",
  },
  highRiskLabel: { color: "#FB7185", fontSize: 10, fontWeight: "900", marginBottom: 6 },
  highRiskName: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  highRiskMeta: { color: "#FECACA", fontSize: 13, marginTop: 4 },
  criticalPill: {
    color: "#FB7185",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#4C0B15",
    overflow: "hidden",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 10,
  },
  viewAll: { color: "#A78BFA", fontSize: 14, fontWeight: "800" },
  patientList: { borderRadius: 8, overflow: "hidden" },
  desktopPatientRow: {
    minHeight: 70,
    borderWidth: 1,
    borderLeftWidth: 2,
    borderColor: "#1F2937",
    backgroundColor: "#071019",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    marginBottom: 1,
  },
  desktopAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopAvatarText: { fontSize: 13, fontWeight: "900" },
  desktopPatientName: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  desktopPatientMeta: { color: "#CBD5E1", fontSize: 12, marginTop: 4 },
  desktopPatientStatus: { fontSize: 13, fontWeight: "900" },
  reportList: { gap: 8 },
  desktopReportRow: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    backgroundColor: "#071019",
    flexDirection: "row",
    gap: 14,
    padding: 14,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#052E1B",
  },
  reportTopLine: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  desktopReportName: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  desktopReportMeta: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  sampleBadge: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#3A2604",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  desktopReportButton: {
    height: 34,
    borderWidth: 1,
    borderColor: "#7C3AED",
    borderRadius: 6,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  desktopReportButtonText: { color: "#A78BFA", fontSize: 12, fontWeight: "800" },
  rightRail: { width: 420, gap: 18 },
  topTools: { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginBottom: 6 },
  dateCard: {
    height: 50,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#071019",
  },
  dateText: { color: "#F8FAFC", fontSize: 13, fontWeight: "900" },
  dateSubtext: { color: "#94A3B8", fontSize: 11, marginTop: 3 },
  bellButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071019",
  },
  bellBadge: {
    position: "absolute",
    right: 6,
    top: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F43F5E",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    overflow: "hidden",
  },
  panel: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    backgroundColor: "#071019",
    padding: 20,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  panelTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  panelAction: { color: "#A78BFA", fontSize: 13, fontWeight: "800" },
  scheduleRow: { flexDirection: "row", alignItems: "center", minHeight: 56 },
  scheduleTime: { width: 78, color: "#CBD5E1", fontSize: 13 },
  scheduleInfo: {
    flex: 1,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scheduleDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#3B82F6" },
  scheduleName: { color: "#F8FAFC", fontSize: 13, fontWeight: "900" },
  scheduleType: { color: "#94A3B8", fontSize: 11, marginTop: 4 },
  alertRow: {
    minHeight: 66,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: { color: "#F8FAFC", fontSize: 13, fontWeight: "900" },
  alertBody: { color: "#94A3B8", fontSize: 11, marginTop: 4 },
  alertTime: { color: "#94A3B8", fontSize: 11 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickAction: {
    width: "48.5%",
    height: 90,
    borderWidth: 1,
    borderColor: "#263244",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0B111C",
  },
  quickActionLabel: { color: "#CBD5E1", fontSize: 12, fontWeight: "700" },
  contentPage: { flex: 1, maxWidth: 1040 },
  pageHero: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    backgroundColor: "#071019",
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  pageHeroIcon: {
    width: 58,
    height: 58,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B111C",
  },
  pageTitle: { color: "#FFFFFF", fontSize: 27, fontWeight: "900" },
  pageSubtitle: { color: "#CBD5E1", fontSize: 14, marginTop: 6 },
  pageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 16 },
  pagePanel: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    backgroundColor: "#071019",
    padding: 16,
    gap: 8,
  },
  pageCard: {
    flex: 1,
    minWidth: 250,
    minHeight: 148,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    backgroundColor: "#071019",
    padding: 18,
  },
  pageCardTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "900", marginTop: 14 },
  pageCardBody: { color: "#CBD5E1", fontSize: 13, lineHeight: 19, marginTop: 8 },
  reviewBanner: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: "#E11D48",
    borderRadius: 8,
    backgroundColor: "#2A0810",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    marginBottom: 8,
  },
  reviewTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  reviewBody: { color: "#FECACA", fontSize: 13, marginTop: 4 },
  messageRow: {
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  messageAvatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E153B",
  },
  messageName: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" },
  messageBody: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  analyticsValue: { fontSize: 38, fontWeight: "900", lineHeight: 42 },
  chartBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
    overflow: "hidden",
    marginTop: 18,
  },
  chartFill: { height: 8, borderRadius: 4 },
  settingsRow: {
    minHeight: 68,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
});

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
