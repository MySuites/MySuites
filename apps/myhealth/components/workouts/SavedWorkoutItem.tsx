import React from 'react';
import { View, Text } from 'react-native';
import { ActionCard } from '../../../../packages/ui/ActionCard';
import { RaisedButton } from '../../../../packages/ui/RaisedButton';
import { SavedWorkout } from '../../types';
import { IconSymbol } from '../ui/icon-symbol';
import { useUITheme } from '../../../../packages/ui/theme';

interface SavedWorkoutItemProps {
    item: SavedWorkout;
    isExpanded: boolean;
    onPress: () => void;
    onEdit: () => void;
    onStart: () => void;
    onDelete: () => void;
}

export const SavedWorkoutItem = ({ 
    item, 
    isExpanded, 
    onPress, 
    onEdit, 
    onStart,
    onDelete 
}: SavedWorkoutItemProps) => {
    const theme = useUITheme();
    return (
        <ActionCard 
            onPress={onPress}
            activeOpacity={0.9}
            className="p-0 mb-0"
            onDelete={onDelete}
            onEdit={onEdit}
        >
            <View className={`flex-row justify-between items-center ${isExpanded ? 'border-b border-light dark:border-dark' : ''}`}>
                <View className="flex-row items-center flex-1 mr-2">
                        <Text className="font-semibold text-light dark:text-dark text-lg mb-0.5" numberOfLines={1}>{item.name}</Text>
                </View>
                
                <View className="flex-row items-center">
                    <RaisedButton 
                        onPress={onStart}
                        borderRadius={20}
                        className="w-10 h-10 p-0 my-0 rounded-full items-center justify-center"
                    >
                        <IconSymbol 
                            name="play.fill" 
                            size={15} 
                            color={theme.primary} 
                        />
                    </RaisedButton>
                </View>
            </View>
            
            {isExpanded && (
                <View className="bg-light/50 dark:bg-dark/50 px-4 py-2 rounded-b-xl">
                    {item.exercises && item.exercises.length > 0 ? (
                        item.exercises.map((ex: any, idx: number) => (
                            <View key={idx} className="py-2 flex-row justify-between border-b border-light dark:border-dark last:border-0">
                                <Text className="text-light dark:text-dark font-medium">{ex.name}</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-sm">{ex.sets} x {ex.reps}</Text>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 dark:text-gray-400 py-2 italic text-center">No exercises</Text>
                    )}
                </View>
            )}
        </ActionCard>
    );
};
