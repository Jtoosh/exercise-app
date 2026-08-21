export type Difficulty = "beginner" | "intermediate" | "expert" | "";

export type Muscle =
    | "abdominals"
    | "abductors"
    | "adductors"
    | "biceps"
    | "calves"
    | "chest"
    | "forearms"
    | "glutes"
    | "hamstrings"
    | "lats"
    | "lower back"
    | "middle back"
    | "neck"
    | "quadriceps"
    | "traps"
    | "triceps";

export type ExerciseType = "strength" | "stretching" | "plyometrics" | "powerlifting" | "cardio" | "";

const CDN_BASE_IMAGE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

export class Exercise {
  private readonly _name: string;
  private readonly _type: ExerciseType;
  private readonly _muscle: Muscle;
  private readonly _difficulty: Difficulty;
  private readonly _instructions: string[];
  private readonly _equipment: string[];
  private readonly _images: string[];
  private readonly _id: string;

  constructor(
    name: string,
    type: ExerciseType,
    muscle: Muscle,
    difficulty: Difficulty,
    instructions: string[] = [],
    equipment: string[] | string = [],
    images: string[] = [],
    id: string = ""
  ) {
    this._name = name;
    this._type = type;
    this._muscle = muscle;
    this._difficulty = difficulty;
    this._instructions = Array.isArray(instructions) ? instructions : [];

    if (Array.isArray(equipment)) {
      this._equipment = equipment;
    } else if (typeof equipment === "string" && equipment.trim().length > 0) {
      this._equipment = [equipment];
    } else {
      this._equipment = [];
    }

    this._images = images;
    this._id = id;
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

  get instructions(): string[] {
    return this._instructions;
  }

  get equipment(): string[] {
    return this._equipment;
  }

  get images(): string[] {
    return this._images;
  }

  get id(): string {
    return this._id;
  }

  public getImageUrl(index: number = 0): string | null {
    if (this._images && this._images.length > index && this._images[index]) {
      return `${CDN_BASE_IMAGE_URL}${this._images[index]}`;
    }
    return null;
  }
}

