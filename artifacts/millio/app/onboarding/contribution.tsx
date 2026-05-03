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

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function OnboardingContribution() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setMonthlyContribution } = usePortfolio();

  const [valueStr, setValueStr] = useState("");
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handleContinue() {
    const val = parseFloat(valueStr.replace(/,/g, "")) || 0;
    if (isNaN(val) || val < 0) {
      setError("Enter a valid amount or 0 if none.");
      return;
    }
    setMonthlyContribution(val);
    router.push("/onboarding/goal");
  }

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
            <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
          </View>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.content}>
          <Feather name="calendar" size={40} color={colors.primary} style={styles.icon} />
          <Text style={[styles.title, { color: colors.foreground }]}>Monthly fuel</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            How much do you add to your silos each month? This powers your harvest projection.
          </Text>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border },
            ]}
            placeholder="$0"
            placeholderTextColor={colors.mutedForeground}
            value={valueStr ? `$${valueStr}` : ""}
            onChangeText={(t) => { setValueStr(t.replace(/[^0-9.]/g, "")); setError(""); }}
            keyboardType="decimal-pad"
            autoFocus
          />

          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Can be 0 — some silos grow on their own
          </Text>

          {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((amt) => (
              <Pressable
                key={amt}
                onPress={() => setValueStr(amt.toString())}
                style={({ pressed }) => [
                  styles.quickBtn,
                  {
                    backgroundColor:
                      valueStr === amt.toString() ? colors.primary : colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.quickBtnText,
                    {
                      color: valueStr === amt.toString() ? colors.primaryForeground : colors.mutedForeground,
                    },
                  ]}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.continueBtnText, { color: colors.primaryForeground }]}>
            Continue
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
  icon: {
    alignSelf: "center",
    marginBottom: 8,
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
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
  quickBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
