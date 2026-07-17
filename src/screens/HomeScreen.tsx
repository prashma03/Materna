import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  Sparkles,
  Sun,
  Moon,
  MessageCircle,
  MapPin,
  FileText,
  ShieldAlert,
  CheckCircle2,
  CalendarClock,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Grid2X2,
  Heart,
  Home,
  Info,
  Pill,
  PlusCircle,
  Settings,
  UserRound,
  Watch,
  AlertTriangle,
  Leaf,
} from "lucide-react-native";
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
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1000;
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

  if (isDesktop) {
    return (
      <DesktopHome
        theme={theme}
        toggleTheme={toggleTheme}
        onAskMaterna={onAskMaterna}
        onOpenHospitals={onOpenHospitals}
        onOpenProfile={onOpenProfile}
        onEmergency={onEmergency}
        activeScenario={activeScenario}
        onScenarioChange={onScenarioChange}
      />
    );
  }

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

function DesktopHome({
  theme,
  toggleTheme,
  onAskMaterna,
  onOpenHospitals,
  onOpenProfile,
  onEmergency,
  activeScenario,
  onScenarioChange,
}: HomeScreenProps) {
  const data = scenarios[activeScenario];
  const riskColor = data.risk.color;
  const desktopColors = {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceSoft: "#F1F8F3",
    border: "#DDE7E2",
    text: "#0F172A",
    muted: "#607086",
    green: "#16A85F",
    red: "#E11D48",
  };

  const navItems = [
    { label: "Dashboard", icon: Home, active: true, onPress: undefined },
    { label: "Today", icon: CalendarDays, active: false, onPress: undefined },
    { label: "Symptoms", icon: Heart, active: false, onPress: onAskMaterna },
    { label: "Care Plan", icon: ClipboardList, active: false, onPress: undefined },
    { label: "Tools", icon: Grid2X2, active: false, onPress: undefined, trailing: ChevronDown },
    { label: "Hospitals", icon: Building2, active: false, onPress: onOpenHospitals },
    { label: "Reports", icon: FileText, active: false, onPress: onOpenProfile },
    { label: "Wearables", icon: Watch, active: false, onPress: undefined, badge: "Coming soon" },
    { label: "Settings", icon: Settings, active: false, onPress: undefined },
  ];

  const quickActions = [
    { label: "Add symptom", icon: PlusCircle, onPress: onAskMaterna },
    { label: "Log vitals", icon: Heart, onPress: undefined },
    { label: "Medication reminder", icon: Pill, onPress: undefined },
    { label: "Appointment tracker", icon: CalendarDays, onPress: undefined },
  ];

  const carePlan = [
    activeScenario === "Red"
      ? "Review emergency symptoms and contact care team now"
      : "Log any new symptoms before the end of the day",
    "Keep profile and pregnancy history updated",
    activeScenario === "Green"
      ? "Know your closest hospital before you need it"
      : "Confirm the safest hospital route for your current symptoms",
    "Hydrate well and take your prenatal vitamins",
  ];

  const toolCards = [
    {
      title: "AI symptom chat",
      body: "Describe symptoms and get safe escalation guidance.",
      icon: MessageCircle,
      onPress: onAskMaterna,
    },
    {
      title: "Emergency support",
      body: "Use the red button below to notify the linked doctor workflow.",
      icon: ShieldAlert,
      onPress: onEmergency,
      danger: true,
    },
    {
      title: "Hospital navigation",
      body: "Find nearby hospitals, emergency care, and county resources.",
      icon: MapPin,
      onPress: onOpenHospitals,
    },
    {
      title: "Profile report",
      body: "Create a patient-approved profile and PDF summary.",
      icon: FileText,
      onPress: onOpenProfile,
    },
  ];

  return (
    <SafeAreaView style={desktopStyles.safeArea}>
      <View style={desktopStyles.shell}>
        <View style={desktopStyles.sidebar}>
          <View style={desktopStyles.brandBlock}>
            <Image
              source={require("../../assets/materna-app-icon.png")}
              style={desktopStyles.logo}
              resizeMode="cover"
            />
            <View>
              <Text style={desktopStyles.brandName}>MATERNA</Text>
              <Text style={desktopStyles.brandTagline}>Care for you. Care for two.</Text>
            </View>
          </View>

          <View style={desktopStyles.sidebarNav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const Trailing = item.trailing;
              return (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  style={[
                    desktopStyles.sidebarItem,
                    item.active && desktopStyles.sidebarItemActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Icon
                    size={19}
                    color={item.active ? desktopColors.green : "#111827"}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      desktopStyles.sidebarLabel,
                      item.active && desktopStyles.sidebarLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View style={desktopStyles.sidebarBadge}>
                      <Text style={desktopStyles.sidebarBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {Trailing && <Trailing size={16} color="#111827" />}
                </Pressable>
              );
            })}
          </View>

          <View style={desktopStyles.helpCard}>
            <Text style={desktopStyles.helpTitle}>Need help?</Text>
            <Text style={desktopStyles.helpBody}>
              Our AI assistant is here 24/7 to support you.
            </Text>
            <Pressable style={desktopStyles.helpButton} onPress={onAskMaterna}>
              <MessageCircle size={16} color="#FFFFFF" />
              <Text style={desktopStyles.helpButtonText}>Chat with Materna AI</Text>
            </Pressable>
            <View style={desktopStyles.helpIllustration}>
              <Leaf size={42} color="#A7D9BC" />
              <Image
                source={require("../../assets/materna-app-icon.png")}
                style={desktopStyles.helpImage}
                resizeMode="cover"
              />
              <Leaf size={42} color="#A7D9BC" />
            </View>
          </View>
        </View>

        <ScrollView
          style={desktopStyles.workspace}
          contentContainerStyle={desktopStyles.workspaceContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={desktopStyles.topBar}>
            <View>
              <Text style={desktopStyles.greeting}>Good morning, Maya</Text>
              <Text style={desktopStyles.subGreeting}>
                You're doing great! Let's keep you and your baby healthy.
              </Text>
            </View>
            <View style={desktopStyles.topActions}>
              <Pressable style={desktopStyles.themeButton} onPress={toggleTheme}>
                <Moon size={18} color="#0F172A" />
                <Text style={desktopStyles.themeButtonText}>Dark</Text>
              </Pressable>
              <View style={desktopStyles.bellButton}>
                <Bell size={22} color="#0F172A" />
                <View style={desktopStyles.alertDot}>
                  <Text style={desktopStyles.alertDotText}>2</Text>
                </View>
              </View>
              <View style={desktopStyles.profilePill}>
                <Image
                  source={require("../../assets/materna-app-icon.png")}
                  style={desktopStyles.profileImage}
                  resizeMode="cover"
                />
                <View>
                  <Text style={desktopStyles.profileName}>Maya Sharma</Text>
                  <Text style={desktopStyles.profileMeta}>28 weeks pregnant</Text>
                </View>
                <ChevronDown size={18} color="#0F172A" />
              </View>
            </View>
          </View>

          <View style={desktopStyles.desktopGrid}>
            <View style={desktopStyles.mainColumn}>
              <View style={[desktopStyles.statusCard, { borderColor: `${riskColor}55` }]}>
                <View style={desktopStyles.statusHeader}>
                  <View style={[desktopStyles.statusPill, { borderColor: `${riskColor}55`, backgroundColor: `${riskColor}10` }]}>
                    <View style={[desktopStyles.statusDot, { backgroundColor: riskColor }]} />
                    <Text style={[desktopStyles.statusPillText, { color: riskColor }]}>
                      {data.risk.message}
                    </Text>
                  </View>
                  <View style={desktopStyles.priorityRow}>
                    <Text style={desktopStyles.priorityText}>Care priority: </Text>
                    <Text style={[desktopStyles.priorityLevel, { color: riskColor }]}>
                      {activeScenario}
                    </Text>
                    <Info size={14} color={riskColor} />
                  </View>
                </View>

                <View style={desktopStyles.statusBody}>
                  <View style={desktopStyles.statusCopy}>
                    <Text style={desktopStyles.statusTitle}>{data.risk.headline}</Text>
                    <Text style={desktopStyles.statusDescription}>{data.risk.description}</Text>
                    <View style={desktopStyles.desktopDivider} />
                    <Text style={desktopStyles.nextStepLabel}>NEXT STEP</Text>
                    <Text style={desktopStyles.nextStepText}>{data.risk.action}</Text>
                  </View>
                  <View style={desktopStyles.statusVisual}>
                    <Leaf size={54} color="#A9DDBD" style={desktopStyles.leafOne} />
                    <View style={[desktopStyles.checkCircle, { backgroundColor: `${riskColor}18` }]}>
                      <CheckCircle2 size={54} color={riskColor} strokeWidth={2.5} />
                    </View>
                    <Leaf size={48} color="#8FCDA9" style={desktopStyles.leafTwo} />
                  </View>
                </View>
              </View>

              <Pressable style={desktopStyles.askBanner} onPress={onAskMaterna}>
                <Sparkles size={28} color="#FFFFFF" />
                <View style={{ flex: 1 }}>
                  <Text style={desktopStyles.askTitle}>Ask Materna about symptoms</Text>
                  <Text style={desktopStyles.askBody}>
                    Get guidance and answers from your AI assistant
                  </Text>
                </View>
                <ChevronRight size={28} color="#FFFFFF" />
              </Pressable>

              <View style={desktopStyles.planCard}>
                <View style={desktopStyles.planContent}>
                  <View style={desktopStyles.planTitleRow}>
                    <CalendarDays size={24} color={desktopColors.green} />
                    <Text style={desktopStyles.desktopPlanTitle}>Today's care plan</Text>
                  </View>
                  {carePlan.map((item) => (
                    <View key={item} style={desktopStyles.planLine}>
                      <CheckCircle2 size={18} color={desktopColors.green} />
                      <Text style={desktopStyles.planLineText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={desktopStyles.motherIllustration}>
                  <Leaf size={82} color="#D6EFE0" />
                  <View style={desktopStyles.motherAvatar}>
                    <View style={desktopStyles.motherHair} />
                    <View style={desktopStyles.motherFace} />
                    <View style={desktopStyles.motherBody} />
                    <View style={desktopStyles.motherBump} />
                  </View>
                  <Heart size={34} color="#F8B4B4" fill="#F8B4B4" />
                  <Leaf size={76} color="#BFE5CC" />
                </View>
              </View>

              <Text style={desktopStyles.sectionTitle}>Care tools</Text>
              <View style={desktopStyles.desktopToolGrid}>
                {toolCards.map((tool) => (
                  <DesktopToolCard key={tool.title} {...tool} />
                ))}
              </View>

              <Text style={desktopStyles.desktopNote}>
                Wearable sensor support will be added later. This version focuses on software workflows:
                symptoms, care navigation, profile reports, emergency alerts, and doctor coordination.
              </Text>
            </View>

            <View style={desktopStyles.rightRail}>
              <View style={desktopStyles.railCard}>
                <View style={desktopStyles.cardTitleRow}>
                  <Text style={desktopStyles.railTitle}>Pregnancy progress</Text>
                  <Info size={15} color="#64748B" />
                </View>
                <View style={desktopStyles.progressRow}>
                  <View style={desktopStyles.progressRing}>
                    <Text style={desktopStyles.progressNumber}>
                      {data.mother.pregnancyWeek}
                    </Text>
                    <Text style={desktopStyles.progressUnit}>weeks</Text>
                  </View>
                  <View>
                    <Text style={desktopStyles.trimester}>3rd trimester</Text>
                    <Text style={desktopStyles.weeksLeft}>12 weeks to go!</Text>
                    <Pressable style={desktopStyles.timelineButton}>
                      <Text style={desktopStyles.timelineText}>View timeline</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={desktopStyles.railCard}>
                <Text style={desktopStyles.railTitle}>Quick actions</Text>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Pressable
                      key={action.label}
                      style={desktopStyles.quickAction}
                      onPress={action.onPress}
                    >
                      <Icon size={21} color={desktopColors.green} />
                      <Text style={desktopStyles.quickActionText}>{action.label}</Text>
                      <ChevronRight size={20} color="#111827" />
                    </Pressable>
                  );
                })}
              </View>

              <View style={desktopStyles.railCard}>
                <Text style={desktopStyles.railTitle}>Tips for you</Text>
                <View style={desktopStyles.tipRow}>
                  <View style={desktopStyles.tipBubble}>
                    <Text style={desktopStyles.tipQuote}>
                      "Rest when you can, eat what nourishes you, and trust your body."
                    </Text>
                    <Text style={desktopStyles.tipSub}>Stay positive, stay strong.</Text>
                  </View>
                  <View style={desktopStyles.plantPot}>
                    <Leaf size={58} color="#79B98F" />
                    <View style={desktopStyles.pot} />
                  </View>
                </View>
              </View>

              <View style={desktopStyles.emergencyCard}>
                <Text style={desktopStyles.emergencyTitle}>Emergency alert</Text>
                <Text style={desktopStyles.emergencyBody}>
                  In case of emergency, alert your linked doctor immediately.
                </Text>
                <Pressable style={desktopStyles.emergencyButton} onPress={onEmergency}>
                  <AlertTriangle size={22} color="#FFFFFF" />
                  <Text style={desktopStyles.emergencyButtonText}>
                    Press and hold to alert
                  </Text>
                </Pressable>
              </View>

              <View style={desktopStyles.scenarioCard}>
                <Text style={desktopStyles.scenarioTitle}>Demo state</Text>
                <View style={desktopStyles.scenarioRow}>
                  {(["Green", "Yellow", "Red"] as RiskLevel[]).map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        desktopStyles.scenarioChip,
                        activeScenario === level && {
                          borderColor: scenarios[level].risk.color,
                          backgroundColor: `${scenarios[level].risk.color}12`,
                        },
                      ]}
                      onPress={() => onScenarioChange(level)}
                    >
                      <Text
                        style={[
                          desktopStyles.scenarioChipText,
                          activeScenario === level && {
                            color: scenarios[level].risk.color,
                          },
                        ]}
                      >
                        {level}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DesktopToolCard({
  icon: Icon,
  title,
  body,
  onPress,
  danger,
}: {
  icon: React.ComponentType<any>;
  title: string;
  body: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const color = danger ? "#E11D48" : "#16A85F";
  return (
    <Pressable style={desktopStyles.desktopToolCard} onPress={onPress}>
      <View style={[desktopStyles.toolIconBox, { borderColor: `${color}44` }]}>
        <Icon size={30} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={desktopStyles.desktopToolTitle}>{title}</Text>
        <Text style={desktopStyles.desktopToolBody}>{body}</Text>
      </View>
      <ChevronRight size={22} color="#111827" />
    </Pressable>
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

const desktopStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  shell: { flex: 1, flexDirection: "row", backgroundColor: "#F8FAFC" },
  sidebar: {
    width: 278,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    paddingHorizontal: 26,
    paddingTop: 32,
    paddingBottom: 32,
  },
  brandBlock: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: 36 },
  logo: { width: 54, height: 54, borderRadius: 27 },
  brandName: { color: "#214A32", fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  brandTagline: { color: "#7A8796", fontSize: 12, marginTop: 5 },
  sidebarNav: { gap: 8, flex: 1 },
  sidebarItem: {
    minHeight: 46,
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  sidebarItemActive: { backgroundColor: "#EAF6EF" },
  sidebarLabel: { color: "#111827", fontSize: 15, fontWeight: "600", flex: 1 },
  sidebarLabelActive: { color: "#16A85F", fontWeight: "900" },
  sidebarBadge: {
    backgroundColor: "#DDF6E8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  sidebarBadgeText: { color: "#16A85F", fontSize: 11, fontWeight: "800" },
  helpCard: {
    borderWidth: 1,
    borderColor: "#D8EBDD",
    borderRadius: 14,
    padding: 20,
    backgroundColor: "#F1F8F3",
    overflow: "hidden",
  },
  helpTitle: { color: "#0F172A", fontSize: 16, fontWeight: "900", marginBottom: 10 },
  helpBody: { color: "#64748B", fontSize: 13, lineHeight: 19, marginBottom: 18 },
  helpButton: {
    height: 42,
    borderRadius: 21,
    backgroundColor: "#16A85F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  helpButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  helpIllustration: {
    height: 104,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    marginTop: 14,
  },
  helpImage: { width: 82, height: 82, borderRadius: 41 },
  workspace: { flex: 1 },
  workspaceContent: { paddingHorizontal: 70, paddingTop: 38, paddingBottom: 34 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 24,
  },
  greeting: { color: "#0F172A", fontSize: 19, fontWeight: "900" },
  subGreeting: { color: "#475569", fontSize: 13, marginTop: 10 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 18 },
  themeButton: {
    height: 42,
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  themeButtonText: { color: "#0F172A", fontSize: 13, fontWeight: "800" },
  bellButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  alertDot: {
    position: "absolute",
    top: 4,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
  },
  alertDotText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  profilePill: {
    height: 58,
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
  },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  profileName: { color: "#0F172A", fontSize: 14, fontWeight: "900" },
  profileMeta: { color: "#475569", fontSize: 13, marginTop: 3 },
  desktopGrid: { flexDirection: "row", gap: 38, alignItems: "flex-start" },
  mainColumn: { flex: 1, minWidth: 0, maxWidth: 760 },
  rightRail: { width: 405, gap: 20 },
  statusCard: {
    minHeight: 248,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#F8FCF9",
    padding: 20,
    marginBottom: 18,
    overflow: "hidden",
  },
  statusHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusPill: {
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusPillText: { fontSize: 14, fontWeight: "900" },
  priorityRow: { flexDirection: "row", alignItems: "center" },
  priorityText: { color: "#475569", fontSize: 12 },
  priorityLevel: { fontSize: 12, fontWeight: "900", marginRight: 6 },
  statusBody: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusCopy: { flex: 1, paddingRight: 28 },
  statusTitle: { color: "#0F172A", fontSize: 25, lineHeight: 32, fontWeight: "900", marginTop: 22 },
  statusDescription: { color: "#475569", fontSize: 15, lineHeight: 24, marginTop: 10 },
  desktopDivider: { height: 1, backgroundColor: "#DDE7E2", marginTop: 18, marginBottom: 16 },
  nextStepLabel: { color: "#7A8796", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 8 },
  nextStepText: { color: "#0F172A", fontSize: 14, fontWeight: "800" },
  statusVisual: { width: 190, height: 155, alignItems: "center", justifyContent: "center" },
  checkCircle: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  leafOne: { position: "absolute", right: 18, top: 0 },
  leafTwo: { position: "absolute", right: 2, bottom: 18 },
  askBanner: {
    minHeight: 72,
    borderRadius: 12,
    backgroundColor: "#0FB85E",
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 22,
    marginBottom: 18,
  },
  askTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  askBody: { color: "#E7FFF0", fontSize: 13, marginTop: 5 },
  planCard: {
    minHeight: 202,
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 18,
  },
  planContent: { flex: 1, padding: 20 },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  desktopPlanTitle: { color: "#0F172A", fontSize: 17, fontWeight: "900" },
  planLine: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  planLineText: { color: "#334155", fontSize: 14, fontWeight: "600" },
  motherIllustration: {
    width: 240,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F5FBF7",
  },
  motherAvatar: { width: 80, height: 140, alignItems: "center", justifyContent: "flex-end" },
  motherHair: {
    position: "absolute",
    top: 10,
    width: 62,
    height: 64,
    borderRadius: 31,
    backgroundColor: "#334155",
  },
  motherFace: {
    position: "absolute",
    top: 28,
    width: 38,
    height: 44,
    borderRadius: 19,
    backgroundColor: "#F3B78C",
  },
  motherBody: {
    width: 54,
    height: 90,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#8FD3A4",
  },
  motherBump: {
    position: "absolute",
    bottom: 10,
    width: 66,
    height: 58,
    borderRadius: 33,
    backgroundColor: "#9ADCB0",
  },
  sectionTitle: { color: "#0F172A", fontSize: 17, fontWeight: "900", marginBottom: 12 },
  desktopToolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 18 },
  desktopToolCard: {
    width: "48%",
    minHeight: 108,
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  toolIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopToolTitle: { color: "#0F172A", fontSize: 15, fontWeight: "900", marginBottom: 7 },
  desktopToolBody: { color: "#475569", fontSize: 13, lineHeight: 19 },
  desktopNote: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 22,
    backgroundColor: "#FFFFFF",
  },
  railCard: {
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  railTitle: { color: "#0F172A", fontSize: 15, fontWeight: "900" },
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", gap: 22 },
  progressRing: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 8,
    borderColor: "#2FBE72",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FCF9",
  },
  progressNumber: { color: "#0F172A", fontSize: 34, fontWeight: "900" },
  progressUnit: { color: "#0F172A", fontSize: 13, fontWeight: "900" },
  trimester: { color: "#0F172A", fontSize: 14, fontWeight: "900", marginBottom: 12 },
  weeksLeft: { color: "#475569", fontSize: 13, marginBottom: 22 },
  timelineButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 19,
    alignSelf: "flex-start",
  },
  timelineText: { color: "#0F172A", fontSize: 13, fontWeight: "800" },
  quickAction: {
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quickActionText: { color: "#475569", fontSize: 14, flex: 1 },
  tipRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 18 },
  tipBubble: { flex: 1, borderRadius: 8, backgroundColor: "#EAF4ED", padding: 18 },
  tipQuote: { color: "#0F172A", fontSize: 15, lineHeight: 22, fontWeight: "900" },
  tipSub: { color: "#475569", fontSize: 13, marginTop: 12 },
  plantPot: { width: 74, alignItems: "center" },
  pot: {
    width: 34,
    height: 30,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#D7B889",
    marginTop: -8,
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: "#F8B4B4",
    borderRadius: 12,
    backgroundColor: "#FFF3F3",
    padding: 20,
  },
  emergencyTitle: { color: "#E11D48", fontSize: 17, fontWeight: "900", marginBottom: 12 },
  emergencyBody: { color: "#475569", fontSize: 14, lineHeight: 21, marginBottom: 18 },
  emergencyButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: "#E11D48",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emergencyButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  scenarioCard: {
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  scenarioTitle: { color: "#64748B", fontSize: 12, fontWeight: "800", marginBottom: 10 },
  scenarioRow: { flexDirection: "row", gap: 8 },
  scenarioChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDE7E2",
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  scenarioChipText: { color: "#64748B", fontSize: 12, fontWeight: "900" },
});
