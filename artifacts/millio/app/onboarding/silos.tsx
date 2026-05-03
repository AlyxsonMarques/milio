import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { AddSiloSheet } from "@/components/AddSiloSheet";
import { SiloCard } from "@/components/SiloCard";
import { Silo, usePortfolio } from "@/context/PortfolioContext";
import { generateId } from "@/utils/format";

export default function OnboardingSilos() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addSilo } = usePortfolio();

  const [localSilos, setLocalSilos] = useState<Silo[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [editingSilo, setEditingSilo] = useState<Silo | undefined>(undefined);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handleSave(siloData: Omit<Silo, "id" | "createdAt">, siloId?: string) {
    if (siloId) {
      setLocalSilos((prev) =>
        prev.map((s) => (s.id === siloId ? { ...s, ...siloData } : s))
      );
    } else {
      setLocalSilos((prev) => [
        ...prev,
        { ...siloData, id: generateId(), createdAt: new Date().toISOString() },
      ]);
    }
    setEditingSilo(undefined);
  }

  function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalSilos((prev) => prev.filter((s) => s.id !== id));
  }

  function handleContinue() {
    for (const s of localSilos) {
      addSilo({
        name: s.name,
        type: s.type,
        currentValue: s.currentValue,
        yearlyReturnRate: s.yearlyReturnRate,
        recurringContribution: s.recurringContribution,
        notificationDay: s.notificationDay,
        notificationId: s.notificationId,
      });
    }
    router.push("/onboarding/contribution");
  }

  return (
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
          <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>
        <View style={{ width: 22 }} />
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Your silos</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Add each savings account, property, or investment.
      </Text>

      <FlatList
        data={localSilos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SiloCard
            silo={item}
            onEdit={() => { setEditingSilo(item); setShowSheet(true); }}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No silos yet. Add your first one.
            </Text>
          </View>
        }
        style={{ flex: 1 }}
      />

      <Pressable
        onPress={() => { setEditingSilo(undefined); setShowSheet(true); }}
        style={({ pressed }) => [
          styles.addBtn,
          { borderColor: colors.primary, opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <Feather name="plus" size={18} color={colors.primary} />
        <Text style={[styles.addBtnText, { color: colors.primary }]}>Add a silo</Text>
      </Pressable>

      <Pressable
        onPress={handleContinue}
        disabled={localSilos.length === 0}
        style={({ pressed }) => [
          styles.continueBtn,
          {
            backgroundColor: localSilos.length > 0 ? colors.primary : colors.muted,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.continueBtnText,
            { color: localSilos.length > 0 ? colors.primaryForeground : colors.mutedForeground },
          ]}
        >
          Continue
        </Text>
        <Feather
          name="arrow-right"
          size={18}
          color={localSilos.length > 0 ? colors.primaryForeground : colors.mutedForeground}
        />
      </Pressable>

      <AddSiloSheet
        visible={showSheet}
        silo={editingSilo}
        onSave={handleSave}
        onClose={() => { setShowSheet(false); setEditingSilo(undefined); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  stepDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {},
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  list: {
    gap: 10,
    paddingBottom: 12,
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 10,
  },
  addBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
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
