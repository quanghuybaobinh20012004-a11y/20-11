import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getHabits, saveHabits } from '../../utils/storage';
import { Calendar } from 'react-native-calendars'; 
import { Ionicons } from '@expo/vector-icons';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [habit, setHabit] = useState<any>(null);

  // Tải lại dữ liệu khi quay lại màn hình (để cập nhật sau khi Sửa)
  useFocusEffect(
    useCallback(() => {
      loadHabit();
    }, [id])
  );

  const loadHabit = async () => {
    const allHabits = await getHabits();
    const found = allHabits.find((h: any) => h.id === id);
    if (found) setHabit(found);
  };

  const handleDelete = async () => {
    Alert.alert(
      "Xóa Thói Quen",
      "Bạn có chắc chắn muốn xóa vĩnh viễn?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: async () => {
            const allHabits = await getHabits();
            const newList = allHabits.filter((h: any) => h.id !== id); 
            await saveHabits(newList);
            router.back(); 
          }}
      ]
    );
  };

  // FR-5: Logic Calendar (Xanh = Xong, Xám = Quên)
  const getMarkedDates = () => {
    if (!habit) return {};
    const marked: any = {};
    const start = new Date(habit.startDate);
    const end = new Date();
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateStr)) {
        marked[dateStr] = { selected: true, selectedColor: habit.color || '#007AFF' };
      } else {
        marked[dateStr] = { marked: true, dotColor: 'gray', activeOpacity: 0 };
      }
    }
    return marked;
  };

  if (!habit) return <View style={styles.container}><Text>Đang tải...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {/* Header: Icon + Title + Stats FR-6 */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
           <Ionicons name={habit.icon || 'fitness'} size={60} color={habit.color || "#4B0082"} />
        </View>
        
        <Text style={styles.title}>{habit.title}</Text>
        {habit.description ? <Text style={styles.desc}>"{habit.description}"</Text> : null}
        <Text style={styles.frequency}>Tần suất: {habit.frequency === 'daily' ? 'Hàng Ngày' : 'Hàng Tuần'}</Text>

        {/* FR-6: Hiển thị đầy đủ 3 chỉ số Streak */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{habit.streak?.current || 0}</Text>
            <Text style={styles.statLabel}>Hiện tại</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{habit.streak?.longest || 0}</Text>
            <Text style={styles.statLabel}>Kỷ lục</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{habit.completedDates?.length || 0}</Text>
            <Text style={styles.statLabel}>Tổng ngày</Text>
          </View>
        </View>

        {/* FR-7: Thông tin nhắc nhở */}
        <Text style={{color: 'gray', marginTop: 15, fontSize: 12}}>
           ⏰ Nhắc lúc: {habit.reminderTime} - "{habit.reminderMessage}"
        </Text>
      </View>

      {/* Nút Sửa (FR-2) */}
      <TouchableOpacity 
        style={[styles.editButton, { borderColor: habit.color || '#4B0082' }]} 
        onPress={() => router.push(`/habit/edit?id=${habit.id}`)}
      >
        <Ionicons name="create-outline" size={20} color={habit.color || '#4B0082'} />
        <Text style={[styles.editText, { color: habit.color || '#4B0082' }]}>Chỉnh Sửa</Text>
      </TouchableOpacity>

      {/* Calendar Section (FR-5) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử hoạt động</Text>
        <Calendar
          markedDates={getMarkedDates()}
          theme={{ todayTextColor: 'orange', arrowColor: habit.color || '#4B0082' }}
        />
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.deleteText}>Xóa Thói Quen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  iconContainer: { padding: 10, backgroundColor: 'white', borderRadius: 50, elevation: 5, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 16, color: '#555', fontStyle: 'italic', marginVertical: 5 },
  frequency: { fontSize: 14, color: 'gray', marginBottom: 5 },
  
  // Styles mới cho FR-6
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    marginTop: 15,
    paddingHorizontal: 10
  },
  statItem: { 
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
    minWidth: 80
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#4B0082' },
  statLabel: { fontSize: 12, color: 'gray', marginTop: 2 },

  section: { backgroundColor: 'white', borderRadius: 15, padding: 10, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 10 },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderWidth: 1, borderRadius: 10, marginBottom: 20, backgroundColor: 'white' },
  editText: { fontWeight: 'bold', marginLeft: 5 },
  deleteButton: { backgroundColor: '#FF3B30', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, width: '100%', justifyContent: 'center', marginBottom: 40 },
  deleteText: { color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});