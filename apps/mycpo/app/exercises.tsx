import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, ActivityIndicator } from 'react-native'; // ID: 2225d6a8-644c-49dc-874e-ef431dd7ddcf, 19dc8f02-b90c-4e07-9dad-1191f01d8f5a
import { useRouter } from 'expo-router';
import { useActiveWorkout } from '../providers/ActiveWorkoutProvider';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { useUITheme } from '@mycsuite/ui';
import { useAuth } from '@mycsuite/auth';
import { fetchExercises } from '../hooks/useWorkoutManager';
import { IconSymbol } from '../components/ui/icon-symbol';

export default function ExercisesScreen() {
  const router = useRouter();
  const theme = useUITheme();
  const { addExercise } = useActiveWorkout();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
        if (!user) {
            setLoading(false);
            return;
        }
        const { data } = await fetchExercises(user);
        setExercises(data || []);
        setLoading(false);
    }
    load();
  }, [user]);


  const styles = makeStyles(theme);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
           <ThemedText type="link">Close</ThemedText>
        </TouchableOpacity>
        <ThemedText type="subtitle">Exercises</ThemedText>
        <View style={{width: 50}} /> 
      </ThemedView>
      
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            onPress={() => {
                addExercise(item.name, "3", "10"); // Default sets/reps for now
                router.back();
            }}
          >
            <View>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText style={{color: theme.icon ?? '#888', fontSize: 12}}>{item.category}</ThemedText> 
            </View>
            <IconSymbol name="plus.circle" size={20} color={theme.primary} />
          </TouchableOpacity>
        )}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
            <View style={{padding: 20, alignItems: 'center'}}>
                <ThemedText style={{color: theme.icon}}>No exercises found.</ThemedText>
            </View>
        }
      />
      )}
    </ThemedView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  closeButton: {
      padding: 8,
  },
  list: {
      flex: 1,
  },
  item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.surface,
  }
});
