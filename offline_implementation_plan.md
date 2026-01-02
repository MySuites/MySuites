# Offline-First & Guest Mode Implementation Plan

This plan enables a fully functional "Guest Mode" where the app works without an account. An account is treated as a mechanism for cloud backup and multi-device sync, rather than a requirement for usage.

## User Review Required

> [!IMPORTANT]
> **Architecture Shift**: We are moving from a "Mutation Queue" (Command Pattern) to **"State-Based Synchronization"**.
> - **Reason**: "Guest Mode" implies long periods of disconnected usage. Replaying months of "Actions" is fragile.
> - **Solution**: We will add a `syncStatus` ('synced' | 'pending') flag to all local data.
> - **Guest Experience**: Guests write to local storage. All items are marked `pending`.
> - **Sign-In Experience**: When a guest signs in, the Sync Service detects all `pending` items and bulk-uploads them to the cloud.

> [!NOTE]
> We still need `@react-native-community/netinfo` to detect connectivity.

## Proposed Changes

### Data Model Updates
We will extend our local types (SavedWorkouts, Routines, History) to include:
```typescript
interface Syncable {
    id: string; // UUID (generated locally if new)
    syncStatus: 'synced' | 'pending' | 'dirty'; // 'dirty' means modified since sync
    updatedAt: number;
    deletedAt?: number; // For Soft Deletes
}

// Rich History Document (Stored Locally)
interface LocalWorkoutLog extends Syncable {
    name: string;
    duration: number;
    date: string;
    exercises: Exercise[]; // Contains 'logs' (sets/reps/weight)
    note?: string;
}
```

### Dependencies
- Install `@react-native-community/netinfo`

### Components

#### 1. `providers/DataRepository.tsx` (New)
*Abstractions over `workout-api` to handle the "Local First" logic.*
- **Methods**:
    - `getWorkouts()`: Returns local `AsyncStorage` items *excluding* those with `deletedAt`.
    - `getHistory()`: Returns `LocalWorkoutLog[]`.
    - `getExerciseStats(exerciseId)`: 
        - **Refactored**: Instead of querying Supabase `set_logs`, this now iterates over `getHistory()` locally to calculate max weight, volume, etc.
        - **Benefit**: Works instantly offline and updates immediately after a workout.
    - `saveWorkout(workout)`
    - `saveLog(log)`: Saves full `LocalWorkoutLog` to AsyncStorage.

#### 2. `hooks/useSyncService.ts` (New)
*The engine that runs in the background.*
- **Triggers**:
    - App Open
    - Connectivity Change (Offline -> Online)
    - User Sign In
- **Logic**:
    1.  **Push (History)**:
        - Takes a `LocalWorkoutLog`.
        - Calls API `persistCompletedWorkoutToSupabase` (which handles splitting into `workout_logs` + `set_logs`).
    2.  **Pull (History)**:
        - Fetches `workout_logs` + `set_logs` (joined).
        - Reconstructs `LocalWorkoutLog` (Rich Document).
        - Saves to AsyncStorage.

#### 3. `assets/data/default-exercises.json` (New)
*Bundled source of truth for base exercises.*
- Contains the ~100-200 standard exercises (Pushups, Pullups, etc.).

### `WorkoutManagerProvider.tsx` Refactor
- Remove direct calls to `workout-api` and `AsyncStorage`.
- logical flow:
    - **Init**: Load all data from `DataRepository` into state (Rapid render).
    - **Effect**: Initialize `useSyncService` to start background consistency check.
    - **Actions**: `saveWorkout`, etc., call `DataRepository.saveWorkout()`.

### New Files
#### [NEW] [hooks/useSyncService.ts](file:///Users/zbanks/Documents/MySuite/apps/myhealth/hooks/useSyncService.ts)
#### [NEW] [utils/storage.ts](file:///Users/zbanks/Documents/MySuite/apps/myhealth/utils/storage.ts) (Helper for AsyncStorage wrapper)
#### [NEW] [assets/data/default-exercises.json](file:///Users/zbanks/Documents/MySuite/apps/myhealth/assets/data/default-exercises.json)

## Verification Plan

### Test Scenarios
1.  **Guest Mode (Fresh Install)**
    - Install app, do NOT log in.
    - Create 2 Workouts, 1 Routine.
    - **Verify**: Can see "Pushups" (from JSON) and add it to workout.
    - Complete a workout (History Log).
    - **Verify**: Data persists after app restart.
2.  **Cloud Onboarding**
    - Go to Settings -> Sign In.
    - **Verify**: `useSyncService` triggers.
    - **Verify**: Data appears in Supabase table.
3.  **Offline Stats**
    - Perform "Bench Press" 100kg.
    - Go Offline.
    - Check "Bench Press" Details/Charts.
    - **Verify**: Last performance (100kg) and Chart history are visible (calculated from local logs).