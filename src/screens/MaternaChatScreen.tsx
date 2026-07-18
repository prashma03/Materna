import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { askAssistant, shareProfileReport } from "../api/maternaAPI";
import {
  loadChatRiskSignals,
  recordChatRiskSignal,
} from "../storage/chatRiskStorage";
import { loadProfile } from "../storage/profileStorage";
import { assessMaternalRisk } from "../utils/maternalRiskAssessment";
import { sampleSensorData } from "../data/sampleSensorData";

interface Props {
  theme: "dark" | "light";
  onClose: () => void;
  name: string;
  patientId?: string;
  currentSensors?: object | null;
  riskLevel?: string;
}

interface Message {
  id: string;
  from: "user" | "materna";
  text: string;
  alert?: boolean;
}

const RESPONSES: { keywords: string[]; reply: string; alert?: boolean }[] = [
  {
    keywords: ["headache", "head"],
    reply: "Mild headaches can be common in pregnancy. Drink water, rest, and avoid bright screens. If the headache is severe, sudden, or comes with blurry vision or swelling, contact your provider right away.",
  },
  {
    keywords: ["swelling", "swollen", "feet", "ankles", "hands"],
    reply: "⚠️ Swelling in your hands, face, or sudden severe swelling in your legs can be a sign of preeclampsia. Please contact your doctor or go to the hospital today.",
    alert: true,
  },
  {
    keywords: ["blurry", "vision", "eyes", "seeing"],
    reply: "⚠️ Blurry or changed vision during pregnancy is a warning sign. This could be related to blood pressure. Please contact your provider immediately or go to the nearest hospital.",
    alert: true,
  },
  {
    keywords: ["nausea", "sick", "vomit", "throwing up"],
    reply: "Nausea is very common, especially in the first trimester. Try small frequent meals, ginger tea, and staying hydrated. If you can't keep any food or water down for more than 24 hours, call your doctor.",
  },
  {
    keywords: ["tired", "fatigue", "exhausted", "sleep"],
    reply: "Fatigue is normal throughout pregnancy. Try to rest when you can, eat iron-rich foods, and stay hydrated. If you feel extremely tired along with dizziness or shortness of breath, let your provider know.",
  },
  {
    keywords: ["kick", "movement", "baby moving", "not moving"],
    reply: "Tracking baby movement is important. If you notice significantly fewer kicks than usual or no movement for several hours, contact your doctor right away. You can do a kick count — 10 movements in 2 hours is a good sign.",
  },
  {
    keywords: [
      "jaw",
      "chest pain",
      "chest pressure",
      "shortness of breath",
      "can't breathe",
      "cannot breathe",
      "trouble breathing",
    ],
    reply:
      "Jaw pain with chest discomfort, shortness of breath, sweating, dizziness, or nausea can be an emergency. Call 911 now and do not drive yourself. If the jaw pain is isolated and mild, contact your healthcare provider promptly for advice.",
    alert: true,
  },
  {
    keywords: ["pain", "cramp", "cramping", "stomach", "belly"],
    reply: "⚠️ Severe or persistent abdominal pain during pregnancy should not be ignored. If the pain is sharp, constant, or comes with bleeding or fever, go to the hospital immediately.",
    alert: true,
  },
  {
    keywords: ["bleed", "bleeding", "spotting"],
    reply: "⚠️ Any bleeding during pregnancy should be reported to your doctor right away, even if it seems light. Please call your provider or go to the hospital.",
    alert: true,
  },
  {
    keywords: ["blood pressure", "bp", "pressure"],
    reply: "Your current blood pressure reading from the bracelet is 115/74 mmHg, which is in the normal range. If you ever feel dizzy, have a headache, or notice swelling, check in with your provider.",
  },
  {
    keywords: ["heart rate", "heartbeat", "pulse"],
    reply: "Your heart rate is currently 77 bpm, which is normal for pregnancy. A resting heart rate between 60–100 bpm is healthy. Light exercise is fine — just don't push too hard.",
  },
];

const FALLBACK =
  "I'm here to help with pregnancy questions and symptoms. Could you describe what you're feeling in a bit more detail? For urgent concerns, please contact your doctor or call 911.";

const QUICK_PROMPTS = [
  "I have chest pain",
  "My vision is blurry",
  "My baby is moving less",
  "I have swelling",
];

function getResponse(input: string): { reply: string; alert?: boolean } {
  const lower = input.toLowerCase();
  for (const r of RESPONSES) {
    if (r.keywords.some((k) => lower.includes(k))) {
      return { reply: r.reply, alert: r.alert };
    }
  }
  return { reply: FALLBACK };
}

