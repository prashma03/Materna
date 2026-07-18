
import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, Pressable, KeyboardAvoidingView, Platform
} from "react-native";
import { Heart } from "lucide-react-native";

export default function LoginScreen({ theme, onLogin }) {
  const isDark = theme === "dark";
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const c = {
    bg:     isDark ? "#05070A" : "#F8FAFC",
    card:   isDark ? "#101418" : "#FFFFFF",
    border: isDark ? "#242B33" : "#E2E8F0",
    text:   isDark ? "#F8FAFC" : "#0F172A",
    muted:  isDark ? "#64748B" : "#94A3B8",
    green:  "#22C55E",
  };

  function handleLogin() {
    // Frontend-only: accept any non-empty input for local sign-in
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    onLogin();
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.wrap}>

        {/* Brand */}
        <View style={s.brand}>
          <View style={[s.iconCircle, { backgroundColor: "#19231E", borderColor: c.green }]}>
            <Heart size={28} color={c.green} fill={c.green} />
          </View>
          <Text style={[s.appName, { color: c.text }]}>MATERNA</Text>
          <Text style={[s.tagline, { color: c.muted }]}>
            Rural maternal safety for connected care
          </Text>
        </View>

        {/* Card */}
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[s.cardTitle, { color: c.text }]}>Sign In</Text>

          <Text style={[s.label, { color: c.muted }]}>Email</Text>
          <TextInput
            style={[s.input, { backgroundColor: c.bg, borderColor: c.border, color: c.text }]}
            placeholder="you@example.com"
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[s.label, { color: c.muted }]}>Password</Text>
          <TextInput
            style={[s.input, { backgroundColor: c.bg, borderColor: c.border, color: c.text }]}
            placeholder="••••••••"
            placeholderTextColor={c.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Pressable style={[s.btn, { backgroundColor: c.green }]} onPress={handleLogin}>
            <Text style={s.btnText}>Continue →</Text>
          </Pressable>

          <Text style={[s.hint, { color: c.muted }]}>
            Enter your details to continue
          </Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1 },
  wrap:       { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  brand:      { alignItems: "center", marginBottom: 32 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  appName:    { fontSize: 22, fontWeight: "900", letterSpacing: 4, marginBottom: 6 },
  tagline:    { fontSize: 13, textAlign: "center" },
  card:       { borderWidth: 1, borderRadius: 20, padding: 24 },
  cardTitle:  { fontSize: 20, fontWeight: "800", marginBottom: 20 },
  label:      { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, marginTop: 12 },
  input:      { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  error:      { color: "#e11d48", fontSize: 13, marginTop: 8 },
  btn:        { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 20 },
  btnText:    { color: "#fff", fontWeight: "800", fontSize: 15 },
  hint:       { fontSize: 11, textAlign: "center", marginTop: 12 },
});
