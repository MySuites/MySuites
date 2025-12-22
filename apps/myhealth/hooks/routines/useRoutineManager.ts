import { useCallback, useEffect, useState } from "react";

export function useRoutineManager(routines: any[]) {
    // Active Routine progress state
    const [activeRoutine, setActiveRoutine] = useState<
        {
            id: string;
            dayIndex: number; // 0-based index in sequence
            lastCompletedDate?: string;
        } | null
    >(null);

    function startActiveRoutine(routineId: string) {
        setActiveRoutine({
            id: routineId,
            dayIndex: 0,
        });
    }

    function setActiveRoutineIndex(index: number) {
        setActiveRoutine((prev) =>
            prev
                ? { ...prev, dayIndex: index, lastCompletedDate: undefined }
                : null
        );
    }

    const markRoutineDayComplete = useCallback(() => {
        if (!activeRoutine) return;

        // 1. Mark today as complete
        setActiveRoutine((prev) =>
            prev
                ? ({
                    ...prev,
                    lastCompletedDate: new Date().toISOString(),
                })
                : null
        );
    }, [activeRoutine]);

    // Auto-advance routine day if completed on a previous day
    useEffect(() => {
        if (activeRoutine && activeRoutine.lastCompletedDate) {
            const lastDate = new Date(activeRoutine.lastCompletedDate);
            const today = new Date();
            // Reset hours to compare only dates
            lastDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            if (lastDate.getTime() < today.getTime()) {
                // It was completed yesterday or before -> Advance!
                // Find routine to know length for wrapping
                const routine = routines.find((r) => r.id === activeRoutine.id);
                const sequenceLength = routine?.sequence?.length || 1;

                setActiveRoutine((prev) =>
                    prev
                        ? ({
                            ...prev,
                            dayIndex: (prev.dayIndex + 1) % sequenceLength,
                            lastCompletedDate: undefined, // Clear completion so it's fresh for new day
                        })
                        : null
                );
            }
        }
    }, [activeRoutine, routines]);

    function clearActiveRoutine() {
        setActiveRoutine(null);
    }

    const setRoutineState = (newState: typeof activeRoutine) => {
        setActiveRoutine(newState);
    };

    return {
        activeRoutine,
        startActiveRoutine,
        setActiveRoutineIndex,
        markRoutineDayComplete,
        clearActiveRoutine,
        setRoutineState, // for persistence loading
    };
}
