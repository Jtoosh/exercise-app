import { expect, test } from "bun:test";
import { createWorkoutEndpoint } from "./workoutEndpoint";
import usersEndpoint from "../../api/users";
import workoutsEndpoint from "../../api/workouts";
import type { WorkoutRepository } from "../repository/WorkoutRepository";

const user = { id: "6c9291bf-f8ef-449b-9782-47b494b5c462", name: "James" };

test("Vercel exposes both logging routes as callable Web handlers", () => {
    expect(typeof usersEndpoint.fetch).toBe("function");
    expect(workoutsEndpoint).toBe(usersEndpoint);
});

test("deployed entry point initializes once and handles profiles and workout history", async () => {
    let connections = 0;
    const repository: WorkoutRepository = {
        listUsers: async () => [user], createUser: async name => ({ ...user, name }),
        hasUser: async id => id === user.id, save: async () => {},
        history: async () => ({ workouts: [], totals: [] }),
    };
    const endpoint = createWorkoutEndpoint(() => { connections++; return repository; });
    expect(connections).toBe(0);
    expect(await (await endpoint.fetch(new Request("https://example.com/api/users"))).json()).toEqual([user]);
    const created = await endpoint.fetch(new Request("https://example.com/api/users", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "New profile" }),
    }));
    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({ ...user, name: "New profile" });
    expect(await (await endpoint.fetch(new Request(`https://example.com/api/workouts?userId=${user.id}`))).json())
        .toEqual({ workouts: [], totals: [] });
    expect(connections).toBe(1);
});

test("initialization failures return JSON and allow retry without leaking credentials", async () => {
    const endpoint = createWorkoutEndpoint(() => { throw new Error("postgres://secret@example.com/db"); });
    for (const route of ["users", "workouts"]) {
        const response = await endpoint.fetch(new Request(`https://example.com/api/${route}`));
        expect(response.status).toBe(503);
        expect(response.headers.get("content-type")).toContain("application/json");
        const body = await response.json();
        expect(body.error).toContain("DATABASE_URL");
        expect(body.error).not.toContain("secret");
    }
});
