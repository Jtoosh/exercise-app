import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { SQL } from "bun";
import { migrate } from "../db/migrate";
import { PostgresWorkoutRepository } from "./WorkoutRepository";
import { createWorkoutHandler } from "../../api/workouts";
import type { WorkoutLog } from "../../src/lib/workoutLog";

const databaseUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!databaseUrl)("PostgreSQL workout persistence", () => {
    // All objects live in a disposable schema, never in the application's tables.
    const schema = `test_workouts_${crypto.randomUUID().replaceAll("-", "")}`;
    let database: SQL;
    let admin: SQL;
    let repository: PostgresWorkoutRepository;
    let userId: string;
    const sample = (finishedAt = "2026-03-01T00:10:00.000Z"): WorkoutLog => ({
        id: crypto.randomUUID(), startedAt: new Date(Date.parse(finishedAt) - 1800000).toISOString(), finishedAt,
        weightUnit: "kg", exercises: [
            { exerciseId: "squat", name: "Squat", sets: [{ reps: 10, weight: 42.5 }, { reps: 8, weight: 45 }] },
            { exerciseId: "plank", name: "Plank", sets: [{ reps: 0, weight: 0 }] },
        ],
    });
    beforeAll(async () => {
        admin = new SQL(databaseUrl!);
        await admin.unsafe(`CREATE SCHEMA ${schema}`);
        database = new SQL(databaseUrl!, { max: 5, connection: { search_path: schema } });
        await migrate(database);
        await migrate(database);
        repository = new PostgresWorkoutRepository(database);
        userId = (await repository.createUser("James")).id;
    });
    afterAll(async () => {
        if (database) await database.close();
        if (admin) { await admin.unsafe(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); await admin.close(); }
    });
    test("round-trips ordered exercises and sets, actual duration, and persisted calendar totals", async () => {
        const workout = sample();
        await repository.save(userId, workout);
        const history = await repository.history(userId);
        expect(history.workouts).toEqual([{ ...workout, durationSeconds: 1800 }]);
        expect(history.totals).toEqual(expect.arrayContaining([
            { period: "month", periodStart: "2026-03-01", count: 1 },
            { period: "week", periodStart: "2026-02-23", count: 1 },
        ]));
        await Promise.all([repository.save(userId, workout), repository.save(userId, workout)]);
        expect(await repository.history(userId)).toEqual(history);
    });
    test("separates users and crosses UTC Monday/month/year boundaries", async () => {
        const other = await repository.createUser("Other person");
        expect(await repository.history(other.id)).toEqual({ workouts: [], totals: [] });
        for (const timestamp of ["2025-12-31T23:59:00Z", "2026-01-01T00:01:00Z", "2026-01-05T00:01:00Z"])
            await repository.save(other.id, sample(timestamp));
        const { totals } = await repository.history(other.id);
        expect(totals).toEqual(expect.arrayContaining([
            { period: "month", periodStart: "2025-12-01", count: 1 },
            { period: "month", periodStart: "2026-01-01", count: 2 },
            { period: "week", periodStart: "2025-12-29", count: 2 },
            { period: "week", periodStart: "2026-01-05", count: 1 },
        ]));
        const [owned] = (await repository.history(userId)).workouts;
        await expect(repository.save(other.id, owned!)).rejects.toThrow("identifier already used");
    });
    test("rolls back the entire workout and counters if a set insert fails", async () => {
        const before = await repository.history(userId);
        const invalid = sample();
        invalid.exercises[1]!.sets[0]!.reps = -1;
        await expect(repository.save(userId, invalid)).rejects.toThrow();
        expect(await repository.history(userId)).toEqual(before);
        expect(await database`SELECT id FROM workouts WHERE id = ${invalid.id}`).toHaveLength(0);
    });
    test("concurrent distinct saves increment both totals without lost updates", async () => {
        const user = await repository.createUser("Concurrent");
        await Promise.all(Array.from({ length: 5 }, () => repository.save(user.id, sample())));
        expect((await repository.history(user.id)).totals.map(total => total.count)).toEqual([5, 5]);
    });
    test("HTTP handlers persist and retrieve records and reject invalid/unknown users", async () => {
        const handler = createWorkoutHandler(repository);
        const request = (path: string, body?: unknown) => new Request(`http://localhost${path}`, body === undefined ? undefined : {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const created = await handler(request("/api/users", { name: " API User " }));
        expect(created.status).toBe(201);
        const user = await created.json();
        expect(user.name).toBe("API User");
        const workout = sample();
        expect((await handler(request(`/api/workouts?userId=${user.id}`, workout))).status).toBe(200);
        const history = await (await handler(request(`/api/workouts?userId=${user.id}`))).json();
        expect(history.workouts[0].exercises).toEqual(workout.exercises);
        expect((await handler(request(`/api/workouts?userId=${user.id}`, { ...workout, exercises: [] }))).status).toBe(400);
        expect((await handler(request(`/api/workouts?userId=${crypto.randomUUID()}`))).status).toBe(404);
        expect((await handler(request("/api/workouts?userId=invalid"))).status).toBe(400);
        expect((await handler(request("/api/users", { name: " " }))).status).toBe(400);
        expect((await handler(new Request("http://localhost/api/users", { method: "DELETE" }))).status).toBe(405);
        expect((await handler(new Request("http://localhost/api/users", { method: "POST", body: "{" }))).status).toBe(400);
        expect((await handler(new Request("http://localhost/api/users", { method: "POST", headers: { origin: "https://elsewhere.example" }, body: "{}" }))).status).toBe(403);
    });
});
