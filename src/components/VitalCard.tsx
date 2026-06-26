import React from "react";
import { View, Text, StyleSheet } from "react-native";

type VitalCardProps = {
  title: string;
  value: string;
  unit: string;
  theme: "dark" | "light";
};

export default function VitalCard({ title, value, unit, theme }: VitalCardProps) {
  const isDark = theme === "dark";

  const colors = {
    card: isDark ? "#101418" : "#FFFFFF",
    border: isDark ? "#242B33" : "#E2E8F0",
    text: isDark ? "#F8FAFC" : "#0F172A",
    mutedText: isDark ? "#94A3B8" : "#64748B",
    blue: isDark ? "#93C5FD" : "#2563EB",
    green: "#22C55E",
    wave: isDark ? "#4ADE80" : "#16A34A",
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.liveDot, { backgroundColor: colors.green }]} />

      <Text style={[styles.title, { color: colors.blue }]}>{title}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.unit, { color: colors.mutedText }]}>{unit}</Text>
      </View>

      <View style={styles.waveRow}>
        <View style={[styles.waveBar, { height: 7, backgroundColor: colors.wave }]} />
        <View style={[styles.waveBar, { height: 13, backgroundColor: colors.wave }]} />
        <View style={[styles.waveBar, { height: 9, backgroundColor: colors.wave }]} />
        <View style={[styles.waveBar, { height: 17, backgroundColor: colors.wave }]} />
        <View style={[styles.waveBar, { height: 12, backgroundColor: colors.wave }]} />
        <View style={[styles.waveBar, { height: 20, backgroundColor: colors.wave }]} />
        <View style={[styles.waveBar, { height: 15, backgroundColor: colors.wave }]} />
        <View style={[styles.waveBar, { height: 10, backgroundColor: colors.wave }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    position: "relative",
  },
  liveDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  title: {
    fontSize: 12,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  value: {
    fontSize: 25,
    fontWeight: "800",
  },
  unit: {
    fontSize: 10,
    marginLeft: 4,
    marginBottom: 5,
  },
  waveRow: {
    height: 26,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
    marginTop: 10,
  },
  waveBar: {
    flex: 1,
    borderRadius: 99,
  },
});