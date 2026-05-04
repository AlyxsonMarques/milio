import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function HypeToast({ message, onDismiss }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 100, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => onDismiss());
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(100);
      opacity.setValue(0);
    }
  }, [message, translateY, opacity, onDismiss]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.primary,
          bottom: insets.bottom + 88,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.primaryForeground }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    zIndex: 999,
  },
  text: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});
