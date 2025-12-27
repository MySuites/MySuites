import React from 'react';
import { View, Text } from 'react-native';
import { ActionCard } from '../../../../packages/ui/ActionCard';
import { RaisedButton } from '../../../../packages/ui/RaisedButton';
import { SavedWorkout } from '../../types';
import { IconSymbol } from '../ui/icon-symbol';
import { useUITheme } from '../../../../packages/ui/theme';

interface SavedWorkoutItemProps {
    item: SavedWorkout;
    onEdit: () => void;
    onStart: () => void;
    onDelete: () => void;
}

export const SavedWorkoutItem = ({ 
    item, 
    onEdit, 
    onStart,
    onDelete 
}: SavedWorkoutItemProps) => {
    const theme = useUITheme();
    return (
        <ActionCard 
            activeOpacity={1}
            className="p-0 mb-0"
            onDelete={onDelete}
            onEdit={onEdit}
        >
            <View className="flex-row justify-between items-center">
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
        </ActionCard>
    );
};
