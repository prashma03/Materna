import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  HeartPulse,
  Home,
  Hospital,
  Info,
  LogOut,
  MessageCircle,
  Save,
  Settings,
  UserRound,
} from "lucide-react-native";
import {
  EMPTY_PROFILE,
  ProfileData,
  loadProfile,
  saveProfile,
} from "../storage/profileStorage";
import { createAndShareProfileReport } from "../utils/profileReport";
import { sampleSensorData } from "../data/sampleSensorData";
import { shareProfileReport } from "../api/maternaAPI";
import { loadChatRiskSignals } from "../storage/chatRiskStorage";
import { assessMaternalRisk } from "../utils/maternalRiskAssessment";

interface Props {
  theme: "dark" | "light";
}

export default function ProfileScreen({ theme }: Props) {
  const { width } = useWindowDimensions();
  const dark = theme === "dark";
  const c = dark ? colors.dark : colors.light;
  const isDesktop = Platform.OS === "web" && width >= 1000;
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState("");

  useEffect(() => {
    loadProfile().then((stored) => {
      setProfile(stored || EMPTY_PROFILE);
      setLoading(false);
    });
  }, []);

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((current) => ({
      ...current,
      [key]: value,
      ...(key === "pregnancyWeek"
        ? { pregnancyWeekRecordedAt: new Date().toISOString() }
        : {}),
    }));
  }

  async function persistProfile() {
    const now = new Date().toISOString();
    const next = {
      ...profile,
      pregnancyWeekRecordedAt:
        profile.pregnancyWeek && !profile.pregnancyWeekRecordedAt
          ? now
          : profile.pregnancyWeekRecordedAt,
      updatedAt: now,
    };
    await saveProfile(next);
    setProfile(next);
    return next;
  }

  async function handleSave() {
    await persistProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleReport() {
    const missingFields = [
      !profile.fullName.trim() && "Full name",
      !isCompleteDateOfBirth(profile.dateOfBirth) && "Date of birth",
      !profile.county.trim() && "County",
      !profile.age.trim() && "Age",
      !profile.pregnancyWeek.trim() && "Pregnancy week",
      !profile.emergencyContact.trim() && "Emergency contact",
    ].filter(Boolean) as string[];

    const age = Number(profile.age);
    const pregnancyWeek = Number(profile.pregnancyWeek);

    if (missingFields.length > 0) {
      const message = `Please complete: ${missingFields.join(", ")}.`;
      setReportStatus(message);
      Alert.alert("Profile incomplete", message);
      return;
    }

    if (!Number.isInteger(age) || age < 12 || age > 65) {
      const message = "Please enter a valid age before creating the PDF.";
      setReportStatus(message);
      Alert.alert("Check age", message);
      return;
    }

    if (
      !Number.isInteger(pregnancyWeek) ||
      pregnancyWeek < 1 ||
      pregnancyWeek > 42
    ) {
      const message = "Pregnancy week must be between 1 and 42.";
      setReportStatus(message);
      Alert.alert("Check pregnancy week", message);
      return;
    }

    setGeneratingReport(true);
    setReportStatus("");
    try {
      const savedProfile = await persistProfile();
      const chatSignals = await loadChatRiskSignals();
      const earlyRiskAssessment = assessMaternalRisk(savedProfile, chatSignals);
      if (savedProfile.shareWithDoctor) {
        const result = await shareProfileReport({
          patient_id: "patient_001",
          profile: savedProfile,
          bracelet: sampleSensorData.bracelet,
          vitals: sampleSensorData.vitals,
          risk: sampleSensorData.risk,
          earlyRiskAssessment,
          chatSignals,
        });
        setReportStatus(
          result
            ? "Report delivered to the linked doctor."
            : "PDF created on this device."
        );
      } else {
        setReportStatus(
          "PDF created locally. Turn on doctor sharing to deliver it to the dashboard."
        );
      }
      await createAndShareProfileReport(
        savedProfile,
        sampleSensorData,
        earlyRiskAssessment
      );
    } finally {
      setGeneratingReport(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.accent} />
        <Text style={[styles.loadingText, { color: c.textMuted }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (isDesktop) {
    return (
      <DesktopProfileScreen
        profile={profile}
        update={update}
        handleSave={handleSave}
        handleReport={handleReport}
        saved={saved}
        generatingReport={generatingReport}
        reportStatus={reportStatus}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: c.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: c.accent }]}>MATERNA</Text>
          <Text style={[styles.pageLabel, { color: c.textMuted }]}>My Profile</Text>
          <Text style={[styles.pageDate, { color: c.textMuted }]}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>

        <SectionHeader label="Personal" color={c.sectionHeader} />
        <Text style={[styles.requiredNote, { color: c.textMuted }]}>
          Fields marked * are required to create or send a PDF.
        </Text>
        <Field label="Full name *" value={profile.fullName} onChangeText={(value) => update("fullName", value)} placeholder="e.g. Maya Johnson" c={c} />
        <DateOfBirthPicker
          value={profile.dateOfBirth}
          onChange={(value) => update("dateOfBirth", value)}
          c={c}
        />
        <Field label="County *" value={profile.county} onChangeText={(value) => update("county", value)} placeholder="e.g. Desha" c={c} />

        <View style={styles.row}>
          <Field label="Age *" value={profile.age} onChangeText={(value) => update("age", value)} placeholder="e.g. 28" keyboardType="numeric" c={c} style={styles.rowField} />
          <Field label="Pregnancy week *" value={profile.pregnancyWeek} onChangeText={(value) => update("pregnancyWeek", value)} placeholder="e.g. 28" keyboardType="numeric" c={c} style={styles.rowField} />
        </View>

        <View style={styles.row}>
          <Field label="Weight (lbs)" value={profile.weightLbs} onChangeText={(value) => update("weightLbs", value)} placeholder="145" keyboardType="numeric" c={c} style={styles.rowField} />
          <Field label="Height (ft)" value={profile.heightFt} onChangeText={(value) => update("heightFt", value)} placeholder="5" keyboardType="numeric" c={c} style={styles.rowField} />
          <Field label="In" value={profile.heightIn} onChangeText={(value) => update("heightIn", value)} placeholder="4" keyboardType="numeric" c={c} style={styles.smallRowField} />
        </View>

        <Field label="Previous pregnancies" value={profile.previousPregnancies} onChangeText={(value) => update("previousPregnancies", value)} placeholder="e.g. 1" keyboardType="numeric" c={c} />

        <SectionHeader label="Medical history" color={c.sectionHeader} />
        <ToggleRow label="History of miscarriage" value={profile.hasMiscarriage} onToggle={(value) => update("hasMiscarriage", value)} c={c} />
        <ToggleRow label="High blood pressure" value={profile.hasHighBP} onToggle={(value) => update("hasHighBP", value)} c={c} />
        <ToggleRow label="Diabetes" value={profile.hasDiabetes} onToggle={(value) => update("hasDiabetes", value)} c={c} />
        <ToggleRow label="Anemia" value={profile.hasAnemia} onToggle={(value) => update("hasAnemia", value)} c={c} />
        <ToggleRow label="Previous C-section" value={profile.hasCSection} onToggle={(value) => update("hasCSection", value)} c={c} />
        <Field label="Current medications" value={profile.medications} onChangeText={(value) => update("medications", value)} placeholder="List medications, or leave blank" multiline c={c} />

        <SectionHeader label="Emergency and care" color={c.sectionHeader} />
        <Field label="Emergency contact (name and phone) *" value={profile.emergencyContact} onChangeText={(value) => update("emergencyContact", value)} placeholder="e.g. John Smith, 501-555-0199" c={c} />
        <Field label="Preferred hospital or clinic" value={profile.preferredHospital} onChangeText={(value) => update("preferredHospital", value)} placeholder="e.g. UAMS Medical Center" c={c} />

        <View style={[styles.consentCard, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}>
          <View style={styles.consentText}>
            <Text style={[styles.consentTitle, { color: c.text }]}>Share with linked doctor</Text>
            <Text style={[styles.consentBody, { color: c.textMuted }]}>
              Allows your care team dashboard to view your saved profile.
            </Text>
          </View>
          <Switch
            value={profile.shareWithDoctor}
            onValueChange={(value) => update("shareWithDoctor", value)}
            trackColor={{ false: c.switchTrackOff, true: c.accent }}
            thumbColor="#ffffff"
          />
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: c.accent }]} onPress={handleSave}>
          <Save size={18} color="#ffffff" />
          <Text style={styles.saveButtonText}>{saved ? "Profile saved" : "Save changes"}</Text>
        </TouchableOpacity>

        {reportStatus ? (
          <Text
            style={[
              styles.reportStatus,
              {
                color: reportStatus.startsWith("Report delivered")
                  ? "#22C55E"
                  : c.textMuted,
              },
            ]}
          >
            {reportStatus}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.reportButton, { borderColor: c.accent }]}
          onPress={handleReport}
          disabled={generatingReport}
        >
          {generatingReport ? <ActivityIndicator size="small" color={c.accent} /> : <FileText size={18} color={c.accent} />}
          <Text style={[styles.reportButtonText, { color: c.accent }]}>
            {generatingReport ? "Creating report..." : "Create and share PDF"}
          </Text>
        </TouchableOpacity>

        {profile.updatedAt ? (
          <Text style={[styles.updatedText, { color: c.textMuted }]}>
            Last saved {new Date(profile.updatedAt).toLocaleString()}
          </Text>
        ) : null}

        <Text style={[styles.disclaimer, { color: c.textMuted }]}>
          Your profile is stored on this device. Doctor access is controlled by the sharing switch.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.sectionHeader, { color }]}>{label.toUpperCase()}</Text>;
}

