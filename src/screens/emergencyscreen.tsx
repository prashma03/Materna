import React, { useState, useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Animated,
  Alert,
  useWindowDimensions,
} from "react-native";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  Heart,
  HeartPulse,
  Home,
  Hospital,
  LogOut,
  MessageCircle,
  Phone,
  Settings,
  ShieldCheck,
  Siren,
} from "lucide-react-native";
import { sendEmergencyAlert } from "../api/maternaAPI";
import { sampleSensorData } from "../data/sampleSensorData";
import { loadProfile } from "../storage/profileStorage";

interface Props {
  theme: "dark" | "light";
  onClose?: () => void;
}

const NEAREST_HOSPITAL = {
  name: "Delta Memorial Hospital",
  type: "Level IV · Labor & Delivery",
  distance: "8 miles",
  time: "~12 min",
  phone: "8707935000",
  address: "811 South St, Dumas, AR",
  bedsAvailable: 3,
};

const AMBULANCE = {
  id: "AMB-047",
  driver: "Paramedic J. Williams",
  eta: "9 min",
  phone: "5013885555",
  status: "En route",
};

export default function EmergencyScreen({ theme, onClose }: Props) {
  const { width } = useWindowDimensions();
  const dark = theme === "dark";
  const c = dark ? colors.dark : colors.light;
  const isDesktop = Platform.OS === "web" && width >= 1000;

  const [phase, setPhase] = useState<"idle" | "activating" | "active">("idle");
  const [bedReserved, setBedReserved] = useState(false);
  const [ambulanceCalled, setAmbulanceCalled] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [doctorAlertStatus, setDoctorAlertStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const alertSent = useRef(false);

  // Pulse animation for emergency button
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Countdown when activating
  useEffect(() => {
    if (phase !== "activating") return;
    if (countdown === 0) {
      setPhase("active");
      notifyDoctor();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  async function notifyDoctor() {
    if (alertSent.current) return;
    alertSent.current = true;
    setDoctorAlertStatus("sending");
    const profile = await loadProfile();
    const result = await sendEmergencyAlert({
      patient_id: "patient_001",
      patient_name: profile?.fullName || "Maya Johnson",
      pregnancy_week: profile?.pregnancyWeek || 28,
      location: profile?.county
        ? `${profile.county} County, Arkansas`
        : "Location unavailable",
      vitals: sampleSensorData.vitals,
    });
    setDoctorAlertStatus(result ? "sent" : "failed");
  }

  function handleEmergencyPress() {
    alertSent.current = false;
    setDoctorAlertStatus("idle");
    setPhase("activating");
    setCountdown(3);
  }

  function handleCancel() {
    setPhase("idle");
    setCountdown(3);
  }

  function handleCall(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  function handleDirections() {
    const query = encodeURIComponent(NEAREST_HOSPITAL.address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  }

  function handleReserveBed() {
    setBedReserved(true);
  }

  function handleCallAmbulance() {
    setAmbulanceCalled(true);
  }

  if (isDesktop) {
    return (
      <DesktopEmergencyScreen
        pulse={pulse}
        phase={phase}
        countdown={countdown}
        doctorAlertStatus={doctorAlertStatus}
        bedReserved={bedReserved}
        ambulanceCalled={ambulanceCalled}
        onClose={onClose}
        onEmergencyPress={handleEmergencyPress}
        onCancel={handleCancel}
        onCall={handleCall}
        onDirections={handleDirections}
        onReserveBed={handleReserveBed}
        onCallAmbulance={handleCallAmbulance}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Text style={[styles.backText, { color: c.textMuted }]}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.screenTitle, { color: "#ff4444" }]}>EMERGENCY</Text>
        </View>

        {/* ── IDLE: Big emergency button ── */}
        {phase === "idle" && (
          <View style={styles.centerSection}>
            <Text style={[styles.instructions, { color: c.textMuted }]}>
              Press and hold if you are experiencing a medical emergency
            </Text>

            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity
                style={styles.emergencyBtn}
                onPress={handleEmergencyPress}
                activeOpacity={0.85}
              >
                <Text style={styles.emergencyBtnIcon}>🚨</Text>
                <Text style={styles.emergencyBtnText}>EMERGENCY</Text>
                <Text style={styles.emergencyBtnSub}>Tap to activate</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}
                onPress={() => handleCall("911")}
              >
                <Text style={styles.quickBtnIcon}>📞</Text>
                <Text style={[styles.quickBtnText, { color: c.text }]}>Call 911</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}
                onPress={() => handleCall(NEAREST_HOSPITAL.phone)}
              >
                <Text style={styles.quickBtnIcon}>🏥</Text>
                <Text style={[styles.quickBtnText, { color: c.text }]}>Call Hospital</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── ACTIVATING: Countdown ── */}
        {phase === "activating" && (
          <View style={styles.centerSection}>
            <View style={[styles.countdownCard, { backgroundColor: c.card, borderColor: "#ff4444" }]}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={[styles.countdownLabel, { color: c.text }]}>
                Activating emergency response...
              </Text>
              <Text style={[styles.countdownSub, { color: c.textMuted }]}>
                Notifying nearest hospital and emergency contacts
              </Text>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: c.cardBorder }]}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelBtnText, { color: c.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── ACTIVE: Emergency response ── */}
        {phase === "active" && (
          <View>
            {/* Alert banner */}
            <View style={styles.alertBanner}>
              <Text style={styles.alertBannerText}>
                🚨 Emergency activated · Hospital notified · Contacts alerted
              </Text>
              <Text style={styles.alertBannerStatus}>
                {doctorAlertStatus === "sending"
                  ? "Sending alert to linked doctor..."
                  : doctorAlertStatus === "sent"
                  ? "Linked doctor notified successfully"
                  : doctorAlertStatus === "failed"
                  ? "Doctor alert could not be delivered. Call 911 now."
                  : "Preparing doctor notification..."}
              </Text>
            </View>

            {/* Nearest hospital */}
            <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
              NEAREST L&D HOSPITAL
            </Text>
            <View style={[styles.hospitalCard, { backgroundColor: c.card, borderColor: "#ff4444" }]}>
              <View style={styles.hospitalTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hospitalName, { color: c.text }]}>
                    {NEAREST_HOSPITAL.name}
                  </Text>
                  <Text style={[styles.hospitalType, { color: c.textMuted }]}>
                    {NEAREST_HOSPITAL.type}
                  </Text>
                </View>
                <View style={[styles.etaBadge, { backgroundColor: "#ff444422" }]}>
                  <Text style={styles.etaText}>{NEAREST_HOSPITAL.time}</Text>
                </View>
              </View>

              <Text style={[styles.hospitalDistance, { color: c.textMuted }]}>
                📍 {NEAREST_HOSPITAL.distance} away
              </Text>

              <View style={[styles.bedsRow, { backgroundColor: bedReserved ? "#14532d" : "#1a1a2e" }]}>
                <Text style={{ color: bedReserved ? "#4ade80" : c.textMuted, fontSize: 13 }}>
                  {bedReserved
                    ? "✓ Bed reserved in Labor & Delivery"
                    : `🛏 ${NEAREST_HOSPITAL.bedsAvailable} L&D beds available`}
                </Text>
              </View>

              <View style={styles.hospitalBtns}>
                <TouchableOpacity
                  style={[styles.hospitalBtn, { backgroundColor: "#ff4444" }]}
                  onPress={() => handleCall(NEAREST_HOSPITAL.phone)}
                >
                  <Text style={styles.hospitalBtnText}>📞 Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.hospitalBtn, { backgroundColor: c.cardBorder }]}
                  onPress={handleDirections}
                >
                  <Text style={[styles.hospitalBtnText, { color: c.text }]}>🗺 Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.hospitalBtn,
                    { backgroundColor: bedReserved ? "#14532d" : "#6c63ff" },
                  ]}
                  onPress={handleReserveBed}
                  disabled={bedReserved}
                >
                  <Text style={styles.hospitalBtnText}>
                    {bedReserved ? "✓ Reserved" : "Reserve Bed"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Ambulance tracking */}
            <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
              AMBULANCE TRACKING
            </Text>
            <View style={[styles.ambulanceCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              {!ambulanceCalled ? (
                <View style={styles.ambulanceIdle}>
                  <Text style={{ fontSize: 36 }}>🚑</Text>
                  <Text style={[styles.ambulanceIdleText, { color: c.text }]}>
                    Dispatch an ambulance to your location
                  </Text>
                  <TouchableOpacity
                    style={styles.dispatchBtn}
                    onPress={handleCallAmbulance}
                  >
                    <Text style={styles.dispatchBtnText}>🚑 Dispatch Ambulance</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.ambulanceHeader}>
                    <Text style={{ fontSize: 28 }}>🚑</Text>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.ambulanceId, { color: c.text }]}>
                        {AMBULANCE.id}
                      </Text>
                      <Text style={[styles.ambulanceDriver, { color: c.textMuted }]}>
                        {AMBULANCE.driver}
                      </Text>
                    </View>
                    <View style={[styles.etaBadge, { backgroundColor: "#14532d" }]}>
                      <Text style={[styles.etaText, { color: "#4ade80" }]}>
                        ETA {AMBULANCE.eta}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusRow, { borderColor: c.cardBorder }]}>
                    <View style={styles.statusDot} />
                    <Text style={[styles.statusText, { color: "#4ade80" }]}>
                      {AMBULANCE.status} · Live tracking active
                    </Text>
                  </View>

                  {/* Map placeholder */}
                  <View style={[styles.mapPlaceholder, { backgroundColor: dark ? "#0a0f1a" : "#e8f0fe" }]}>
                    <Text style={styles.mapEmoji}>🗺️</Text>
                    <Text style={[styles.mapText, { color: c.textMuted }]}>
                      Live map · Ambulance en route
                    </Text>
                    <View style={styles.mapAmbulance}>
                      <Text>🚑</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.callAmbBtn, { backgroundColor: "#ff4444" }]}
                    onPress={() => handleCall(AMBULANCE.phone)}
                  >
                    <Text style={styles.callAmbBtnText}>📞 Call Paramedic</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Deactivate */}
            <TouchableOpacity
              style={[styles.deactivateBtn, { borderColor: c.cardBorder }]}
              onPress={handleCancel}
            >
              <Text style={[styles.deactivateBtnText, { color: c.textMuted }]}>
                Deactivate Emergency
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function DesktopEmergencyScreen({
  pulse,
  phase,
  countdown,
  doctorAlertStatus,
  bedReserved,
  ambulanceCalled,
  onClose,
  onEmergencyPress,
  onCancel,
  onCall,
  onDirections,
  onReserveBed,
  onCallAmbulance,
}: {
  pulse: Animated.Value;
  phase: "idle" | "activating" | "active";
  countdown: number;
  doctorAlertStatus: "idle" | "sending" | "sent" | "failed";
  bedReserved: boolean;
  ambulanceCalled: boolean;
  onClose?: () => void;
  onEmergencyPress: () => void;
  onCancel: () => void;
  onCall: (phone: string) => void;
  onDirections: () => void;
  onReserveBed: () => void;
  onCallAmbulance: () => void;
}) {
  const navItems = [
    { label: "Dashboard", icon: Home },
    { label: "Today", icon: CalendarDays },
    { label: "Symptoms", icon: HeartPulse },
    { label: "Care Plan", icon: ClipboardList },
    { label: "Hospitals", icon: Hospital },
    { label: "Reports", icon: FileText },
    { label: "Emergency", icon: AlertTriangle, active: true },
    { label: "Messages", icon: MessageCircle },
    { label: "Settings", icon: Settings },
  ];

  return (
    <SafeAreaView style={desktopEmergency.safe}>
      <View style={desktopEmergency.shell}>
        <View style={desktopEmergency.sidebar}>
          <View style={desktopEmergency.brandRow}>
            <View style={desktopEmergency.brandMark}>
              <Heart size={34} color="#02070D" fill="#02070D" />
            </View>
            <View>
              <Text style={desktopEmergency.brandName}>MATERNA</Text>
              <Text style={desktopEmergency.brandTagline}>Care for you. Care for two.</Text>
            </View>
          </View>
          <View style={desktopEmergency.navList}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.label}
                  style={[
                    desktopEmergency.navItem,
                    item.active && desktopEmergency.navItemActive,
                  ]}
                >
                  <Icon size={20} color={item.active ? "#FB7185" : "#CBD5E1"} />
                  <Text
                    style={[
                      desktopEmergency.navText,
                      item.active && desktopEmergency.navTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={desktopEmergency.doctorCard}>
            <View style={desktopEmergency.doctorAvatar}>
              <Text style={desktopEmergency.doctorAvatarText}>AP</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={desktopEmergency.doctorName}>Dr. Aisha Patel</Text>
              <Text style={desktopEmergency.doctorMeta}>OB-GYN</Text>
              <Text style={desktopEmergency.doctorHospital}>Delta Memorial Hospital</Text>
            </View>
          </View>
          <View style={desktopEmergency.logoutRow}>
            <LogOut size={20} color="#CBD5E1" />
            <Text style={desktopEmergency.logoutText}>Log out</Text>
          </View>
        </View>

        <ScrollView
          style={desktopEmergency.contentScroll}
          contentContainerStyle={desktopEmergency.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={desktopEmergency.card}>
            <Pressable style={desktopEmergency.backRow} onPress={onClose}>
              <ArrowLeft size={20} color="#CBD5E1" />
              <Text style={desktopEmergency.backText}>Back</Text>
            </Pressable>

            <View style={desktopEmergency.hero}>
              <View style={desktopEmergency.titleRow}>
                <Text style={desktopEmergency.title}>EMERGENCY</Text>
                <Siren size={42} color="#FB7185" />
              </View>
              <Text style={desktopEmergency.instructions}>
                Press and hold if you are experiencing a medical emergency
              </Text>

              <View style={desktopEmergency.ecgWrap}>
                <View style={desktopEmergency.ecgLine} />
                <HeartPulse size={34} color="#EF4444" style={desktopEmergency.ecgLeft} />
                <HeartPulse size={34} color="#EF4444" style={desktopEmergency.ecgRight} />
                <Animated.View
                  style={[
                    desktopEmergency.buttonPulseOuter,
                    { transform: [{ scale: pulse }] },
                  ]}
                >
                  <Pressable
                    style={desktopEmergency.bigEmergencyButton}
                    onPress={onEmergencyPress}
                    accessibilityRole="button"
                    accessibilityLabel="Activate emergency"
                  >
                    <Siren size={58} color="#FFFFFF" />
                    <Text style={desktopEmergency.buttonTitle}>
                      {phase === "activating"
                        ? `${countdown}`
                        : phase === "active"
                        ? "ACTIVE"
                        : "EMERGENCY"}
                    </Text>
                    <Text style={desktopEmergency.buttonSub}>
                      {phase === "active" ? "Doctor notified" : "Press and hold"}
                    </Text>
                  </Pressable>
                </Animated.View>
              </View>
            </View>

            {phase === "active" ? (
              <DesktopEmergencyActive
                doctorAlertStatus={doctorAlertStatus}
                bedReserved={bedReserved}
                ambulanceCalled={ambulanceCalled}
                onCall={onCall}
                onDirections={onDirections}
                onReserveBed={onReserveBed}
                onCallAmbulance={onCallAmbulance}
                onCancel={onCancel}
              />
            ) : (
              <DesktopEmergencyIdle onCall={onCall} />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DesktopEmergencyIdle({ onCall }: { onCall: (phone: string) => void }) {
  return (
    <>
      <View style={desktopEmergency.actionGrid}>
        <Pressable style={desktopEmergency.call911Card} onPress={() => onCall("911")}>
          <View style={desktopEmergency.callIconRed}>
            <Phone size={44} color="#FB7185" fill="#FB7185" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={desktopEmergency.actionTitle}>Call 911</Text>
            <Text style={desktopEmergency.actionBody}>For immediate help</Text>
          </View>
          <Text style={desktopEmergency.redArrow}>›</Text>
        </Pressable>

        <Pressable
          style={desktopEmergency.callHospitalCard}
          onPress={() => onCall(NEAREST_HOSPITAL.phone)}
        >
          <View style={desktopEmergency.callIconPurple}>
            <Building2 size={44} color="#A78BFA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={desktopEmergency.actionTitle}>Call Hospital</Text>
            <Text style={desktopEmergency.actionBody}>Reach your care team</Text>
          </View>
          <Text style={desktopEmergency.purpleArrow}>›</Text>
        </Pressable>
      </View>

      <View style={desktopEmergency.infoGrid}>
        <View style={desktopEmergency.whenCard}>
          <View style={desktopEmergency.infoHeader}>
            <AlertTriangle size={32} color="#FB7185" />
            <Text style={desktopEmergency.infoTitle}>When to use Emergency</Text>
          </View>
          {[
            "Severe bleeding or heavy spotting",
            "Severe headache, blurred vision",
            "Difficulty breathing or chest pain",
            "Baby's movement stops or feels very low",
            "Any other situation where you feel something is seriously wrong",
          ].map((item) => (
            <View key={item} style={desktopEmergency.checkLine}>
              <View style={desktopEmergency.checkDot}>
                <Text style={desktopEmergency.checkText}>✓</Text>
              </View>
              <Text style={desktopEmergency.checkLabel}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={desktopEmergency.reassureCard}>
          <View style={desktopEmergency.shieldIcon}>
            <ShieldCheck size={52} color="#22C55E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={desktopEmergency.infoTitle}>You're not alone</Text>
            <Text style={desktopEmergency.reassureText}>
              Materna is here to keep you and your baby safe.
            </Text>
            <Text style={desktopEmergency.reassureText}>Get help when you need it.</Text>
          </View>
          <View style={desktopEmergency.motherSilhouette}>
            <View style={desktopEmergency.motherHair} />
            <View style={desktopEmergency.motherBody} />
            <View style={desktopEmergency.motherBump} />
          </View>
        </View>
      </View>

      <View style={desktopEmergency.footerLine}>
        <View style={desktopEmergency.footerRule} />
        <Heart size={20} color="#EF4444" fill="#EF4444" />
        <Text style={desktopEmergency.footerText}>Stay safe. We care.</Text>
        <View style={desktopEmergency.footerRule} />
      </View>
    </>
  );
}

function DesktopEmergencyActive({
  doctorAlertStatus,
  bedReserved,
  ambulanceCalled,
  onCall,
  onDirections,
  onReserveBed,
  onCallAmbulance,
  onCancel,
}: {
  doctorAlertStatus: "idle" | "sending" | "sent" | "failed";
  bedReserved: boolean;
  ambulanceCalled: boolean;
  onCall: (phone: string) => void;
  onDirections: () => void;
  onReserveBed: () => void;
  onCallAmbulance: () => void;
  onCancel: () => void;
}) {
  const status =
    doctorAlertStatus === "sending"
      ? "Sending alert to linked doctor..."
      : doctorAlertStatus === "sent"
      ? "Linked doctor notified successfully"
      : doctorAlertStatus === "failed"
      ? "Doctor alert could not be delivered. Call 911 now."
      : "Preparing doctor notification...";

  return (
    <View style={desktopEmergency.activeGrid}>
      <View style={desktopEmergency.activePanel}>
        <Text style={desktopEmergency.activeTitle}>Emergency response active</Text>
        <Text style={desktopEmergency.activeBody}>{status}</Text>
        <View style={desktopEmergency.activeActions}>
          <Pressable style={desktopEmergency.activeRedButton} onPress={() => onCall("911")}>
            <Phone size={19} color="#FFFFFF" />
            <Text style={desktopEmergency.activeButtonText}>Call 911</Text>
          </Pressable>
          <Pressable
            style={desktopEmergency.activeOutlineButton}
            onPress={() => onCall(NEAREST_HOSPITAL.phone)}
          >
            <Text style={desktopEmergency.activeOutlineText}>Call hospital</Text>
          </Pressable>
        </View>
      </View>

      <View style={desktopEmergency.activePanel}>
        <Text style={desktopEmergency.activeTitle}>{NEAREST_HOSPITAL.name}</Text>
        <Text style={desktopEmergency.activeBody}>
          {NEAREST_HOSPITAL.distance} away - {NEAREST_HOSPITAL.time}
        </Text>
        <Text style={desktopEmergency.activeBody}>
          {bedReserved
            ? "Bed reserved in Labor & Delivery"
            : `${NEAREST_HOSPITAL.bedsAvailable} L&D beds available`}
        </Text>
        <View style={desktopEmergency.activeActions}>
          <Pressable style={desktopEmergency.activeOutlineButton} onPress={onDirections}>
            <Text style={desktopEmergency.activeOutlineText}>Navigate</Text>
          </Pressable>
          <Pressable
            style={desktopEmergency.activePurpleButton}
            onPress={onReserveBed}
            disabled={bedReserved}
          >
            <Text style={desktopEmergency.activeButtonText}>
              {bedReserved ? "Reserved" : "Reserve bed"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={desktopEmergency.activePanel}>
        <Text style={desktopEmergency.activeTitle}>
          {ambulanceCalled ? `${AMBULANCE.id} en route` : "Ambulance tracking"}
        </Text>
        <Text style={desktopEmergency.activeBody}>
          {ambulanceCalled
            ? `${AMBULANCE.driver} - ETA ${AMBULANCE.eta}`
            : "Dispatch an ambulance to your location."}
        </Text>
        <View style={desktopEmergency.activeActions}>
          <Pressable
            style={desktopEmergency.activeRedButton}
            onPress={ambulanceCalled ? () => onCall(AMBULANCE.phone) : onCallAmbulance}
          >
            <Text style={desktopEmergency.activeButtonText}>
              {ambulanceCalled ? "Call paramedic" : "Dispatch ambulance"}
            </Text>
          </Pressable>
          <Pressable style={desktopEmergency.activeOutlineButton} onPress={onCancel}>
            <Text style={desktopEmergency.activeOutlineText}>Deactivate</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function getColors(mode: "dark" | "light") {
  const isDark = mode === "dark";
  return {
    background: isDark ? "#0a0a0f" : "#f5f7fa",
    text: isDark ? "#f0f0f0" : "#1a1a1a",
    textMuted: isDark ? "#8a8fa8" : "#6b7280",
    card: isDark ? "#12121a" : "#ffffff",
    cardBorder: isDark ? "#2e3347" : "#e5e7eb",
  };
}

const colors = { dark: getColors("dark"), light: getColors("light") };

const desktopEmergency = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#02070D" },
  shell: { flex: 1, flexDirection: "row", backgroundColor: "#02070D" },
  sidebar: {
    width: 274,
    margin: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 22,
    backgroundColor: "#070D16",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    paddingBottom: 28,
    marginBottom: 24,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
  },
  brandName: { color: "#F8FAFC", fontSize: 24, fontWeight: "900" },
  brandTagline: { color: "#94A3B8", fontSize: 11, marginTop: 6 },
  navList: { flex: 1, gap: 8 },
  navItem: {
    minHeight: 48,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  navItemActive: {
    borderWidth: 1,
    borderColor: "#BE123C",
    backgroundColor: "#351018",
  },
  navText: { color: "#CBD5E1", fontSize: 15, fontWeight: "600" },
  navTextActive: { color: "#FB7185", fontWeight: "900" },
  doctorCard: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#071019",
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  doctorAvatarText: { color: "#0F172A", fontSize: 13, fontWeight: "900" },
  doctorName: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  doctorMeta: { color: "#CBD5E1", fontSize: 12, marginTop: 4 },
  doctorHospital: { color: "#94A3B8", fontSize: 10, marginTop: 3 },
  logoutRow: { height: 42, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18 },
  logoutText: { color: "#CBD5E1", fontSize: 14, fontWeight: "700" },
  contentScroll: { flex: 1 },
  content: { paddingVertical: 10, paddingRight: 10 },
  card: {
    minHeight: 980,
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingTop: 34,
    paddingBottom: 22,
    backgroundColor: "#060B13",
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start" },
  backText: { color: "#CBD5E1", fontSize: 15 },
  hero: { alignItems: "center", marginTop: -4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  title: { color: "#FB7185", fontSize: 42, fontWeight: "900", letterSpacing: 10 },
  instructions: { color: "#E5E7EB", fontSize: 17, marginTop: 18 },
  ecgWrap: {
    height: 320,
    width: "100%",
    maxWidth: 980,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ecgLine: { position: "absolute", height: 1, left: 20, right: 20, backgroundColor: "#8B1F2F" },
  ecgLeft: { position: "absolute", left: 175, opacity: 0.9 },
  ecgRight: { position: "absolute", right: 145, opacity: 0.9 },
  buttonPulseOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EF444455",
    backgroundColor: "#EF44441A",
    shadowColor: "#EF4444",
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  bigEmergencyButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF233C",
    shadowColor: "#EF4444",
    shadowOpacity: 0.9,
    shadowRadius: 35,
  },
  buttonTitle: { color: "#FFFFFF", fontSize: 27, fontWeight: "900", letterSpacing: 1, marginTop: 8 },
  buttonSub: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginTop: 8 },
  actionGrid: {
    width: "100%",
    maxWidth: 1060,
    alignSelf: "center",
    flexDirection: "row",
    gap: 36,
    marginTop: 4,
  },
  call911Card: {
    flex: 1,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#BE123C",
    borderRadius: 8,
    backgroundColor: "#170B13",
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  callHospitalCard: {
    flex: 1,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#6D28D9",
    borderRadius: 8,
    backgroundColor: "#100D22",
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  callIconRed: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#401522",
  },
  callIconPurple: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#24153F",
  },
  actionTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900" },
  actionBody: { color: "#CBD5E1", fontSize: 15, marginTop: 12 },
  redArrow: { color: "#FB7185", fontSize: 42, fontWeight: "300" },
  purpleArrow: { color: "#A78BFA", fontSize: 42, fontWeight: "300" },
  infoGrid: {
    width: "100%",
    maxWidth: 1060,
    alignSelf: "center",
    flexDirection: "row",
    gap: 28,
    marginTop: 30,
  },
  whenCard: {
    flex: 1,
    minHeight: 250,
    borderWidth: 1,
    borderColor: "#BE123C",
    borderRadius: 8,
    backgroundColor: "#170B13",
    padding: 28,
  },
  reassureCard: {
    flex: 1,
    minHeight: 250,
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 8,
    backgroundColor: "#071A16",
    padding: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    overflow: "hidden",
  },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 18 },
  infoTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  checkLine: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginTop: 13 },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkText: { color: "#EF4444", fontSize: 11, fontWeight: "900" },
  checkLabel: { color: "#E5E7EB", fontSize: 15, lineHeight: 23, flex: 1 },
  shieldIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  reassureText: { color: "#E5E7EB", fontSize: 16, lineHeight: 27, marginTop: 16 },
  motherSilhouette: {
    width: 130,
    height: 180,
    alignItems: "center",
    justifyContent: "flex-end",
    opacity: 0.35,
  },
  motherHair: {
    position: "absolute",
    top: 18,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#14532D",
  },
  motherBody: {
    width: 70,
    height: 118,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: "#22C55E",
  },
  motherBump: {
    position: "absolute",
    bottom: 14,
    width: 82,
    height: 70,
    borderRadius: 41,
    backgroundColor: "#16A34A",
  },
  footerLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 26,
  },
  footerRule: { width: 78, height: 1, backgroundColor: "#1F2937" },
  footerText: { color: "#E5E7EB", fontSize: 15 },
  activeGrid: {
    width: "100%",
    maxWidth: 1060,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 10,
  },
  activePanel: {
    flex: 1,
    minWidth: 320,
    borderWidth: 1,
    borderColor: "#BE123C",
    borderRadius: 8,
    backgroundColor: "#170B13",
    padding: 22,
  },
  activeTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  activeBody: { color: "#E5E7EB", fontSize: 14, lineHeight: 22, marginTop: 12 },
  activeActions: { flexDirection: "row", gap: 12, marginTop: 20, flexWrap: "wrap" },
  activeRedButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 18,
    backgroundColor: "#E11D48",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  activePurpleButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 18,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
  },
  activeOutlineButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#374151",
    justifyContent: "center",
  },
  activeButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  activeOutlineText: { color: "#CBD5E1", fontSize: 13, fontWeight: "900" },
});

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24, marginTop: 8 },
  backBtn: { marginRight: 12 },
  backText: { fontSize: 15 },
  screenTitle: { fontSize: 22, fontWeight: "900", letterSpacing: 4 },
  centerSection: { alignItems: "center", paddingVertical: 20 },
  instructions: { fontSize: 14, textAlign: "center", marginBottom: 32, lineHeight: 20, paddingHorizontal: 20 },
  emergencyBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ff1a1a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff0000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 40,
  },
  emergencyBtnIcon: { fontSize: 48, marginBottom: 4 },
  emergencyBtnText: { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  emergencyBtnSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 },
  quickActions: { flexDirection: "row", gap: 12, width: "100%" },
  quickBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  quickBtnIcon: { fontSize: 24 },
  quickBtnText: { fontSize: 13, fontWeight: "700" },
  countdownCard: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  countdownNumber: { fontSize: 80, fontWeight: "900", color: "#ff4444", lineHeight: 90 },
  countdownLabel: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  countdownSub: { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  cancelBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, fontWeight: "600" },
  alertBanner: {
    backgroundColor: "#ff1a1a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  alertBannerText: { color: "#fff", fontWeight: "700", fontSize: 13, textAlign: "center" },
  alertBannerStatus: { color: "#fee2e2", fontSize: 11, textAlign: "center", marginTop: 5 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 2, marginBottom: 10 },
  hospitalCard: { borderWidth: 2, borderRadius: 16, padding: 16, marginBottom: 24 },
  hospitalTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  hospitalName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  hospitalType: { fontSize: 12 },
  etaBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  etaText: { color: "#ff4444", fontSize: 13, fontWeight: "700" },
  hospitalDistance: { fontSize: 12, marginBottom: 12 },
  bedsRow: { borderRadius: 10, padding: 10, marginBottom: 14 },
  hospitalBtns: { flexDirection: "row", gap: 8 },
  hospitalBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  hospitalBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  ambulanceCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  ambulanceIdle: { alignItems: "center", paddingVertical: 16, gap: 12 },
  ambulanceIdleText: { fontSize: 14, textAlign: "center", fontWeight: "600" },
  dispatchBtn: { backgroundColor: "#ff4444", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  dispatchBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  ambulanceHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ambulanceId: { fontSize: 16, fontWeight: "700" },
  ambulanceDriver: { fontSize: 12 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" },
  statusText: { fontSize: 13, fontWeight: "600" },
  mapPlaceholder: { borderRadius: 12, height: 140, alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative" },
  mapEmoji: { fontSize: 40, marginBottom: 8 },
  mapText: { fontSize: 12 },
  mapAmbulance: { position: "absolute", bottom: 30, left: "40%", fontSize: 20 },
  callAmbBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  callAmbBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  deactivateBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  deactivateBtnText: { fontSize: 14, fontWeight: "600" },
});
