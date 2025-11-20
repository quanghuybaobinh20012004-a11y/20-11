// app/habit/edit.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveHabits, getHabits } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const ICONS = ['fitness', 'book', 'cafe', 'code-slash', 'bed', 'water', 'bicycle', 'musical-notes'];
const COLORS = ['#4B0082', '#FF3B30', '#FF9500', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'];

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams(); // Lấy ID thói quen cần sửa
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fitness');
  const [selectedColor, setSelectedColor] = useState('#4B0082');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const habits = await getHabits();
    const habit = habits.find((h: any) => h.id === id);
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setSelectedIcon(habit.icon);
      setSelectedColor(habit.color || '#4B0082');
      setFrequency(habit.frequency || 'daily');
      setReminderTime(habit.reminderTime || '');
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Tên không được trống");

    const habits = await getHabits();
    const updatedHabits = habits.map((h: any) => {
      if (h.id === id) {
        // FR-2: Update title, description, icon, frequency [cite: 16]
        return { 
          ...h, 
          title, description, icon: selectedIcon, color: selectedColor, frequency, reminderTime 
        };
      }
      return h;
    });

    await saveHabits(updatedHabits);
    Alert.alert("Thành công", "Đã cập nhật thói quen!");
    router.back();
  };

  if (loading) return <View><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Chỉnh Sửa Thói Quen</Text>

      <Text style={styles.label}>Tên thói quen</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Tần suất</Text>
      <View style={styles.row}>
        {['daily', 'weekly'].map((freq) => (
          <TouchableOpacity key={freq} style={[styles.optionBtn, frequency === freq && styles.selectedOption]} onPress={() => setFrequency(freq as any)}>
            <Text style={[styles.optionText, frequency === freq && {color: 'white'}]}>{freq === 'daily' ? 'Hàng Ngày' : 'Hàng Tuần'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Icon</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        {ICONS.map(icon => (
          <TouchableOpacity key={icon} onPress={() => setSelectedIcon(icon)} style={[styles.iconBtn, selectedIcon === icon && styles.selectedIconBtn]}>
            <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? 'white' : '#333'} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Màu sắc</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        {COLORS.map(color => (
          <TouchableOpacity key={color} onPress={() => setSelectedColor(color)} style={[styles.colorBtn, { backgroundColor: color }, selectedColor === color && styles.selectedColorBtn]} />
        ))}
      </ScrollView>

      <TouchableOpacity style={[styles.saveBtn, {backgroundColor: selectedColor}]} onPress={handleUpdate}>
        <Text style={styles.saveText}>Cập Nhật</Text>
      </TouchableOpacity>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 10 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#E5E5EA', padding: 12, borderRadius: 10, backgroundColor: '#F9F9F9' },
  row: { flexDirection: 'row', marginBottom: 10 },
  optionBtn: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginRight: 10, minWidth: 100, alignItems: 'center' },
  selectedOption: { backgroundColor: '#4B0082', borderColor: '#4B0082' },
  optionText: { fontWeight: '600', color: '#333' },
  scrollRow: { marginBottom: 10, flexDirection: 'row' },
  iconBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  selectedIconBtn: { backgroundColor: '#4B0082' },
  colorBtn: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  selectedColorBtn: { borderWidth: 3, borderColor: '#333' },
  saveBtn: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});