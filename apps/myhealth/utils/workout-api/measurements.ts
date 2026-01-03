import { supabase } from "@mysuite/auth";

export const fetchBodyMeasurementHistory = async (user: any) => {
    return supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
};

export const persistBodyMeasurement = async (
    user: any,
    weight: number,
    date: string,
) => {
    // Check for existing entry on this date to update (upsert logic based on date uniqueness per user)
    const { data: existing } = await supabase
        .from("body_measurements")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();

    if (existing) {
        return supabase
            .from("body_measurements")
            .update({ weight })
            .eq("id", existing.id)
            .select()
            .single();
    } else {
        return supabase
            .from("body_measurements")
            .insert({
                user_id: user.id,
                weight,
                date,
            })
            .select()
            .single();
    }
};
