import { Feather } from "@expo/vector-icons";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePortfolio } from "@/context/PortfolioContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDelta } from "@/utils/format";

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateHistory } = usePortfolio();

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>History</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {updateHistory.length} update{updateHistory.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={updateHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        renderItem={({ item }) => {
          const isPositive = item.delta >= 0;
          return (
            <View
              style={[
                styles.item,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: isPositive
                      ? colors.accent + "20"
                      : colors.destructive + "20",
                  },
                ]}
              >
                <Feather
                  name={isPositive ? "arrow-up" : "arrow-down"}
                  size={16}
                  color={isPositive ? colors.accent : colors.destructive}
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemSilo, { color: colors.foreground }]} numberOfLines={1}>
                  {item.siloName}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                  {formatCurrency(item.previousValue, true)} → {formatCurrency(item.newValue, true)}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <Text
                  style={[
                    styles.itemDelta,
                    { color: isPositive ? colors.accent : colors.destructive },
                  ]}
                >
                  {formatDelta(item.delta)}
                </Text>
                <Text style={[styles.itemTime, { color: colors.mutedForeground }]}>
                  {timeAgo(item.timestamp)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="clock" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No updates yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Update your silo values and your history will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemSilo: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  itemMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  itemDelta: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  itemTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 60,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
