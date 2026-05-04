import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleSiloReminder(
  siloId: string,
  siloName: string,
  dayOfMonth: number
): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;

    const now = new Date();
    let triggerDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, 9, 0, 0);
    if (triggerDate <= now) {
      triggerDate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth, 9, 0, 0);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to update your silo",
        body: `How is ${siloName} growing? Tap to log the latest value.`,
        data: { siloId },
      },
      trigger: triggerDate,
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelSiloReminder(notificationId: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}
