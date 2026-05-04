import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Silo } from "@/context/PortfolioContext";
import { formatCurrency } from "@/utils/format";

interface Props {
  visible: boolean;
  silo: Silo | null;
  onSave: (amount: number) => void;
  onClose: () => void;
}

export function ContributeSheet({ visible, silo, onSave, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [amountStr, setAmountStr] = useState("");
  const [mode, setMode] = useState<"add" | "withdraw">("add");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setAmountStr("");
      setMode("add");
      setError("");
    }
  }, [visible]);

  if (!silo) return null;

  const parsedAmount = parseFloat(amountStr.replace(/,/g, ""));
  const delta = !isNaN(parsedAmount) && amountStr !== "" ? (mode === "add" ? parsedAmount : -parsedAmount) : 0;
  const newValue = silo.currentValue + delta;
  const showPreview = !isNaN(parsedAmount) && amountStr !== "";

  function handleSave() {
    const amount = parseFloat(amountStr.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(mode === "add" ? amount : -amount);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior="padding" style={styles.avoidingView}>
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
              <Text style={[styles.currentValue, { color: colors.mutedForeground }]}>
                Currently {formatCurrency(silo.currentValue)}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={[styles.modeRow, { backgroundColor: colors.secondary, borderRadius: 12 }]}>
            <Pressable
              onPress={() => setMode("add")}
              style={[
                styles.modeBtn,
                mode === "add" && { backgroundColor: colors.accent },
              ]}
            >
              <Feather
                name="plus"
                size={14}
                color={mode === "add" ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  { color: mode === "add" ? "#fff" : colors.mutedForeground },
                ]}
              >
                Deposit
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("withdraw")}
              style={[
                styles.modeBtn,
                mode === "withdraw" && { backgroundColor: colors.destructive },
              ]}
            >
              <Feather
                name="minus"
                size={14}
                color={mode === "withdraw" ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  { color: mode === "withdraw" ? "#fff" : colors.mutedForeground },
                ]}
              >
                Withdraw
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            {mode === "add" ? "Amount to add ($)" : "Amount to withdraw ($)"}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            value={amountStr}
            onChangeText={(t) => { setAmountStr(t.replace(/[^0-9.]/g, "")); setError(""); }}
            keyboardType="decimal-pad"
            autoFocus
          />

          {showPreview && (
            <View style={[styles.previewRow, { backgroundColor: colors.secondary, borderRadius: 10 }]}>
              <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>
                New balance
              </Text>
              <Text
                style={[
                  styles.previewValue,
                  { color: delta >= 0 ? colors.accent : colors.destructive },
                ]}
              >
                {formatCurrency(newValue)}
              </Text>
            </View>
          )}

          {!!error && (
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          )}

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              {
                backgroundColor: mode === "add" ? colors.accent : colors.destructive,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.saveBtnText, { color: "#fff" }]}>
              {mode === "add" ? "Add to silo" : "Withdraw from silo"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  avoidingView: { justifyContent: "flex-end" },
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
  currentValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  modeRow: {
    flexDirection: "row",
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  modeBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  fieldLabel: {
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
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  previewValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
