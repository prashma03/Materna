import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Pressable, TextInput
} from "react-native";
import { Search, LogOut, AlertTriangle, Users } from "lucide-react-native";

type RiskLevel = "Critical" | "High" | "Moderate" | "Stable";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
}

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: "emergency_button" | "vitals" | "symptom";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface Patient {
  id: string;
  doctorId: string;
  name: string;
  avatarInitials: string;
  age: number;
  pregnancyWeek: number;
  county: string;
  riskLevel: RiskLevel;
  riskScore: number;
  emergencyActive: boolean;
  emergencyTriggeredAt?: string;
  vitals: {
    heartRate: number;
    spO2: number;
    skinTemp: number;
    respiration: number;
  };
  riskAssessment: {
    factors: Array<{ label: string; points: number }>;
  };
}

interface Props {
  theme: string;
  doctor: Doctor;
  navigate: (screen: string, params?: any) => void;
  onLogout: () => void;
}

type FilterType = "All" | RiskLevel;
const FILTERS: FilterType[] = ["All", "Critical", "High", "Moderate", "Stable"];

const DEMO_PATIENTS: Patient[] = [
  {
    id: "patient-1",
    doctorId: "doctor-1",
    name: "Maya Johnson",
    avatarInitials: "MJ",
    age: 28,
    pregnancyWeek: 28,
    county: "Desha",
    riskLevel: "Stable",
    riskScore: 18,
    emergencyActive: false,
    vitals: { heartRate: 77, spO2: 99, skinTemp: 98.4, respiration: 15 },
    riskAssessment: { factors: [{ label: "Vitals are within expected range", points: 0 }] },
  },
  {
    id: "patient-2",
    doctorId: "doctor-1",
    name: "Maria Gonzalez",
    avatarInitials: "MG",
    age: 32,
    pregnancyWeek: 34,
    county: "Jefferson",
    riskLevel: "Critical",
    riskScore: 92,
    emergencyActive: true,
    emergencyTriggeredAt: new Date(Date.now() - 8 * 60000).toISOString(),
    vitals: { heartRate: 119, spO2: 92, skinTemp: 100.2, respiration: 22 },
    riskAssessment: {
      factors: [
        { label: "Severe hypertension pattern", points: 45 },
        { label: "Low oxygen reading", points: 25 },
      ],
    },
  },
  {
    id: "patient-3",
    doctorId: "doctor-1",
    name: "Tanya Williams",
    avatarInitials: "TW",
    age: 25,
    pregnancyWeek: 22,
    county: "Phillips",
    riskLevel: "High",
    riskScore: 68,
    emergencyActive: false,
    vitals: { heartRate: 92, spO2: 96, skinTemp: 99.1, respiration: 18 },
    riskAssessment: { factors: [{ label: "Elevated blood pressure trend", points: 30 }] },
  },
];

let DEMO_ALERTS: Alert[] = [
  {
    id: "alert-1",
    patientId: "patient-2",
    patientName: "Maria Gonzalez",
    type: "emergency_button",
    message: "Emergency button pressed. Review vitals and contact patient.",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-2",
    patientId: "patient-3",
    patientName: "Tanya Williams",
    type: "vitals",
    message: "Blood pressure trend is rising and needs review.",
    timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
    acknowledged: false,
  },
];

function getPatientsByDoctor(doctorId: string): Patient[] {
  return DEMO_PATIENTS.filter((patient) => patient.doctorId === doctorId);
}

function getUnacknowledgedAlerts(): Alert[] {
  return DEMO_ALERTS.filter((alert) => !alert.acknowledged);
}

function acknowledgeAlert(id: string): void {
  DEMO_ALERTS = DEMO_ALERTS.map((alert) =>
    alert.id === id ? { ...alert, acknowledged: true } : alert
  );
}

function getRiskColor(level: RiskLevel): string {
  if (level === "Critical") return "#e11d48";
  if (level === "High") return "#d97706";
  if (level === "Moderate") return "#3b82f6";
  return "#22C55E";
}

function getRiskBg(level: RiskLevel, isDark: boolean): string {
  return isDark ? `${getRiskColor(level)}22` : `${getRiskColor(level)}18`;
}

