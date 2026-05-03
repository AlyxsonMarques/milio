import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Silo } from "@/context/PortfolioContext";
import { formatCurrency } from "@/utils/format";

interface Props {
  silo: Silo;
  onUpdate?: () => void;
  onEdit?: () => void;
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

export function SiloCard({ silo, onUpdate, onEdit, onDelete, compact = false }: Props) {
  const colors = useColors();

  const handleUpdate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate?.();
  };

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
          {silo.yearlyReturnRate > 0 ? ` · ${silo.yearlyReturnRate}% p.a.` : " · No return"}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {formatCurrency(silo.currentValue, true)}
        </Text>
        <View style={styles.actions}>
          {onUpdate && (
            <Pressable
              onPress={handleUpdate}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Feather name="edit-3" size={13} color={colors.primaryForeground} />
            </Pressable>
          )}
          {!compact && onEdit && (
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.secondary, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Feather name="settings" size={13} color={colors.mutedForeground} />
            </Pressable>
          )}
          {!compact && onDelete && (
            <Pressable
              onPress={onDelete}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.destructive + "20", opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Feather name="trash-2" size={13} color={colors.destructive} />
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
    gap: 2,
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
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
