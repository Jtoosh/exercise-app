import { test, expect } from "bun:test";
import { Exercise } from "./exercise.ts";

test("Exercise initializes instructions array correctly", () => {
  const ex = new Exercise(
    "Bench Press",
    "strength",
    "chest",
    "intermediate",
    ["Lie on the bench.", "Grip the barbell.", "Lower to chest and press up."],
    ["barbell"],
    ["Bench_Press/0.jpg", "Bench_Press/1.jpg"],
    "Bench_Press"
  );

  expect(ex.name).toBe("Bench Press");
  expect(ex.muscle).toBe("chest");
  expect(ex.equipment).toEqual(["barbell"]);
  expect(ex.instructions).toHaveLength(3);
  expect(ex.instructions[0]).toBe("Lie on the bench.");
  expect(ex.getImageUrl(0)).toBe("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press/0.jpg");
  expect(ex.getImageUrl(1)).toBe("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press/1.jpg");
});

test("Exercise handles empty or missing image arrays gracefully", () => {
  const ex = new Exercise(
    "Push Up",
    "strength",
    "chest",
    "beginner",
    ["Step 1", "Step 2", "Step 3"],
    "body only"
  );

  expect(ex.instructions).toEqual(["Step 1", "Step 2", "Step 3"]);
  expect(ex.equipment).toEqual(["body only"]);
  expect(ex.getImageUrl(0)).toBeNull();
});
