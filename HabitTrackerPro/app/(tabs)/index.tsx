// app/(tabs)/index.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { getHabits, saveHabits } from '../../utils/storage';
// Import các hàm xử lý thông báo
import { cancelSmartReminder, scheduleSmartReminder } from '../../utils/notifications';

export default function HomeScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getHabits();
    setHabits(data);
  };

  const toggleComplete = async (id: string) => {
    // 1. Cập nhật trạng thái thói quen (Logic cũ)
    const updatedHabits = habits.map(habit => {
      if (habit.id === id) {
        const isCompletedToday = habit.completedDates.includes(today);
        let newCompletedDates;
        
        if (isCompletedToday) {
          newCompletedDates = habit.completedDates.filter((d: string) => d !== today);
        } else {
          newCompletedDates = [...habit.completedDates, today];
        }
        
        return { 
          ...habit, 
          completedDates: newCompletedDates,
          streak: { ...habit.streak, current: newCompletedDates.length } 
        };
      }
      return habit;
    });

    // Lưu dữ liệu mới vào máy
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);

    // 2. --- THÊM LOGIC MỚI Ở ĐÂY (SMART REMINDER FR-8) ---
    // Kiểm tra xem CÒN thói quen nào chưa làm trong ngày hôm nay không?
    // Logic: Tìm xem có thói quen nào mà completedDates KHÔNG chứa 'today'
    const hasUnfinishedHabits = updatedHabits.some(habit => 
      !habit.completedDates.includes(today)
    );

    if (!hasUnfinishedHabits) {
      // Nếu không còn việc gì (đã xong hết) -> Hủy nhắc nhở tối nay
      await cancelSmartReminder();
    } else {
      // Nếu vẫn còn việc (hoặc vừa bỏ tick 1 việc) -> Đặt lại nhắc nhở
      await scheduleSmartReminder();
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isCompleted = item.completedDates.includes(today);
    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.info} 
          onPress={() => router.push({
            pathname: '/habit/[id]',
            params: { id: item.id }
          })}
        >
          <Ionicons name={item.icon || 'star'} size={24} color="#4B0082" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.streak}>🔥 Streak: {item.streak?.current || 0}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleComplete(item.id)}>
          <Ionicons 
            name={isCompleted ? "checkbox" : "square-outline"} 
            size={32} 
            color={isCompleted ? "green" : "gray"} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Habit Tracker Pro</Text>
      
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có thói quen nào. Thêm mới nhé!</Text>}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add')} 
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 50, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#1C1C1E' },
  card: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  info: { flexDirection: 'row', alignItems: 'center', flex: 1 }, 
  title: { fontSize: 18, fontWeight: '600', color: '#000' },
  streak: { fontSize: 12, color: '#FF9500', marginTop: 4 },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 50, fontSize: 16 },
  fab: { 
    position: 'absolute', bottom: 30, right: 20, 
    backgroundColor: '#007AFF', width: 60, height: 60, 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5
  }
});