function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
  const color = getRiskColor(level);

  return (
    <View style={{ borderWidth: 1, borderColor: color, backgroundColor: `${color}22`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color, fontSize: 11, fontWeight: "800" }}>{level} {score}</Text>
    </View>
  );
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DoctorDashboardScreen({ theme, doctor, navigate, onLogout }: Props) {
  const isDark = theme === "dark";
  const c = {
    bg:       isDark ? "#05070A" : "#F8FAFC",
    card:     isDark ? "#101418" : "#FFFFFF",
    border:   isDark ? "#242B33" : "#E2E8F0",
    text:     isDark ? "#F8FAFC" : "#0F172A",
    muted:    isDark ? "#64748B" : "#94A3B8",
    soft:     isDark ? "#CBD5E1" : "#475569",
    green:    "#22C55E",
    purple:   "#6c63ff",
    rose:     "#e11d48",
    amber:    "#d97706",
  };

  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<FilterType>("All");
  const [alerts, setAlerts]       = useState<Alert[]>(getUnacknowledgedAlerts());
  const allPatients                = getPatientsByDoctor(doctor.id);

  const filtered = allPatients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || p.riskLevel === filter;
    return matchSearch && matchFilter;
  });

  const critical  = allPatients.filter(p => p.riskLevel === "Critical").length;
  const high      = allPatients.filter(p => p.riskLevel === "High").length;
  const moderate  = allPatients.filter(p => p.riskLevel === "Moderate").length;
  const stable    = allPatients.filter(p => p.riskLevel === "Stable").length;

  const emergencyPatients = allPatients.filter(p => p.emergencyActive);

  function dismissAlert(id: string) {
    acknowledgeAlert(id);
    setAlerts(getUnacknowledgedAlerts());
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Header ── */}
        <View style={[s.header, { borderBottomColor: c.border }]}>
          <View>
            <View style={s.brandRow}>
              <View style={[s.brandDot, { backgroundColor: c.purple }]} />
              <Text style={[s.brand, { color: c.text }]}>MATERNA</Text>
              <View style={[s.portalBadge, { backgroundColor: "#19153a", borderColor: c.purple }]}>
                <Text style={[s.portalTxt, { color: c.purple }]}>Doctor Portal</Text>
              </View>
            </View>
            <Text style={[s.docName, { color: c.text }]}>{doctor.name}</Text>
            <Text style={[s.docSub, { color: c.muted }]}>{doctor.specialization} · {doctor.hospital}</Text>
          </View>
          <View style={s.headerRight}>
            {alerts.length > 0 && (
              <View style={[s.alertBubble, { backgroundColor: c.rose }]}>
                <Text style={s.alertBubbleTxt}>{alerts.length}</Text>
              </View>
            )}
            <Pressable onPress={onLogout} style={[s.logoutBtn, { borderColor: c.border }]}>
              <LogOut size={18} color={c.muted} />
            </Pressable>
          </View>
        </View>

        {/* ── Emergency alerts banner ── */}
        {emergencyPatients.map(p => (
          <Pressable
            key={p.id}
            style={[s.emergencyBanner, { backgroundColor: isDark ? "#2d0a12" : "#fff1f2" }]}
            onPress={() => navigate("PatientDetail", { patientId: p.id })}
          >
            <View style={[s.emergencyIcon, { backgroundColor: c.rose + "33" }]}>
              <AlertTriangle size={18} color={c.rose} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.emergencyTitle, { color: c.rose }]}>
                🚨 EMERGENCY — {p.name}
              </Text>
              <Text style={[s.emergencySub, { color: isDark ? "#fca5a5" : "#9f1239" }]}>
                Week {p.pregnancyWeek} · HR {p.vitals.heartRate} · SpO2 {p.vitals.spO2}% · {timeAgo(p.emergencyTriggeredAt!)}
              </Text>
            </View>
            <Text style={{ color: c.rose, fontSize: 18 }}>›</Text>
          </Pressable>
        ))}

        {/* ── Unacknowledged alerts ── */}
        {alerts.filter(a => !emergencyPatients.find(p => p.id === a.patientId && a.type === "emergency_button")).map(a => (
          <View key={a.id} style={[s.alertRow, {
            backgroundColor: isDark ? "#1a1000" : "#fffbeb",
            borderColor: c.amber,
          }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.alertRowTitle, { color: c.text }]}>{a.patientName}</Text>
              <Text style={[s.alertRowMsg, { color: c.muted }]}>{a.message}</Text>
              <Text style={[s.alertRowTime, { color: c.muted }]}>{timeAgo(a.timestamp)}</Text>
            </View>
            <Pressable
              style={[s.dismissBtn, { borderColor: c.amber }]}
              onPress={() => dismissAlert(a.id)}
            >
              <Text style={[s.dismissTxt, { color: c.amber }]}>Dismiss</Text>
            </Pressable>
          </View>
        ))}

        {/* ── Overview card ── */}
        <View style={[s.overviewCard, { backgroundColor: isDark ? "#0d0d1a" : "#f5f3ff", borderColor: c.purple }]}>
          <View style={s.overviewTop}>
            <Users size={16} color={c.purple} />
            <Text style={[s.overviewTitle, { color: c.purple }]}>Patient Overview</Text>
          </View>
          <View style={s.overviewGrid}>
            {[
              { label: "Total",    value: allPatients.length, color: c.purple },
              { label: "Critical", value: critical,           color: "#e11d48" },
              { label: "High",     value: high,               color: c.amber },
              { label: "Stable",   value: stable + moderate,  color: c.green },
            ].map(item => (
              <View key={item.label} style={s.overviewItem}>
                <Text style={[s.overviewNum, { color: item.color }]}>{item.value}</Text>
                <Text style={[s.overviewLabel, { color: c.muted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Search ── */}
        <View style={[s.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
          <Search size={16} color={c.muted} />
          <TextInput
            style={[s.searchInput, { color: c.text }]}
            placeholder="Search patients..."
            placeholderTextColor={c.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Filter pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {FILTERS.map(f => {
            const active = filter === f;
            const fColor = f === "All" ? c.purple : getRiskColor(f as RiskLevel);
            return (
              <Pressable
                key={f}
                style={[s.filterPill, {
                  backgroundColor: active ? fColor + "22" : c.card,
                  borderColor: active ? fColor : c.border,
                }]}
                onPress={() => setFilter(f)}
              >
                <Text style={[s.filterTxt, { color: active ? fColor : c.muted }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Priority Queue ── */}
        <View style={s.queueHeader}>
          <Text style={[s.queueTitle, { color: c.text }]}>
            Priority Queue
          </Text>
          <Text style={[s.queueSub, { color: c.muted }]}>
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {filtered.length === 0 && (
          <View style={[s.emptyState, { borderColor: c.border }]}>
            <Text style={[s.emptyTxt, { color: c.muted }]}>No patients match this filter.</Text>
          </View>
        )}

        {filtered.map((patient, idx) => (
          <PatientQueueCard
            key={patient.id}
            patient={patient}
            rank={idx + 1}
            isDark={isDark}
            c={c}
            onPress={() => navigate("PatientDetail", { patientId: patient.id })}
          />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Patient Queue Card ──────────────────────────────────────
function PatientQueueCard({
  patient, rank, isDark, c, onPress
}: {
  patient: Patient;
  rank: number;
  isDark: boolean;
  c: any;
  onPress: () => void;
}) {
  const riskColor = getRiskColor(patient.riskLevel);
  const bg        = getRiskBg(patient.riskLevel, isDark);
  const isCrit    = patient.riskLevel === "Critical";

  return (
    <Pressable
      style={[s.patientCard, { backgroundColor: c.card, borderColor: isCrit ? riskColor : c.border, borderLeftColor: riskColor, borderLeftWidth: 4 }]}
      onPress={onPress}
    >
      {/* Row 1: Avatar + Name + Badge */}
      <View style={s.cardTop}>
        <View style={[s.avatar, { backgroundColor: bg, borderColor: riskColor }]}>
          <Text style={[s.avatarTxt, { color: riskColor }]}>{patient.avatarInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.nameRow}>
            <Text style={[s.patientName, { color: c.text }]}>{patient.name}</Text>
            {patient.emergencyActive && (
              <View style={[s.sosBadge, { backgroundColor: "#e11d48" }]}>
                <Text style={s.sosTxt}>🆘 SOS</Text>
              </View>
            )}
          </View>
          <Text style={[s.patientSub, { color: c.muted }]}>
            Age {patient.age} · Week {patient.pregnancyWeek} · {patient.county} County
          </Text>
        </View>
        <RiskBadge level={patient.riskLevel} score={patient.riskScore} />
      </View>

      {/* Row 2: Key vitals */}
      <View style={[s.vitalsRow, { borderTopColor: c.border }]}>
        {[
          { l: "HR",   v: patient.vitals.heartRate,   u: "bpm", warn: patient.vitals.heartRate > 100,   crit: patient.vitals.heartRate > 120 },
          { l: "SpO2", v: patient.vitals.spO2,         u: "%",   warn: patient.vitals.spO2 < 96,          crit: patient.vitals.spO2 < 94 },
          { l: "Temp", v: patient.vitals.skinTemp,     u: "°F",  warn: patient.vitals.skinTemp > 99.5,    crit: patient.vitals.skinTemp > 100.4 },
          { l: "Resp", v: patient.vitals.respiration,  u: "/min", warn: patient.vitals.respiration > 20,  crit: patient.vitals.respiration > 24 },
        ].map(item => (
          <View key={item.l} style={s.vitalItem}>
            <Text style={[s.vitalVal, { color: item.crit ? "#e11d48" : item.warn ? "#d97706" : "#22C55E" }]}>
              {item.v}
            </Text>
            <Text style={[s.vitalUnit, { color: c.muted }]}>{item.u}</Text>
            <Text style={[s.vitalLabel, { color: c.muted }]}>{item.l}</Text>
          </View>
        ))}
      </View>

      {/* Row 3: Top risk factor */}
      {patient.riskAssessment.factors.length > 0 && (
        <View style={[s.factorRow, { borderTopColor: c.border }]}>
          <Text style={[s.factorLabel, { color: c.muted }]}>Top risk: </Text>
          <Text style={[s.factorVal, { color: riskColor }]}>
            +{patient.riskAssessment.factors[0].points} {patient.riskAssessment.factors[0].label}
          </Text>
          {patient.riskAssessment.factors.length > 1 && (
            <Text style={[s.factorMore, { color: c.muted }]}>
              +{patient.riskAssessment.factors.length - 1} more
            </Text>
          )}
          <Text style={[s.arrow, { color: c.muted }]}>›</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1 },
  header:          { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 20, borderBottomWidth: 1 },
  brandRow:        { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  brandDot:        { width: 8, height: 8, borderRadius: 4 },
  brand:           { fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  portalBadge:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  portalTxt:       { fontSize: 9, fontWeight: "800" },
  docName:         { fontSize: 18, fontWeight: "800" },
  docSub:          { fontSize: 12, marginTop: 2 },
  headerRight:     { alignItems: "flex-end", gap: 8 },
  alertBubble:     { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  alertBubbleTxt:  { color: "#fff", fontSize: 10, fontWeight: "800" },
  logoutBtn:       { borderWidth: 1, borderRadius: 10, padding: 8 },
  emergencyBanner: { flexDirection: "row", alignItems: "center", gap: 12, margin: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: "#e11d48" },
  emergencyIcon:   { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emergencyTitle:  { fontSize: 14, fontWeight: "800" },
  emergencySub:    { fontSize: 12, marginTop: 2 },
  alertRow:        { flexDirection: "row", alignItems: "center", marginHorizontal: 12, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, gap: 10 },
  alertRowTitle:   { fontSize: 13, fontWeight: "700" },
  alertRowMsg:     { fontSize: 12, marginTop: 1 },
  alertRowTime:    { fontSize: 10, marginTop: 3 },
  dismissBtn:      { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dismissTxt:      { fontSize: 11, fontWeight: "600" },
  overviewCard:    { margin: 12, borderWidth: 1, borderRadius: 16, padding: 16 },
  overviewTop:     { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  overviewTitle:   { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  overviewGrid:    { flexDirection: "row", justifyContent: "space-around" },
  overviewItem:    { alignItems: "center" },
  overviewNum:     { fontSize: 28, fontWeight: "900" },
  overviewLabel:   { fontSize: 11, marginTop: 2 },
  searchWrap:      { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 12, marginTop: 12, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput:     { flex: 1, fontSize: 14 },
  filterScroll:    { paddingLeft: 12, marginTop: 10, marginBottom: 4 },
  filterPill:      { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  filterTxt:       { fontSize: 12, fontWeight: "600" },
  queueHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 12, marginTop: 16, marginBottom: 8 },
  queueTitle:      { fontSize: 16, fontWeight: "800" },
  queueSub:        { fontSize: 12 },
  emptyState:      { borderWidth: 1, borderRadius: 12, margin: 12, padding: 24, alignItems: "center" },
  emptyTxt:        { fontSize: 14 },
  patientCard:     { marginHorizontal: 12, marginBottom: 10, borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  cardTop:         { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  avatar:          { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatarTxt:       { fontSize: 14, fontWeight: "800" },
  nameRow:         { flexDirection: "row", alignItems: "center", gap: 6 },
  patientName:     { fontSize: 15, fontWeight: "700" },
  patientSub:      { fontSize: 12, marginTop: 2 },
  sosBadge:        { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  sosTxt:          { fontSize: 9, color: "#fff", fontWeight: "800" },
  vitalsRow:       { flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, borderTopWidth: 1 },
  vitalItem:       { alignItems: "center" },
  vitalVal:        { fontSize: 15, fontWeight: "800" },
  vitalUnit:       { fontSize: 9 },
  vitalLabel:      { fontSize: 9, marginTop: 2 },
  factorRow:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, gap: 4 },
  factorLabel:     { fontSize: 11 },
  factorVal:       { fontSize: 11, fontWeight: "700" },
  factorMore:      { fontSize: 11, marginLeft: 4 },
  arrow:           { marginLeft: "auto", fontSize: 16 },
});
