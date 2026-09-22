import { expect, test } from "bun:test";
import { WorkoutBuilderPresenter } from "./WorkoutBuilderPresenter.ts";
import { Workout } from "@/lib/workout.ts";
import { Exercise } from "@/lib/exercise.ts";

// Mock Exercise Service
class MockExerciseService {
    public calls: any[] = [];

    public getExerciseByMuscle = async (muscle: string, options?: any): Promise<Exercise> => {
        this.calls.push({ muscle, options });
        const isCable = options?.resistance === "cable_machine" || options?.equipment?.includes("cable");
        const name = `${muscle} ${isCable ? "Cable Pull" : "Dumbbell Press"} ${Math.floor(Math.random() * 1000)}`;
        return new Exercise(
            name,
            "strength",
            muscle as any,
            "intermediate",
            ["Step 1", "Step 2"],
            isCable ? ["cable"] : ["dumbbell"],
            [],
            name.replace(/\s+/g, "_")
        );
    };
}

test("buildWorkout respects exercise count based on duration", async () => {
    const mockService = new MockExerciseService();
    const presenter = new WorkoutBuilderPresenter(mockService as any);

    const workout = await presenter.buildWorkout("push", 35);
    // 35 / 7.5 = 4.67 -> round to 5 exercises
    expect(workout.exercises.length).toBe(5);
    expect(workout.focus).toBe("push");
});

test("buildWorkout balances resistance types when requested", async () => {
    const mockService = new MockExerciseService();
    const presenter = new WorkoutBuilderPresenter(mockService as any);

    await presenter.buildWorkout("pull", 30, { resistancePreference: "balanced" });

    // Should alternate resistance between freeweight and cable_machine
    const resistances = mockService.calls.map((c) => c.options?.resistance);
    expect(resistances[0]).toBe("freeweight");
    expect(resistances[1]).toBe("cable_machine");
    expect(resistances[2]).toBe("freeweight");
    expect(resistances[3]).toBe("cable_machine");
});

test("swapExercise replaces target exercise without duplicate IDs", async () => {
    const mockService = new MockExerciseService();
    const presenter = new WorkoutBuilderPresenter(mockService as any);

    const initialWorkout = await presenter.buildWorkout("legs", 15); // 2 exercises
    expect(initialWorkout.exercises.length).toBe(2);

    const oldExercise = initialWorkout.exercises[0];
    const updatedWorkout = await presenter.swapExercise(initialWorkout, 0);

    expect(updatedWorkout.exercises.length).toBe(2);
    expect(updatedWorkout.exercises[0].name).not.toBe(oldExercise.name);
});

test("mixed category focus survives resistance retry, completion, and swap", async () => {
    const service = new MockExerciseService();
    const original = service.getExerciseByMuscle;
    service.getExerciseByMuscle = async (muscle, options) => {
        if (options.resistance === "cable_machine") {
            service.calls.push({ muscle, options });
            throw new Error("No cable matches");
        }
        return original(muscle, options);
    };
    const presenter = new WorkoutBuilderPresenter(service);
    const categories = ["strength", "powerlifting"] as const;
    const workout = await presenter.buildWorkout("legs", 15, { categories });
    expect(workout.categories).toEqual(categories);
    expect(service.calls.every(call => JSON.stringify(call.options.categories) === JSON.stringify(categories))).toBe(true);
    const updated = await presenter.swapExercise(workout.completeExercise(0), 1, { categories: ["cardio"] });
    expect(updated.categories).toEqual(categories);
    expect(updated.isCompleted(0)).toBe(true);
    expect(service.calls.at(-1).options.categories).toEqual(categories);
});

test("unspecified category focus defaults to any", async () => {
    const service = new MockExerciseService();
    const workout = await new WorkoutBuilderPresenter(service).buildWorkout("legs", 15);
    expect(workout.categories).toBe("any");
    expect(service.calls.every(call => call.options.categories === "any")).toBe(true);
});
