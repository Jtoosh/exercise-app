import {ExerciseService} from "@/service/ExerciseService.ts";
import {type MuscleGroup, Workout} from "@/lib/workout.ts";
import {Exercise, type Muscle} from "@/lib/exercise.ts";

export interface BuildWorkoutOptions {
    equipment?: (string | null)[];
    resistancePreference?: "balanced" | "freeweight" | "cable_machine" | "all";
}

export class WorkoutBuilderPresenter {
    private service: ExerciseService;

    constructor(service?: ExerciseService) {
        this.service = service || new ExerciseService();
    }

    public async buildWorkout(
        muscleGroup: MuscleGroup,
        duration: number,
        options?: BuildWorkoutOptions
    ): Promise<Workout> {
        const exerciseCount = Math.max(1, Math.round(duration / 7.5));
        const muscles: Muscle[] = Workout.decodeMuscleGroup(muscleGroup);
        const exercises: Exercise[] = [];
        const chosenIds: string[] = [];

        const resistancePref = options?.resistancePreference || "balanced";

        for (let i = 0; i < exerciseCount; i++) {
            const muscle = muscles[i % muscles.length];

            let targetResistance: "freeweight" | "cable_machine" | "all" = "all";
            if (resistancePref === "balanced") {
                targetResistance = i % 2 === 0 ? "freeweight" : "cable_machine";
            } else if (resistancePref === "freeweight" || resistancePref === "cable_machine") {
                targetResistance = resistancePref;
            }

            try {
                const exercise = await this.service.getExerciseByMuscle(muscle, {
                    equipment: options?.equipment,
                    resistance: targetResistance,
                    excludeIds: chosenIds,
                });
                exercises.push(exercise);
                if (exercise.id || exercise.name) {
                    chosenIds.push((exercise.id || exercise.name).toLowerCase());
                }
            } catch (err) {
                // If target resistance fails, fallback to 'all'
                const fallbackExercise = await this.service.getExerciseByMuscle(muscle, {
                    equipment: options?.equipment,
                    resistance: "all",
                    excludeIds: chosenIds,
                });
                exercises.push(fallbackExercise);
                if (fallbackExercise.id || fallbackExercise.name) {
                    chosenIds.push((fallbackExercise.id || fallbackExercise.name).toLowerCase());
                }
            }
        }

        return new Workout("strength", muscleGroup, exercises);
    }

    public async swapExercise(
        currentWorkout: Workout,
        exerciseIndex: number,
        options?: BuildWorkoutOptions
    ): Promise<Workout> {
        if (exerciseIndex < 0 || exerciseIndex >= currentWorkout.exercises.length) {
            return currentWorkout;
        }

        const currentExercise = currentWorkout.exercises[exerciseIndex];
        const muscle = currentExercise.muscle || "chest";

        const existingIds = currentWorkout.exercises
            .filter((_, idx) => idx !== exerciseIndex)
            .map((ex) => (ex.id || ex.name || "").toLowerCase())
            .filter(Boolean);

        const newExercise = await this.service.getExerciseByMuscle(muscle, {
            equipment: options?.equipment,
            resistance: options?.resistancePreference === "all" ? "all" : undefined,
            excludeIds: existingIds,
        });

        return currentWorkout.replaceExercise(exerciseIndex, newExercise);
    }
}