function DesktopProfileScreen({
  profile,
  update,
  handleSave,
  handleReport,
  saved,
  generatingReport,
  reportStatus,
}: {
  profile: ProfileData;
  update: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
  handleSave: () => void;
  handleReport: () => void;
  saved: boolean;
  generatingReport: boolean;
  reportStatus: string;
}) {
  const [dobMonth, dobDay, dobYear] = splitDesktopDob(profile.dateOfBirth);

  function updateDob(part: "month" | "day" | "year", value: string) {
    const next = {
      month: dobMonth,
      day: dobDay,
      year: dobYear,
      [part]: value,
    };
    const monthNumber = getDesktopMonthNumber(next.month);
    update(
      "dateOfBirth",
      `${String(monthNumber || 1).padStart(2, "0")}/${String(
        Number(next.day) || 1
      ).padStart(2, "0")}/${next.year || new Date().getFullYear() - 25}`
    );
  }

  return (
    <SafeAreaView style={desktopProfile.safeArea}>
      <View style={desktopProfile.shell}>
        <View style={desktopProfile.sidebar}>
          <View style={desktopProfile.brandBlock}>
            <View style={desktopProfile.brandMark}>
              <Text style={desktopProfile.brandMarkText}>M</Text>
            </View>
            <View>
              <Text style={desktopProfile.brandName}>MATERNA</Text>
              <Text style={desktopProfile.brandTagline}>Care for you. Care for two.</Text>
            </View>
          </View>

          <View style={desktopProfile.navList}>
            {[
              { label: "Today", icon: Home },
              { label: "Hospitals", icon: Hospital },
              { label: "Profile", icon: UserRound, active: true },
              { label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.label}
                  style={[desktopProfile.navItem, item.active && desktopProfile.navItemActive]}
                >
                  <Icon size={22} color={item.active ? "#6D4AFF" : "#64748B"} />
                  <Text
                    style={[
                      desktopProfile.navLabel,
                      item.active && desktopProfile.navLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.active ? <View style={desktopProfile.navDot} /> : null}
                </View>
              );
            })}
          </View>

          <View style={desktopProfile.helpCard}>
            <View style={desktopProfile.helpIcon}>
              <HeartPulse size={26} color="#8B5CF6" />
            </View>
            <Text style={desktopProfile.helpTitle}>Need help?</Text>
            <Text style={desktopProfile.helpSubtitle}>Materna care chat</Text>
            <Text style={desktopProfile.helpBody}>Get quick guidance anytime.</Text>
            <Pressable style={desktopProfile.helpButton}>
              <Text style={desktopProfile.helpButtonText}>Start chat</Text>
              <ChevronRight size={17} color="#6D4AFF" />
            </Pressable>
          </View>

          <View style={desktopProfile.profileMini}>
            <View style={desktopProfile.profileInitials}>
              <Text style={desktopProfile.profileInitialsText}>
                {getInitials(profile.fullName || "Clara May")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={desktopProfile.profileMiniName}>
                {profile.fullName || "Clara May"}
              </Text>
              <Text style={desktopProfile.profileMiniMeta}>
                {profile.pregnancyWeek || "23"} weeks pregnant
              </Text>
              <Text style={desktopProfile.profileMiniLink}>View profile</Text>
            </View>
            <ChevronRight size={17} color="#6D4AFF" />
          </View>

          <View style={desktopProfile.logoutRow}>
            <LogOut size={20} color="#64748B" />
            <Text style={desktopProfile.logoutText}>Log out</Text>
          </View>
        </View>

        <ScrollView
          style={desktopProfile.workspace}
          contentContainerStyle={desktopProfile.workspaceContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={desktopProfile.card}>
            <View style={desktopProfile.cardHeader}>
              <View>
                <Text style={desktopProfile.pageTitle}>My Profile</Text>
                <Text style={desktopProfile.pageSubtitle}>
                  Your information helps us personalize your care and alerts.
                </Text>
              </View>
              <View style={desktopProfile.headerArt}>
                <View style={desktopProfile.clipboard}>
                  <View style={desktopProfile.clipTop} />
                  <UserRound size={42} color="#8B5CF6" />
                  <View style={desktopProfile.clipLine} />
                  <View style={[desktopProfile.clipLine, { width: 68 }]} />
                  <View style={[desktopProfile.clipLine, { width: 54 }]} />
                </View>
              </View>
            </View>

            <DesktopSectionTitle icon={UserRound} label="Personal" />
            <DesktopField
              label="Full name *"
              value={profile.fullName}
              onChangeText={(value) => update("fullName", value)}
              placeholder="Clara May"
            />

            <View style={desktopProfile.twoColRow}>
              <View style={desktopProfile.halfCol}>
                <Text style={desktopProfile.desktopLabel}>Date of birth *</Text>
                <View style={desktopProfile.dateInputs}>
                  <DesktopField
                    label=""
                    sublabel="Month"
                    value={dobMonth}
                    onChangeText={(value) => updateDob("month", value)}
                    placeholder="Jan"
                    style={desktopProfile.dateInput}
                  />
                  <DesktopField
                    label=""
                    sublabel="Day"
                    value={dobDay}
                    onChangeText={(value) => updateDob("day", value)}
                    placeholder="5"
                    keyboardType="numeric"
                    style={desktopProfile.dateInput}
                  />
                  <DesktopField
                    label=""
                    sublabel="Year"
                    value={dobYear}
                    onChangeText={(value) => updateDob("year", value)}
                    placeholder="2001"
                    keyboardType="numeric"
                    style={desktopProfile.dateInput}
                  />
                </View>
              </View>
              <DesktopField
                label="Country *"
                value="United States"
                onChangeText={() => undefined}
                editable={false}
                style={desktopProfile.halfCol}
              />
            </View>

            <View style={desktopProfile.twoColRow}>
              <DesktopField
                label="Age *"
                value={profile.age}
                onChangeText={(value) => update("age", value)}
                placeholder="23"
                keyboardType="numeric"
                style={desktopProfile.halfCol}
              />
              <DesktopField
                label="Pregnancy week *"
                value={profile.pregnancyWeek}
                onChangeText={(value) => update("pregnancyWeek", value)}
                placeholder="25"
                keyboardType="numeric"
                style={desktopProfile.halfCol}
              />
            </View>

            <View style={desktopProfile.fourColRow}>
              <DesktopField label="Weight (lbs)" value={profile.weightLbs} onChangeText={(value) => update("weightLbs", value)} placeholder="130" keyboardType="numeric" style={desktopProfile.quarterCol} />
              <DesktopField label="Height (ft)" value={profile.heightFt} onChangeText={(value) => update("heightFt", value)} placeholder="5" keyboardType="numeric" style={desktopProfile.quarterCol} />
              <DesktopField label="Height (in)" value={profile.heightIn} onChangeText={(value) => update("heightIn", value)} placeholder="4" keyboardType="numeric" style={desktopProfile.quarterCol} />
              <DesktopField label="Previous pregnancies" value={profile.previousPregnancies} onChangeText={(value) => update("previousPregnancies", value)} placeholder="3" keyboardType="numeric" style={desktopProfile.quarterCol} />
            </View>

            <DesktopSectionTitle icon={HeartPulse} label="Medical History" />
            <View style={desktopProfile.medicalGrid}>
              <DesktopToggle label="History of miscarriage" value={profile.hasMiscarriage} onToggle={(value) => update("hasMiscarriage", value)} />
              <DesktopToggle label="Anemia" value={profile.hasAnemia} onToggle={(value) => update("hasAnemia", value)} />
              <DesktopToggle label="High blood pressure" value={profile.hasHighBP} onToggle={(value) => update("hasHighBP", value)} />
              <DesktopToggle label="Previous C-section" value={profile.hasCSection} onToggle={(value) => update("hasCSection", value)} />
              <DesktopToggle label="Diabetes" value={profile.hasDiabetes} onToggle={(value) => update("hasDiabetes", value)} />
              <View style={desktopProfile.otherRow}>
                <Text style={desktopProfile.toggleText}>Other medical conditions</Text>
                <Info size={14} color="#94A3B8" />
                <ChevronRight size={20} color="#64748B" />
              </View>
            </View>

            <View style={desktopProfile.twoColRow}>
              <DesktopField
                label="County"
                value={profile.county}
                onChangeText={(value) => update("county", value)}
                placeholder="Desha"
                style={desktopProfile.halfCol}
              />
              <DesktopField
                label="Emergency contact *"
                value={profile.emergencyContact}
                onChangeText={(value) => update("emergencyContact", value)}
                placeholder="Name and phone"
                style={desktopProfile.halfCol}
              />
            </View>

            <View style={desktopProfile.actionRow}>
              <DesktopToggle
                label="Share with linked doctor"
                value={profile.shareWithDoctor}
                onToggle={(value) => update("shareWithDoctor", value)}
                compact
              />
              <Pressable style={desktopProfile.saveButton} onPress={handleSave}>
                <Save size={17} color="#FFFFFF" />
                <Text style={desktopProfile.saveButtonText}>
                  {saved ? "Profile saved" : "Save changes"}
                </Text>
              </Pressable>
              <Pressable
                style={desktopProfile.reportButton}
                onPress={handleReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <ActivityIndicator size="small" color="#6D4AFF" />
                ) : (
                  <FileText size={17} color="#6D4AFF" />
                )}
                <Text style={desktopProfile.reportButtonText}>
                  {generatingReport ? "Creating report..." : "Create PDF"}
                </Text>
              </Pressable>
            </View>
            {reportStatus ? <Text style={desktopProfile.reportStatus}>{reportStatus}</Text> : null}
          </View>
        </ScrollView>

        <View style={desktopProfile.bottomNav}>
          {[
            { label: "Today", icon: CalendarDays },
            { label: "Alerts", icon: Bell, alert: true },
            { label: "Hospitals", icon: Hospital },
            { label: "Profile", icon: UserRound, active: true },
          ].map((item) => {
            const Icon = item.icon;
            const color = item.active ? "#22C55E" : item.alert ? "#FB7185" : "#64748B";
            return (
              <View key={item.label} style={desktopProfile.bottomItem}>
                <View style={item.alert ? desktopProfile.alertBubble : undefined}>
                  <Icon size={24} color={color} />
                </View>
                <Text
                  style={[
                    desktopProfile.bottomLabel,
                    item.active && desktopProfile.bottomLabelActive,
                    item.alert && desktopProfile.bottomLabelAlert,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function DesktopSectionTitle({ icon: Icon, label }: { icon: React.ComponentType<any>; label: string }) {
  return (
    <View style={desktopProfile.sectionTitleRow}>
      <Icon size={25} color="#6D4AFF" />
      <Text style={desktopProfile.sectionTitle}>{label.toUpperCase()}</Text>
      <View style={desktopProfile.sectionRule} />
    </View>
  );
}

function DesktopField({
  label,
  sublabel,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  editable = true,
  style,
}: {
  label: string;
  sublabel?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  editable?: boolean;
  style?: object;
}) {
  return (
    <View style={[desktopProfile.fieldWrap, style]}>
      {label ? <Text style={desktopProfile.desktopLabel}>{label}</Text> : null}
      <TextInput
        style={[desktopProfile.desktopInput, !editable && desktopProfile.disabledInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        editable={editable}
      />
      {sublabel ? <Text style={desktopProfile.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

function DesktopToggle({
  label,
  value,
  onToggle,
  compact = false,
}: {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  compact?: boolean;
}) {
  return (
    <View style={[desktopProfile.toggleRow, compact && desktopProfile.toggleCompact]}>
      <View style={desktopProfile.toggleLabelRow}>
        <Text style={desktopProfile.toggleText}>{label}</Text>
        <Info size={14} color="#94A3B8" />
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#CBD5E1", true: "#6D4AFF" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function splitDesktopDob(value: string) {
  const [month, day, year] = value.split("/");
  if (!month && !day && !year) return ["", "", ""];
  const monthLabel = MONTHS[Number(month) - 1] || month || "";
  return [monthLabel, day ? String(Number(day)) : "", year || ""];
}

function getDesktopMonthNumber(value: string) {
  const numeric = Number(value);
  if (numeric >= 1 && numeric <= 12) return numeric;
  const index = MONTHS.findIndex(
    (month) => month.toLowerCase() === value.trim().slice(0, 3).toLowerCase()
  );
  return index >= 0 ? index + 1 : 0;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isCompleteDateOfBirth(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date()
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  multiline?: boolean;
  c: any;
  style?: object;
}

function Field({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false, c, style }: FieldProps) {
  return (
    <View style={[styles.fieldWrapper, style]}>
      <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text },
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

function ToggleRow({ label, value, onToggle, c }: { label: string; value: boolean; onToggle: (value: boolean) => void; c: any }) {
  return (
    <View style={[styles.toggleRow, { borderBottomColor: c.divider }]}>
      <Text style={[styles.toggleLabel, { color: c.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: c.switchTrackOff, true: c.accent }} thumbColor="#ffffff" />
    </View>
  );
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function DateOfBirthPicker({
  value,
  onChange,
  c,
}: {
  value: string;
  onChange: (value: string) => void;
  c: any;
}) {
  const [monthValue, dayValue, yearValue] = value.split("/");
  const month = Number(monthValue) || 0;
  const day = Number(dayValue) || 0;
  const year = Number(yearValue) || 0;
  const [openPart, setOpenPart] = useState<"month" | "day" | "year" | null>(null);

  const currentYear = new Date().getFullYear();
  const selectedYear = year || currentYear - 25;
  const selectedMonth = month || 1;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const years = Array.from({ length: 60 }, (_, index) => currentYear - 12 - index);

  function savePart(part: "month" | "day" | "year", nextValue: number) {
    const nextMonth = part === "month" ? nextValue : selectedMonth;
    const nextYear = part === "year" ? nextValue : selectedYear;
    const maxDay = new Date(nextYear, nextMonth, 0).getDate();
    const nextDay = Math.min(part === "day" ? nextValue : day || 1, maxDay);
    onChange(
      `${String(nextMonth).padStart(2, "0")}/${String(nextDay).padStart(2, "0")}/${nextYear}`
    );
    setOpenPart(null);
  }

  const options =
    openPart === "month"
      ? MONTHS.map((label, index) => ({ label, value: index + 1 }))
      : openPart === "day"
      ? Array.from({ length: daysInMonth }, (_, index) => ({
          label: String(index + 1),
          value: index + 1,
        }))
      : years.map((item) => ({ label: String(item), value: item }));

  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, { color: c.textMuted }]}>Date of birth *</Text>
      <View style={styles.dateRow}>
        <DateBox
          label="Month"
          value={month ? MONTHS[month - 1] : "Month"}
          onPress={() => setOpenPart("month")}
          c={c}
        />
        <DateBox
          label="Day"
          value={day ? String(day) : "Day"}
          onPress={() => setOpenPart("day")}
          c={c}
        />
        <DateBox
          label="Year"
          value={year ? String(year) : "Year"}
          onPress={() => setOpenPart("year")}
          c={c}
        />
      </View>

      <Modal
        visible={openPart !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenPart(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpenPart(null)}>
          <Pressable
            style={[styles.optionSheet, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}
            onPress={() => undefined}
          >
            <Text style={[styles.optionTitle, { color: c.text }]}>
              Select {openPart}
            </Text>
            <ScrollView style={styles.optionList}>
              {options.map((option) => (
                <Pressable
                  key={`${openPart}-${option.value}`}
                  style={[styles.option, { borderBottomColor: c.divider }]}
                  onPress={() => savePart(openPart!, option.value)}
                >
                  <Text style={[styles.optionText, { color: c.text }]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DateBox({
  label,
  value,
  onPress,
  c,
}: {
  label: string;
  value: string;
  onPress: () => void;
  c: any;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose birth ${label.toLowerCase()}`}
      style={[styles.dateBox, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}
      onPress={onPress}
    >
      <Text style={[styles.dateBoxValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.dateBoxLabel, { color: c.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

function getColors(mode: "dark" | "light") {
  const isDark = mode === "dark";
  return {
    background: isDark ? "#0f1117" : "#f5f7fa",
    text: isDark ? "#f0f0f0" : "#1a1a1a",
    textMuted: isDark ? "#8a8fa8" : "#6b7280",
    accent: "#6c63ff",
    sectionHeader: isDark ? "#6c63ff" : "#4f46e5",
    inputBg: isDark ? "#1c1f2e" : "#ffffff",
    inputBorder: isDark ? "#2e3347" : "#d1d5db",
    placeholder: isDark ? "#4a4f66" : "#9ca3af",
    divider: isDark ? "#1e2233" : "#e5e7eb",
    switchTrackOff: isDark ? "#2e3347" : "#d1d5db",
  };
}

const colors = { dark: getColors("dark"), light: getColors("light") };

const desktopProfile = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  shell: { flex: 1, flexDirection: "row", backgroundColor: "#F8FAFC" },
  sidebar: {
    width: 296,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 74,
  },
  brandBlock: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 48 },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C5CFF",
  },
  brandMarkText: { color: "#FFFFFF", fontSize: 24, fontWeight: "900" },
  brandName: { color: "#6D4AFF", fontSize: 27, fontWeight: "900", letterSpacing: 6 },
  brandTagline: { color: "#64748B", fontSize: 12, marginTop: 8 },
  navList: { gap: 14, flex: 1 },
  navItem: {
    minHeight: 52,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  navItemActive: { backgroundColor: "#F1ECFF" },
  navLabel: { color: "#475569", fontSize: 16, fontWeight: "700", flex: 1 },
  navLabelActive: { color: "#6D4AFF", fontWeight: "900" },
  navDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6D4AFF" },
  helpCard: {
    borderWidth: 1,
    borderColor: "#D8CCFF",
    borderRadius: 10,
    backgroundColor: "#FBF8FF",
    padding: 18,
    marginBottom: 24,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFE8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  helpTitle: { color: "#0F172A", fontSize: 17, fontWeight: "900", marginBottom: 8 },
  helpSubtitle: { color: "#0F172A", fontSize: 14, fontWeight: "900", marginBottom: 8 },
  helpBody: { color: "#64748B", fontSize: 13, lineHeight: 20, marginBottom: 18 },
  helpButton: {
    height: 40,
    borderWidth: 1,
    borderColor: "#7C5CFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  helpButtonText: { color: "#6D4AFF", fontSize: 13, fontWeight: "900" },
  profileMini: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileInitials: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EDE7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitialsText: { color: "#6D4AFF", fontSize: 16, fontWeight: "900" },
  profileMiniName: { color: "#0F172A", fontSize: 14, fontWeight: "900" },
  profileMiniMeta: { color: "#64748B", fontSize: 11, marginTop: 6 },
  profileMiniLink: { color: "#6D4AFF", fontSize: 12, fontWeight: "800", marginTop: 10 },
  logoutRow: { height: 54, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 10 },
  logoutText: { color: "#64748B", fontSize: 14, fontWeight: "700" },
  workspace: { flex: 1 },
  workspaceContent: { paddingHorizontal: 54, paddingTop: 42, paddingBottom: 110 },
  card: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 34,
    shadowColor: "#64748B",
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  cardHeader: {
    minHeight: 160,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: { color: "#07153A", fontSize: 30, fontWeight: "900" },
  pageSubtitle: { color: "#64748B", fontSize: 15, marginTop: 12 },
  headerArt: {
    width: 250,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3EDFF",
    borderRadius: 90,
    opacity: 0.9,
  },
  clipboard: {
    width: 100,
    height: 132,
    borderWidth: 6,
    borderColor: "#8B5CF6",
    borderRadius: 8,
    alignItems: "center",
    paddingTop: 28,
    backgroundColor: "#FFFFFFAA",
  },
  clipTop: {
    position: "absolute",
    top: -15,
    width: 44,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#8B5CF6",
  },
  clipLine: { width: 58, height: 4, borderRadius: 2, backgroundColor: "#C4B5FD", marginTop: 12 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 18,
    marginBottom: 22,
  },
  sectionTitle: { color: "#6D4AFF", fontSize: 14, fontWeight: "900", letterSpacing: 0.5 },
  sectionRule: { flex: 1, height: 1, backgroundColor: "#CBD5E1" },
  fieldWrap: { marginBottom: 18 },
  desktopLabel: { color: "#475569", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  desktopInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  disabledInput: { color: "#0F172A", backgroundColor: "#FBFCFE" },
  sublabel: { color: "#64748B", fontSize: 11, marginTop: 8, marginLeft: 10 },
  twoColRow: { flexDirection: "row", gap: 38, alignItems: "flex-start" },
  halfCol: { flex: 1 },
  dateInputs: { flexDirection: "row", gap: 18 },
  dateInput: { flex: 1 },
  fourColRow: { flexDirection: "row", gap: 24, alignItems: "flex-start" },
  quarterCol: { flex: 1 },
  medicalGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: 62 },
  toggleRow: {
    width: "47%",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
  toggleCompact: { width: 280, borderBottomWidth: 0 },
  toggleLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  toggleText: { color: "#475569", fontSize: 14, fontWeight: "600" },
  otherRow: {
    width: "47%",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 18,
    paddingTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  saveButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 18,
    backgroundColor: "#6D4AFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  reportButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6D4AFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  reportButtonText: { color: "#6D4AFF", fontSize: 13, fontWeight: "900" },
  reportStatus: { color: "#64748B", fontSize: 12, textAlign: "right", marginTop: 12 },
  bottomNav: {
    position: "absolute",
    left: 296,
    right: 0,
    bottom: 0,
    height: 76,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFFF2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 86,
  },
  bottomItem: { alignItems: "center", justifyContent: "center", gap: 5, minWidth: 70 },
  bottomLabel: { color: "#64748B", fontSize: 12, fontWeight: "800" },
  bottomLabelActive: { color: "#22C55E" },
  bottomLabelAlert: { color: "#FB7185" },
  alertBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -2,
  },
});

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 13 },
  scroll: { padding: 20, paddingBottom: 48 },
  header: { marginBottom: 24, marginTop: 8 },
  screenTitle: { fontSize: 22, fontWeight: "800", letterSpacing: 4 },
  pageLabel: { fontSize: 14, marginTop: 2 },
  pageDate: { fontSize: 11, marginTop: 5 },
  sectionHeader: { fontSize: 11, fontWeight: "700", letterSpacing: 2, marginTop: 28, marginBottom: 12 },
  requiredNote: { fontSize: 10, lineHeight: 15, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  dateRow: { flexDirection: "row", gap: 8 },
  dateBox: { flex: 1, minHeight: 58, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, justifyContent: "center" },
  dateBoxValue: { fontSize: 15, fontWeight: "700" },
  dateBoxLabel: { fontSize: 9, marginTop: 3, textTransform: "uppercase" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 28 },
  optionSheet: { maxHeight: "70%", borderWidth: 1, borderRadius: 10, padding: 14 },
  optionTitle: { fontSize: 16, fontWeight: "800", textTransform: "capitalize", marginBottom: 8 },
  optionList: { maxHeight: 360 },
  option: { paddingVertical: 13, borderBottomWidth: 1 },
  optionText: { fontSize: 15, textAlign: "center" },
  rowField: { flex: 1 },
  smallRowField: { flex: 0.65 },
  fieldWrapper: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  multiline: { height: 72, textAlignVertical: "top" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1 },
  toggleLabel: { fontSize: 15, flex: 1, paddingRight: 12 },
  consentCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, padding: 14, marginTop: 10 },
  consentText: { flex: 1, paddingRight: 12 },
  consentTitle: { fontSize: 14, fontWeight: "700" },
  consentBody: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  saveButton: { flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 24, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  reportButton: { flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 10, borderWidth: 1, borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  reportButtonText: { fontSize: 14, fontWeight: "700" },
  reportStatus: { fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 10 },
  updatedText: { fontSize: 10, textAlign: "center", marginTop: 12 },
  disclaimer: { fontSize: 11, textAlign: "center", marginTop: 12, lineHeight: 16 },
});
