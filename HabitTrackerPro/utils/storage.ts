import AsyncStorage from '@react-native-async-storage/async-storage';

const HABIT_KEY = '@habits_data';

export const getHabits = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HABIT_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Lỗi đọc dữ liệu", e);
    return [];
  }
};

export const saveHabits = async (habits: any) => {
  try {
    const jsonValue = JSON.stringify(habits);
    await AsyncStorage.setItem(HABIT_KEY, jsonValue);
  } catch (e) {
    console.error("Lỗi lưu dữ liệu", e);
  }
};