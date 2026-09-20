import { expect, test } from "bun:test";
import { Workout } from "./workout";
import { Exercise } from "./exercise";

function workout() {
    return new Workout("strength", "legs", ["Squat", "Deadlift", "Lunge"].map(name =>
        new Exercise(name, "strength", "quadriceps", "beginner")));
}

test("completing a circuit is immutable and idempotent", () => {
    const original = workout();
    const completed = original.completeExercise(0);
    expect(original.isCompleted(0)).toBe(false);
    expect(completed.isCompleted(0)).toBe(true);
    expect(completed.completeExercise(0)).toBe(completed);
    expect(completed.completeExercise(99)).toBe(completed);
    expect(completed.nextIncompleteIndex(0)).toBe(1);
});

test("advancement skips completed circuits and wraps to unfinished circuits", () => {
    const partial = workout().completeExercise(1);
    expect(partial.nextIncompleteIndex(0)).toBe(2);
    expect(partial.completeExercise(2).nextIncompleteIndex(2)).toBe(0);
    expect(partial.nextIncompleteIndex(-1)).toBe(0);
});

test("the last completion ends the flow with no next circuit", () => {
    const completed = workout().completeExercise(0).completeExercise(1).completeExercise(2);
    expect(completed.nextIncompleteIndex(2)).toBeNull();
    expect(completed.completedIndexes.size).toBe(3);
    expect(new Workout("strength", "legs", []).nextIncompleteIndex(-1)).toBeNull();
});
