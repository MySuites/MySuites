import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View, TextInput, Button, FlatList } from 'react-native';
import { useWorkoutManager } from '../../providers/WorkoutManagerProvider';

// Mock dependencies
jest.mock('../../providers/WorkoutManagerProvider', () => ({
    useWorkoutManager: jest.fn(),
}));

// Mock Data
const MOCK_EXERCISES = [
    { id: '1', name: 'Push Ups', muscle: 'Chest' },
    { id: '2', name: 'Pull Ups', muscle: 'Back' },
    { id: '3', name: 'Squats', muscle: 'Legs' },
];

const ExerciseManagementTestComponent = () => {
    const { createCustomExercise } = useWorkoutManager();
    const [searchQuery, setSearchQuery] = useState('');
    const [exercises, setExercises] = useState(MOCK_EXERCISES);

    const filteredExercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateExercise = (name: string) => {
        const newEx = { id: '99', name, muscle: 'Custom' };
        createCustomExercise(name, 'Custom'); // Call the provider method
        setExercises(prev => [...prev, newEx]); // Optimistic update for test UI
    };

    return (
        <View>
            <TextInput 
                testID="search-input"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercises"
            />
            
            <FlatList
                data={filteredExercises}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Text testID={`exercise-${item.id}`}>{item.name}</Text>
                )}
            />

            <Button 
                title="Create 'Burpees'" 
                onPress={() => handleCreateExercise('Burpees')} 
            />
        </View>
    );
};

describe('Exercise Management Flow', () => {
    it('searches for exercises and creates a custom one', async () => {
        // Setup mock return
        const mockCreateCustomExercise = jest.fn();
        (useWorkoutManager as jest.Mock).mockReturnValue({
            createCustomExercise: mockCreateCustomExercise,
        });

        const { getByTestId, queryByText, getByText } = render(<ExerciseManagementTestComponent />);

        // 1. Initial State (All exercises visible)
        expect(getByText('Push Ups')).toBeTruthy();
        expect(getByText('Pull Ups')).toBeTruthy();

        // 2. Search filtering
        fireEvent.changeText(getByTestId('search-input'), 'Pull');
        
        await waitFor(() => {
            expect(getByText('Pull Ups')).toBeTruthy();
            expect(queryByText('Push Ups')).toBeNull();
        });

        // 3. Create Custom Exercise
        fireEvent.press(getByText("Create 'Burpees'"));

        await waitFor(() => {
            expect(mockCreateCustomExercise).toHaveBeenCalledWith('Burpees', 'Custom');
        });

        // 4. Clear search to see the new exercise
        fireEvent.changeText(getByTestId('search-input'), '');

        await waitFor(() => {
            expect(getByText('Burpees')).toBeTruthy();
        });
    });
});
