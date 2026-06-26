import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FileText, Save } from "lucide-react-native";
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
  const dark = theme === "dark";
  const c = dark ? colors.dark : colors.light;
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
              Allows the doctor dashboard in this demo to view your saved profile.
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
