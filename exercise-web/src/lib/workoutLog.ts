export interface UserProfile { id: string; name: string }
export interface ExerciseSet { reps: number; weight: number }
export interface LoggedExercise { exerciseId: string; name: string; sets: ExerciseSet[] }
export interface WorkoutLog {
    id: string;
    startedAt: string;
    finishedAt: string;
    weightUnit: "kg" | "lb";
    exercises: LoggedExercise[];
}
export interface SavedWorkout extends WorkoutLog { durationSeconds: number }
export interface WorkoutTotal { period: "week" | "month"; periodStart: string; count: number }
export interface WorkoutHistory { workouts: SavedWorkout[]; totals: WorkoutTotal[] }

export class ValidationError extends Error {}
export function validateProfile(value: unknown): string {
    if (typeof value !== "string" || !value.trim() || value.trim().length > 100)
        throw new ValidationError("Name must contain 1–100 characters.");
    return value.trim();
}
export function validateId(value: string): void {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
        throw new ValidationError("Invalid identifier.");
}
export function validateWorkout(value: unknown): WorkoutLog {
    if (!value || typeof value !== "object") throw new ValidationError("Invalid workout.");
    const workout = value as WorkoutLog;
    validateId(workout.id);
    const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
    if (typeof workout.startedAt !== "string" || typeof workout.finishedAt !== "string" ||
        !timestampPattern.test(workout.startedAt) || !timestampPattern.test(workout.finishedAt))
        throw new ValidationError("Workout times must include an ISO date, time, and timezone.");
    const start = Date.parse(workout.startedAt);
    const finish = Date.parse(workout.finishedAt);
    if (typeof workout.startedAt !== "string" || typeof workout.finishedAt !== "string" ||
        !Number.isFinite(start) || !Number.isFinite(finish) || finish < start ||
        finish - start > 7 * 86400000 || finish > Date.now() + 60000)
        throw new ValidationError("Enter valid start and finish times (maximum seven days).");
    if (workout.weightUnit !== "kg" && workout.weightUnit !== "lb")
        throw new ValidationError("Weight unit must be kg or lb.");
    if (!Array.isArray(workout.exercises) || workout.exercises.length < 1 || workout.exercises.length > 100)
        throw new ValidationError("Record between 1 and 100 exercises.");
    for (const exercise of workout.exercises) {
        if (!exercise || typeof exercise.exerciseId !== "string" || exercise.exerciseId.length > 200 ||
            typeof exercise.name !== "string" || !exercise.name.trim() || exercise.name.length > 200 ||
            !Array.isArray(exercise.sets) || !exercise.sets.length || exercise.sets.length > 100)
            throw new ValidationError("Each exercise needs a name and 1–100 sets.");
        for (const set of exercise.sets) {
            if (!set || !Number.isInteger(set.reps) || set.reps < 0 || set.reps > 10000 ||
                typeof set.weight !== "number" || !Number.isFinite(set.weight) || set.weight < 0 || set.weight > 10000)
                throw new ValidationError("Reps must be whole numbers and weights must be nonnegative (maximum 10,000).");
        }
    }
    return workout;
}
