import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { PendingMilestone } from "@/context/PortfolioContext";

interface Props {
  milestone: PendingMilestone | null;
  onDismiss: () => void;
}

export function MilestoneModal({ milestone, onDismiss }: Props) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (milestone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.7);
      opacity.setValue(0);
    }
  }, [milestone, scale, opacity]);

  if (!milestone) return null;

  const isHarvest = milestone.percentage === 100;

  return (
    <Modal transparent animationType="none" visible={!!milestone} onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary,
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.pct, { color: colors.primaryForeground }]}>
              {milestone.percentage}%
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.primary }]}>{milestone.name}</Text>
          <Text style={[styles.message, { color: colors.foreground }]}>{milestone.message}</Text>

          {isHarvest && (
            <Text style={[styles.emoji, { color: colors.primary }]}>HARVEST</Text>
          )}

          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
              {isHarvest ? "I am a millionaire!" : "Keep going!"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 2,
    gap: 12,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  pct: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  emoji: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
  },
  btn: {
    marginTop: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
