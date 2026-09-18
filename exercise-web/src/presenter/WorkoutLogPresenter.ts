import type { Workout } from "@/lib/workout";
import { validateProfile, validateWorkout, type WorkoutLog } from "@/lib/workoutLog";
import { HttpWorkoutLogService, type WorkoutLogService } from "@/service/WorkoutLogService";
export class WorkoutLogPresenter {
    constructor(private readonly service: WorkoutLogService = new HttpWorkoutLogService(),
        private readonly now: () => Date = () => new Date()) {}
    users() { return this.service.users(); }
    createUser(name: string) { return this.service.createUser(validateProfile(name)); }
    history(userId: string) { return this.service.history(userId); }
    start(workout: Workout): WorkoutLog {
        const timestamp = this.now().toISOString();
        return { id: crypto.randomUUID(), startedAt: timestamp, finishedAt: timestamp, weightUnit: "kg",
            exercises: workout.exercises.map(exercise => ({ exerciseId: exercise.id, name: exercise.name, sets: [{ reps: 0, weight: 0 }] })) };
    }
    finish(workout: WorkoutLog): WorkoutLog { return { ...workout, finishedAt: this.now().toISOString() }; }
    async save(userId: string, workout: WorkoutLog) { await this.service.save(userId, validateWorkout(workout)); }
}
