import type { ExerciseSet, LoggedExercise, WorkoutLog } from "@/lib/workoutLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ExerciseSetLogger({ exercise, weightUnit, disabled, onChange }: {
    exercise: LoggedExercise;
    weightUnit: WorkoutLog["weightUnit"];
    disabled: boolean;
    onChange: (sets: ExerciseSet[]) => void;
}) {
    function updateSet(setIndex: number, field: keyof ExerciseSet, value: number) {
        onChange(exercise.sets.map((set, position) => position === setIndex ? { ...set, [field]: value } : set));
    }
    return <fieldset disabled={disabled} className="border rounded-lg p-3 space-y-3">
        <legend className="px-1 font-semibold">Log sets</legend>
        {exercise.sets.length === 0 && <p className="text-sm text-muted-foreground">Skipped — add a set to include this exercise.</p>}
        {exercise.sets.map((set, setIndex) => <div className="flex flex-wrap gap-2 items-end" key={setIndex}>
            <label className="flex-1 min-w-0 text-sm">Set {setIndex + 1} reps
                <Input aria-label={`${exercise.name} set ${setIndex + 1} reps`} type="number" min="0" max="10000" step="1"
                    value={Number.isNaN(set.reps) ? "" : set.reps} onChange={event => updateSet(setIndex, "reps", event.target.valueAsNumber)} />
            </label>
            <label className="flex-1 min-w-0 text-sm">Weight ({weightUnit})
                <Input aria-label={`${exercise.name} set ${setIndex + 1} weight (${weightUnit})`} type="number" min="0" max="10000" step="any"
                    value={Number.isNaN(set.weight) ? "" : set.weight} onChange={event => updateSet(setIndex, "weight", event.target.valueAsNumber)} />
            </label>
            <Button size="sm" variant="outline" aria-label={`Remove ${exercise.name} set ${setIndex + 1}`}
                onClick={() => onChange(exercise.sets.filter((_, position) => position !== setIndex))}>Remove set</Button>
        </div>)}
        <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onChange([...exercise.sets, { reps: 0, weight: 0 }])}>Add set</Button>
            {exercise.sets.length > 0 && <Button size="sm" variant="ghost" onClick={() => onChange([])}>Skip exercise</Button>}
        </div>
    </fieldset>;
}
