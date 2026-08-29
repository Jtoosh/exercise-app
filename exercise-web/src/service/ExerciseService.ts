import { Exercise, type ExerciseType, type Muscle, type Difficulty } from "@/lib/exercise.ts";

export interface FetchExerciseOptions {
    equipment?: (string | null)[];
    resistance?: "freeweight" | "cable_machine" | "all";
    excludeIds?: string[];
}

export class ExerciseService {
    public getExerciseByMuscle = async (
        muscle: string,
        options?: FetchExerciseOptions
    ): Promise<Exercise> => {
        const queryParams = new URLSearchParams();
        queryParams.set("muscle", muscle);

        if (options?.equipment && options.equipment.length > 0) {
            const eqList = options.equipment.map((e) => (e === null ? "body only" : e));
            queryParams.set("equipment", eqList.join(","));
        }

        if (options?.resistance && options.resistance !== "all") {
            queryParams.set("resistance", options.resistance);
        }

        if (options?.excludeIds && options.excludeIds.length > 0) {
            queryParams.set("exclude", options.excludeIds.join(","));
        }

        let results = await fetch(`/api/exercise?${queryParams.toString()}`);
        let data = (await results.json()) as any[];

        // Fallback: If no results with strict options, retry without excludeIds or without equipment filter
        if ((!data || data.length === 0) && options?.excludeIds && options.excludeIds.length > 0) {
            const fallbackParams = new URLSearchParams(queryParams);
            fallbackParams.delete("exclude");
            results = await fetch(`/api/exercise?${fallbackParams.toString()}`);
            data = (await results.json()) as any[];
        }

        if ((!data || data.length === 0) && options?.equipment && options.equipment.length > 0) {
            const fallbackParams = new URLSearchParams();
            fallbackParams.set("muscle", muscle);
            results = await fetch(`/api/exercise?${fallbackParams.toString()}`);
            data = (await results.json()) as any[];
        }

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
            item.id || item.name || ""
        );
    };
}



