import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react-native";
import { askAssistant, shareProfileReport } from "../api/maternaAPI";
import {
  loadChatRiskSignals,
  recordChatRiskSignal,
} from "../storage/chatRiskStorage";
import { loadProfile } from "../storage/profileStorage";
import { sampleSensorData } from "../data/sampleSensorData";
import { assessMaternalRisk } from "../utils/maternalRiskAssessment";

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

const QUICK_PROMPTS = [
  "I have chest pain",
  "My vision is blurry",
  "My baby is moving less",
  "I have swelling",
];

const RESPONSES: { keywords: string[]; reply: string; alert?: boolean }[] = [
  {
    keywords: ["headache", "head"],
    reply:
      "Mild headaches can be common in pregnancy. Drink water, rest, and avoid bright screens. If the headache is severe, sudden, or comes with blurry vision or swelling, contact your provider right away.",
  },
  {
    keywords: ["swelling", "swollen", "feet", "ankles", "hands"],
    reply:
      "Swelling in your hands, face, or sudden severe swelling in your legs can be a sign of preeclampsia. Please contact your doctor or go to the hospital today.",
    alert: true,
  },
  {
    keywords: ["blurry", "vision", "eyes", "seeing"],
    reply:
      "Blurry or changed vision during pregnancy is a warning sign. This could be related to blood pressure. Please contact your provider immediately or go to the nearest hospital.",
    alert: true,
  },
  {
    keywords: ["nausea", "sick", "vomit", "throwing up"],
    reply:
      "Nausea is very common, especially in the first trimester. Try small frequent meals, ginger tea, and staying hydrated. If you can't keep any food or water down for more than 24 hours, call your doctor.",
  },
  {
    keywords: ["tired", "fatigue", "exhausted", "sleep"],
    reply:
      "Fatigue is normal throughout pregnancy. Try to rest when you can, eat iron-rich foods, and stay hydrated. If you feel extremely tired along with dizziness or shortness of breath, let your provider know.",
  },
  {
    keywords: ["kick", "movement", "baby moving", "not moving"],
    reply:
      "Tracking baby movement is important. If you notice significantly fewer kicks than usual or no movement for several hours, contact your doctor right away. You can do a kick count: 10 movements in 2 hours is a good sign.",
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
    reply:
      "Severe or persistent abdominal pain during pregnancy should not be ignored. If the pain is sharp, constant, or comes with bleeding or fever, go to the hospital immediately.",
    alert: true,
  },
  {
    keywords: ["bleed", "bleeding", "spotting"],
    reply:
      "Any bleeding during pregnancy should be reported to your doctor right away, even if it seems light. Please call your provider or go to the hospital.",
    alert: true,
  },
  {
    keywords: ["blood pressure", "bp", "pressure"],
    reply:
      "Your current blood pressure reading from the bracelet is 115/74 mmHg, which is in the normal range. If you ever feel dizzy, have a headache, or notice swelling, check in with your provider.",
  },
  {
    keywords: ["heart rate", "heartbeat", "pulse"],
    reply:
      "Your heart rate is currently 77 bpm, which is normal for pregnancy. A resting heart rate between 60-100 bpm is healthy. Light exercise is fine; just don't push too hard.",
  },
];

const FALLBACK =
  "I'm here to help with pregnancy questions and symptoms. Could you describe what you're feeling in a bit more detail? For urgent concerns, please contact your doctor or call 911.";

