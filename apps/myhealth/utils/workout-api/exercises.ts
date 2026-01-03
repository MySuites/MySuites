import { supabase } from "@mysuite/auth";

import ExerciseDefaultData from "../../assets/data/default-exercises.json";
import { DataRepository } from "../../providers/DataRepository";

export async function fetchExercises(user: any) {
    let data;

    if (user) {
        // Fetch user specific exercises with muscle groups
        const { data: userData, error } = await supabase
            .from("exercises")
            .select(`
                exercise_id, 
                exercise_name, 
                properties,
                exercise_muscle_groups (
                    role,
                    muscle_groups ( name )
                )
            `)
            .order("exercise_name", { ascending: true });

        if (error) return { data: [], error };
        data = userData;
    } else {
        // Guest: Use default data
        data = ExerciseDefaultData.map((e: any) => ({
            exercise_id: e.id,
            exercise_name: e.name,
            properties: e.type,
            exercise_muscle_groups: [{
                role: "primary",
                muscle_groups: { name: e.muscle_group },
            }],
        }));
    }

    const mapped = data.map((e: any) => {
        // Get primary muscle group or first available
        const muscles = e.exercise_muscle_groups || [];
        const primary = muscles.find((m: any) => m.role === "primary");
        const firstMuscle = primary
            ? primary.muscle_groups?.name
            : (muscles[0]?.muscle_groups?.name);

        // Parse properties from comma-separated string
        const properties = e.properties
            ? e.properties.split(",").map((s: string) => s.trim())
            : [];

        return {
            id: e.exercise_id,
            name: e.exercise_name,
            category: firstMuscle || "General",
            properties: properties,
            // Keep rawType if needed for now, or just rely on properties
            rawType: e.properties,
        };
    });

    return { data: mapped, error: null };
}

// Fetch all available muscle groups
export async function fetchMuscleGroups() {
    const { data, error } = await supabase
        .from("muscle_groups")
        .select("*")
        .order("name", { ascending: true });
    return { data, error };
}

// Fetch stats for chart
export async function fetchExerciseStats(
    user: any,
    exerciseId: string,
    metric: "weight" | "reps" | "duration" | "distance" = "weight",
) {
    // Local-First: Calculate from local history for ALL users (guest and auth).
    try {
        const history = await DataRepository.getHistory();
        const grouped = new Map();

        history.forEach((h: any) => {
            h.exercises.forEach((e: any) => {
                // Check if matches by ID or Name (for reliability)
                if (
                    e.id === exerciseId ||
                    e.name === exerciseId /* Fallback if ID is name */
                ) {
                    if (e.logs) {
                        const dateKey = new Date(h.date).toDateString();

                        e.logs.forEach((log: any) => {
                            let val = 0;
                            let valid = false;

                            // Handle string/number conversion robustly
                            if (metric === "weight" && log.weight) {
                                val = parseFloat(log.weight);
                                valid = !isNaN(val);
                            } else if (metric === "reps" && log.reps) {
                                val = parseFloat(log.reps);
                                valid = !isNaN(val);
                            } else if (
                                metric === "duration" && log.duration
                            ) {
                                val = parseFloat(log.duration);
                                valid = !isNaN(val);
                            } else if (
                                metric === "distance" && log.distance
                            ) {
                                val = parseFloat(log.distance);
                                valid = !isNaN(val);
                            }

                            if (valid) {
                                if (!grouped.has(dateKey)) {
                                    grouped.set(dateKey, {
                                        date: h.date,
                                        max: val,
                                        total: val,
                                        dataPointText: val.toString(),
                                    });
                                } else {
                                    const entry = grouped.get(dateKey);
                                    if (val > entry.max) {
                                        entry.max = val;
                                        entry.dataPointText = val
                                            .toString();
                                    }
                                    entry.total += val;
                                }
                            }
                        });
                    }
                }
            });
        });

        const sorted = Array.from(grouped.values()).sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const chartData = sorted.map((item: any) => ({
            value: item.max,
            label: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            dataPointText: item.dataPointText,
        }));

        return { data: chartData, error: null };
    } catch (e) {
        console.error("Local stats error", e);
        return { data: [], error: e };
    }
}

export async function createCustomExerciseInSupabase(
    user: any,
    name: string,
    type: string = "bodyweight_reps",
    primaryMuscle?: string,
    secondaryMuscles?: string[],
) {
    if (!user) return { error: "User not logged in" };

    // 1. Create Exercise
    const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .insert([{
            exercise_name: name.trim(),
            properties: type,
            user_id: user.id,
        }])
        .select()
        .single();

    if (exerciseError || !exerciseData) {
        return { data: null, error: exerciseError };
    }

    // 2. Link Muscle Groups
    const muscleInserts: any[] = [];

    // We need to fetch muscle group IDs for the names provided
    // Ideally we pass IDs from the frontend, but if names, we resolve them.
    // Let's assume frontend passes IDs since we will switch to dropdowns relying on fetchMuscleGroups.
    // Or if names, we'd need a lookup. Let's assume IDs or names that strictly match.
    // Given the UI plan, we should fetch muscle groups first and pass their IDs.

    // However, if we want to be robust to mismatched names, let's fetch IDs for the provided strings if they look like names.
    // For now, let's assume the frontend will pass the correct ID if we provide it.

    if (primaryMuscle) {
        muscleInserts.push({
            exercise_id: exerciseData.exercise_id,
            muscle_group_id: primaryMuscle,
            role: "primary",
        });
    }

    if (secondaryMuscles && secondaryMuscles.length > 0) {
        secondaryMuscles.forEach((mId) => {
            // Avoid duplicate primary
            if (mId !== primaryMuscle) {
                muscleInserts.push({
                    exercise_id: exerciseData.exercise_id,
                    muscle_group_id: mId,
                    role: "secondary",
                });
            }
        });
    }

    if (muscleInserts.length > 0) {
        const { error: muscleError } = await supabase
            .from("exercise_muscle_groups")
            .insert(muscleInserts);

        if (muscleError) {
            console.warn("Failed to link muscle groups", muscleError);
            // We don't fail the whole creation, just warn
        }
    }

    return { data: exerciseData, error: null };
}
export async function fetchLastExercisePerformance(
    user: any,
    exerciseId: string,
    exerciseName?: string,
) {
    // Local-First: Calculate from local history for ALL users.
    try {
        const history = await DataRepository.getHistory();
        // Sort history desc by date
        const sortedHistory = [...history].sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        for (const h of sortedHistory) {
            const ex = h.exercises.find((e: any) =>
                e.id === exerciseId || e.name === exerciseName
            );
            if (ex && ex.logs && ex.logs.length > 0) {
                // Found latest session
                const logs = ex.logs.map((log: any) => ({
                    ...log,
                    exercise_name: ex.name, // Ensure context if needed
                    exercise_id: ex.id,
                }));
                return { data: logs, error: null };
            }
        }
        return { data: null, error: "No previous performance found" };
    } catch (e) {
        return { data: null, error: e };
    }
}
