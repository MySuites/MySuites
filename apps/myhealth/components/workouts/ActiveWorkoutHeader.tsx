import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { RaisedButton } from '@mysuite/ui';
import Animated from 'react-native-reanimated';
import { useActiveWorkout } from '../../providers/ActiveWorkoutProvider';
import { formatSeconds } from '../../utils/formatting';
import { IconSymbol } from '../ui/icon-symbol';
import { useRouter } from 'expo-router';

export function ActiveWorkoutHeader() {
    const router = useRouter();

    const { isRunning, workoutSeconds, workoutName, isExpanded, toggleExpanded, hasActiveSession, pauseWorkout, exercises } = useActiveWorkout();
    

    const hasActiveWorkout = hasActiveSession;
    
    
    if (!hasActiveWorkout) {
        return null;
    }


    const title = workoutName || "Current Workout";
    const rightIcon = isExpanded ? "chevron.down" : "chevron.up";
    
    const handlePress = () => {
         toggleExpanded();
    };

    const handleEnd = (e: any) => {
        // Stop propagation to prevent toggling expansion
        e?.stopPropagation();
        
        const completedSetsCount = exercises.reduce((acc, ex) => acc + (ex.completedSets || 0), 0);

        if (completedSetsCount === 0) {
            Alert.alert(
                "No Sets Completed",
                "Please complete at least one set or discard this workout session below.",
                [{ text: "OK" }]
            );
            return;
        }

        // Pause and navigate to end screen
        pauseWorkout();
        router.push('/workouts/end');
    };

    return (
        <Animated.View 
            style={{ 
                zIndex: 1001,
                top: 0,
            }}
            className="absolute top-0 left-0 right-0 py-4 pt-16 rounded-b-3xl bg-light/70 dark:bg-dark/70"
        >
            {/* Background Tappable Area for Toggle */}
            <TouchableOpacity 
                className="absolute inset-0 z-0"
                onPress={handlePress} 
                activeOpacity={1}
            />

            {/* Content with pointerEvents check */}
            <View 
                className="flex-row justify-center items-center relative min-h-[44px] z-10"
                pointerEvents="box-none"
            >
                 {/* Left: Timer + Status */}
                 <View className="absolute left-5 z-10 flex-row items-center gap-2" pointerEvents="none">
                     <View className={`w-2 h-2 rounded-full ${isRunning ? 'bg-primary dark:bg-primary-dark' : 'bg-gray-400'}`} />
                     <Text className="text-sm font-semibold tabular-nums text-light dark:text-dark">{formatSeconds(workoutSeconds)}</Text>
                 </View>
                 
                 {/* Center: Title */}
                 <Text className="text-2xl font-bold text-light dark:text-dark text-center flex-1 mx-20" numberOfLines={1}>{title}</Text>
                 
                 {/* Right: End Button + Chevron */}
                 <View className="absolute right-5 z-10 flex-row items-center gap-3">
                     <RaisedButton 
                        onPress={handleEnd}
                        className="h-8 px-3 py-0 bg-light dark:bg-dark-lighter"
                        variant="custom"
                        borderRadius={16}
                        showGradient={false}
                     >
                         <Text className="text-danger text-xs font-bold">End</Text>
                     </RaisedButton>
                     <IconSymbol 
                        name={rightIcon} 
                        size={16} 
                        className="text-light dark:text-dark"
                     />
                 </View>
            </View>
        </Animated.View>
    );
}
