import { Platform } from "react-native";

function getDefaultApiUrl() {
  if (Platform.OS === "web") {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";

    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return "http://localhost:5000/api";
    }

    return "/api";
  }

  return "http://localhost:5000/api";
}

export const MATERNA_URL =
  process.env.EXPO_PUBLIC_MATERNA_API_URL || getDefaultApiUrl();

export const DOCTOR_SESSION_KEY = "materna_doctor_session";

export const BASE_HEADERS = {
  "Content-Type": "application/json",
};
