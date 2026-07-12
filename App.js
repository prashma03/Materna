import React, { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/profilescreen";
import AIChatScreen from "./src/screens/AIChatScreen";
import HospitalsScreen from "./src/screens/HospitalsScreen";
import EmergencyScreen from "./src/screens/emergencyscreen";
import DoctorWorkspace from "./src/screens/doctor/DoctorWorkspace";

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

