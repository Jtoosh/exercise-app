import {ExerciseService} from "@/service/ExerciseService.ts";
import {type MuscleGroup, Workout} from "@/lib/workout.ts";
import {Exercise, type Muscle} from "@/lib/exercise.ts";

export class WorkoutBuilderPresenter {
    private service: ExerciseService

    constructor() {
        this.service = new ExerciseService()
    }

    public async buildWorkout(muscleGroup: MuscleGroup, duration: number): Promise<Workout> {
        const exerciseCount = duration / 7.5
        const muscles: Muscle[] = Workout.decodeMuscleGroup(muscleGroup)
        const exercises: Exercise[] = []

        for (const m of muscles) {
           for (let j = 0; j < exerciseCount / muscles.length; j++) {
               exercises.push(await this.service.getExerciseByMuscle(m))
           }
        }

        // Currently hardcoded to return strength training, other workouts is a future feature
        return new Workout("strength", muscleGroup, exercises)

    }



}