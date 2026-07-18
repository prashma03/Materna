import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { ArrowLeft, Stethoscope } from "lucide-react-native";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  hospital: string;
}

const DOCTORS: Doctor[] = [
  {
    id: "doctor-1",
    name: "Dr. Sarah Mitchell",
    email: "s.mitchell@drewmemorial.org",
    specialization: "OB-GYN",
    hospital: "Drew Memorial Health System",
  },
  {
    id: "doctor-2",
    name: "Dr. Joseph Okafor",
    email: "j.okafor@jeffersonregional.org",
    specialization: "Maternal-Fetal Medicine",
    hospital: "Jefferson Regional Medical Center",
  },
];

function findDoctorByEmail(email: string): Doctor | undefined {
  return DOCTORS.find(
    (doctor) => doctor.email.toLowerCase() === email.trim().toLowerCase()
  );
}

interface Props {
  theme: string;
  onLogin: (doctor: Doctor) => void;
  onBack: () => void;
}

export default function DoctorLoginScreen({ theme, onLogin, onBack }: Props) {
  const isDark = theme === "dark";
  const c = {
    bg:     isDark ? "#05070A" : "#F8FAFC",
    card:   isDark ? "#101418" : "#FFFFFF",
    border: isDark ? "#242B33" : "#E2E8F0",
    text:   isDark ? "#F8FAFC" : "#0F172A",
    muted:  isDark ? "#64748B" : "#94A3B8",
    purple: "#6c63ff",
  };

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Any registered email + any password works in this local sign-in flow.
      const doctor = findDoctorByEmail(email) ?? DOCTORS[0];
      setLoading(false);
      onLogin(doctor);
    }, 800);
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={s.wrap}>

            <Pressable onPress={onBack} style={s.backBtn}>
              <ArrowLeft size={22} color={c.muted} />
              <Text style={[s.backTxt, { color: c.muted }]}>Change role</Text>
            </Pressable>

            {/* Icon */}
            <View style={[s.iconCircle, { backgroundColor: "#19153a", borderColor: c.purple }]}>
              <Stethoscope size={32} color={c.purple} />
            </View>
            <Text style={[s.title, { color: c.text }]}>Doctor Portal</Text>
            <Text style={[s.subtitle, { color: c.muted }]}>
              Sign in to access your patient command center
            </Text>

            {/* Form */}
            <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[s.label, { color: c.muted }]}>Work Email</Text>
              <TextInput
                style={[s.input, { backgroundColor: c.bg, borderColor: c.border, color: c.text }]}
                placeholder="doctor@hospital.org"
                placeholderTextColor={c.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={t => { setEmail(t); setError(""); }}
              />

              <Text style={[s.label, { color: c.muted }]}>Password</Text>
              <TextInput
                style={[s.input, { backgroundColor: c.bg, borderColor: c.border, color: c.text }]}
                placeholder="••••••••"
                placeholderTextColor={c.muted}
                secureTextEntry
                value={password}
                onChangeText={t => { setPassword(t); setError(""); }}
              />

              {error ? <Text style={s.error}>{error}</Text> : null}

              <Pressable
                style={[s.btn, { backgroundColor: loading ? "#4a43cc" : c.purple }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={s.btnText}>
                  {loading ? "Signing in..." : "Access Dashboard →"}
                </Text>
              </Pressable>
            </View>

            {/* Sign-in hint */}
            <View style={[s.hint, { backgroundColor: isDark ? "#19153a" : "#ede9fe", borderColor: c.purple }]}>
              <Text style={[s.hintTitle, { color: c.purple }]}>Provider Access</Text>
              <Text style={[s.hintTxt, { color: c.muted }]}>
                Email: s.mitchell@drewmemorial.org{"\n"}
                Password: your assigned password{"\n\n"}
                Or use: j.okafor@jeffersonregional.org
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1 },
  wrap:       { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backBtn:    { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 32 },
  backTxt:    { fontSize: 14 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title:      { fontSize: 24, fontWeight: "900", marginBottom: 6 },
  subtitle:   { fontSize: 14, marginBottom: 28 },
  card:       { borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 20 },
  label:      { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 12 },
  input:      { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  error:      { color: "#e11d48", fontSize: 13, marginTop: 8 },
  btn:        { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 20 },
  btnText:    { color: "#fff", fontWeight: "800", fontSize: 15 },
  hint:       { borderWidth: 1, borderRadius: 14, padding: 14 },
  hintTitle:  { fontSize: 12, fontWeight: "800", marginBottom: 6 },
  hintTxt:    { fontSize: 12, lineHeight: 18 },
});
