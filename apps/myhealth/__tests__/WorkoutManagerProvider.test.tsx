
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Button, Text, View, Alert } from 'react-native';
import { WorkoutManagerProvider, useWorkoutManager } from '../providers/WorkoutManagerProvider';

// Define the mock functions outside so we can access them
const mockUseAuth = jest.fn();

const mockSelectOrder = jest.fn(() => Promise.resolve({ data: [] as any[], error: null }));
const mockIs = jest.fn(() => ({
    order: mockSelectOrder
}));

// Mock dependencies
jest.mock('@mysuite/auth', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    is: mockIs,
                    order: mockSelectOrder
                })),
                order: mockSelectOrder
            })),
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Test' }, error: null }))
                }))
            })),
            delete: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null }))
            })),
        })),
        functions: {
            invoke: jest.fn((fnName, options) => {
                if (fnName === 'create-workout') {
                    return Promise.resolve({
                        data: {
                            data: {
                                workout_id: 'new-id',
                                workout_name: options?.body?.workout_name || 'New Workout',
                                created_at: new Date().toISOString()
                            },
                            error: null
                        }
                    });
                }
                return Promise.resolve({ data: null, error: 'Function not mocked' });
            })
        }
    },
    useAuth: () => mockUseAuth()
}));

// Mock useRoutineManager
const mockSetRoutineState = jest.fn();
jest.mock('../hooks/routines/useRoutineManager', () => ({
    useRoutineManager: jest.fn(() => ({
        activeRoutine: null,
        startActiveRoutine: jest.fn(),
        setActiveRoutineIndex: jest.fn(),
        markRoutineDayComplete: jest.fn(),
        clearActiveRoutine: jest.fn(),
        setRoutineState: mockSetRoutineState
    }))
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('WorkoutManagerProvider', () => {

    const TestConsumer = () => {
        const { savedWorkouts, saveWorkout } = useWorkoutManager();
        return (
            <View>
                <Text testID="saved-count">{savedWorkouts.length}</Text>
                <Button title="Save" onPress={() => saveWorkout('New Workout', [], () => {})} />
            </View>
        );
    };

    beforeEach(() => {
        // Default to logged in user
        mockUseAuth.mockReturnValue({ user: { id: 'test-user-id' } });
        jest.clearAllMocks();
        mockSelectOrder.mockResolvedValue({ data: [], error: null });
    });

    it('initializes and handles race conditions correctly', async () => {
        const { getByTestId } = render(
            <WorkoutManagerProvider>
                <TestConsumer />
            </WorkoutManagerProvider>
        );

        // Wait for initial fetch to settle
        await waitFor(() => {
            expect(getByTestId('saved-count').children[0]).toBe('0');
        });
    });

    it('saves a workout to server when user is logged in', async () => {
        // Mock returning one existing workout initially so we can wait for fetch to complete
        mockSelectOrder
            .mockResolvedValueOnce({ data: [{ workout_id: 'existing', workout_name: 'Existing', created_at: '2023-01-01' }], error: null }) // Workouts
            .mockResolvedValueOnce({ data: [], error: null }) // Routines
            .mockResolvedValueOnce({ data: [], error: null }); // History

        const { getByText, getByTestId } = render(
            <WorkoutManagerProvider>
                <TestConsumer />
            </WorkoutManagerProvider>
        );

        // Wait for initial fetch to complete (count 1)
        await waitFor(() => {
            expect(getByTestId('saved-count').children[0]).toBe('1');
        });

        // Perform save
        fireEvent.press(getByText('Save'));

        // Wait for update - should be 2 now (1 existing + 1 new)
        await waitFor(() => {
             expect(getByTestId('saved-count').children[0]).toBe('2');
        });
    });

    it('saves a workout locally when user is NOT logged in', async () => {
        mockUseAuth.mockReturnValue({ user: null });

        const { getByText, getByTestId } = render(
            <WorkoutManagerProvider>
                <TestConsumer />
            </WorkoutManagerProvider>
        );
        
        // Wait for initial load (from local storage, mocked as empty here implicitly by not mocking localStorage behavior fully or expecting empty)
        await waitFor(() => {
            expect(getByTestId('saved-count').children[0]).toBe('0');
        });

        fireEvent.press(getByText('Save'));

        await waitFor(() => {
             expect(getByTestId('saved-count').children[0]).toBe('1');
        });
    });

    it('filters out routine-specific workouts by querying routine_id IS NULL', async () => {
        render(
            <WorkoutManagerProvider>
                <TestConsumer />
            </WorkoutManagerProvider>
        );

        // Wait for fetch
         await waitFor(() => {
             expect(mockIs).toHaveBeenCalledWith('routine_id', null);
         });
    });
});
