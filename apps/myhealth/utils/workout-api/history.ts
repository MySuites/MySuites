import { supabase } from "@mycsuite/auth";
import { Exercise } from "./types";

function isUUID(str: string) {
    const regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(str);
}

export async function fetchWorkoutHistory(user: any) {
    if (!user) return { data: [], error: null };

    // Try rich query first
    let { data: logs, error } = await supabase
        .from("workout_logs")
        .select(`
            workout_log_id,
            workout_id,
            user_id,
            workout_time,
            exercises,
            created_at,
            workout_name,
            note,
            workouts ( workout_name )
        `)
        .eq("user_id", user.id)
        .order("workout_time", { ascending: false });

    // Fallback to simple query if rich query fails
    if (error) {
        console.warn("Rich history fetch failed, trying simple query", error);
        const { data: simpleLogs, error: simpleError } = await supabase
            .from("workout_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("workout_time", { ascending: false });

        if (simpleError) {
            return { data: [], error: simpleError };
        }
        logs = simpleLogs;
    }

    const formatted = logs?.map((log: any) => {
        let fallbackName = undefined;
        try {
            if (log.notes) {
                const parsed = JSON.parse(log.notes);
                if (parsed.name) fallbackName = parsed.name;
            }
        } catch {}

        // Handle potential missing columns from fallback
        // Check for 'exercises' if 'notes' is missing (schema change)
        const notes = log.notes || (log.exercises ? log.exercises : undefined);

        // Try to parse name from exercises/notes JSON if workout_name is missing
        if (!fallbackName && notes) {
            try {
                const parsed = typeof notes === "string"
                    ? JSON.parse(notes)
                    : notes;
                if (parsed.name) fallbackName = parsed.name;
            } catch {}
        }

        // Use the explicit user note column if available
        // If not, don't show the JSON dump in the notes field
        const userNote = log.note || log.user_note || null;

        return {
            id: log.workout_log_id,
            workoutId: log.workout_id,
            userId: log.user_id,
            workoutTime: log.workout_time,
            notes: userNote, // Only show user entered note
            workoutName: log.workout_name || log.workouts?.workout_name ||
                fallbackName ||
                "Untitled Workout",
            createdAt: log.created_at,
        };
    }) || [];

    return { data: formatted, error: null };
}

export async function persistCompletedWorkoutToSupabase(
    user: any,
    name: string,
    exercises: Exercise[],
    duration: number,
    workoutId?: string,
    note?: string,
) {
    if (!user) return { error: "User not logged in" };

    // Strip actual logs from the notes used for the workout summary
    // This preserves the "plan" but moves the "performance" to set_logs
    const exercisesForNotes = exercises.map(({ logs, ...rest }) => {
        // Filter setTargets - only save completed sets
        if (typeof rest.completedSets === "number" && rest.setTargets) {
            rest.setTargets = rest.setTargets.slice(0, rest.completedSets);
        }

        // Remove redundant keys
        if ("type" in rest) delete (rest as any).type;
        if ("sets" in rest) delete (rest as any).sets;
        if ("reps" in rest) delete (rest as any).reps;
        if ("completedSets" in rest) delete (rest as any).completedSets;

        return rest;
    });

    const notesObj = {
        name,
        duration,
        exercises: exercisesForNotes,
    };

    // 1. Create Workout Log
    const { data: workoutLog, error: workoutLogError } = await supabase
        .from("workout_logs")
        .insert([{
            user_id: user.id,
            // workout_id is removed
            workout_time: new Date().toISOString(),
            exercises: JSON.stringify(notesObj),
            workout_name: name,
            duration: duration,
            note: note || null, // New column
        }])
        .select()
        .single();

    if (workoutLogError || !workoutLog) {
        return { data: null, error: workoutLogError };
    }

    // 2. Create Set Logs
    const setLogInserts: any[] = [];

    exercises.forEach((ex) => {
        if (ex.logs && ex.logs.length > 0) {
            ex.logs.forEach((log, index) => {
                setLogInserts.push({
                    workout_log_id: workoutLog.workout_log_id,
                    exercise_set_id: null, // We don't have this link in ad-hoc mode
                    details: {
                        ...log,
                        exercise_name: ex.name,
                        exercise_id: ex.id,
                        set_number: index + 1,
                    },
                    exercise_id: isUUID(ex.id) ? ex.id : null, // New column
                    created_at: new Date().toISOString(),
                });
            });
        }
    });

    if (setLogInserts.length > 0) {
        const { error: setLogsError } = await supabase
            .from("set_logs")
            .insert(setLogInserts);

        if (setLogsError) {
            console.warn("Failed to insert set logs", setLogsError);
            // We return the workout log as success, but warn?
            // Or treating it as success is arguably fine since the summary is there.
        }
    }

    return { data: workoutLog, error: null };
}

export async function fetchWorkoutLogDetails(user: any, logId: string) {
    if (!user) return { data: [], error: "User not logged in" };

    try {
        // 1. Fetch workout log to get the snapshot of exercises (with properties)
        const { data: workoutLog } = await supabase
            .from("workout_logs")
            .select("exercises")
            .eq("workout_log_id", logId)
            .single();

        // Parse exercises JSON to a map for easy lookup
        let exercisesSnapshot: any[] = [];
        try {
            if (workoutLog?.exercises) {
                let parsed: any;
                if (typeof workoutLog.exercises === "string") {
                    parsed = JSON.parse(workoutLog.exercises);
                } else {
                    parsed = workoutLog.exercises;
                }

                // Handle different structures
                if (Array.isArray(parsed)) {
                    exercisesSnapshot = parsed;
                } else if (parsed && Array.isArray(parsed.exercises)) {
                    exercisesSnapshot = parsed.exercises;
                }
            }
        } catch {}

        if (!Array.isArray(exercisesSnapshot)) {
            exercisesSnapshot = [];
        }

        // Fallback: Reconstruct from set_logs (Legacy behavior)
        const { data: setLogs, error } = await supabase
            .from("set_logs")
            .select(`
                set_log_id,
                details,
                notes,
                exercise_id,
                exercise_sets (
                    set_number,
                    workout_exercises (
                        position,
                        exercises (
                            exercise_name
                        )
                    )
                )
            `)
            .eq("workout_log_id", logId)
            .order("created_at", { ascending: true }); // Simple ordering

        if (error) return { data: [], error };

        // Group by exercise
        const grouped: Record<string, any> = {};

        if (setLogs) {
            setLogs.forEach((log: any) => {
                const relationalName = log.exercise_sets?.workout_exercises
                    ?.exercises
                    ?.exercise_name;
                const detailsName = log.details?.exercise_name;
                const exName = relationalName || detailsName ||
                    "Unknown Exercise";

                // Try to find properties from snapshot
                const logExId = log.exercise_id || log.details?.exercise_id;
                let matchedEx = exercisesSnapshot.find((e: any) =>
                    e.id === logExId
                );
                if (!matchedEx) {
                    matchedEx = exercisesSnapshot.find((e: any) =>
                        e.name === exName
                    );
                }
                const position =
                    log.exercise_sets?.workout_exercises?.position || 999;
                const setNumber = log.exercise_sets?.set_number ||
                    log.details?.set_number;

                if (!grouped[exName]) {
                    grouped[exName] = {
                        name: exName,
                        position: position,
                        sets: [],
                        properties: matchedEx?.properties || [],
                    };
                }

                grouped[exName].sets.push({
                    setNumber: setNumber,
                    details: log.details,
                    notes: log.notes,
                });
            });
        }

        const result = Object.values(grouped).sort((a: any, b: any) =>
            a.position - b.position
        );

        return { data: result, error: null };
    } catch (err: any) {
        console.warn("fetchWorkoutLogDetails failed", err);
        return { data: [], error: err.message || "Failed to load details" };
    }
}

export async function deleteWorkoutLogFromSupabase(user: any, logId: string) {
    if (!user) return;
    try {
        await supabase.from("workout_logs").delete().eq(
            "workout_log_id",
            logId,
        );
    } catch (e) {
        console.warn("Failed to delete workout log on server", e);
        throw e;
    }
}
