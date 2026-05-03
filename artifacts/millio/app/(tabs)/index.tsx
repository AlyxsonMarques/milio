import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CountdownHero } from "@/components/CountdownHero";
import { ContributeSheet } from "@/components/ContributeSheet";
import { HypeToast } from "@/components/HypeToast";
import { MilestoneModal } from "@/components/MilestoneModal";
import { SiloCard } from "@/components/SiloCard";
import { Silo, usePortfolio } from "@/context/PortfolioContext";
import { useColors } from "@/hooks/useColors";
import { formatDate, formatMonthsAway } from "@/utils/format";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    silos,
    netWorth,
    percentToGoal,
    remainingToGoal,
    eta,
    goal,
    totalMonthlyContribution,
    pendingMilestone,
    pendingHype,
    contributeSilo,
    dismissMilestone,
    dismissHype,
  } = usePortfolio();

  const [contributingSilo, setContributingSilo] = useState<Silo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }

  const etaDate = eta.arrivalDate ? new Date(eta.arrivalDate) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 110 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appBar}>
          <Text style={[styles.appName, { color: colors.primary }]}>MILLIO</Text>
        </View>

        <CountdownHero
          remainingToGoal={remainingToGoal}
          percentToGoal={percentToGoal}
          netWorth={netWorth}
          goal={goal}
        />

        <View style={[styles.etaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.etaRow}>
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={[styles.etaLabel, { color: colors.mutedForeground }]}>
              At your current pace
            </Text>
          </View>
          {etaDate && eta.months > 0 ? (
            <>
              <Text style={[styles.etaDate, { color: colors.foreground }]}>
                {formatDate(etaDate)}
              </Text>
              <Text style={[styles.etaAway, { color: colors.primary }]}>
                {formatMonthsAway(eta.months)}
              </Text>
            </>
          ) : eta.months === 0 ? (
            <Text style={[styles.etaDate, { color: colors.accent }]}>
              You've reached your goal!
            </Text>
          ) : netWorth <= 0 ? (
            <Text style={[styles.etaNA, { color: colors.mutedForeground }]}>
              Add a silo value to see your ETA
            </Text>
          ) : (
            <Text style={[styles.etaNA, { color: colors.mutedForeground }]}>
              Add more or increase your returns to reach the goal within 50 years
            </Text>
          )}
          {totalMonthlyContribution > 0 && (
            <Text style={[styles.etaMeta, { color: colors.mutedForeground }]}>
              Contributing ${totalMonthlyContribution.toLocaleString()}/mo
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your silos</Text>
            <Pressable onPress={() => router.push("/(tabs)/silos")} hitSlop={12}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Manage</Text>
            </Pressable>
          </View>

          {silos.length === 0 ? (
            <Pressable
              onPress={() => router.push("/(tabs)/silos")}
              style={({ pressed }) => [
                styles.emptySilos,
                { borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Feather name="plus-circle" size={28} color={colors.primary} />
              <Text style={[styles.emptySilosText, { color: colors.mutedForeground }]}>
                Add your first silo
              </Text>
            </Pressable>
          ) : (
            <View style={styles.siloList}>
              {silos.slice(0, 5).map((silo) => (
                <SiloCard
                  key={silo.id}
                  silo={silo}
                  compact
                  onContribute={() => setContributingSilo(silo)}
                />
              ))}
              {silos.length > 5 && (
                <Pressable
                  onPress={() => router.push("/(tabs)/silos")}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={[styles.moreText, { color: colors.primary }]}>
                    +{silos.length - 5} more silos →
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <HypeToast message={pendingHype} onDismiss={dismissHype} />
      <MilestoneModal milestone={pendingMilestone} onDismiss={dismissMilestone} />

      <ContributeSheet
        visible={!!contributingSilo}
        silo={contributingSilo}
        onSave={(amount) => contributingSilo && contributeSilo(contributingSilo.id, amount)}
        onClose={() => setContributingSilo(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  appBar: {
    marginBottom: 4,
  },
  appName: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
  },
  etaCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 4,
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  etaLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  etaDate: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  etaAway: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  etaNA: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  etaMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  siloList: {
    gap: 10,
  },
  emptySilos: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 36,
    alignItems: "center",
    gap: 10,
  },
  emptySilosText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  moreText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
