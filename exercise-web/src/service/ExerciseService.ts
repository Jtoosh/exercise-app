import { Exercise, type CategoryFocus, type ExerciseType, type Muscle, type Difficulty } from "@/lib/exercise.ts";

export interface FetchExerciseOptions {
    categories?: CategoryFocus;
    equipment?: (string | null)[];
    resistance?: "freeweight" | "cable_machine" | "all";
    excludeIds?: string[];
}

export class ExerciseService {
    constructor(private readonly request: (url: string) => Promise<Response> = url => fetch(url)) {}

    public getExerciseByMuscle = async (
        muscle: string,
        options?: FetchExerciseOptions
    ): Promise<Exercise> => {
        const queryParams = new URLSearchParams();
        queryParams.set("muscle", muscle);

        if (options?.categories && options.categories !== "any" && options.categories.length > 0) {
            queryParams.set("category", options.categories.join(","));
        }

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

        const fetchExercises = async (params: URLSearchParams): Promise<any[]> => {
            const response = await this.request(`/api/exercise?${params.toString()}`);
            if (!response.ok) throw new Error(`Failed to fetch exercises: ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid exercise catalog response");
            return data;
        };
        let data = await fetchExercises(queryParams);

        // Fallback: If no results with strict options, retry without excludeIds or without equipment filter
        if ((!data || data.length === 0) && options?.excludeIds && options.excludeIds.length > 0) {
            const fallbackParams = new URLSearchParams(queryParams);
            fallbackParams.delete("exclude");
            data = await fetchExercises(fallbackParams);
        }

        if ((!data || data.length === 0) && options?.equipment && options.equipment.length > 0) {
            const fallbackParams = new URLSearchParams(queryParams);
            fallbackParams.delete("equipment");
            fallbackParams.delete("resistance");
            fallbackParams.delete("exclude");
            data = await fetchExercises(fallbackParams);
        }

        if (!data || data.length === 0) {
            throw new Error(`No exercises found for ${muscle} in ${options?.categories && options.categories !== "any" && options.categories.length ? options.categories.join(", ") : "any category"}. Try another muscle focus or category selection.`);
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



