import { validateId, validateProfile, validateWorkout, ValidationError } from "../src/lib/workoutLog";
import { WorkoutConflictError, type WorkoutRepository } from "../server/repository/WorkoutRepository";
export function createWorkoutHandler(repository: WorkoutRepository) {
    return async (request: Request): Promise<Response> => {
        const url = new URL(request.url);
        try {
            if (request.method === "POST" && request.headers.get("origin") && request.headers.get("origin") !== url.origin)
                return Response.json({ error: "Origin not allowed." }, { status: 403 });
            if (url.pathname === "/api/users") {
                if (request.method === "GET") return Response.json(await repository.listUsers());
                if (request.method === "POST") {
                    const body = await request.json();
                    return Response.json(await repository.createUser(validateProfile(body?.name)), { status: 201 });
                }
            } else if (url.pathname === "/api/workouts") {
                if (request.method !== "GET" && request.method !== "POST")
                    return Response.json({ error: "Method not allowed." }, { status: 405 });
                const userId = url.searchParams.get("userId") ?? "";
                validateId(userId);
                if (!await repository.hasUser(userId)) return Response.json({ error: "User not found." }, { status: 404 });
                if (request.method === "GET") return Response.json(await repository.history(userId));
                await repository.save(userId, validateWorkout(await request.json()));
                return Response.json({ saved: true });
            }
            return Response.json({ error: "Method not allowed." }, { status: 405 });
        } catch (error) {
            if (error instanceof ValidationError || error instanceof SyntaxError)
                return Response.json({ error: error.message }, { status: 400 });
            if (error instanceof WorkoutConflictError) return Response.json({ error: error.message }, { status: 409 });
            console.error("Workout persistence failed", error);
            return Response.json({ error: "Unable to access workout history. Please try again." }, { status: 503 });
        }
    };
}
