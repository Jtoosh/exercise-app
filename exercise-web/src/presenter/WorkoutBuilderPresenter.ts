import {ExerciseService} from "@/service/ExerciseService.ts";
import {type MuscleGroup, Workout} from "@/lib/workout.ts";

export class WorkoutBuilderPresenter {
    private service: ExerciseService

    constructor() {
        this.service = new ExerciseService()
    }

    public async buildWorkout(muscleGroup: MuscleGroup, duration: number): Promise<Workout> {

    }

}