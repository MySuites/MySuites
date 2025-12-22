import { renderHook } from "@testing-library/react-native";
import { useActiveWorkoutPersistence } from "../../hooks/workouts/useActiveWorkoutPersistence";

// Mock localStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn(function (key: string) {
            return store[key] || null;
        }),
        setItem: jest.fn(function (key: string, value: string) {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(function (key: string) {
            delete store[key];
        }),
        clear: jest.fn(function () {
            store = {};
        }),
    };
})();

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

describe("useActiveWorkoutPersistence", () => {
    beforeEach(() => {
        (localStorageMock as any).clear();
        jest.clearAllMocks();
    });

    const defaultProps = {
        exercises: [],
        workoutSeconds: 0,
        workoutName: "Test Workout",
        isRunning: false,
        routineId: null,
        setExercises: jest.fn(),
        setWorkoutSeconds: jest.fn(),
        setWorkoutName: jest.fn(),
        setRoutineId: jest.fn(),
        setRunning: jest.fn(),
        setHasActiveSession: jest.fn(),
        sourceWorkoutId: null,
        setSourceWorkoutId: jest.fn(),
    };

    it("should save state to localStorage on update", () => {
        const { rerender } = renderHook(
            (props: any) => useActiveWorkoutPersistence(props),
            {
                initialProps: defaultProps,
            },
        );

        const newProps = {
            ...defaultProps,
            workoutSeconds: 10,
            workoutName: "My Workout",
        };
        rerender(newProps);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "myhealth_workout_seconds",
            "10",
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "myhealth_workout_name",
            "My Workout",
        );
    });

    it("should save exercises to localStorage", () => {
        const { rerender } = renderHook(
            (props: any) => useActiveWorkoutPersistence(props),
            {
                initialProps: defaultProps,
            },
        );

        const exercises = [{
            id: "ex1",
            name: "Exercise 1",
            sets: 3,
            reps: 10,
            completedSets: 0,
            logs: [],
        }];
        const newProps = { ...defaultProps, exercises };
        rerender(newProps);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "myhealth_workout_exercises",
            JSON.stringify(exercises),
        );
    });

    it("should save routineId if present", () => {
        const { rerender } = renderHook(
            (props: any) => useActiveWorkoutPersistence(props),
            {
                initialProps: defaultProps,
            },
        );

        const newProps = { ...defaultProps, routineId: "routine-123" };
        rerender(newProps);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "myhealth_workout_routine_id",
            "routine-123",
        );
    });

    it("should remove routineId if null", () => {
        // Start with a routine ID
        const initialProps = { ...defaultProps, routineId: "routine-123" };
        const { rerender } = renderHook(
            (props: any) => useActiveWorkoutPersistence(props),
            {
                initialProps: initialProps,
            },
        );

        // Update to null
        const newProps = { ...defaultProps, routineId: null };
        rerender(newProps);

        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "myhealth_workout_routine_id",
        );
    });

    it("should load state from localStorage on mount", () => {
        localStorageMock.setItem("myhealth_workout_seconds", "25");
        localStorageMock.setItem("myhealth_workout_name", "Loaded Workout");
        localStorageMock.setItem(
            "myhealth_workout_routine_id",
            "routine-saved",
        );
        localStorageMock.setItem("myhealth_workout_running", "true");

        renderHook(() => useActiveWorkoutPersistence(defaultProps));

        expect(defaultProps.setWorkoutSeconds).toHaveBeenCalledWith(25);
        expect(defaultProps.setWorkoutName).toHaveBeenCalledWith(
            "Loaded Workout",
        );
        expect(defaultProps.setRoutineId).toHaveBeenCalledWith("routine-saved");
        expect(defaultProps.setRunning).toHaveBeenCalledWith(true);
        expect(defaultProps.setHasActiveSession).toHaveBeenCalledWith(true);
    });

    it("should clear persistence", () => {
        const { result } = renderHook(() =>
            useActiveWorkoutPersistence(defaultProps)
        );

        result.current.clearPersistence();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "myhealth_workout_exercises",
        );
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "myhealth_workout_seconds",
        );
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "myhealth_workout_name",
        );
    });
});