export default function MaternaChatScreen({
  theme,
  onClose,
  name,
  patientId = "patient_maya",
  currentSensors = null,
  riskLevel = "stable",
}: Props) {
  const dark = theme === "dark";
  const c = dark ? colors.dark : colors.light;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      from: "materna",
      text: `Hi ${name}! I'm Materna. Tell me how you're feeling or ask me anything about your pregnancy.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  async function handleSend(promptText?: string) {
    const trimmed = (promptText ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      from: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    const riskSignal = await recordChatRiskSignal(trimmed);
    if (riskSignal) {
      const profile = await loadProfile();
      if (profile?.shareWithDoctor) {
        const chatSignals = await loadChatRiskSignals();
        await shareProfileReport({
          patient_id: patientId,
          profile,
          bracelet: sampleSensorData.bracelet,
          vitals: sampleSensorData.vitals,
          risk: sampleSensorData.risk,
          earlyRiskAssessment: assessMaternalRisk(profile, chatSignals),
          chatSignals,
        });
      }
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const apiReply = await askAssistant(
      patientId,
      trimmed,
      currentSensors,
      riskLevel
    );
    const fallback = getResponse(trimmed);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      from: "materna",
      text: apiReply || fallback.reply,
      alert: apiReply ? false : fallback.alert,
    };

    setIsLoading(false);
    setMessages((prev) => [...prev, botMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: c.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <View style={[styles.header, { borderBottomColor: c.divider }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Text style={[styles.backText, { color: c.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.accent }]}>Ask Materna</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.from === "user"
                ? [styles.userBubble, { backgroundColor: c.accent }]
                : msg.alert
                ? [styles.botBubble, { backgroundColor: c.alertBg, borderColor: c.alertBorder, borderWidth: 1 }]
                : [styles.botBubble, { backgroundColor: c.botBubble }],
            ]}
          >
            {msg.from === "materna" && (
              <Text style={[styles.senderLabel, { color: msg.alert ? c.alertText : c.textMuted }]}>
                {msg.alert ? "⚠️ Materna Alert" : "Materna"}
              </Text>
            )}
            <Text
              style={[
                styles.bubbleText,
                { color: msg.from === "user" ? "#fff" : msg.alert ? c.alertText : c.text },
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View
            style={[
              styles.bubble,
              styles.botBubble,
              { backgroundColor: c.botBubble },
            ]}
          >
            <Text style={[styles.senderLabel, { color: c.textMuted }]}>
              Materna
            </Text>
            <ActivityIndicator size="small" color={c.accent} />
          </View>
        )}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.quickPromptRow,
          { borderTopColor: c.divider, backgroundColor: c.background },
        ]}
      >
        {QUICK_PROMPTS.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={[
              styles.quickPrompt,
              { borderColor: c.inputBorder, backgroundColor: c.inputBg },
            ]}
            onPress={() => handleSend(prompt)}
            disabled={isLoading}
          >
            <Text style={[styles.quickPromptText, { color: c.text }]}>
              {prompt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View
        style={[
          styles.inputRow,
          { borderTopColor: c.divider, backgroundColor: c.background },
        ]}
      >
        <TextInput
          style={[styles.textInput, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Describe a symptom or ask a question..."
          placeholderTextColor={c.placeholder}
          returnKeyType="send"
          onSubmitEditing={() => handleSend()}
          onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                input.trim() && !isLoading ? c.accent : c.inputBorder,
            },
          ]}
          onPress={() => handleSend()}
          disabled={!input.trim() || isLoading}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function getColors(mode: "dark" | "light") {
  const isDark = mode === "dark";
  return {
    background: isDark ? "#0f1117" : "#f5f7fa",
    text: isDark ? "#f0f0f0" : "#1a1a1a",
    textMuted: isDark ? "#8a8fa8" : "#6b7280",
    accent: "#6c63ff",
    botBubble: isDark ? "#1c1f2e" : "#ffffff",
    inputBg: isDark ? "#1c1f2e" : "#ffffff",
    inputBorder: isDark ? "#2e3347" : "#d1d5db",
    placeholder: isDark ? "#4a4f66" : "#9ca3af",
    divider: isDark ? "#1e2233" : "#e5e7eb",
    alertBg: isDark ? "#2a1a1a" : "#fff5f5",
    alertBorder: "#ff4444",
    alertText: "#ff6b6b",
  };
}

const colors = { dark: getColors("dark"), light: getColors("light") };

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
  },
  backBtn: { width: 60 },
  backText: { fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 2 },
  messages: { padding: 16, paddingBottom: 24 },
  bubble: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    maxWidth: "85%",
  },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  botBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  senderLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  quickPromptRow: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 2,
    gap: 8,
  },
  quickPrompt: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },
  quickPromptText: { fontSize: 12, fontWeight: "700" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 26 : 18,
    marginBottom: Platform.OS === "ios" ? 6 : 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});

