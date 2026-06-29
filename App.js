import React, { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable, ScrollView } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/profilescreen";
import AIChatScreen from "./src/screens/AIChatScreen";
import HospitalsScreen from "./src/screens/HospitalsScreen";
import EmergencyScreen from "./src/screens/emergencyscreen";
import LoginScreen from "./src/screens/loginscreen";
import DoctorWorkspace from "./src/screens/doctor/DoctorWorkspace";
import { loadProfile } from "./src/storage/profileStorage";
import { getSharedReports } from "./src/api/maternaAPI";
import { createAndShareProfileReport } from "./src/utils/profileReport";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("Today");
  const [showChat, setShowChat] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [userType, setUserType] = useState(null); // null = login screen
  const [activeScenario, setActiveScenario] = useState("Green");
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeScale = useRef(new Animated.Value(0.9)).current;
  const welcomeLift = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(welcomeScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeLift, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(welcomeOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeScale, {
          toValue: 1.04,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setShowWelcome(false));
    }, 2300);

    return () => clearTimeout(timer);
  }, [welcomeLift, welcomeOpacity, welcomeScale]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showChat) {
          setShowChat(false);
          return true;
        }

        if (showEmergency) {
          setShowEmergency(false);
          return true;
        }

        if (userType === "patient" && activeTab !== "Today") {
          setActiveTab("Today");
          return true;
        }

        return false;
      }
    );

    return () => subscription.remove();
  }, [activeTab, showChat, showEmergency, userType]);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const dark = theme === "dark";
  const navBg = dark ? "#0f1117" : "#ffffff";
  const navBorder = dark ? "#1e2233" : "#e5e7eb";
  const activeColor = "#22C55E";
  const inactiveColor = dark ? "#4a4f66" : "#9ca3af";
  const screenBg = dark ? "#05070A" : "#F8FAFC";

  // ── LOGIN SCREEN ──────────────────────────────────────────
  if (showWelcome) {
    return (
      <SafeAreaView style={welcome.container}>
        <Animated.View
          style={[
            welcome.content,
            {
              opacity: welcomeOpacity,
              transform: [
                { scale: welcomeScale },
                { translateY: welcomeLift },
              ],
            },
          ]}
        >
          <Animated.Image
            source={require("./assets/materna-app-icon.png")}
            style={welcome.logo}
            resizeMode="cover"
          />
          <Text style={welcome.title}>Welcome to Materna</Text>
          <Text style={welcome.tagline}>Two hearts, one wrist</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (!userType) {
    return (
      <SafeAreaView style={[login.container, { backgroundColor: "#05070A" }]}>
        <View style={login.inner}>

          {/* Logo */}
          <View style={login.logoRow}>
            <View style={login.logoDot} />
            <Text style={login.logoText}>MATERNA</Text>
          </View>
          <Text style={login.tagline}>
            Maternal health monitoring{"\n"}for rural Arkansas
          </Text>

          {/* Divider */}
          <View style={login.divider} />

          <Text style={login.chooseLabel}>Who are you?</Text>

          {/* Patient login */}
          <Pressable
            style={[login.loginBtn, { borderColor: "#22C55E", backgroundColor: "#0a1a0f" }]}
            onPress={() => setUserType("patient")}
          >
            <Text style={login.loginBtnIcon}>🤰</Text>
            <View style={{ flex: 1 }}>
              <Text style={[login.loginBtnTitle, { color: "#22C55E" }]}>I'm a Patient</Text>
              <Text style={login.loginBtnSub}>Report symptoms, get alerts, connect with care</Text>
            </View>
            <Text style={{ color: "#22C55E", fontSize: 20 }}>›</Text>
          </Pressable>

          {/* Doctor login */}
          <Pressable
            style={[login.loginBtn, { borderColor: "#6c63ff", backgroundColor: "#0d0b1a" }]}
            onPress={() => setUserType("doctor")}
          >
            <Text style={login.loginBtnIcon}>🩺</Text>
            <View style={{ flex: 1 }}>
              <Text style={[login.loginBtnTitle, { color: "#6c63ff" }]}>I'm a Doctor</Text>
              <Text style={login.loginBtnSub}>Monitor patients, manage alerts, view dashboard</Text>
            </View>
            <Text style={{ color: "#6c63ff", fontSize: 20 }}>›</Text>
          </Pressable>

          <Text style={login.footer}>
            Materna · Hackathon Demo · Arkansas Rural Health
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── DOCTOR DASHBOARD ──────────────────────────────────────
  if (userType === "doctor") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#05070A" }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: 430, flex: 1 }}>
            <DoctorWorkspace
              theme={theme}
              onLogout={() => setUserType(null)}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── PATIENT APP ───────────────────────────────────────────

  if (showChat) {
    return (
      <View style={{ flex: 1, backgroundColor: dark ? "#0f1117" : "#f5f7fa", alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: 430, flex: 1 }}>
          <AIChatScreen
            theme={theme}
            onClose={() => setShowChat(false)}
            name="Maya"
            patientId="patient_001"
          />
        </View>
      </View>
    );
  }

  if (showEmergency) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0f", alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: 430, flex: 1 }}>
          <EmergencyScreen theme={theme} onClose={() => setShowEmergency(false)} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>

      {/* Screens */}
      <View style={{ flex: 1, alignItems: "center", backgroundColor: screenBg }}>
        <View style={{ width: "100%", maxWidth: 430, flex: 1 }}>
          {activeTab === "Today" && (
            <HomeScreen
              theme={theme}
              toggleTheme={toggleTheme}
              onAskMaterna={() => setShowChat(true)}
              onOpenHospitals={() => setActiveTab("Hospitals")}
              onOpenProfile={() => setActiveTab("Profile")}
              onEmergency={() => setShowEmergency(true)}
              activeScenario={activeScenario}
              onScenarioChange={setActiveScenario}
            />
          )}          {activeTab === "Hospitals" && (
            <HospitalsScreen theme={theme} riskLevel={activeScenario} />
          )}
          {activeTab === "Profile" && <ProfileScreen theme={theme} />}
        </View>
      </View>

      {/* Bottom nav */}
      <View style={{ backgroundColor: navBg, borderTopWidth: 1, borderTopColor: navBorder }}>
        <View style={[styles.nav, { backgroundColor: navBg }]}>
          {[
            { label: "Today", icon: "⌂", emergency: false },            { label: "🚨", icon: "🚨", emergency: true },
            { label: "Hospitals", icon: "🏥", emergency: false },
            { label: "Profile", icon: "◯", emergency: false },
          ].map(({ label, icon, emergency }) => {
            const isActive = activeTab === label;
            const color = emergency ? "#ff4444" : isActive ? activeColor : inactiveColor;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.navItem, emergency && styles.emergencyNavItem]}
                onPress={() => emergency ? setShowEmergency(true) : setActiveTab(label)}
              >
                <Text style={[styles.navIcon, { color }, emergency && styles.emergencyIcon]}>
                  {icon}
                </Text>
                {!emergency && (
                  <Text style={[styles.navLabel, { color }]}>{label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

    </View>
  );
}

// ── Doctor Dashboard (self-contained, no external imports) ──
function DoctorDashboard({ theme, onLogout }) {
  const isDark = theme === "dark";
  const c = {
    bg: isDark ? "#05070A" : "#F8FAFC",
    card: isDark ? "#101418" : "#FFFFFF",
    border: isDark ? "#242B33" : "#E2E8F0",
    text: isDark ? "#F8FAFC" : "#0F172A",
    muted: isDark ? "#64748B" : "#94A3B8",
    purple: "#6c63ff",
    green: "#22C55E",
    red: "#e11d48",
    amber: "#d97706",
  };

  const [filter, setFilter] = useState("All");
  const [sharedProfile, setSharedProfile] = useState(null);
  const [sharedReport, setSharedReport] = useState(null);
  const [showSharedProfile, setShowSharedProfile] = useState(false);

  useEffect(() => {
    loadProfile().then((profile) => {
      setSharedProfile(profile?.shareWithDoctor ? profile : null);
    });

    async function refreshReports() {
      const reports = await getSharedReports();
      if (Array.isArray(reports) && reports.length > 0) {
        setSharedReport(reports[0]);
        setSharedProfile(reports[0].profile);
      }
    }

    refreshReports();
    const interval = setInterval(refreshReports, 5000);
    return () => clearInterval(interval);
  }, []);

  async function shareDoctorCopy() {
    if (!sharedReport) return;
    await createAndShareProfileReport(sharedReport.profile, {
      bracelet: sharedReport.bracelet,
      vitals: sharedReport.vitals,
      risk: sharedReport.risk,
      mother: {
        name: sharedReport.profile.fullName || "Patient",
        pregnancyWeek: Number(sharedReport.profile.pregnancyWeek) || 0,
      },
    });
  }

  const patients = [
    {
      id: "1", name: "Maya Johnson", age: 28, week: 28,
      county: "Desha", risk: "Stable", riskColor: "#22C55E",
      hr: 77, spo2: 99, temp: 98.4, resp: 15,
      bp: "115/74", emergency: false,
      factor: "No risk factors detected",
    },
    {
      id: "2", name: "Maria Gonzalez", age: 32, week: 34,
      county: "Jefferson", risk: "Critical", riskColor: "#e11d48",
      hr: 119, spo2: 92, temp: 100.2, resp: 22,
      bp: "163/109", emergency: true,
      factor: "Severe hypertension + low oxygen",
    },
    {
      id: "3", name: "Tanya Williams", age: 25, week: 22,
      county: "Phillips", risk: "High", riskColor: "#d97706",
      hr: 92, spo2: 96, temp: 99.1, resp: 18,
      bp: "139/90", emergency: false,
      factor: "Early hypertension pattern",
    },
    {
      id: "4", name: "Sarah Davis", age: 30, week: 30,
      county: "Arkansas", risk: "Moderate", riskColor: "#3b82f6",
      hr: 85, spo2: 97, temp: 98.8, resp: 16,
      bp: "128/82", emergency: false,
      factor: "Elevated BP trend",
    },
    {
      id: "5", name: "Lisa Brown", age: 22, week: 18,
      county: "Lincoln", risk: "Stable", riskColor: "#22C55E",
      hr: 72, spo2: 98, temp: 98.2, resp: 14,
      bp: "112/70", emergency: false,
      factor: "No risk factors detected",
    },
  ];

  const filtered = filter === "All" ? patients : patients.filter(p => p.risk === filter);
  const emergency = patients.filter(p => p.emergency);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={[doc.header, { borderBottomColor: c.border }]}>
          <View>
            <View style={doc.brandRow}>
              <View style={[doc.brandDot, { backgroundColor: c.purple }]} />
              <Text style={[doc.brand, { color: c.text }]}>MATERNA</Text>
              <View style={[doc.portalBadge, { backgroundColor: "#19153a", borderColor: c.purple }]}>
                <Text style={[doc.portalTxt, { color: c.purple }]}>Doctor Portal</Text>
              </View>
            </View>
            <Text style={[doc.docName, { color: c.text }]}>Dr. Aisha Patel</Text>
            <Text style={[doc.docSub, { color: c.muted }]}>OB-GYN · Delta Memorial Hospital</Text>
          </View>
          <TouchableOpacity
            onPress={onLogout}
            style={[doc.logoutBtn, { borderColor: c.border }]}
          >
            <Text style={{ color: c.muted, fontSize: 12, fontWeight: "600" }}>← Logout</Text>
          </TouchableOpacity>
        </View>

        {sharedProfile && (
          <TouchableOpacity
            style={[
              doc.profileAccessCard,
              { backgroundColor: c.card, borderColor: c.purple },
            ]}
            onPress={() => setShowSharedProfile((visible) => !visible)}
          >
            <View style={doc.profileAccessTop}>
              <View>
                <Text style={[doc.profileAccessTitle, { color: c.text }]}>
                  Shared maternal profile
                </Text>
                <Text style={[doc.profileAccessSub, { color: c.muted }]}>
                  {sharedProfile.fullName || "Maya Johnson"} · {sharedReport
                    ? "Received live"
                    : "Saved on this device"}
                </Text>
              </View>
              <Text style={[doc.profileAccessAction, { color: c.purple }]}>
                {showSharedProfile ? "Hide" : "View"}
              </Text>
            </View>

            {showSharedProfile && (
              <View style={[doc.profileDetails, { borderTopColor: c.border }]}>
                <View style={doc.sharedProfileGrid}>
                  {[
                    ["Age", sharedProfile.age || "Not provided"],
                    ["Pregnancy week", sharedProfile.pregnancyWeek || "Not provided"],
                    ["County", sharedProfile.county || "Not provided"],
                    ["Previous pregnancies", sharedProfile.previousPregnancies || "Not provided"],
                    ["Preferred care", sharedProfile.preferredHospital || "Not provided"],
                    ["Emergency contact", sharedProfile.emergencyContact || "Not provided"],
                  ].map(([label, value]) => (
                    <View key={label} style={doc.sharedProfileItem}>
                      <Text style={[doc.sharedProfileLabel, { color: c.muted }]}>{label}</Text>
                      <Text style={[doc.sharedProfileValue, { color: c.text }]}>{value}</Text>
                    </View>
                  ))}
                </View>

                <Text style={[doc.sharedProfileSection, { color: c.purple }]}>
                  MEDICAL HISTORY
                </Text>
                <Text style={[doc.sharedProfileBody, { color: c.text }]}>
                  {[
                    sharedProfile.hasMiscarriage && "History of miscarriage",
                    sharedProfile.hasHighBP && "High blood pressure",
                    sharedProfile.hasDiabetes && "Diabetes",
                    sharedProfile.hasAnemia && "Anemia",
                    sharedProfile.hasCSection && "Previous C-section",
                  ].filter(Boolean).join(" · ") || "No conditions reported"}
                </Text>

                <Text style={[doc.sharedProfileSection, { color: c.purple }]}>
                  CURRENT MEDICATIONS
                </Text>
                <Text style={[doc.sharedProfileBody, { color: c.text }]}>
                  {sharedProfile.medications || "None reported"}
                </Text>

                {sharedReport?.vitals && (
                  <>
                    <Text style={[doc.sharedProfileSection, { color: c.purple }]}>
                      BRACELET SNAPSHOT
                    </Text>
                    <View style={doc.reportVitalsRow}>
                      {Object.values(sharedReport.vitals).map((vital) => (
                        <View key={vital.title} style={doc.reportVital}>
                          <Text style={[doc.reportVitalValue, { color: c.text }]}>
                            {vital.value} {vital.unit}
                          </Text>
                          <Text style={[doc.reportVitalLabel, { color: c.muted }]}>
                            {vital.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={[doc.doctorPdfButton, { borderColor: c.purple }]}
                      onPress={shareDoctorCopy}
                    >
                      <Text style={[doc.doctorPdfButtonText, { color: c.purple }]}>
                        Open or share PDF copy
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                <Text style={[doc.sharedProfileUpdated, { color: c.muted }]}>
                  {sharedReport ? "Received" : "Last updated"} {sharedReport?.received_at
                    ? new Date(sharedReport.received_at).toLocaleString()
                    : sharedProfile.updatedAt
                    ? new Date(sharedProfile.updatedAt).toLocaleString()
                    : "not recorded"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Emergency banner */}
        {emergency.map(p => (
          <View key={p.id} style={doc.emergencyBanner}>
            <Text style={doc.emergencyTitle}>🚨 EMERGENCY — {p.name}</Text>
            <Text style={doc.emergencySub}>
              Week {p.week} · HR {p.hr} · BP {p.bp} · SpO2 {p.spo2}%
            </Text>
            <View style={doc.emergencyBtns}>
              <TouchableOpacity style={[doc.emergencyBtn, { backgroundColor: "#e11d48" }]}>
                <Text style={doc.emergencyBtnText}>📞 Call Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[doc.emergencyBtn, { backgroundColor: "#7f1d1d" }]}>
                <Text style={doc.emergencyBtnText}>🚑 Dispatch Ambulance</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Overview */}
        <View style={[doc.overviewCard, { backgroundColor: isDark ? "#0d0d1a" : "#f5f3ff", borderColor: c.purple }]}>
          <Text style={[doc.overviewTitle, { color: c.purple }]}>PATIENT OVERVIEW</Text>
          <View style={doc.overviewGrid}>
            {[
              { label: "Total", value: patients.length, color: c.purple },
              { label: "Critical", value: patients.filter(p => p.risk === "Critical").length, color: c.red },
              { label: "High", value: patients.filter(p => p.risk === "High").length, color: c.amber },
              { label: "Stable", value: patients.filter(p => p.risk === "Stable").length, color: c.green },
            ].map(item => (
              <View key={item.label} style={doc.overviewItem}>
                <Text style={[doc.overviewNum, { color: item.color }]}>{item.value}</Text>
                <Text style={[doc.overviewLabel, { color: c.muted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 12, marginBottom: 8 }}>
          {["All", "Critical", "High", "Moderate", "Stable"].map(f => (
            <TouchableOpacity
              key={f}
              style={[doc.filterPill, {
                backgroundColor: filter === f ? c.purple + "22" : c.card,
                borderColor: filter === f ? c.purple : c.border,
              }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[doc.filterTxt, { color: filter === f ? c.purple : c.muted }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Patient list */}
        <Text style={[doc.queueTitle, { color: c.text }]}>AI Priority Queue</Text>

        {filtered.map((p) => (
          <View
            key={p.id}
            style={[doc.patientCard, {
              backgroundColor: c.card,
              borderColor: p.emergency ? p.riskColor : c.border,
              borderLeftColor: p.riskColor,
            }]}
          >
            {/* Name row */}
            <View style={doc.cardTop}>
              <View style={[doc.avatar, { backgroundColor: p.riskColor + "22", borderColor: p.riskColor }]}>
                <Text style={[doc.avatarTxt, { color: p.riskColor }]}>
                  {p.name.split(" ").map(n => n[0]).join("")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[doc.patientName, { color: c.text }]}>{p.name}</Text>
                  {p.emergency && (
                    <View style={[doc.sosBadge]}>
                      <Text style={doc.sosTxt}>🆘 SOS</Text>
                    </View>
                  )}
                </View>
                <Text style={[doc.patientSub, { color: c.muted }]}>
                  Age {p.age} · Week {p.week} · {p.county} County
                </Text>
              </View>
              <View style={[doc.riskBadge, { backgroundColor: p.riskColor + "22", borderColor: p.riskColor }]}>
                <Text style={[doc.riskTxt, { color: p.riskColor }]}>{p.risk}</Text>
              </View>
            </View>

            {/* Vitals row */}
            <View style={[doc.vitalsRow, { borderTopColor: c.border }]}>
              {[
                { l: "HR", v: p.hr, u: "bpm", warn: p.hr > 100, crit: p.hr > 120 },
                { l: "SpO2", v: p.spo2, u: "%", warn: p.spo2 < 96, crit: p.spo2 < 94 },
                { l: "BP", v: p.bp, u: "", warn: false, crit: p.risk === "Critical" },
                { l: "Temp", v: p.temp, u: "°F", warn: p.temp > 99.5, crit: p.temp > 100.4 },
              ].map(item => (
                <View key={item.l} style={doc.vitalItem}>
                  <Text style={[doc.vitalVal, { color: item.crit ? "#e11d48" : item.warn ? "#d97706" : "#22C55E" }]}>
                    {item.v}
                  </Text>
                  <Text style={[doc.vitalUnit, { color: c.muted }]}>{item.u}</Text>
                  <Text style={[doc.vitalLabel, { color: c.muted }]}>{item.l}</Text>
                </View>
              ))}
            </View>

            {/* Risk factor */}
            <View style={[doc.factorRow, { borderTopColor: c.border }]}>
              <Text style={[doc.factorLabel, { color: c.muted }]}>Risk: </Text>
              <Text style={[doc.factorVal, { color: p.riskColor }]}>{p.factor}</Text>
            </View>

            {/* Action buttons */}
            <View style={[doc.actionRow, { borderTopColor: c.border }]}>
              <TouchableOpacity style={[doc.actionBtn, { backgroundColor: c.purple }]}>
                <Text style={doc.actionBtnText}>📞 Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[doc.actionBtn, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border }]}>
                <Text style={[doc.actionBtnText, { color: c.text }]}>💬 Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[doc.actionBtn, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border }]}>
                <Text style={[doc.actionBtnText, { color: c.text }]}>📋 Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  nav: { flexDirection: "row", paddingBottom: 24, paddingTop: 10, maxWidth: 430, width: "100%", alignSelf: "center", alignItems: "center" },
  navItem: { flex: 1, alignItems: "center", gap: 4 },
  emergencyNavItem: { marginTop: -16 },
  navIcon: { fontSize: 22 },
  emergencyIcon: { fontSize: 28 },
  navLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
});

const welcome = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05070A",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 24,
    marginBottom: 25,
  },
  title: {
    color: "#22C55E",
    fontSize: 29,
    fontWeight: "900",
    textAlign: "center",
  },
  tagline: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 9,
    textAlign: "center",
  },
});

const login = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 28, justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#22C55E" },
  logoText: { fontSize: 28, fontWeight: "900", color: "#F8FAFC", letterSpacing: 4 },
  tagline: { fontSize: 15, color: "#64748B", lineHeight: 22, marginBottom: 32 },
  divider: { height: 1, backgroundColor: "#242B33", marginBottom: 28 },
  chooseLabel: { fontSize: 13, color: "#64748B", fontWeight: "700", letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1.5, borderRadius: 18, padding: 18, marginBottom: 14 },
  loginBtnIcon: { fontSize: 32 },
  loginBtnTitle: { fontSize: 17, fontWeight: "800", marginBottom: 3 },
  loginBtnSub: { fontSize: 12, color: "#64748B", lineHeight: 18 },
  footer: { textAlign: "center", color: "#2e3347", fontSize: 11, marginTop: 40 },
});

const doc = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 20, borderBottomWidth: 1 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  brandDot: { width: 8, height: 8, borderRadius: 4 },
  brand: { fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  portalBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  portalTxt: { fontSize: 9, fontWeight: "800" },
  docName: { fontSize: 18, fontWeight: "800" },
  docSub: { fontSize: 12, marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  profileAccessCard: { marginHorizontal: 12, marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 14 },
  profileAccessTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  profileAccessTitle: { fontSize: 14, fontWeight: "800" },
  profileAccessSub: { fontSize: 11, marginTop: 3 },
  profileAccessAction: { fontSize: 12, fontWeight: "800" },
  profileDetails: { borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
  sharedProfileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sharedProfileItem: { width: "47%" },
  sharedProfileLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  sharedProfileValue: { fontSize: 12, fontWeight: "700", marginTop: 3 },
  sharedProfileSection: { fontSize: 10, fontWeight: "800", marginTop: 15, marginBottom: 4 },
  sharedProfileBody: { fontSize: 12, lineHeight: 18 },
  sharedProfileUpdated: { fontSize: 9, marginTop: 14 },
  reportVitalsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reportVital: { width: "31%", paddingVertical: 5 },
  reportVitalValue: { fontSize: 12, fontWeight: "800" },
  reportVitalLabel: { fontSize: 9, marginTop: 2 },
  doctorPdfButton: { borderWidth: 1, borderRadius: 8, alignItems: "center", paddingVertical: 10, marginTop: 12 },
  doctorPdfButtonText: { fontSize: 11, fontWeight: "800" },
  emergencyBanner: { margin: 12, padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: "#e11d48", backgroundColor: "#2d0a12" },
  emergencyTitle: { color: "#e11d48", fontSize: 15, fontWeight: "900", marginBottom: 4 },
  emergencySub: { color: "#fca5a5", fontSize: 12, marginBottom: 12 },
  emergencyBtns: { flexDirection: "row", gap: 8 },
  emergencyBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  emergencyBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  overviewCard: { margin: 12, borderWidth: 1, borderRadius: 16, padding: 16 },
  overviewTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 12 },
  overviewGrid: { flexDirection: "row", justifyContent: "space-around" },
  overviewItem: { alignItems: "center" },
  overviewNum: { fontSize: 28, fontWeight: "900" },
  overviewLabel: { fontSize: 11, marginTop: 2 },
  filterPill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  filterTxt: { fontSize: 12, fontWeight: "600" },
  queueTitle: { fontSize: 16, fontWeight: "800", paddingHorizontal: 12, marginTop: 8, marginBottom: 8 },
  patientCard: { marginHorizontal: 12, marginBottom: 10, borderWidth: 1, borderLeftWidth: 4, borderRadius: 16, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 14, fontWeight: "800" },
  patientName: { fontSize: 15, fontWeight: "700" },
  patientSub: { fontSize: 12, marginTop: 2 },
  sosBadge: { backgroundColor: "#e11d48", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  sosTxt: { fontSize: 9, color: "#fff", fontWeight: "800" },
  riskBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  riskTxt: { fontSize: 11, fontWeight: "700" },
  vitalsRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, borderTopWidth: 1 },
  vitalItem: { alignItems: "center" },
  vitalVal: { fontSize: 15, fontWeight: "800" },
  vitalUnit: { fontSize: 9 },
  vitalLabel: { fontSize: 9, marginTop: 2 },
  factorRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1 },
  factorLabel: { fontSize: 11 },
  factorVal: { fontSize: 11, fontWeight: "700", flex: 1 },
  actionRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  actionBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});


