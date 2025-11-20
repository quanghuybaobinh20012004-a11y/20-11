import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// --- CẤU HÌNH ---
if (Platform.OS !== 'android') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as any),
  });
}

const SMART_REMINDER_ID = 'smart-reminder-8pm';

export async function registerForPushNotificationsAsync() {
  // Android Expo Go: Trả về false để không sập, nhưng vẫn cho logic chạy tiếp
  if (Platform.OS === 'android') {
    console.log("🛡️ [Android Safe Mode] Dùng Alert thay thế Notification.");
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    return false;
  }
}

export async function scheduleSmartReminder() {
  // 1. NẾU LÀ ANDROID EXPO GO -> HIỆN ALERT TRÊN MÀN HÌNH ĐIỆN THOẠI
  if (Platform.OS === 'android') {
    Alert.alert(
      "⏰ Đã Lên Lịch Nhắc Nhở (Mô phỏng)",
      "Hệ thống sẽ nhắc bạn vào lúc 20:00 tối nay nếu chưa hoàn thành nhiệm vụ.",
      [{ text: "OK, Đã hiểu" }]
    );
    return;
  }

  // 2. Logic thật cho iOS/Build
  try {
    await Notifications.cancelScheduledNotificationAsync(SMART_REMINDER_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: SMART_REMINDER_ID,
      content: {
        title: "Đừng quên thói quen! 🌙",
        body: "Bạn vẫn còn thói quen chưa hoàn thành.",
        sound: true,
      },
      trigger: { hour: 20, minute: 0, repeats: true },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function cancelSmartReminder() {
  // 1. NẾU LÀ ANDROID EXPO GO -> HIỆN ALERT
  if (Platform.OS === 'android') {
    Alert.alert(
      "✅ Tuyệt vời!",
      "Bạn đã hoàn thành hết thói quen. Đã HỦY nhắc nhở tối nay.",
      [{ text: "OK" }]
    );
    return;
  }

  // 2. Logic thật
  try {
    await Notifications.cancelScheduledNotificationAsync(SMART_REMINDER_ID);
  } catch (error) {
    console.log(error);
  }
}