import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function OnboardingWelcome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 24,
          paddingBottom: bottomPad + 24,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="trending-up" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.appName, { color: colors.primary }]}>MILLIO</Text>
        <Text style={[styles.tagline, { color: colors.foreground }]}>
          Grain by grain,{"\n"}the chicken fills its belly.
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          A gamified net worth tracker that counts down to your million harvest.
        </Text>
      </View>

      <View style={styles.bottom}>
        <View style={[styles.featureRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="target" size={18} color={colors.primary} />
          <Text style={[styles.featureText, { color: colors.foreground }]}>
            Track every silo on the path to $1M
          </Text>
        </View>
        <View style={[styles.featureRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="clock" size={18} color={colors.primary} />
          <Text style={[styles.featureText, { color: colors.foreground }]}>
            See your real harvest ETA — month and year
          </Text>
        </View>
        <View style={[styles.featureRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="award" size={18} color={colors.primary} />
          <Text style={[styles.featureText, { color: colors.foreground }]}>
            Hit milestones. Feel the momentum.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/onboarding/silos")}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>
            Let's plant your first grain
          </Text>
          <Feather name="arrow-right" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    gap: 16,
    paddingTop: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  bottom: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
