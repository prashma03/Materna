import React, { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Image, Platform, ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable, useWindowDimensions } from "react-native";
import {
  Baby,
  Bell,
  ChevronRight,
  Heart,
  Home,
  Hospital,
  House,
  Leaf,
  Monitor,
  ShieldCheck,
  Siren,
  Smartphone,
  Stethoscope,
  UserRound,
  Users,
  Wifi,
} from "lucide-react-native";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/profilescreen";
import MaternaChatScreen from "./src/screens/MaternaChatScreen";
import HospitalsScreen from "./src/screens/HospitalsScreen";
import EmergencyScreen from "./src/screens/emergencyscreen";
import DoctorWorkspace from "./src/screens/doctor/DoctorWorkspace";

export default function App() {
  const { width } = useWindowDimensions();
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
  const isDesktopPatient = Platform.OS === "web" && width >= 1000;
  const isDesktopDoctor = Platform.OS === "web" && width >= 1000;
  const isDesktopLogin = Platform.OS === "web" && width >= 900;

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
    if (isDesktopLogin) {
      return (
        <DesktopLogin
          onPatient={() => setUserType("patient")}
          onDoctor={() => setUserType("doctor")}
        />
      );
    }

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

          <LoginChoice
            icon={Baby}
            title="I'm a Patient"
            subtitle="Report symptoms, get alerts, connect with care"
            accent="#22C55E"
            background="#0a1a0f"
            onPress={() => setUserType("patient")}
          />

          <LoginChoice
            icon={Stethoscope}
            title="I'm a Doctor"
            subtitle="Monitor patients, manage alerts, view dashboard"
            accent="#6c63ff"
            background="#0d0b1a"
            onPress={() => setUserType("doctor")}
          />

          <Text style={login.footer}>
            Materna - Arkansas Rural Health
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
          <View style={{ width: "100%", maxWidth: isDesktopDoctor ? 1600 : 430, flex: 1 }}>
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
        <View style={{ width: "100%", maxWidth: isDesktopPatient ? 760 : 430, flex: 1 }}>
          <MaternaChatScreen
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
        <View style={{ width: "100%", maxWidth: isDesktopPatient ? 1600 : 430, flex: 1 }}>
          <EmergencyScreen theme={theme} onClose={() => setShowEmergency(false)} />
        </View>
      </View>
    );
  }

  return (
      <View style={{ flex: 1, backgroundColor: screenBg }}>

      {/* Screens */}
      <View style={{ flex: 1, alignItems: "center", backgroundColor: screenBg }}>
        <View style={{ width: "100%", maxWidth: isDesktopPatient ? 1600 : 430, flex: 1 }}>
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
          )}
          {activeTab === "Hospitals" && (
            <HospitalsScreen theme={theme} riskLevel={activeScenario} />
          )}
          {activeTab === "Profile" && <ProfileScreen theme={theme} />}
        </View>
      </View>

      {/* Bottom nav */}
      {!isDesktopPatient && (
      <View style={{ backgroundColor: navBg, borderTopWidth: 1, borderTopColor: navBorder }}>
        <View style={[styles.nav, { backgroundColor: navBg }]}>
          {[
            { label: "Today", icon: Home, emergency: false },
            { label: "Emergency", icon: Siren, emergency: true },
            { label: "Hospitals", icon: Hospital, emergency: false },
            { label: "Profile", icon: UserRound, emergency: false },
          ].map(({ label, icon: Icon, emergency }) => {
            const isActive = activeTab === label;
            const color = emergency ? "#ff4444" : isActive ? activeColor : inactiveColor;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.navItem, emergency && styles.emergencyNavItem]}
                onPress={() => emergency ? setShowEmergency(true) : setActiveTab(label)}
                accessibilityRole="button"
                accessibilityLabel={emergency ? "Open emergency support" : `Open ${label}`}
              >
                <View style={[styles.navIconShell, emergency && styles.emergencyIconShell]}>
                  <Icon
                    size={emergency ? 24 : 21}
                    color={color}
                    strokeWidth={emergency ? 2.7 : 2.2}
                  />
                </View>
                {!emergency && (
                  <Text style={[styles.navLabel, { color }]}>{label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      )}

    </View>
  );
}

function LoginChoice({
  icon: Icon,
  title,
  subtitle,
  accent,
  background,
  onPress,
}) {
  return (
    <Pressable
      style={[login.loginBtn, { borderColor: accent, backgroundColor: background }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[login.loginIconShell, { backgroundColor: `${accent}18` }]}>
        <Icon size={27} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[login.loginBtnTitle, { color: accent }]}>{title}</Text>
        <Text style={login.loginBtnSub}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color={accent} />
    </Pressable>
  );
}

function DesktopLogin({ onPatient, onDoctor }) {
  const features = [
    {
      title: "Private & Secure",
      body: "Your data is protected with enterprise-grade security.",
      icon: ShieldCheck,
    },
    {
      title: "Built for Rural Care",
      body: "Designed for rural Arkansas communities and providers.",
      icon: Wifi,
    },
    {
      title: "Timely Alerts",
      body: "Get notified early and take action faster.",
      icon: Bell,
    },
    {
      title: "Better Outcomes",
      body: "Connecting moms to care for healthier futures.",
      icon: Users,
    },
  ];

  return (
    <SafeAreaView style={desktopLogin.container}>
      <ScrollView
        contentContainerStyle={desktopLogin.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={desktopLogin.content}>
          <View style={desktopLogin.heroRow}>
            <View style={desktopLogin.identityBlock}>
              <Image
                source={require("./assets/materna-app-icon.png")}
                style={desktopLogin.brandLogo}
                resizeMode="cover"
              />
              <View>
                <Text style={desktopLogin.brandTitle}>MATERNA</Text>
                <Text style={desktopLogin.brandSubtitle}>
                  Maternal health monitoring{"\n"}for rural Arkansas
                </Text>
              </View>
            </View>

            <View style={desktopLogin.heroDivider} />

            <View style={desktopLogin.welcomeBlock}>
              <View style={desktopLogin.welcomeTitleRow}>
                <Text style={desktopLogin.welcomeTitle}>
                  Welcome to <Text style={desktopLogin.greenText}>Materna</Text>
                </Text>
                <Heart size={34} color="#4ADE80" />
              </View>
              <Text style={desktopLogin.welcomeBody}>
                Smart maternal health monitoring and support,{"\n"}
                built for rural communities in Arkansas.
              </Text>
            </View>

            <View style={desktopLogin.heroArt}>
              <View style={desktopLogin.heroGlow} />
              <Leaf size={86} color="#255F38" style={desktopLogin.heroLeafLeft} />
              <View style={desktopLogin.motherFigure}>
                <View style={desktopLogin.motherHair} />
                <View style={desktopLogin.motherFace} />
                <View style={desktopLogin.motherBody} />
                <View style={desktopLogin.motherBump} />
              </View>
              <Leaf size={92} color="#2E7D48" style={desktopLogin.heroLeafRight} />
              <View style={desktopLogin.starOne} />
              <View style={desktopLogin.starTwo} />
              <View style={desktopLogin.starThree} />
            </View>
          </View>

          <View style={desktopLogin.sectionHeader}>
            <View style={desktopLogin.headerIcon}>
              <Users size={19} color="#4ADE80" />
            </View>
            <Text style={desktopLogin.sectionTitle}>WHO ARE YOU?</Text>
            <View style={desktopLogin.headerLine} />
          </View>

          <DesktopRoleCard
            icon={Baby}
            artIcon={Smartphone}
            title="I'm a Patient"
            body="Report symptoms, get alerts, connect with care."
            accent="#4ADE80"
            background="#082415"
            onPress={onPatient}
          />

          <DesktopRoleCard
            icon={Stethoscope}
            artIcon={Monitor}
            title="I'm a Doctor"
            body="Monitor patients, manage alerts, view dashboard."
            accent="#8B5CF6"
            background="#130B2B"
            onPress={onDoctor}
          />

          <View style={desktopLogin.featureStrip}>
            {features.map((feature) => (
              <View key={feature.title} style={desktopLogin.featureItem}>
                <View style={desktopLogin.featureIcon}>
                  <feature.icon size={28} color="#4ADE80" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={desktopLogin.featureTitle}>{feature.title}</Text>
                  <Text style={desktopLogin.featureBody}>{feature.body}</Text>
                </View>
              </View>
            ))}
            <View style={desktopLogin.ruralLine}>
              <House size={46} color="#1F6B39" />
              <View style={desktopLogin.hillOne} />
              <View style={desktopLogin.hillTwo} />
            </View>
          </View>

          <Text style={desktopLogin.footer}>Materna - Arkansas Rural Health</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DesktopRoleCard({
  icon: Icon,
  artIcon: ArtIcon,
  title,
  body,
  accent,
  background,
  onPress,
}) {
  return (
    <Pressable
      style={[
        desktopLogin.roleCard,
        { borderColor: accent, backgroundColor: background },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[desktopLogin.roleIcon, { backgroundColor: `${accent}1F` }]}>
        <Icon size={52} color={accent} strokeWidth={1.8} />
      </View>
      <View style={desktopLogin.roleCopy}>
        <Text style={[desktopLogin.roleTitle, { color: accent }]}>{title}</Text>
        <Text style={desktopLogin.roleBody}>{body}</Text>
      </View>
      <View style={desktopLogin.roleArt}>
        <Leaf size={64} color={`${accent}33`} style={desktopLogin.roleLeafLeft} />
        <ArtIcon size={106} color={`${accent}99`} strokeWidth={1.6} />
        <Leaf size={62} color={`${accent}26`} style={desktopLogin.roleLeafRight} />
      </View>
      <View style={[desktopLogin.roleArrow, { borderColor: `${accent}55` }]}>
        <ChevronRight size={42} color={accent} />
      </View>
    </Pressable>
  );
}

const desktopLogin = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#02070D" },
  scroll: {
    flexGrow: 1,
    backgroundColor: "#02070D",
    paddingHorizontal: 64,
    paddingVertical: 30,
    alignItems: "center",
  },
  content: { width: "100%", maxWidth: 1560 },
  heroRow: {
    minHeight: 190,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    position: "relative",
  },
  identityBlock: { width: 380, flexDirection: "row", alignItems: "center", gap: 22 },
  brandLogo: { width: 92, height: 92, borderRadius: 46 },
  brandTitle: {
    color: "#F8FAFC",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 1,
  },
  brandSubtitle: { color: "#CBD5E1", fontSize: 18, lineHeight: 28, marginTop: 10 },
  heroDivider: { width: 1, height: 140, backgroundColor: "#273142", marginRight: 56 },
  welcomeBlock: { flex: 1, zIndex: 2 },
  welcomeTitleRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  welcomeTitle: { color: "#FFFFFF", fontSize: 42, lineHeight: 52, fontWeight: "900" },
  greenText: { color: "#4ADE80" },
  welcomeBody: { color: "#CBD5E1", fontSize: 21, lineHeight: 32, marginTop: 22 },
  heroArt: {
    width: 390,
    height: 190,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    bottom: 22,
    width: 230,
    height: 160,
    borderRadius: 130,
    backgroundColor: "#12351F",
    opacity: 0.95,
  },
  heroLeafLeft: { position: "absolute", left: 38, bottom: 8, transform: [{ rotate: "-22deg" }] },
  heroLeafRight: { position: "absolute", right: 18, bottom: 6, transform: [{ rotate: "22deg" }] },
  motherFigure: { width: 118, height: 178, alignItems: "center", justifyContent: "flex-end", zIndex: 3 },
  motherHair: {
    position: "absolute",
    top: 7,
    width: 78,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#111827",
    transform: [{ rotate: "-8deg" }],
  },
  motherFace: {
    position: "absolute",
    top: 36,
    width: 48,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F2B98C",
  },
  motherBody: {
    width: 70,
    height: 104,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: "#59A765",
  },
  motherBump: {
    position: "absolute",
    bottom: 16,
    width: 82,
    height: 72,
    borderRadius: 45,
    backgroundColor: "#68B875",
  },
  starOne: { position: "absolute", top: 18, left: 86, width: 4, height: 4, borderRadius: 2, backgroundColor: "#FEF08A" },
  starTwo: { position: "absolute", top: 80, right: 32, width: 5, height: 5, borderRadius: 3, backgroundColor: "#FEF08A" },
  starThree: { position: "absolute", top: 40, right: 118, width: 3, height: 3, borderRadius: 2, backgroundColor: "#FEF08A" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 18, marginBottom: 18 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D2618",
  },
  sectionTitle: { color: "#4ADE80", fontSize: 21, fontWeight: "900", letterSpacing: 4 },
  headerLine: { flex: 1, height: 1, backgroundColor: "#1F2937" },
  roleCard: {
    height: 126,
    borderWidth: 1.5,
    borderRadius: 22,
    marginBottom: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    position: "relative",
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 36,
  },
  roleCopy: { width: 470, zIndex: 2 },
  roleTitle: { fontSize: 27, fontWeight: "900", marginBottom: 10 },
  roleBody: { color: "#CBD5E1", fontSize: 19, lineHeight: 26 },
  roleArt: {
    position: "absolute",
    right: 150,
    height: "100%",
    width: 360,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.78,
  },
  roleLeafLeft: { position: "absolute", left: 30, bottom: 16, transform: [{ rotate: "-25deg" }] },
  roleLeafRight: { position: "absolute", right: 18, bottom: 18, transform: [{ rotate: "25deg" }] },
  roleArrow: {
    marginLeft: "auto",
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#02070D66",
  },
  featureStrip: {
    minHeight: 104,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 22,
    backgroundColor: "#071019",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    overflow: "hidden",
  },
  featureItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 18, zIndex: 2 },
  featureIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E7A3A",
    backgroundColor: "#0B2718",
  },
  featureTitle: { color: "#F8FAFC", fontSize: 14, fontWeight: "900", marginBottom: 6 },
  featureBody: { color: "#CBD5E1", fontSize: 13, lineHeight: 19, maxWidth: 220 },
  ruralLine: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 360,
    height: 92,
    opacity: 0.55,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 24,
  },
  hillOne: {
    position: "absolute",
    right: 8,
    bottom: 12,
    width: 250,
    height: 70,
    borderTopWidth: 1,
    borderColor: "#1F6B39",
    borderRadius: 120,
  },
  hillTwo: {
    position: "absolute",
    right: 86,
    bottom: -2,
    width: 270,
    height: 78,
    borderTopWidth: 1,
    borderColor: "#1F6B39",
    borderRadius: 130,
  },
  footer: { color: "#64748B", textAlign: "center", fontSize: 14, marginTop: 16 },
});

const styles = StyleSheet.create({
  nav: { flexDirection: "row", paddingBottom: 24, paddingTop: 10, maxWidth: 430, width: "100%", alignSelf: "center", alignItems: "center" },
  navItem: { flex: 1, alignItems: "center", gap: 4 },
  emergencyNavItem: { marginTop: -16 },
  navIconShell: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  emergencyIconShell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ff4444",
    backgroundColor: "#2d0a12",
  },
  navLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0 },
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
  tagline: { fontSize: 15, color: "#94A3B8", lineHeight: 22, marginBottom: 32 },
  divider: { height: 1, backgroundColor: "#242B33", marginBottom: 28 },
  chooseLabel: { fontSize: 13, color: "#94A3B8", fontWeight: "800", letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1.5, borderRadius: 14, padding: 17, marginBottom: 14 },
  loginIconShell: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  loginBtnTitle: { fontSize: 17, fontWeight: "800", marginBottom: 3 },
  loginBtnSub: { fontSize: 12, color: "#94A3B8", lineHeight: 18 },
  footer: { textAlign: "center", color: "#4B5563", fontSize: 11, marginTop: 40 },
});

