import  { type Exercise, type ExerciseType } from "./exercise";
import type { Muscle } from "./exercise";

export type MuscleGroup = "push" | "pull" | "legs";
export type WorkoutFocus = Muscle[] | MuscleGroup

export class Workout {
  private _type: ExerciseType;
  private _focus: WorkoutFocus;
  private _duration = 0;
  private _exercises: Exercise[];
  private _completedIndexes: Set<number>;

  constructor(type: ExerciseType, focus: WorkoutFocus, exercises: Exercise[], completedIndexes: Set<number> = new Set()) {
    this._type = type;
    this._focus = focus;
    this._exercises = exercises;
    this._duration = 7.5 * exercises.length;
    this._completedIndexes = completedIndexes;
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

  get completedIndexes(): Set<number> {
    return this._completedIndexes;
  }

  public isCompleted(index: number): boolean {
    return this._completedIndexes.has(index);
  }

  public toggleCompleted(index: number): Workout {
    const nextCompleted = new Set(this._completedIndexes);
    if (nextCompleted.has(index)) {
      nextCompleted.delete(index);
    } else {
      nextCompleted.add(index);
    }
    return new Workout(this._type, this._focus, [...this._exercises], nextCompleted);
  }

  public replaceExercise(index: number, newExercise: Exercise): Workout {
    if (index < 0 || index >= this._exercises.length) {
      return this;
    }
    const updatedExercises = [...this._exercises];
    updatedExercises[index] = newExercise;
    return new Workout(this._type, this._focus, updatedExercises, new Set(this._completedIndexes));
  }

  public static decodeMuscleGroup(muscleGroup: MuscleGroup): Muscle[] {
    switch (muscleGroup){
      case "legs":
        return ["quadriceps", "hamstrings", "glutes", "calves"];
      case "pull":
        return ["biceps", "lats", "lower back", "middle back", "traps"];
      case "push":
        return ["triceps", "chest", "forearms"];
      default:
        return ["abdominals"];
    }
  }
}