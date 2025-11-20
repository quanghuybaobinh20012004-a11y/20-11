// app/add.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { saveHabits, getHabits } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

// Danh sách Icon và Màu để chọn (FR-1)
const ICONS = ['fitness', 'book', 'cafe', 'code-slash', 'bed', 'water', 'bicycle', 'musical-notes'];
const COLORS = ['#4B0082', '#FF3B30', '#FF9500', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'];

export default function AddHabitScreen() {
  const router = useRouter();
  
  // Các trường dữ liệu theo FR-1
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Mô tả
  const [selectedIcon, setSelectedIcon] = useState('fitness'); // Icon
  const [selectedColor, setSelectedColor] = useState('#4B0082'); // Màu sắc
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily'); // Tần suất
  
  const [reminderTime, setReminderTime] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên thói quen!");
      return;
    }

    const newHabit = {
      id: Date.now().toString(),
      title,
      description, 
      icon: selectedIcon,
      color: selectedColor,
      frequency,
      reminderTime: reminderTime || '07:00',
      reminderMessage: reminderMessage || 'Cố lên!',
      startDate: new Date().toISOString(),
      completedDates: [],
      streak: { current: 0, longest: 0 }
    };

    const existingHabits = await getHabits();
    await saveHabits([...existingHabits, newHabit]);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tạo Thói Quen Mới</Text>

      <Text style={styles.label}>Tên thói quen (*)</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="VD: Đọc sách" />

      {/* FR-1: Description */}
      <Text style={styles.label}>Mô tả (Tùy chọn)</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="VD: Đọc 10 trang mỗi tối" />

      {/* FR-1: Frequency */}
      <Text style={styles.label}>Tần suất</Text>
      <View style={styles.row}>
        {['daily', 'weekly'].map((freq) => (
          <TouchableOpacity 
            key={freq} 
            style={[styles.optionBtn, frequency === freq && styles.selectedOption]}
            onPress={() => setFrequency(freq as any)}
          >
            <Text style={[styles.optionText, frequency === freq && {color: 'white'}]}>
              {freq === 'daily' ? 'Hàng Ngày' : 'Hàng Tuần'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FR-1: Icon Selection */}
      <Text style={styles.label}>Chọn Biểu tượng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        {ICONS.map(icon => (
          <TouchableOpacity key={icon} onPress={() => setSelectedIcon(icon)} style={[styles.iconBtn, selectedIcon === icon && styles.selectedIconBtn]}>
            <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? 'white' : '#333'} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FR-1: Color Selection */}
      <Text style={styles.label}>Chọn Màu chủ đề</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        {COLORS.map(color => (
          <TouchableOpacity 
            key={color} 
            onPress={() => setSelectedColor(color)} 
            style={[styles.colorBtn, { backgroundColor: color }, selectedColor === color && styles.selectedColorBtn]} 
          />
        ))}
      </ScrollView>

      <Text style={styles.label}>Giờ nhắc (HH:MM)</Text>
      <TextInput style={styles.input} value={reminderTime} onChangeText={setReminderTime} placeholder="07:00" />

      <TouchableOpacity style={[styles.saveBtn, {backgroundColor: selectedColor}]} onPress={handleSave}>
        <Text style={styles.saveText}>Lưu Thói Quen</Text>
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