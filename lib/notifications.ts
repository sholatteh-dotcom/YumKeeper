import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FoodItem, getDaysRemaining } from './food-data';

// ─── Channel IDs ─────────────────────────────────────────────────────────────
// Centralised constants so every call-site uses the same string.
export const CHANNEL_EXPIRY_ALERTS = 'expiry-alerts';
export const CHANNEL_WEEKLY_DIGEST = 'weekly-digest';

// ─── Notification handler ─────────────────────────────────────────────────────
// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Channel registration ─────────────────────────────────────────────────────
/**
 * Register named Android notification channels (Android 8+ / API 26+).
 * Called once at app startup (before any notification is scheduled).
 * On iOS and web this is a no-op.
 *
 * Users can individually control each channel in:
 *   Settings → Apps → YumKeeper → Notifications
 */
export async function registerNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  // High-priority channel for imminent expiry alerts
  await Notifications.setNotificationChannelAsync(CHANNEL_EXPIRY_ALERTS, {
    name: 'Expiry Alerts',
    description: 'Alerts when food items are about to expire',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2D8A4E',
    enableLights: true,
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
    sound: 'default',
    bypassDnd: false,
  });

  // Default-priority channel for weekly inventory summaries
  await Notifications.setNotificationChannelAsync(CHANNEL_WEEKLY_DIGEST, {
    name: 'Weekly Digest',
    description: 'Weekly summary of your food inventory',
    importance: Notifications.AndroidImportance.DEFAULT,
    enableLights: false,
    enableVibrate: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: false,
    sound: 'default',
    bypassDnd: false,
  });
}

// ─── Permission request ───────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  // Ensure channels exist before requesting permission (Android requirement)
  await registerNotificationChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// ─── Schedule expiry notifications ───────────────────────────────────────────
export async function scheduleExpiryNotifications(
  items: FoodItem[],
  alertDays: number[] = [1, 3]
): Promise<void> {
  if (Platform.OS === 'web') return;

  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  for (const item of items) {
    const daysLeft = getDaysRemaining(item.expiryDate);

    for (const alertDay of alertDays) {
      if (daysLeft === alertDay) {
        const message = alertDay === 0
          ? `${item.emoji} ${item.name} expires TODAY!`
          : alertDay === 1
          ? `${item.emoji} ${item.name} expires TOMORROW!`
          : `${item.emoji} ${item.name} expires in ${alertDay} days`;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🫙 YumKeeper Alert',
            body: message,
            data: { itemId: item.id },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
            // Route to the Expiry Alerts channel on Android
            channelId: CHANNEL_EXPIRY_ALERTS,
          },
        }).catch(() => {
          // Silently fail if scheduling fails
        });
      }
    }
  }
}

// ─── Schedule weekly digest ───────────────────────────────────────────────────
/**
 * Schedule a weekly inventory digest notification every Sunday at 9 AM.
 * Uses the Weekly Digest channel so users can opt-out independently.
 */
export async function scheduleWeeklyDigest(totalItems: number): Promise<void> {
  if (Platform.OS === 'web') return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Cancel any existing weekly digest notification
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if ((notif.content.data as Record<string, unknown>)?.type === 'weekly-digest') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🫙 Your Weekly Food Summary',
      body: `You have ${totalItems} item${totalItems !== 1 ? 's' : ''} in your pantry. Check what needs using up!`,
      data: { type: 'weekly-digest' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 9,
      minute: 0,
      channelId: CHANNEL_WEEKLY_DIGEST,
    },
  }).catch(() => {
    // Silently fail if scheduling fails
  });
}

// ─── Test notification ────────────────────────────────────────────────────────
export async function scheduleTestNotification(item: FoodItem): Promise<void> {
  if (Platform.OS === 'web') return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🫙 YumKeeper Alert',
      body: `${item.emoji} ${item.name} is expiring soon! Check your inventory.`,
      data: { itemId: item.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: CHANNEL_EXPIRY_ALERTS,
    },
  });
}
