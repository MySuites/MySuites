import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useUITheme } from '@mysuite/ui';
import { IconSymbol } from '../ui/icon-symbol';


interface AddDayModalProps {
    visible: boolean;
    onClose: () => void;
    onAddRestDay: () => void;
    onAddWorkout: (workout: any) => void;
    savedWorkouts: any[];
}

export const AddDayModal = ({
    visible,
    onClose,
    onAddRestDay,
    onAddWorkout,
    savedWorkouts
}: AddDayModalProps) => {
    const theme = useUITheme();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-light dark:bg-dark">
                <View className="flex-row items-center justify-between p-4 border-b border-light dark:border-white/10 pt-4 android:pt-10">
                    <TouchableOpacity onPress={onClose} className="p-2">
                            <Text className="text-base leading-[30px] text-[#0a7ea4]">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-bold">Add Day</Text>
                    <View style={{ width: 50 }} />
                </View>
                
                <ScrollView className="flex-1 p-4">
                    <Text className="text-base leading-6 font-semibold mb-3">Options</Text>
                    <TouchableOpacity 
                        onPress={onAddRestDay} 
                        className="bg-light-lighter dark:bg-border-dark p-4 rounded-xl border border-black/5 dark:border-white/10 mb-6 flex-row items-center"
                    >
                        <IconSymbol name="moon.zzz.fill" size={24} color={theme.primary} />
                        <Text className="ml-3 font-semibold text-lg">Rest Day</Text>
                    </TouchableOpacity>

                    <Text className="text-base leading-6 font-semibold mb-3">Saved Workouts</Text>
                    {savedWorkouts.length === 0 ? (
                            <Text className="text-gray-500 dark:text-gray-400 italic">No saved workouts found.</Text>
                    ) : (
                        savedWorkouts.map((workout) => (
                            <TouchableOpacity 
                                key={workout.id}
                                onPress={() => onAddWorkout(workout)}
                                className="bg-light-lighter dark:bg-border-dark p-4 rounded-xl border border-black/5 dark:border-white/10 mb-3 flex-row items-center justify-between"
                            >
                                <View>
                                    <Text className="font-semibold text-lg">{workout.name}</Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-sm">{workout.exercises?.length || 0} Exercises</Text>
                                </View>
                                <IconSymbol name="plus.circle" size={24} color={theme.primary} />
                            </TouchableOpacity>
                        ))
                    )}
                    <View className="h-20" /> 
                </ScrollView>
            </View>
        </Modal>
    );
};
