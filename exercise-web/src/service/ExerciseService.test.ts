import { expect, test } from "bun:test";
import { ExerciseService } from "./ExerciseService";

test("category constraints survive exclusion and equipment fallbacks", async () => {
    const requests: URL[] = [];
    const service = new ExerciseService(async url => {
        requests.push(new URL(url, "http://localhost"));
        return Response.json(requests.length < 3 ? [] : [{ name: "Jump", category: "plyometrics" }]);
    });
    const exercise = await service.getExerciseByMuscle("quadriceps", {
        categories: ["plyometrics", "strongman"], equipment: ["cable"], excludeIds: ["jump"],
    });
    expect(requests).toHaveLength(3);
    expect(requests.every(url => url.searchParams.get("category") === "plyometrics,strongman")).toBe(true);
    expect(exercise.category).toBe("plyometrics");
});

test("any and empty category selection omit the filter", async () => {
    const service = new ExerciseService(async url => {
        expect(new URL(url, "http://localhost").searchParams.has("category")).toBe(false);
        return Response.json([{ name: "Run", category: "cardio" }]);
    });
    await service.getExerciseByMuscle("quadriceps", { categories: "any" });
    await service.getExerciseByMuscle("quadriceps", { categories: [] });
});

test("empty category matches and HTTP failures produce useful errors", async () => {
    const empty = new ExerciseService(async () => Response.json([]));
    await expect(empty.getExerciseByMuscle("chest", { categories: ["cardio"] })).rejects.toThrow("No exercises found for chest in cardio");
    const failed = new ExerciseService(async () => Response.json({ error: "Unavailable" }, { status: 500 }));
    await expect(failed.getExerciseByMuscle("chest")).rejects.toThrow("Failed to fetch exercises: 500");
});
