// app/(tabs)/report.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getHabits } from '../../utils/storage';
import { BarChart } from 'react-native-chart-kit'; // FR-10

const screenWidth = Dimensions.get('window').width;

export default function ReportScreen() {
  const [stats, setStats] = useState<any>({
    totalHabits: 0,
    perfectStreak: 0,
    bestHabit: 'Chưa có',
    weeklyData: [0, 0, 0, 0, 0, 0, 0], // Dữ liệu cho biểu đồ
    completionRate: 0,
  });

  useFocusEffect(
    useCallback(() => {
      calculateStats();
    }, [])
  );

  const calculateStats = async () => {
    const habits = await getHabits();
    
    // 1. Tìm thói quen có Streak cao nhất (FR-9)
    let maxStreak = 0;
    let bestName = 'Chưa có';
    habits.forEach((h: any) => {
      if (h.streak.current > maxStreak) {
        maxStreak = h.streak.current;
        bestName = h.title;
      }
    });

    // 2. Tính dữ liệu biểu đồ 7 ngày gần nhất (FR-10)
    // Tạo mảng 7 ngày ngược về quá khứ
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // 6 ngày trước -> Hôm nay
      return d.toISOString().split('T')[0];
    });

    // Đếm số lượng hoàn thành trong mỗi ngày
    const chartData = last7Days.map(date => {
      // Đếm xem ngày 'date' xuất hiện bao nhiêu lần trong tất cả các habits
      let count = 0;
      habits.forEach((h: any) => {
        if (h.completedDates.includes(date)) count++;
      });
      return count;
    });

    // 3. Tính % hoàn thành hôm nay
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter((h: any) => h.completedDates.includes(today)).length;
    const rate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

    setStats({
      totalHabits: habits.length,
      perfectStreak: maxStreak,
      bestHabit: bestName,
      weeklyData: chartData,
      completionRate: rate,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Thống Kê & Báo Cáo</Text>

      {/* FR-9: Tổng quan */}
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#E0F7FA' }]}>
          <Text style={styles.number}>{stats.completionRate}%</Text>
          <Text style={styles.label}>Hoàn thành hôm nay</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.number}>{stats.perfectStreak}</Text>
          <Text style={styles.label}>Chuỗi dài nhất</Text>
        </View>
      </View>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightTitle}>🏆 MVP Thói Quen</Text>
        <Text style={styles.highlightName}>{stats.bestHabit}</Text>
        <Text style={styles.highlightDesc}>Là thói quen bạn giữ kỷ luật tốt nhất!</Text>
      </View>

      {/* FR-10: Biểu đồ cột */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Hiệu suất 7 ngày qua</Text>
        <BarChart
          data={{
            labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], // Nhãn giả lập cho đẹp
            datasets: [{ data: stats.weeklyData }]
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(75, 0, 130, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.7,
          }}
          style={{ borderRadius: 16 }}
          showValuesOnTopOfBars // Hiện số trên cột
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { 
    width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 3 
  },
  number: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  label: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' },
  highlightCard: { 
    backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20, 
    elevation: 3, borderLeftWidth: 5, borderLeftColor: '#FFD700' 
  },
  highlightTitle: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  highlightName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginVertical: 5 },
  highlightDesc: { color: 'gray' },
  chartContainer: { 
    backgroundColor: 'white', padding: 10, borderRadius: 16, elevation: 3, marginBottom: 50, alignItems: 'center'
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }
});