import {Exercise} from "@/lib/exercise.ts";

export class ExerciseService {
    public getExerciseByMuscle = async (muscle: String): Promise<Exercise> => {
        const results = await fetch(`https://exercise-app-blue-three.vercel.app/api/exercises?muscle=${muscle}`);
        const data = await results.json() as Exercise[];
        const index = Math.floor(Math.random() * data.length);
        return data[index]!
    }
}
