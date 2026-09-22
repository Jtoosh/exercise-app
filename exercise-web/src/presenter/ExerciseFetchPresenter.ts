import {Exercise, type CategoryFocus} from "@/lib/exercise.ts";
import  {ExerciseService} from "@/service/ExerciseService.ts";

export class ExerciseFetchPresenter {
    private service: Pick<ExerciseService, "getExerciseByMuscle">;

    constructor(service: Pick<ExerciseService, "getExerciseByMuscle"> = new ExerciseService()) {
        this.service = service
    }
    public async getExerciseByMuscle  (muscle: string, categories: CategoryFocus = "any"): Promise<Exercise> {
        return await this.service.getExerciseByMuscle(muscle, { categories })
    }
}