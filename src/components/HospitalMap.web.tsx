import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { HospitalMapProps } from "./HospitalMap.types";

export default function HospitalMap({
  dark,
  accent,
  hospitals,
  ambulances,
}: HospitalMapProps) {
  return (
    <View
      style={[
        styles.fallback,
        {
          backgroundColor: dark ? "#141824" : "#eef2ff",
          borderColor: accent,
        },
      ]}
    >
      <Text style={[styles.title, { color: dark ? "#ffffff" : "#111827" }]}>
        Live map is available in Expo Go
      </Text>
      <Text style={[styles.body, { color: dark ? "#9ca3af" : "#64748b" }]}>
        {hospitals.length} care locations and {ambulances.length} ambulances are
        shown for the selected county.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    minHeight: 300,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 17, fontWeight: "800", textAlign: "center" },
  body: { fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 8 },
});
