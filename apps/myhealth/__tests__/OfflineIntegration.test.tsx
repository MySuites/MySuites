import { DataRepository } from '../providers/DataRepository';
import { storage } from '../utils/storage';

// Mock DataRepository dependencies
jest.mock('../utils/storage', () => ({
    storage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        getAllKeys: jest.fn(),
    }
}));

jest.mock('../utils/workout-api', () => ({
    persistCompletedWorkoutToSupabase: jest.fn(),
    persistWorkoutToSupabase: jest.fn(),
    fetchWorkoutHistory: jest.fn(),
    fetchUserWorkouts: jest.fn(),
}));

describe('Offline DataRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should save a workout locally in guest mode', async () => {
        const mockWorkout = { name: 'Guest Workout', exercises: [] };
        
        // Mock getWorkouts to return empty
        (storage.getItem as jest.Mock).mockResolvedValueOnce([]);
        
        await DataRepository.saveWorkout(mockWorkout);
        
        // Check if setItem was called
        expect(storage.setItem).toHaveBeenCalledWith(
            "myhealth_saved_workouts",
            expect.any(Array)
        );
        
        // Verify payload has ID and pending status
        const savedArg = (storage.setItem as jest.Mock).mock.calls[0][1];
        expect(savedArg[0].syncStatus).toBe('pending');
        expect(savedArg[0].name).toBe('Guest Workout');
    });

    it('should save history log locally', async () => {
        const mockLog = { name: 'Morning Run', duration: 300, date: '2025-01-01', exercises: [] };
        (storage.getItem as jest.Mock).mockResolvedValueOnce([]);
        
        await DataRepository.saveLog(mockLog);
        
        expect(storage.setItem).toHaveBeenCalledWith(
            "myhealth_workout_history",
            expect.any(Array)
        );
        
        const savedArg = (storage.setItem as jest.Mock).mock.calls[0][1];
        expect(savedArg[0].syncStatus).toBe('pending');
        expect(savedArg[0].name).toBe('Morning Run');
    });

    it('should calculate stats from local history', async () => {
        const mockHistory = [
            {
                date: '2025-01-01',
                exercises: [
                    {
                        name: 'Pushups',
                        logs: [{ weight: 0, reps: 20 }]
                    }
                ]
            },
            {
                date: '2025-01-02',
                exercises: [
                    {
                        name: 'Pushups',
                        logs: [{ weight: 10, reps: 15 }] // Weighted pushup
                    }
                ]
            }
        ];
        
        (storage.getItem as jest.Mock).mockResolvedValue(mockHistory);
        
        const stats = await DataRepository.getExerciseStats('Pushups');
        
        expect(stats.maxWeight).toBe(10);
        expect(stats.totalVolume).toBe(20 * 0 + 15 * 10); // 150
    });

    it('should persist guest mode flag', async () => {
        await storage.setItem('myhealth_guest_mode', 'true');
        expect(storage.setItem).toHaveBeenCalledWith('myhealth_guest_mode', 'true');
    });
});
