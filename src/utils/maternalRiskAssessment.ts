import { ProfileData } from "../storage/profileStorage";
import { ChatRiskSignal } from "../storage/chatRiskStorage";

export interface MaternalRiskAssessment {
  level: "High" | "Needs review" | "Routine";
  color: string;
  reasons: string[];
  assessedAt: string;
  disclaimer: string;
}

export function assessMaternalRisk(
  profile: ProfileData,
  chatSignals: ChatRiskSignal[]
): MaternalRiskAssessment {
  const reasons: string[] = [];
  const age = Number(profile.age);

  if (age && (age < 17 || age >= 35)) reasons.push(`Maternal age ${age}`);
  if (profile.hasHighBP) reasons.push("History of high blood pressure");
  if (profile.hasDiabetes) reasons.push("History of diabetes");
  if (profile.hasMiscarriage) reasons.push("History of miscarriage");
  if (profile.hasAnemia) reasons.push("History of anemia");
  if (profile.hasCSection) reasons.push("Previous C-section");
  chatSignals.forEach((signal) => reasons.push(signal.reason));

  const urgentChatSignal = chatSignals.some((signal) =>
    /jaw|chest|breathing|bleeding|vision|preeclampsia|fetal movement/i.test(
      signal.reason
    )
  );
  const highProfileRisk = profile.hasHighBP || profile.hasDiabetes;
  const level =
    urgentChatSignal || highProfileRisk || reasons.length >= 3
      ? "High"
      : reasons.length > 0
      ? "Needs review"
      : "Routine";

  return {
    level,
    color:
      level === "High"
        ? "#e11d48"
        : level === "Needs review"
        ? "#d97706"
        : "#22C55E",
    reasons,
    assessedAt: new Date().toISOString(),
    disclaimer:
      "Early review flag based on patient-entered profile and chat signals. It is not a diagnosis.",
  };
}
