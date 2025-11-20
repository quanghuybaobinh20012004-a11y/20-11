import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react'; 

import { useColorScheme } from '@/hooks/use-color-scheme';

import { registerForPushNotificationsAsync, scheduleSmartReminder } from '../utils/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await registerForPushNotificationsAsync();
      
      if (hasPermission) {
        await scheduleSmartReminder(); 
      }
    };

    setupNotifications();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        <Stack.Screen name="add" options={{ title: 'Thêm Mới', presentation: 'modal' }} />

        <Stack.Screen name="habit/[id]" options={{ title: 'Chi Tiết Thói Quen' }} />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}