import { storage } from "../utils/storage";
import type { LocalWorkoutLog, Syncable, Exercise } from "../utils/workout-api/types";
import uuid from 'react-native-uuid';
import ExerciseDefaultData from '../assets/data/default-exercises.json';

const KEYS = {
    WORKOUTS: "myhealth_saved_workouts",
    ROUTINES: "myhealth_workout_routines",
    HISTORY: "myhealth_workout_history",
};

export const DataRepository = {
    
    // --- Workouts ---
    getWorkouts: async (): Promise<any[]> => {
        const raw = await storage.getItem<any[]>(KEYS.WORKOUTS);
        if (!raw) return [];
        return raw.filter((w: any) => !w.deletedAt);
    },

    saveWorkouts: async (workouts: any[]): Promise<void> => {
        await storage.setItem(KEYS.WORKOUTS, workouts);
    },

    saveWorkout: async (workout: any): Promise<void> => {
        const workouts = await DataRepository.getWorkouts();
        // If exists update, else add
        const index = workouts.findIndex((w: any) => w.id === workout.id);
        
        const now = Date.now();
        const toSave = {
            ...workout,
            updatedAt: now,
            syncStatus: 'pending' as const
        };

        let newWorkouts;
        if (index >= 0) {
            newWorkouts = [...workouts];
            newWorkouts[index] = toSave;
        } else {
             // If new, ensure ID
             if (!toSave.id) toSave.id = uuid.v4();
             newWorkouts = [toSave, ...workouts];
        }
        await DataRepository.saveWorkouts(newWorkouts);
    },

    deleteWorkout: async (id: string): Promise<void> => {
        const workouts = await storage.getItem<any[]>(KEYS.WORKOUTS) || [];
        const index = workouts.findIndex((w: any) => w.id === id);
        if (index >= 0) {
            workouts[index].deletedAt = Date.now();
            workouts[index].syncStatus = 'pending'; // Need to sync deletion
            await DataRepository.saveWorkouts(workouts);
        }
    },


    // --- History ---
    getHistory: async (): Promise<LocalWorkoutLog[]> => {
        const raw = await storage.getItem<LocalWorkoutLog[]>(KEYS.HISTORY);
        return raw || [];
    },

    saveHistory: async (logs: LocalWorkoutLog[]): Promise<void> => {
        await storage.setItem(KEYS.HISTORY, logs);
    },

    saveLog: async (log: Omit<LocalWorkoutLog, 'updatedAt' | 'syncStatus' | 'id'> & { id?: string }): Promise<LocalWorkoutLog> => {
        const history = await DataRepository.getHistory();
        const now = Date.now();
        const fullLog: LocalWorkoutLog = {
            ...log,
            id: log.id || (uuid.v4() as string),
            updatedAt: now,
            syncStatus: 'pending',
        };
        const newHistory = [fullLog, ...history];
        await DataRepository.saveHistory(newHistory);
        return fullLog;
    },
    
    // --- Stats ---
    getExerciseStats: async (exerciseName: string) => {
        const history = await DataRepository.getHistory();
        // Calculate max weight, total volume etc.
        let maxWeight = 0;
        let totalVolume = 0;
        let prDate = null;

        // Iterate history to find logs for this exercise name
        // This is a naive implementation, real world might need optimization or dedicated stats table
        // But for local-first it's fast enough for thousands of logs
        
        const relevantLogs = history.flatMap(h => 
            h.exercises
                .filter(e => e.name === exerciseName && e.logs)
                .map(e => ({ date: h.date, logs: e.logs }))
        );

        for (const entry of relevantLogs) {
             if (entry.logs) {
                 for (const set of entry.logs) {
                     if (set.weight && set.weight > maxWeight) {
                         maxWeight = set.weight;
                         prDate = entry.date;
                     }
                     // Volume logic simplified
                     if (set.weight && set.reps) {
                         totalVolume += set.weight * set.reps;
                     }
                 }
             }
        }

        return {
            maxWeight,
            prDate,
            totalVolume
        };
    },
    
    // --- Base Data ---
    getDefaultExercises: async () => {
        return ExerciseDefaultData;
    }
};
