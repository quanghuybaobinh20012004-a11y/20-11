// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#4B0082',
      tabBarStyle: { paddingBottom: 5, height: 60 },
      tabBarLabelStyle: { fontSize: 12 }
    }}>
      {/* Tab 1: Trang chủ */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Thói Quen', 
          tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
          headerShown: false 
        }} 
      />

      {/* Tab 2: Báo cáo (Mới thêm) */}
      <Tabs.Screen 
        name="report" 
        options={{ 
          title: 'Thống Kê', 
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={28} color={color} />,
          headerShown: false 
        }} 
      />
    </Tabs>
  );
}