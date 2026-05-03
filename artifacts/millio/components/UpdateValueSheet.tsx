import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Silo } from "@/context/PortfolioContext";
import { formatCurrency } from "@/utils/format";

interface Props {
  visible: boolean;
  silo: Silo | null;
  onSave: (newValue: number) => void;
  onClose: () => void;
}

export function UpdateValueSheet({ visible, silo, onSave, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [valueStr, setValueStr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && silo) {
      setValueStr(silo.currentValue.toString());
      setError("");
    }
  }, [visible, silo]);

  function handleSave() {
    const value = parseFloat(valueStr.replace(/,/g, ""));
    if (isNaN(value) || value < 0) {
      setError("Enter a valid amount.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(value);
    onClose();
  }

  if (!silo) return null;

  const delta = parseFloat(valueStr.replace(/,/g, "")) - silo.currentValue;
  const showDelta = !isNaN(delta) && valueStr !== "" && delta !== 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.sheetWrapper}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>{silo.name}</Text>
              <Text style={[styles.current, { color: colors.mutedForeground }]}>
                Currently {formatCurrency(silo.currentValue)}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>New value ($)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            value={valueStr}
            onChangeText={(t) => { setValueStr(t); setError(""); }}
            keyboardType="decimal-pad"
            autoFocus
          />

          {showDelta && (
            <Text
              style={[
                styles.delta,
                { color: delta > 0 ? colors.accent : colors.destructive },
              ]}
            >
              {delta > 0 ? "+" : ""}{formatCurrency(delta, true)} vs current
            </Text>
          )}

          {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
              Update silo
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheetWrapper: { justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#404040",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  current: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
  },
  delta: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 8,
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
