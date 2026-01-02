import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@mysuite/auth";
import { DataRepository } from "../providers/DataRepository";
import {
    fetchUserWorkouts,
    fetchWorkoutHistory,
    persistCompletedWorkoutToSupabase,
    persistWorkoutToSupabase,
} from "../utils/workout-api";

export function useSyncService() {
    const { user } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const isSyncingRef = useRef(false);

    const pullData = useCallback(async () => {
        if (!user) return;
        try {
            console.log("Pulling data...");
            // 1. Pull History
            const { data: historyData, error: historyError } =
                await fetchWorkoutHistory(user);
            if (!historyError && historyData) {
                // Logic from before...
            }

            // 2. Pull Saved Workouts
            const { data: wData, error: wError } = await fetchUserWorkouts(
                user,
            );
            if (!wError && wData) {
                const mapped = wData.map((w: any) => ({
                    id: w.workout_id,
                    name: w.workout_name,
                    exercises: w.notes ? JSON.parse(w.notes) : [],
                    createdAt: w.created_at,
                    syncStatus: "synced" as const,
                    updatedAt: new Date(w.created_at).getTime(),
                }));
                await DataRepository.saveWorkouts(mapped);
            }
        } catch (e) {
            console.error("Pull failed", e);
        }
    }, [user]);

    const pushData = useCallback(async () => {
        if (!user) return;
        try {
            console.log("Pushing data...");
            // 1. Push History
            const history = await DataRepository.getHistory();
            const pendingHistory = history.filter((h) =>
                h.syncStatus === "pending"
            );

            for (const log of pendingHistory) {
                const { error } = await persistCompletedWorkoutToSupabase(
                    user,
                    log.name,
                    log.exercises,
                    log.duration,
                    log.date,
                    log.note,
                );

                if (!error) {
                    log.syncStatus = "synced";
                }
            }
            await DataRepository.saveHistory(history);

            // 2. Push Saved Workouts
            const workouts = await DataRepository.getWorkouts();
            const pendingWorkouts = workouts.filter((w: any) =>
                w.syncStatus === "pending"
            );

            for (const w of pendingWorkouts) {
                const { data, error } = await persistWorkoutToSupabase(
                    user,
                    w.name,
                    w.exercises,
                );
                if (!error && data) {
                    w.id = data.workout_id;
                    w.syncStatus = "synced";
                }
            }
            await DataRepository.saveWorkouts(workouts);
        } catch (e) {
            console.error("Push failed", e);
        }
    }, [user]);

    const sync = useCallback(async () => {
        if (isSyncingRef.current || !user) return;

        isSyncingRef.current = true;
        setIsSyncing(true);

        try {
            await pushData();
            await pullData();
            console.log("Data sync complete");
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
        }
    }, [user, pushData, pullData]);

    useEffect(() => {
        if (user) {
            sync();
        }
    }, [user, sync]);

    return {
        isSyncing,
        sync,
    };
}
