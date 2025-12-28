import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SavedWorkout } from '../../types';

export default function WorkoutDetailsScreen() {
    const params = useLocalSearchParams();
    
    // Parse the workout data from params
    const workout: SavedWorkout | null = useMemo(() => {
        try {
            if (typeof params.workout === 'string') {
                return JSON.parse(params.workout);
            }
            return null;
        } catch {
            return null;
        }
    }, [params.workout]);

    if (!workout) {
        return (
            <View className="flex-1 bg-light dark:bg-dark p-4 justify-center items-center">
                <Text className="text-lg text-light dark:text-dark">Workout not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-light dark:bg-dark">
            <ScreenHeader 
                title={workout.name || "Workout Details"} 
                withBackButton={true} 
            />
            
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {workout.exercises?.map((ex, idx) => (
                    <View key={idx} className="mb-4 bg-light-lighter dark:bg-border-dark p-3 rounded-xl">
                        <Text className="text-lg font-semibold text-light dark:text-dark">
                            {ex.name}
                        </Text>
                        <Text className="text-gray-500">
                            {ex.sets} Sets
                        </Text>
                        {ex.setTargets && ex.setTargets.length > 0 ? (
                            <View className="mt-2 pl-2 border-l-2 border-primary dark:border-primary-dark">
                                {ex.setTargets.map((set, sIdx) => (
                                    <Text key={sIdx} className="text-light dark:text-dark">
                                        Set {sIdx + 1}: {set.weight ? `${set.weight}lbs x ` : ""}{set.reps || 0} reps
                                    </Text>
                                ))}
                            </View>
                        ) : (
                             <Text className="text-gray-500 mt-1">Target: {ex.reps} reps</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
