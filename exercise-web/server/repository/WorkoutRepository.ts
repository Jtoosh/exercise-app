import type { SQL } from "bun";
import type { UserProfile, WorkoutLog, WorkoutHistory } from "../../src/lib/workoutLog";
export interface WorkoutRepository {
    listUsers(): Promise<UserProfile[]>;
    createUser(name: string): Promise<UserProfile>;
    hasUser(userId: string): Promise<boolean>;
    save(userId: string, workout: WorkoutLog): Promise<void>;
    history(userId: string): Promise<WorkoutHistory>;
}
export class WorkoutConflictError extends Error {}
export class PostgresWorkoutRepository implements WorkoutRepository {
    constructor(private readonly database: SQL) {}
    async listUsers(): Promise<UserProfile[]> { return this.database`SELECT id, name FROM users ORDER BY name, id`; }
    async createUser(name: string): Promise<UserProfile> {
        const [user] = await this.database`INSERT INTO users VALUES (${crypto.randomUUID()}, ${name}) RETURNING id, name`;
        return user;
    }
    async hasUser(userId: string): Promise<boolean> {
        return (await this.database`SELECT id FROM users WHERE id = ${userId}`).length > 0;
    }
    async save(userId: string, workout: WorkoutLog): Promise<void> {
        await this.database.begin(async transaction => {
            const inserted = await transaction`
                INSERT INTO workouts (id, user_id, started_at, finished_at, weight_unit)
                VALUES (${workout.id}, ${userId}, ${workout.startedAt}, ${workout.finishedAt}, ${workout.weightUnit})
                ON CONFLICT (id) DO NOTHING RETURNING id`;
            if (!inserted.length) {
                const existing = await transaction`SELECT id FROM workouts WHERE id = ${workout.id} AND user_id = ${userId}`;
                if (!existing.length) throw new WorkoutConflictError("Workout identifier already used.");
                return; // A retry must never double-count a completed workout.
            }
            for (const [position, exercise] of workout.exercises.entries()) {
                const exerciseId = crypto.randomUUID();
                await transaction`INSERT INTO workout_exercises VALUES
                    (${exerciseId}, ${workout.id}, ${position}, ${exercise.exerciseId}, ${exercise.name})`;
                for (const [setPosition, set] of exercise.sets.entries()) {
                    await transaction`INSERT INTO exercise_sets VALUES (${exerciseId}, ${setPosition}, ${set.reps}, ${set.weight})`;
                }
            }
            for (const period of ["week", "month"]) {
                await transaction`INSERT INTO workout_totals (user_id, period, period_start, count)
                    VALUES (${userId}, ${period}, date_trunc(${period}, ${workout.finishedAt}::timestamptz AT TIME ZONE 'UTC')::date, 1)
                    ON CONFLICT (user_id, period, period_start) DO UPDATE SET count = workout_totals.count + 1`;
            }
        });
    }
    async history(userId: string): Promise<WorkoutHistory> {
        return this.database.begin("isolation level repeatable read read only", async transaction => {
            const workouts = await transaction`
                SELECT id, started_at AS "startedAt", finished_at AS "finishedAt",
                    duration_seconds AS "durationSeconds", weight_unit AS "weightUnit",
                    COALESCE((SELECT jsonb_agg(jsonb_build_object('exerciseId', exercise_id, 'name', name,
                        'sets', (SELECT jsonb_agg(jsonb_build_object('reps', reps, 'weight', weight) ORDER BY position)
                                 FROM exercise_sets WHERE exercise_id = workout_exercises.id)) ORDER BY position)
                        FROM workout_exercises WHERE workout_id = workouts.id), '[]'::jsonb) AS exercises
                FROM workouts WHERE user_id = ${userId} ORDER BY finished_at DESC, id LIMIT 100`;
            const totals = await transaction`SELECT period, to_char(period_start, 'YYYY-MM-DD') AS "periodStart", count
                FROM workout_totals WHERE user_id = ${userId} ORDER BY period_start DESC, period`;
            return { workouts: workouts.map((workout: any) => ({ ...workout,
                startedAt: workout.startedAt.toISOString(), finishedAt: workout.finishedAt.toISOString() })), totals };
        });
    }
}
