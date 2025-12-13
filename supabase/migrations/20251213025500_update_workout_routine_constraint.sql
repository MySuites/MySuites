-- Change workouts.routine_id foreign key to ON DELETE CASCADE
-- This allows routine-specific workouts to be automatically deleted when the routine is deleted,
-- supporting the "Template vs Instance" model.

DO $$
BEGIN
    -- Drop the existing constraint if it exists (assuming default naming convention)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'workouts_routine_id_fkey' 
        AND table_name = 'workouts'
    ) THEN
        ALTER TABLE public.workouts DROP CONSTRAINT workouts_routine_id_fkey;
    END IF;
END $$;

-- Add the new constraint with ON DELETE CASCADE
ALTER TABLE public.workouts
ADD CONSTRAINT workouts_routine_id_fkey
FOREIGN KEY (routine_id)
REFERENCES public.routines(routine_id)
ON DELETE CASCADE;
