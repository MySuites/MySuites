import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { useUITheme } from '@mycsuite/ui';
import { useWorkoutManager } from '../hooks/useWorkoutManager';
import { useActiveWorkout } from '../providers/ActiveWorkoutProvider';

export default function RoutinesScreen() {
  const router = useRouter();
  const theme = useUITheme();
  
  const { routines, deleteRoutine, startActiveRoutine } = useWorkoutManager();
  const { hasActiveSession, setExercises } = useActiveWorkout();

  const styles = makeStyles(theme);

  const handleSetRoutine = (id: string, name: string, sequence: any[]) => {
      if (hasActiveSession) {
          Alert.alert("Active Session", "Please finish or cancel your current workout before setting a new routine.");
          return;
      }
      
      startActiveRoutine(id);
      
      // Load day 1 if available
      if (sequence && sequence.length > 0) {
          const first = sequence[0];
          if (first.type === 'workout' && first.workout) {
              setExercises(first.workout.exercises || []);
          }
      }
      
      Alert.alert('Routine Started', `Routine '${name}' allows you to track your progress.`);
      router.back();
  };

  const handleDelete = (id: string, name: string) => {
      Alert.alert(
          "Delete Routine",
          `Are you sure you want to delete '${name}'?`,
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Delete", 
                  style: "destructive", 
                  onPress: () => deleteRoutine(id) 
              }
          ]
      );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
           <ThemedText type="link">Close</ThemedText>
        </TouchableOpacity>
        <ThemedText type="subtitle">My Routines</ThemedText>
        <View style={{width: 50}} /> 
      </ThemedView>
      
      {routines.length === 0 ? (
          <View style={styles.emptyState}>
              <ThemedText style={{color: theme.icon}}>No saved routines found.</ThemedText>
          </View>
      ) : (
          <FlatList
            data={routines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={{flex: 1}}>
                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                    <ThemedText style={{color: theme.icon ?? '#888', fontSize: 12}}>
                        {new Date(item.createdAt).toLocaleDateString()} • {item.sequence?.length || 0} Days
                    </ThemedText> 
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity 
                        onPress={() => handleSetRoutine(item.id, item.name, item.sequence)} 
                        style={[styles.button, {backgroundColor: theme.primary}]}
                    >
                        <ThemedText style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>Start</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleDelete(item.id, item.name)} 
                        style={[styles.button, {borderColor: theme.surface, borderWidth: 1}]}
                    >
                        <ThemedText style={{fontSize: 14}}>Delete</ThemedText>
                    </TouchableOpacity>
                </View>
              </View>
            )}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 120 }}
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
  emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
  },
  item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.surface,
  },
  actions: {
      flexDirection: 'row',
      gap: 8,
  },
  button: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
  }
});
