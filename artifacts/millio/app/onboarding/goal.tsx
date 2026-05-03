import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePortfolio } from "@/context/PortfolioContext";

const PRESETS = [
  { label: "$500K", value: 500_000 },
  { label: "$1M", value: 1_000_000 },
  { label: "$2M", value: 2_000_000 },
  { label: "$5M", value: 5_000_000 },
];

export default function OnboardingGoal() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setGoal, completeOnboarding } = usePortfolio();

  const [valueStr, setValueStr] = useState("1000000");
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handleFinish() {
    const val = parseFloat(valueStr.replace(/,/g, ""));
    if (isNaN(val) || val <= 0) {
      setError("Enter a valid goal amount.");
      return;
    }
    setGoal(val);
    completeOnboarding();
    router.replace("/(tabs)");
  }

  const numVal = parseFloat(valueStr.replace(/,/g, ""));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: topPad + 12, paddingBottom: bottomPad + 16 },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.stepDots}>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
          </View>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.corn, { color: colors.primary }]}>HARVEST</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Set your goal</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            The default is $1,000,000 — the classic harvest. You can change this anytime.
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: !isNaN(numVal) && numVal > 0 ? colors.primary : colors.border,
              },
            ]}
            placeholder="1000000"
            placeholderTextColor={colors.mutedForeground}
            value={valueStr}
            onChangeText={(t) => { setValueStr(t.replace(/[^0-9]/g, "")); setError(""); }}
            keyboardType="number-pad"
          />

          {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}

          <View style={styles.presetRow}>
            {PRESETS.map((p) => (
              <Pressable
                key={p.value}
                onPress={() => setValueStr(p.value.toString())}
                style={({ pressed }) => [
                  styles.presetBtn,
                  {
                    backgroundColor:
                      numVal === p.value ? colors.primary : colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    {
                      color: numVal === p.value ? colors.primaryForeground : colors.mutedForeground,
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleFinish}
          style={({ pressed }) => [
            styles.finishBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.finishBtnText, { color: colors.primaryForeground }]}>
            Start the harvest
          </Text>
          <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  stepDots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: {},
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },
  corn: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 8,
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  finishBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