function getResponse(input: string): { reply: string; alert?: boolean } {
  const lower = input.toLowerCase();
  for (const response of RESPONSES) {
    if (response.keywords.some((keyword) => lower.includes(keyword))) {
      return { reply: response.reply, alert: response.alert };
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
  const c = theme === "dark" ? colors.dark : colors.light;
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

    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), from: "user", text: trimmed },
    ]);
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
    const apiReply = await askAssistant(patientId, trimmed, currentSensors, riskLevel);
    const fallback = getResponse(trimmed);

    setIsLoading(false);
    setMessages((current) => [
      ...current,
      {
        id: (Date.now() + 1).toString(),
        from: "materna",
        text: apiReply || fallback.reply,
        alert: apiReply ? false : fallback.alert,
      },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <View style={[styles.shell, { backgroundColor: c.surface, borderColor: c.divider }]}>
        <View style={[styles.header, { borderBottomColor: c.divider }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.backButton, { borderColor: c.divider }]}
          >
            <Text style={[styles.backText, { color: c.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={[styles.headerIcon, { backgroundColor: c.greenSoft }]}>
              <HeartPulse size={22} color={c.green} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: c.text }]}>Ask Materna</Text>
              <Text style={[styles.headerSub, { color: c.textMuted }]}>
                Pregnancy support
              </Text>
            </View>
          </View>

          <View style={[styles.secureBadge, { borderColor: c.divider }]}>
            <ShieldCheck size={15} color={c.green} />
            <Text style={[styles.secureText, { color: c.textMuted }]}>Private</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.noticeCard,
              { backgroundColor: c.noticeBg, borderColor: c.noticeBorder },
            ]}
          >
            <AlertTriangle size={18} color={c.noticeText} />
            <Text style={[styles.noticeText, { color: c.noticeText }]}>
              For urgent symptoms, call 911 or go to the nearest emergency department.
            </Text>
          </View>

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.bubble,
                message.from === "user"
                  ? [styles.userBubble, { backgroundColor: c.green }]
                  : message.alert
                  ? [
                      styles.botBubble,
                      {
                        backgroundColor: c.alertBg,
                        borderColor: c.alertBorder,
                        borderWidth: 1,
                      },
                    ]
                  : [
                      styles.botBubble,
                      {
                        backgroundColor: c.botBubble,
                        borderColor: c.bubbleBorder,
                        borderWidth: 1,
                      },
                    ],
              ]}
            >
              {message.from === "materna" ? (
                <Text
                  style={[
                    styles.senderLabel,
                    { color: message.alert ? c.alertText : c.green },
                  ]}
                >
                  {message.alert ? "Materna Alert" : "Materna"}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.bubbleText,
                  {
                    color:
                      message.from === "user"
                        ? "#FFFFFF"
                        : message.alert
                        ? c.alertText
                        : c.text,
                  },
                ]}
              >
                {message.text}
              </Text>
            </View>
          ))}

          {isLoading ? (
            <View
              style={[
                styles.bubble,
                styles.botBubble,
                {
                  backgroundColor: c.botBubble,
                  borderColor: c.bubbleBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.senderLabel, { color: c.green }]}>Materna</Text>
              <ActivityIndicator size="small" color={c.green} />
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.quickPromptWrap, { borderTopColor: c.divider }]}>
          <Text style={[styles.quickPromptLabel, { color: c.textMuted }]}>
            Common concerns
          </Text>
          <ScrollView
            horizontal
            style={styles.quickPromptScroll}
            contentContainerStyle={styles.quickPromptRow}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={[
                  styles.quickPrompt,
                  { backgroundColor: c.inputBg, borderColor: c.inputBorder },
                ]}
                onPress={() => handleSend(prompt)}
                disabled={isLoading}
              >
                <Text
                  style={[styles.quickPromptText, { color: c.text }]}
                  numberOfLines={1}
                >
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: c.surface, borderTopColor: c.divider },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: c.inputBg,
                borderColor: c.inputBorder,
                color: c.text,
              },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder="Describe a symptom or ask a question..."
            placeholderTextColor={c.placeholder}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            onFocus={() =>
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)
            }
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: input.trim() && !isLoading ? c.green : c.inputBorder,
              },
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function getColors(mode: "dark" | "light") {
  const isDark = mode === "dark";
  return {
    background: isDark ? "#05070A" : "#F5F7FA",
    surface: isDark ? "#111827" : "#FFFFFF",
    text: isDark ? "#F8FAFC" : "#111827",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    green: "#22C55E",
    greenSoft: isDark ? "#052E1B" : "#DCFCE7",
    botBubble: isDark ? "#182033" : "#FFFFFF",
    bubbleBorder: isDark ? "#2B3550" : "#E2E8F0",
    inputBg: isDark ? "#0B1220" : "#F8FAFC",
    inputBorder: isDark ? "#2E3347" : "#CBD5E1",
    placeholder: isDark ? "#64748B" : "#94A3B8",
    divider: isDark ? "#1F2937" : "#E2E8F0",
    alertBg: isDark ? "#2A1116" : "#FFF1F2",
    alertBorder: "#FB7185",
    alertText: isDark ? "#FDA4AF" : "#BE123C",
    noticeBg: isDark ? "#231C10" : "#FFF7ED",
    noticeBorder: isDark ? "#5C3B12" : "#FED7AA",
    noticeText: isDark ? "#FDBA74" : "#9A3412",
  };
}

const colors = { dark: getColors("dark"), light: getColors("light") };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Platform.OS === "web" ? 18 : 0,
    paddingVertical: Platform.OS === "web" ? 22 : 0,
  },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    borderWidth: Platform.OS === "web" ? 1 : 0,
    borderRadius: Platform.OS === "web" ? 8 : 0,
    overflow: "hidden",
  },
  header: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 48 : 14,
    paddingBottom: 14,
  },
  backButton: {
    minWidth: 72,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 13, fontWeight: "800" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  headerSub: { fontSize: 12, marginTop: 2 },
  secureBadge: {
    minWidth: 82,
    height: 34,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secureText: { fontSize: 12, fontWeight: "800" },
  messageScroll: { flex: 1 },
  messages: {
    flexGrow: 1,
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  bubble: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 12,
    maxWidth: Platform.OS === "web" ? "72%" : "86%",
  },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 3 },
  botBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 3 },
  senderLabel: { fontSize: 11, fontWeight: "900", marginBottom: 6 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  quickPromptWrap: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 10,
  },
  quickPromptLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    marginBottom: 9,
  },
  quickPromptScroll: {
    flexGrow: 0,
    maxHeight: 42,
  },
  quickPromptRow: {
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    alignItems: "center",
  },
  quickPrompt: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: "center",
  },
  quickPromptText: { fontSize: 12, fontWeight: "800" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    paddingHorizontal: Platform.OS === "web" ? 24 : 12,
    paddingTop: 13,
    paddingBottom: Platform.OS === "ios" ? 26 : 18,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 112,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    minWidth: 68,
    height: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  sendText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
});
