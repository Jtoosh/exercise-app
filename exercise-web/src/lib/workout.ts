import  { type Exercise, type ExerciseType } from "./exercise";
import type { Muscle } from "./exercise";

export type MuscleGroup = "push" | "pull" | "legs";
export type WorkoutFocus = Muscle[] | MuscleGroup

export class Workout {
  private _type: ExerciseType
  private _focus: WorkoutFocus
  private _duration = 0;
  private _exercises: Exercise[]

  constructor(type: ExerciseType, focus: WorkoutFocus, exercises: Exercise[]) {
    this._type = type;
    this._focus = focus;
    this._exercises = exercises
    this._duration = 7.5 * exercises.length
  }

  get type(): ExerciseType {
    return this._type;
  }

  get focus(): WorkoutFocus {
    return this._focus;
  }

  get duration(): number {
    return this._duration;
  }

  get exercises(): Exercise[] {
    return this._exercises;
  }

  public static decodeMuscleGroup(muscleGroup: MuscleGroup): Muscle[] {
    switch (muscleGroup){
      case "legs":
        return ["quadriceps", "hamstrings", "glutes", "calves", ]
      case "pull":
        return ["biceps", "lats", "lower_back", "middle_back", "traps"]
      case "push":
        return ["triceps", "chest", "forearms"]
      default:
        return ["abdominals"];
    }

  }

}