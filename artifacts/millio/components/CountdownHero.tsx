import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/format";

interface Props {
  remainingToGoal: number;
  percentToGoal: number;
  netWorth: number;
  goal: number;
}

export function CountdownHero({ remainingToGoal, percentToGoal, netWorth, goal }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>only</Text>
      <Text style={[styles.amount, { color: colors.primary }]}>
        {formatCurrency(remainingToGoal)}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>to go</Text>

      <View style={styles.progressWrapper}>
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${Math.max(percentToGoal, 1)}%` as `${number}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentLabel, { color: colors.mutedForeground }]}>
          {percentToGoal.toFixed(1)}% of {formatCurrency(goal, true)} goal
        </Text>
      </View>

      <View style={[styles.netWorthRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.netWorthLabel, { color: colors.mutedForeground }]}>
          Your silos hold
        </Text>
        <Text style={[styles.netWorthValue, { color: colors.foreground }]}>
          {formatCurrency(netWorth)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  amount: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    marginVertical: 4,
    letterSpacing: -2,
  },
  progressWrapper: {
    width: "100%",
    marginTop: 20,
    gap: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  netWorthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  netWorthLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  netWorthValue: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
