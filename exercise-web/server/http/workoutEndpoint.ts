import { connectDatabase } from "../db/database";
import { PostgresWorkoutRepository, type WorkoutRepository } from "../repository/WorkoutRepository";
import { createWorkoutHandler } from "./workoutHandler";

// Initialize once per function instance, on the first request rather than at build time.
export function createWorkoutEndpoint(createRepository: () => WorkoutRepository = () =>
    new PostgresWorkoutRepository(connectDatabase())) {
    let handler: ReturnType<typeof createWorkoutHandler> | undefined;
    return {
        async fetch(request: Request): Promise<Response> {
            try {
                handler ??= createWorkoutHandler(createRepository());
            } catch {
                console.error("Workout API initialization failed. Check DATABASE_URL and the Bun runtime configuration.");
                return Response.json({ error: "Workout logging is not configured. Check DATABASE_URL and apply the database migrations." }, { status: 503 });
            }
            return handler(request);
        },
    };
}

export const workoutEndpoint = createWorkoutEndpoint();
