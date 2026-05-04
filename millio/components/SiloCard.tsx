import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Silo } from "@/context/PortfolioContext";
import { formatCurrency } from "@/utils/format";

interface Props {
  silo: Silo;
  onContribute?: () => void;
  onEdit?: () => void;
  onSetValue?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

function SiloIcon({ type, color }: { type: Silo["type"]; color: string }) {
  if (type === "cash") return <Feather name="dollar-sign" size={18} color={color} />;
  if (type === "property") return <Feather name="home" size={18} color={color} />;
  return <MaterialCommunityIcons name="chart-line" size={18} color={color} />;
}

function typeLabel(type: Silo["type"]): string {
  if (type === "cash") return "Cash";
  if (type === "property") return "Property";
  return "Investment";
}

export function SiloCard({ silo, onContribute, onEdit, onSetValue, onDelete, compact = false }: Props) {
  const colors = useColors();

  function handleContribute() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContribute?.();
  }

  function handleMoreOptions() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const options: { text: string; onPress?: () => void; style?: "default" | "destructive" | "cancel" }[] = [
      { text: "Edit silo details", onPress: onEdit },
      { text: "Set exact value", onPress: onSetValue },
      { text: "Delete silo", style: "destructive", onPress: onDelete },
      { text: "Cancel", style: "cancel" },
    ];
    Alert.alert(silo.name, undefined, options.filter((o) => o.onPress !== undefined || o.style === "cancel"));
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.secondary }]}>
        <SiloIcon type={silo.type} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {silo.name}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {typeLabel(silo.type)}
          {silo.yearlyReturnRate > 0 ? ` · ${silo.yearlyReturnRate}% p.a.` : ""}
          {silo.recurringContribution ? ` · +${formatCurrency(silo.recurringContribution, true)}/mo` : ""}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {formatCurrency(silo.currentValue, true)}
        </Text>
        <View style={styles.actions}>
          {onContribute && (
            <Pressable
              onPress={handleContribute}
              style={({ pressed }) => [
                styles.plusBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </Pressable>
          )}
          {!compact && (onEdit || onSetValue || onDelete) && (
            <Pressable
              onPress={handleMoreOptions}
              style={({ pressed }) => [
                styles.menuBtn,
                { backgroundColor: colors.secondary, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Feather name="more-horizontal" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  value: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  plusBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});
