import { expect, test } from "bun:test";
import { WorkoutLogPresenter } from "./WorkoutLogPresenter";
import { Workout } from "@/lib/workout";
import { Exercise } from "@/lib/exercise";
import { validateWorkout, type WorkoutLog } from "@/lib/workoutLog";
import type { WorkoutLogService } from "@/service/WorkoutLogService";

test("presenter records actual time and saves a snapshot through the injected service", async () => {
    let currentTime = new Date("2026-01-01T12:00:00Z");
    let saved: WorkoutLog | undefined;
    const service: WorkoutLogService = {
        users: async () => [], createUser: async name => ({ id: "user", name }),
        history: async () => ({ workouts: [], totals: [] }),
        save: async (userId, log) => { expect(userId).toBe("user"); saved = log; },
    };
    const presenter = new WorkoutLogPresenter(service, () => currentTime);
    const workout = new Workout("strength", "legs", [new Exercise("Squat", "strength", "quadriceps", "beginner")]);
    const started = presenter.start(workout);
    started.exercises[0]!.sets = [{ reps: 12, weight: 20.5 }];
    currentTime = new Date("2026-01-01T12:20:00Z");
    const finished = presenter.finish(started);
    await presenter.save("user", finished);
    expect(saved?.finishedAt).toBe("2026-01-01T12:20:00.000Z");
    expect(saved?.exercises[0]?.sets).toEqual([{ reps: 12, weight: 20.5 }]);
    expect(workout.duration).toBe(7.5);
    expect(finished.id).toBe(started.id);
});

test("validation rejects malformed dates, sets, units and out-of-range numbers", () => {
    const valid: WorkoutLog = { id: crypto.randomUUID(), startedAt: "2026-01-01T12:00:00Z", finishedAt: "2026-01-01T12:30:00Z",
        weightUnit: "lb", exercises: [{ exerciseId: "squat", name: "Squat", sets: [{ reps: 10, weight: 12.5 }] }] };
    expect(validateWorkout(valid)).toEqual(valid);
    for (const invalid of [null, {}, { ...valid, id: "bad" }, { ...valid, startedAt: "bad" },
        { ...valid, finishedAt: "2025-01-01" }, { ...valid, weightUnit: "stone" }, { ...valid, exercises: [] },
        { ...valid, exercises: [null] }, ...[-1, 0.5, NaN, Infinity, 10001].map(reps => ({ ...valid,
            exercises: [{ ...valid.exercises[0], sets: [{ reps, weight: 0 }] }] })),
        ...[-1, NaN, Infinity, 10001].map(weight => ({ ...valid, exercises: [{ ...valid.exercises[0], sets: [{ reps: 1, weight }] }] }))])
        expect(() => validateWorkout(invalid)).toThrow();
});
