import React from 'react';
import { FlatList, TouchableOpacity, View, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useUITheme } from '@mysuite/ui';
import { useWorkoutManager } from '../../hooks/workouts/useWorkoutManager';
import { useActiveWorkout } from '../../providers/ActiveWorkoutProvider';
import { useFloatingButton } from '../../providers/FloatingButtonContext';

export default function RoutinesScreen() {
  const router = useRouter();
  const theme = useUITheme();
  
  const { routines, deleteRoutine, startActiveRoutine } = useWorkoutManager();
  const { hasActiveSession, setExercises } = useActiveWorkout();

    // Hide floating buttons
    const { setIsHidden } = useFloatingButton();
    React.useEffect(() => {
        setIsHidden(true);
        return () => setIsHidden(false);
    }, [setIsHidden]);

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
    <View className="flex-1 bg-light dark:bg-dark">
      <View className="flex-row items-center justify-between p-4 border-b border-bg-dark dark:border-white/10">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
           <Text className="text-base leading-[30px] text-[#0a7ea4]">Close</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold">My Routines</Text>
        <View className="w-[50px]" /> 
      </View>
      
      {routines.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
              <Text style={{color: theme.icon}} className="text-base leading-6">No saved routines found.</Text>
          </View>
      ) : (
          <FlatList
            data={routines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between p-4 border-b border-bg-dark dark:border-white/10">
                <View className="flex-1">
                    <Text className="text-base leading-6 font-semibold">{item.name}</Text>
                    <Text style={{color: theme.icon ?? '#888', fontSize: 12}}>
                        {new Date(item.createdAt).toLocaleDateString()} • {item.sequence?.length || 0} Days
                    </Text> 
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity 
                        onPress={() => handleSetRoutine(item.id, item.name, item.sequence)} 
                        className="py-1.5 px-3 rounded-md bg-primary dark:bg-primary-dark"
                    >
                        <Text className="text-white text-sm font-semibold">Set Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleDelete(item.id, item.name)} 
                        className="py-1.5 px-3 rounded-md border border-bg-dark dark:border-white/10"
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
