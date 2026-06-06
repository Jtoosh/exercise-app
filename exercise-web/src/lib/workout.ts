import  { type Exercise, type ExerciseType } from "./exercise";
import type { Muscle } from "./exercise";

export type MuscleGroup = "push" | "pull" | "legs";
export type WorkoutFocus = Muscle[] | MuscleGroup

export class Workout {
  private _type: ExerciseType
  private _focus: WorkoutFocus
  private _duration = 0;
  private __exercises: Exercise[]

  constructor(type: ExerciseType, focus: WorkoutFocus, exercises: Exercise[]) {
    this._type = type;
    this._focus = focus;
    this.__exercises = exercises
    this._duration = 5.5 * exercises.length
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

  get _exercises(): Exercise[] {
    return this.__exercises;
  }

}