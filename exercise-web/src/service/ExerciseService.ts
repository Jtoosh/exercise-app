import { Exercise, type ExerciseType, type Muscle, type Difficulty } from "@/lib/exercise.ts";

export class ExerciseService {
    public getExerciseByMuscle = async (muscle: String): Promise<Exercise> => {
        const results = await fetch(`/api/exercise?muscle=${muscle}`);
        const data = await results.json() as any[];
        if (!data || data.length === 0) {
            throw new Error(`No exercises found for muscle: ${muscle}`);
        }
        const index = Math.floor(Math.random() * data.length);
        const item = data[index];
        return new Exercise(
            item.name,
            (item.category || "strength") as ExerciseType,
            (muscle || item.primaryMuscles?.[0] || "abdominals") as Muscle,
            (item.level || "beginner") as Difficulty,
            item.instructions || [],
            item.equipment || [],
            item.images || [],
            item.id || ""
        );
    }
}


