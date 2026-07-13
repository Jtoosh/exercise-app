import {Exercise} from "@/lib/exercise.ts";
import  {ExerciseService} from "@/service/ExerciseService.ts";

export class ExerciseFetchPresenter {
    private service: ExerciseService;

    constructor() {
        this.service = new ExerciseService()
    }
    public getExerciseByMuscle = async (muscle: String): Promise<Exercise> => {
        return await this.service.getExerciseByMuscle(muscle)
    }
}