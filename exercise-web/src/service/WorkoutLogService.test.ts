import { expect, test } from "bun:test";
import type { WorkoutLog } from "@/lib/workoutLog";
import { HttpWorkoutLogService } from "./WorkoutLogService";

const workout: WorkoutLog = {
    id: "6c9291bf-f8ef-449b-9782-47b494b5c462",
    startedAt: "2026-01-01T12:00:00Z",
    finishedAt: "2026-01-01T12:30:00Z",
    weightUnit: "kg",
    exercises: [{ exerciseId: "squat", name: "Squat", sets: [{ reps: 10, weight: 42.5 }] }],
};

test("default transport calls fetch with the global receiver", async () => {
    const originalFetch = globalThis.fetch;
    const users = [{ id: "user", name: "James" }];
    try {
        globalThis.fetch = Object.assign(async function (this: unknown, input: Parameters<typeof fetch>[0]) {
            if (this !== globalThis) throw new TypeError("Illegal invocation");
            expect(input).toBe("/api/users");
            return Response.json(users);
        }, { preconnect: originalFetch.preconnect });
        expect(await new HttpWorkoutLogService().users()).toEqual(users);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("injected transport receives each operation's URL and JSON request", async () => {
    const calls: { input: Parameters<typeof fetch>[0]; init: RequestInit | undefined }[] = [];
    const user = { id: "user", name: "James" };
    const history = { workouts: [{ ...workout, durationSeconds: 1800 }], totals: [] };
    const responses = [[user], user, history, { saved: true }];
    const request = Object.assign(async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
        calls.push({ input, init });
        return Response.json(responses.shift());
    }, { preconnect: fetch.preconnect });
    const service = new HttpWorkoutLogService(request);
    expect(await service.users()).toEqual([user]);
    expect(await service.createUser("James")).toEqual(user);
    expect(await service.history("user&other")).toEqual(history);
    expect(await service.save("user&other", workout)).toBeUndefined();
    const post = (body: unknown) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    expect(calls).toEqual([
        { input: "/api/users", init: undefined },
        { input: "/api/users", init: post({ name: "James" }) },
        { input: "/api/workouts?userId=user%26other", init: undefined },
        { input: "/api/workouts?userId=user%26other", init: post(workout) },
    ]);
});

test("API failures preserve server errors and provide a fallback", async () => {
    for (const [body, message] of [
        [{ error: "Database unavailable. Please try again." }, "Database unavailable. Please try again."],
        [{}, "Unable to access workout history."],
    ] as const) {
        const request = Object.assign(async () => Response.json(body, { status: 503 }), { preconnect: fetch.preconnect });
        await expect(new HttpWorkoutLogService(request).users()).rejects.toThrow(message);
    }
});

test("network failures propagate to the presenter and view", async () => {
    const request = Object.assign(async () => { throw new TypeError("Failed to fetch"); }, { preconnect: fetch.preconnect });
    await expect(new HttpWorkoutLogService(request).users()).rejects.toThrow("Failed to fetch");
});

test("plain text Vercel errors and HTML fallbacks produce actionable messages", async () => {
    for (const [status, body] of [[404, "The page could not be found\n\nNOT_FOUND"],
        [500, "A server error has occurred\n\nFUNCTION_INVOCATION_FAILED"], [200, "<!doctype html><html></html>"]] as const) {
        const service = new HttpWorkoutLogService(async () => new Response(body, { status }));
        await expect(service.users()).rejects.toThrow(`Workout logging is unavailable (HTTP ${status})`);
    }
});
