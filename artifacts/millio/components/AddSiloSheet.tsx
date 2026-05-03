import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Silo } from "@/context/PortfolioContext";

type SiloType = "cash" | "property" | "investment";
type ReturnPreset = "none" | "conservative" | "moderate" | "aggressive" | "custom";

interface Props {
  visible: boolean;
  silo?: Silo;
  onSave: (silo: Omit<Silo, "id" | "createdAt">) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: SiloType; label: string; icon: string }[] = [
  { value: "cash", label: "Cash", icon: "dollar-sign" },
  { value: "property", label: "Property", icon: "home" },
  { value: "investment", label: "Investment", icon: "trending-up" },
];

const RETURN_PRESETS: { value: ReturnPreset; label: string; rate: number }[] = [
  { value: "none", label: "None / IDK", rate: 0 },
  { value: "conservative", label: "Conservative 6%", rate: 6 },
  { value: "moderate", label: "Moderate 10%", rate: 10 },
  { value: "aggressive", label: "Aggressive 15%", rate: 15 },
  { value: "custom", label: "Custom", rate: 0 },
];

export function AddSiloSheet({ visible, silo, onSave, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [type, setType] = useState<SiloType>("cash");
  const [valueStr, setValueStr] = useState("");
  const [returnPreset, setReturnPreset] = useState<ReturnPreset>("none");
  const [customRateStr, setCustomRateStr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      if (silo) {
        setName(silo.name);
        setType(silo.type);
        setValueStr(silo.currentValue.toString());
        const preset = RETURN_PRESETS.find((p) => p.rate === silo.yearlyReturnRate && p.value !== "custom");
        if (preset) {
          setReturnPreset(preset.value);
        } else if (silo.yearlyReturnRate > 0) {
          setReturnPreset("custom");
          setCustomRateStr(silo.yearlyReturnRate.toString());
        } else {
          setReturnPreset("none");
        }
      } else {
        setName("");
        setType("cash");
        setValueStr("");
        setReturnPreset("none");
        setCustomRateStr("");
      }
      setError("");
    }
  }, [visible, silo]);

  function getRate(): number {
    if (returnPreset === "custom") return parseFloat(customRateStr) || 0;
    return RETURN_PRESETS.find((p) => p.value === returnPreset)?.rate ?? 0;
  }

  function handleSave() {
    if (!name.trim()) { setError("Give your silo a name."); return; }
    const value = parseFloat(valueStr.replace(/,/g, ""));
    if (isNaN(value) || value < 0) { setError("Enter a valid current value."); return; }
    if (returnPreset === "custom") {
      const rate = parseFloat(customRateStr);
      if (isNaN(rate) || rate < 0 || rate > 100) { setError("Enter a valid return rate (0–100%)."); return; }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({ name: name.trim(), type, currentValue: value, yearlyReturnRate: getRate() });
    onClose();
  }

  const inputStyle = [styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }];

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
            <Text style={[styles.title, { color: colors.foreground }]}>
              {silo ? "Edit Silo" : "New Silo"}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Silo name</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Nubank, Apartment, XP Investimentos"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Type</Text>
            <View style={styles.row}>
              {TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setType(opt.value)}
                  style={({ pressed }) => [
                    styles.typeBtn,
                    {
                      backgroundColor: type === opt.value ? colors.primary : colors.secondary,
                      opacity: pressed ? 0.8 : 1,
                      flex: 1,
                    },
                  ]}
                >
                  <Feather
                    name={opt.icon as "dollar-sign"}
                    size={16}
                    color={type === opt.value ? colors.primaryForeground : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      {
                        color: type === opt.value ? colors.primaryForeground : colors.mutedForeground,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Current value ($)</Text>
            <TextInput
              style={inputStyle}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              value={valueStr}
              onChangeText={setValueStr}
              keyboardType="decimal-pad"
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Yearly return rate</Text>
            <View style={styles.presetGrid}>
              {RETURN_PRESETS.map((p) => (
                <Pressable
                  key={p.value}
                  onPress={() => setReturnPreset(p.value)}
                  style={({ pressed }) => [
                    styles.presetBtn,
                    {
                      backgroundColor: returnPreset === p.value ? colors.primary : colors.secondary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      {
                        color: returnPreset === p.value ? colors.primaryForeground : colors.mutedForeground,
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {returnPreset === "custom" && (
              <TextInput
                style={[inputStyle, { marginTop: 8 }]}
                placeholder="e.g. 12.5"
                placeholderTextColor={colors.mutedForeground}
                value={customRateStr}
                onChangeText={setCustomRateStr}
                keyboardType="decimal-pad"
              />
            )}

            {!!error && (
              <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
            )}

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                {silo ? "Save changes" : "Plant this silo"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheetWrapper: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: "90%",
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
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  scroll: {
    flexGrow: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  presetBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
