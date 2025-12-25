import React from 'react';
import { FlatList, TouchableOpacity, View, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useUITheme } from '@mysuite/ui';
import { useWorkoutManager } from '../../hooks/workouts/useWorkoutManager';
import { useActiveWorkout } from '../../providers/ActiveWorkoutProvider';
import { useFloatingButton } from '../../providers/FloatingButtonContext';

export default function SavedWorkoutsScreen() {
  const router = useRouter();
  const theme = useUITheme();
  
  const { savedWorkouts, deleteSavedWorkout } = useWorkoutManager();
  const { hasActiveSession, setExercises } = useActiveWorkout();
  
  // Hide floating buttons
  const { setIsHidden } = useFloatingButton();
  React.useEffect(() => {
      setIsHidden(true);
      return () => setIsHidden(false);
  }, [setIsHidden]);

  const handleLoad = (id: string, name: string, workoutExercises: any[]) => {
      if (hasActiveSession) {
          Alert.alert("Active Session", "Please finish or cancel your current workout before loading a new one.");
          return;
      }
      setExercises(workoutExercises || []);
      Alert.alert('Loaded', `Workout '${name}' loaded.`);
      router.back();
  };

  const handleDelete = (id: string, name: string) => {
      Alert.alert(
          "Delete Workout",
          `Are you sure you want to delete '${name}'?`,
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Delete", 
                  style: "destructive", 
                  onPress: () => deleteSavedWorkout(id) 
              }
          ]
      );
  };

  return (
    <View className="flex-1 bg-light dark:bg-dark">
      <View className="flex-row items-center justify-between p-4 border-b border-light dark:border-white/10">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
           <Text className="text-base leading-[30px] text-[#0a7ea4]">Close</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold">Saved Workouts</Text>
        <TouchableOpacity onPress={() => router.push('/workouts/create')} className="p-2">
           <Text className="text-base leading-[30px] text-[#0a7ea4]">Create</Text>
        </TouchableOpacity>
      </View>
      
      {savedWorkouts.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
              <Text style={{color: theme.icon}} className="text-base leading-6">No saved workouts found.</Text>
          </View>
      ) : (
          <FlatList
            data={savedWorkouts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between p-4 border-b border-light dark:border-white/10">
                <View className="flex-1">
                    <Text className="text-base leading-6 font-semibold">{item.name}</Text>
                    <Text style={{color: theme.icon ?? '#888', fontSize: 12}}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text> 
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity 
                        onPress={() => handleLoad(item.id, item.name, item.exercises)} 
                        className="py-1.5 px-3 rounded-md bg-primary dark:bg-primary-dark"
                    >
                        <Text className="text-white text-sm font-semibold">Load</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleDelete(item.id, item.name)} 
                        className="py-1.5 px-3 rounded-md border border-light dark:border-white/10"
                    >
                        <Text className="text-sm">Delete</Text>
                    </TouchableOpacity>
                </View>
              </View>
            )}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
          />
      )}
    </View>
  );
}
