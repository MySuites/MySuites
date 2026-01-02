import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
    getItem: async <T>(key: string): Promise<T | null> => {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error("Error reading value", e);
            return null;
        }
    },

    setItem: async (key: string, value: any): Promise<void> => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            console.error("Error saving value", e);
        }
    },

    removeItem: async (key: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error("Error removing value", e);
        }
    },

    clear: async (): Promise<void> => {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            console.error("Error clearing storage", e);
        }
    },

    getAllKeys: async (): Promise<readonly string[]> => {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (e) {
            console.error("Error getting all keys", e);
            return [];
        }
    },
};
