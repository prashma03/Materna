import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAT_RISK_KEY = "@materna_chat_risk_signals";

export interface ChatRiskSignal {
  id: string;
  message: string;
  reason: string;
  recordedAt: string;
}

const SIGNAL_GROUPS = [
  {
    terms: ["jaw", "chest pain", "chest pressure", "shortness of breath", "can't breathe", "cannot breathe", "trouble breathing"],
    reason: "Jaw, chest, or breathing symptom reported in Materna chat",
  },
  {
    terms: ["bleed", "bleeding", "spotting"],
    reason: "Bleeding or spotting reported in Materna chat",
  },
  {
    terms: ["blurry", "vision", "seeing spots"],
    reason: "Vision change reported in Materna chat",
  },
  {
    terms: ["swelling", "swollen", "face swelling", "hand swelling"],
    reason: "Possible preeclampsia symptom reported in Materna chat",
  },
  {
    terms: ["severe headache", "worst headache"],
    reason: "Severe headache reported in Materna chat",
  },
  {
    terms: ["not moving", "fewer kicks", "no movement"],
    reason: "Reduced fetal movement reported in Materna chat",
  },
];

export function detectChatRisk(message: string) {
  const normalized = message.toLowerCase();
  return SIGNAL_GROUPS.find((group) =>
    group.terms.some((term) => normalized.includes(term))
  )?.reason;
}

export async function recordChatRiskSignal(message: string) {
  const reason = detectChatRisk(message);
  if (!reason) return null;

  const current = await loadChatRiskSignals();
  const signal: ChatRiskSignal = {
    id: Date.now().toString(),
    message: message.trim(),
    reason,
    recordedAt: new Date().toISOString(),
  };
  const deduplicated = current.filter((item) => item.reason !== reason);
  await AsyncStorage.setItem(
    CHAT_RISK_KEY,
    JSON.stringify([signal, ...deduplicated].slice(0, 10))
  );
  return signal;
}

export async function loadChatRiskSignals(): Promise<ChatRiskSignal[]> {
  try {
    const stored = await AsyncStorage.getItem(CHAT_RISK_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
