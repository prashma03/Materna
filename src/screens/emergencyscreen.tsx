import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Animated,
  Alert,
} from "react-native";
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
  const dark = theme === "dark";
  const c = dark ? colors.dark : colors.light;

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

                  {/* Demo map placeholder */}
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
