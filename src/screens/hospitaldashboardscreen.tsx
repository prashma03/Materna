import React from "react";
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, Platform
} from "react-native";
import { ArrowLeft, Map } from "lucide-react-native";

/*
 * HOW THIS WORKS:
 * ──────────────────────────────────────────────────────────────────
 * The full dashboard.html (with Leaflet map, ambulance tracking,
 * hospital cards, triage routing, GPS) is embedded here.
 *
 * On NATIVE (iOS/Android): uses react-native-webview to show dashboard.html
 *   Install: npx expo install react-native-webview
 *   Import:  uncomment the WebView import below
 *
 * On WEB (Expo Web / browser): uses a plain <iframe> via a web-only shim
 *   The dashboard.html file must be placed in: /public/dashboard.html
 *   Then it loads at: /dashboard.html
 * ──────────────────────────────────────────────────────────────────
 */

// STEP 1: Uncomment this when you have installed react-native-webview
// import { WebView } from "react-native-webview";

// STEP 2: On Expo Web, this file uses iframe. On native, WebView loads the HTML.
// For demo purposes the component works in ALL environments.

const DASHBOARD_HTML_PATH =
  Platform.OS === "web"
    ? "/dashboard.html"         // Put dashboard.html inside /public folder
    : "file:///android_asset/dashboard.html"; // Android asset folder
    // iOS: bundle with metro, see README below

export default function HospitalDashboardScreen({ theme, navigate }) {
  const isDark = theme === "dark";
  const c = {
    bg:     isDark ? "#05070A" : "#F8FAFC",
    border: isDark ? "#242B33" : "#E2E8F0",
    text:   isDark ? "#F8FAFC" : "#0F172A",
    muted:  isDark ? "#64748B" : "#94A3B8",
    green:  "#22C55E",
  };

  // ─── WEB PLATFORM (Expo Web / browser) ───────────────────────
  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
        <View style={[s.header, { borderBottomColor: c.border }]}>
          <Pressable onPress={() => navigate("Hospitals")}>
            <ArrowLeft size={24} color={c.text} />
          </Pressable>
          <Text style={[s.title, { color: c.text }]}>Command Dashboard</Text>
          <Map size={22} color={c.green} />
        </View>
        {/* @ts-ignore — iframe is valid on web */}
        <iframe
          src={DASHBOARD_HTML_PATH}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            border: "none",
            minHeight: "calc(100vh - 70px)",
          }}
          title="MaternaAI Command Dashboard"
          allow="geolocation"
        />
      </SafeAreaView>
    );
  }

  // ─── NATIVE PLATFORM (iOS / Android) ─────────────────────────
  // Uncomment the WebView import at the top, then uncomment this block:
  /*
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <Pressable onPress={() => navigate("Hospitals")}>
          <ArrowLeft size={24} color={c.text} />
        </Pressable>
        <Text style={[s.title, { color: c.text }]}>Command Dashboard</Text>
        <Map size={22} color={c.green} />
      </View>
      <WebView
        source={{ uri: DASHBOARD_HTML_PATH }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        geolocationEnabled={true}
        allowFileAccess={true}
        originWhitelist={["*"]}
        onError={(e) => console.warn("WebView error:", e)}
      />
    </SafeAreaView>
  );
  */

  // ─── FALLBACK (native, before WebView is installed) ───────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <Pressable onPress={() => navigate("Hospitals")}>
          <ArrowLeft size={24} color={c.text} />
        </Pressable>
        <Text style={[s.title, { color: c.text }]}>Command Dashboard</Text>
        <Map size={22} color={c.green} />
      </View>

      <View style={s.setupCard}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>🗺️</Text>
        <Text style={[s.setupTitle, { color: c.text }]}>
          One install away from the live map
        </Text>
        <Text style={[s.setupBody, { color: c.muted }]}>
          The full hospital dashboard with Leaflet maps, ambulance tracking,
          and GPS routing is ready. To enable it on mobile:
        </Text>

        <View style={[s.step, { borderColor: c.border }]}>
          <Text style={[s.stepNum, { color: c.green }]}>1</Text>
          <Text style={[s.stepTxt, { color: c.text }]}>
            Run:{"\n"}
            <Text style={{ fontFamily: "monospace", color: c.green }}>
              npx expo install react-native-webview
            </Text>
          </Text>
        </View>

        <View style={[s.step, { borderColor: c.border }]}>
          <Text style={[s.stepNum, { color: c.green }]}>2</Text>
          <Text style={[s.stepTxt, { color: c.text }]}>
            Copy{" "}
            <Text style={{ fontFamily: "monospace", color: c.green }}>dashboard.html</Text>
            {"\n"}→ Android: {"/android/app/src/main/assets/"}
            {"\n"}→ iOS: add to Xcode bundle resources
          </Text>
        </View>

        <View style={[s.step, { borderColor: c.border }]}>
          <Text style={[s.stepNum, { color: c.green }]}>3</Text>
          <Text style={[s.stepTxt, { color: c.text }]}>
            Uncomment the{" "}
            <Text style={{ fontFamily: "monospace", color: c.green }}>WebView</Text>
            {" "}block in{"\n"}hospitaldashboardscreen.tsx
          </Text>
        </View>

        <Pressable
          style={[s.webBtn, { backgroundColor: "#19231E", borderColor: c.green }]}
          onPress={() => navigate("Hospitals")}
        >
          <Text style={{ color: c.green, fontWeight: "700" }}>← Back to Hospital List</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1 },
  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1 },
  title:      { fontSize: 18, fontWeight: "800" },
  setupCard:  { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  setupTitle: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  setupBody:  { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  step:       { width: "100%", flexDirection: "row", gap: 12, padding: 14, borderWidth: 1, borderRadius: 12, marginBottom: 10, alignItems: "flex-start" },
  stepNum:    { fontSize: 18, fontWeight: "900", width: 24 },
  stepTxt:    { flex: 1, fontSize: 13, lineHeight: 20 },
  webBtn:     { marginTop: 16, borderWidth: 1, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
});
