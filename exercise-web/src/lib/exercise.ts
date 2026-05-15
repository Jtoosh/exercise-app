export type Difficulty = "beginner" | "intermediate";

export type Muscle = "biceps";

export type ExerciseType = "strength";

export interface Exercise {
  name: string;
  type: Exercise;
  muscle: Muscle;
  difficulty: Difficulty;
  instructions: string;
  equipments: string[];
  safety_info: string;
}

export type Workout = Exercise[]
