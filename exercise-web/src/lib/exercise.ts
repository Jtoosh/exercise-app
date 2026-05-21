export type Difficulty = "beginner" | "intermediate" | "";

export type Muscle = "biceps" | "";

export type ExerciseType = "strength" | "";

export class Exercise {
  private readonly _name: string;
  private readonly _type: ExerciseType;
  private readonly _muscle: Muscle;
  private readonly _difficulty: Difficulty;
  private readonly _instructions: string;
  private readonly _equipments: string[];
  private readonly _safety_info: string;

  constructor(name: string, type: ExerciseType, muscle: Muscle, difficulty: Difficulty, instructions: string, equipments: string[], safety_info: string) {
    this._name = name;
    this._type = type;
    this._muscle = muscle;
    this._difficulty = difficulty;
    this._instructions = instructions;
    this._equipments = equipments;
    this._safety_info = safety_info;
  }

  get name(): string {
    return this._name;
  }

  get type(): ExerciseType {
    return this._type;
  }

  get muscle(): Muscle {
    return this._muscle;
  }

  get difficulty(): Difficulty {
    return this._difficulty;
  }

  get instructions(): string {
    return this._instructions;
  }

  get equipments(): string[] {
    return this._equipments;
  }

  get safety_info(): string {
    return this._safety_info;
  }


}

export type Workout = Exercise[]
