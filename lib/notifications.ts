import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FoodItem, getDaysRemaining } from './food-data';

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

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('freshkeep-expiry', {
      name: 'Expiry Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D8A4E',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

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
          },
        }).catch(() => {
          // Silently fail if scheduling fails
        });
      }
    }
  }
}

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
    },
  });
}
