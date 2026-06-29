import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Sparkles, Sun, Moon, MessageCircle, MapPin, FileText, ShieldAlert, CheckCircle2, CalendarClock } from "lucide-react-native";
import { scenarios } from "../data/sampleSensorData";
import type { RiskLevel } from "../data/sampleSensorData";

type HomeScreenProps = {
  theme: "dark" | "light";
  toggleTheme: () => void;
  onAskMaterna: () => void;
  onOpenHospitals: () => void;
  onOpenProfile: () => void;
  onEmergency: () => void;
  activeScenario: RiskLevel;
  onScenarioChange: (level: RiskLevel) => void;
};

export default function HomeScreen({
  theme,
  toggleTheme,
  onAskMaterna,
  onOpenHospitals,
  onOpenProfile,
  onEmergency,
  activeScenario,
  onScenarioChange,
}: HomeScreenProps) {
  const isDark = theme === "dark";
  const data = scenarios[activeScenario];

  const colors = {
    background: isDark ? "#05070A" : "#F8FAFC",
    card: isDark ? "#101418" : "#FFFFFF",
    border: isDark ? "#242B33" : "#E2E8F0",
    text: isDark ? "#F8FAFC" : "#0F172A",
    mutedText: isDark ? "#94A3B8" : "#64748B",
    softText: isDark ? "#CBD5E1" : "#475569",
  };

  const riskColor = data.risk.color;
  const riskCardBg =
    activeScenario === "Red"
      ? isDark ? "#1a0505" : "#fff5f5"
      : activeScenario === "Yellow"
      ? isDark ? "#1a1505" : "#fffbeb"
      : colors.card;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View>
              <Text style={[styles.brand, { color: colors.text }]}>MATERNA</Text>
              <Text style={[styles.week, { color: colors.mutedText }]}>
                Maya · Week {data.mother.pregnancyWeek}
              </Text>
            </View>
            <Pressable
              onPress={toggleTheme}
              style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {isDark ? <Sun size={14} color={colors.text} /> : <Moon size={14} color={colors.text} />}
              <Text style={[styles.themeButtonText, { color: colors.text }]}>
                {isDark ? "Light" : "Dark"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.dotSwitcher}>
            {(["Green", "Yellow", "Red"] as RiskLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => onScenarioChange(level)}
                style={[
                  styles.switcherDot,
                  {
                    backgroundColor: scenarios[level].risk.color,
                    width: activeScenario === level ? 28 : 10,
                    opacity: activeScenario === level ? 1 : 0.4,
                  },
                ]}
              />
            ))}
          </View>

          <View
            style={[
              styles.statusCard,
              { backgroundColor: riskCardBg, borderColor: colors.border, borderLeftColor: riskColor },
            ]}
          >
            <View style={styles.statusTopRow}>
              <View style={[styles.statusPill, { backgroundColor: riskColor + "22", borderColor: riskColor }]}>
                <View style={[styles.statusDot, { backgroundColor: riskColor }]} />
                <Text style={[styles.statusText, { color: riskColor }]}>{data.risk.message}</Text>
              </View>
              <Text style={[styles.confidence, { color: colors.mutedText }]}>
                Care priority {activeScenario}
              </Text>
            </View>

            <Text style={[styles.heroTitle, { color: colors.text }]}>{data.risk.headline}</Text>
            <Text style={[styles.heroBody, { color: colors.softText }]}>{data.risk.description}</Text>

            {data.risk.pattern && (
              <View style={[styles.patternRow, { borderColor: colors.border }]}>
                <View style={[styles.patternBadge, { borderColor: riskColor }]}>
                  <Text style={[styles.patternLabel, { color: riskColor }]}>REVIEW FLAG</Text>
                </View>
                <Text style={[styles.patternText, { color: riskColor }]}>{data.risk.pattern}</Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.smallLabel, { color: colors.mutedText }]}>NEXT STEP</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>{data.risk.action}</Text>
          </View>

          <Pressable
            onPress={onAskMaterna}
            style={[styles.primaryAction, { backgroundColor: "#22C55E" }]}
          >
            <Sparkles size={18} color="#ffffff" />
            <Text style={styles.primaryActionText}>Ask Materna about symptoms</Text>
          </Pressable>

          <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.planHeader}>
              <CalendarClock size={18} color="#22C55E" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.planTitle, { color: colors.text }]}>Today's care plan</Text>
                <Text style={[styles.planSubtitle, { color: colors.mutedText }]}>
                  Software check-ins to help identify risk earlier.
                </Text>
              </View>
            </View>
            {[
              activeScenario === "Red"
                ? "Review emergency symptoms and contact care team now"
                : "Log any new symptoms before the end of the day",
              "Keep profile and pregnancy history updated",
              activeScenario === "Green"
                ? "Know your closest hospital before you need it"
                : "Confirm the safest hospital route for your current symptoms",
            ].map((item) => (
              <View key={item} style={styles.planItem}>
                <CheckCircle2 size={16} color="#22C55E" />
                <Text style={[styles.planItemText, { color: colors.softText }]}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Care tools</Text>
          <View style={styles.toolGrid}>
            <ToolCard
              icon={MessageCircle}
              title="AI symptom chat"
              body="Describe symptoms and get safe escalation guidance."
              onPress={onAskMaterna}
              c={colors}
            />
            <ToolCard
              icon={ShieldAlert}
              title="Emergency support"
              body="Use the red button below to notify the linked doctor workflow."
              onPress={onEmergency}
              c={colors}
            />
            <ToolCard
              icon={MapPin}
              title="Hospital navigation"
              body="Find nearby hospitals, emergency care, and county resources."
              onPress={onOpenHospitals}
              c={colors}
            />
            <ToolCard
              icon={FileText}
              title="Profile report"
              body="Create a patient-approved profile and PDF summary."
              onPress={onOpenProfile}
              c={colors}
            />
          </View>

          <Text style={[styles.note, { color: colors.mutedText }]}>
            Wearable sensor support will be added later. This version focuses on software workflows:
            symptoms, care navigation, profile reports, emergency alerts, and doctor coordination.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToolCard({
  icon: Icon,
  title,
  body,
  onPress,
  c,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  body: string;
  onPress: () => void;
  c: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toolCard, { backgroundColor: c.card, borderColor: c.border }]}
    >
      <Icon size={18} color="#22C55E" />
      <Text style={[styles.toolTitle, { color: c.text }]}>{title}</Text>
      <Text style={[styles.toolBody, { color: c.mutedText }]}>{body}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: "center" },
  content: { width: "100%", maxWidth: 430, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brand: { fontSize: 17, fontWeight: "900", letterSpacing: 2 },
  week: { fontSize: 12, marginTop: 3 },
  themeButton: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  themeButtonText: { fontSize: 11, fontWeight: "700" },
  dotSwitcher: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  switcherDot: { height: 10, borderRadius: 5 },
  statusCard: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 18, padding: 16, marginBottom: 16 },
  statusTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  statusPill: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 99 },
  statusText: { fontSize: 12, fontWeight: "800" },
  confidence: { fontSize: 10 },
  heroTitle: { fontSize: 22, lineHeight: 28, fontWeight: "900", marginBottom: 10 },
  heroBody: { fontSize: 13, lineHeight: 20 },
  patternRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  patternBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  patternLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  patternText: { fontSize: 12, fontWeight: "700", flex: 1 },
  divider: { height: 1, marginVertical: 14 },
  smallLabel: { fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  actionText: { fontSize: 13, fontWeight: "700" },
  primaryAction: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14, marginBottom: 20 },
  primaryActionText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  planCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 20 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  planTitle: { fontSize: 14, fontWeight: "900" },
  planSubtitle: { fontSize: 11, marginTop: 2 },
  planItem: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 7 },
  planItemText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  sectionTitle: { fontSize: 15, fontWeight: "900", marginBottom: 10 },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  toolCard: { width: "48%", minHeight: 132, borderWidth: 1, borderRadius: 12, padding: 12 },
  toolTitle: { fontSize: 13, fontWeight: "800", marginTop: 9 },
  toolBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  note: { fontSize: 11, lineHeight: 17, marginTop: 18 },
});
