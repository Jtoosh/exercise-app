import {Exercise} from "@/lib/exercise.ts";

export class ExerciseFetchPresenter {
    private baseURL = 'https://api.api-ninjas.com/v1/exercises'

    public getExerciseByMuscle = async (muscle: String): Promise<Exercise> => {
        const results = await fetch(`${this.baseURL}?muscle=${muscle}`, {
            headers: {
                'X-Api-Key': 'g4o0QGdpeUHCVf3nipKZFN0jOd8E18Nyc3ddi4ZY'
            }
        });
        const data = await results.json() as Exercise[];
        const index = Math.floor(Math.random() * data.length);
        return data[index]!
    }
}