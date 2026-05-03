import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddSiloSheet } from "@/components/AddSiloSheet";
import { SiloCard } from "@/components/SiloCard";
import { UpdateValueSheet } from "@/components/UpdateValueSheet";
import { Silo, usePortfolio } from "@/context/PortfolioContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/format";

export default function SilosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { silos, addSilo, updateSilo, updateSiloValue, deleteSilo, netWorth } = usePortfolio();

  const [showAdd, setShowAdd] = useState(false);
  const [editingSilo, setEditingSilo] = useState<Silo | undefined>(undefined);
  const [updatingSilo, setUpdatingSilo] = useState<Silo | null>(null);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handleDelete(silo: Silo) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Remove silo",
      `Remove "${silo.name}"? Its value will be deducted from your net worth.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => deleteSilo(silo.id) },
      ]
    );
  }

  function handleSave(siloData: Omit<Silo, "id" | "createdAt">) {
    if (editingSilo) {
      updateSilo(editingSilo.id, siloData);
    } else {
      addSilo(siloData);
    }
    setEditingSilo(undefined);
  }

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
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Silos</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Total: {formatCurrency(netWorth)}
          </Text>
        </View>
        <Pressable
          onPress={() => { setEditingSilo(undefined); setShowAdd(true); }}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <FlatList
        data={silos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 100 },
        ]}
        renderItem={({ item }) => (
          <SiloCard
            silo={item}
            onUpdate={() => setUpdatingSilo(item)}
            onEdit={() => { setEditingSilo(item); setShowAdd(true); }}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No silos yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap the + button to plant your first silo.
            </Text>
          </View>
        }
      />

      <AddSiloSheet
        visible={showAdd}
        silo={editingSilo}
        onSave={handleSave}
        onClose={() => { setShowAdd(false); setEditingSilo(undefined); }}
      />

      <UpdateValueSheet
        visible={!!updatingSilo}
        silo={updatingSilo}
        onSave={(val) => updatingSilo && updateSiloValue(updatingSilo.id, val)}
        onClose={() => setUpdatingSilo(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    gap: 10,
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
