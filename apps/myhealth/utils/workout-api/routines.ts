import { supabase } from "@mycsuite/auth";

export async function fetchUserRoutines(user: any) {
    if (!user) return { data: [], error: null };
    // We rely on RLS policies to ensure users only see their own routines.
    const { data, error } = await supabase
        .from("routines")
        .select("*")
        .order("created_at", { ascending: false });
    return { data, error };
}

export async function persistRoutineToSupabase(
    user: any,
    routineName: string,
    sequence: any[],
) {
    if (!user) return { error: "User not logged in" };

    const { data: responseData, error: invokeError } = await supabase.functions
        .invoke("create-routine", {
            body: {
                routine_name: routineName.trim(),
                exercises: sequence, // Send full sequence, server handles copying
                user_id: user.id,
            },
        });

    const data = responseData?.data;
    const error = invokeError ||
        (responseData?.error ? new Error(responseData.error) : null);

    if (error || !data) {
        return { error: error || "Failed to create routine" };
    }

    return { data };
}

export async function persistUpdateRoutineToSupabase(
    user: any,
    routineId: string,
    routineName: string,
    sequence: any[],
) {
    if (!user) return { error: "User not logged in" };

    const { data: responseData, error: invokeError } = await supabase.functions
        .invoke("update-routine", {
            body: {
                routine_id: routineId,
                routine_name: routineName.trim(),
                exercises: sequence,
                user_id: user.id,
            },
        });

    const data = responseData?.data;
    const error = invokeError ||
        (responseData?.error ? new Error(responseData.error) : null);

    if (error || !data) {
        return { error: error || "Failed to update routine" };
    }

    return { data };
}

export async function deleteRoutineFromSupabase(user: any, routineId: string) {
    if (!user) return;
    try {
        await supabase.functions.invoke("delete-routine", {
            body: { routine_id: routineId, user_id: user.id },
        });
    } catch (e) {
        console.warn("Failed to delete routine on server", e);
        throw e;
    }
}
