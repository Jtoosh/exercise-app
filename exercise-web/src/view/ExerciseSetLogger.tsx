import type { ExerciseSet, LoggedExercise } from "@/lib/workoutLog";
import { Button } from "@/components/ui/button";
import { NumberStepper } from "./NumberStepper";
import { WeightControl } from "./WeightControl";
import { initialWeight } from "@/lib/weight";

export function ExerciseSetLogger({ exercise, equipment, disabled, onChange }: {
    exercise: LoggedExercise;
    equipment: string[];
    disabled: boolean;
    onChange: (sets: ExerciseSet[]) => void;
}) {
    function updateSet(setIndex: number, field: keyof ExerciseSet, value: number) {
        onChange(exercise.sets.map((set, position) => position === setIndex ? { ...set, [field]: value } : set));
    }
    return <fieldset disabled={disabled} className="border rounded-lg p-3 space-y-3">
        <legend className="px-1 font-semibold">Log sets</legend>
        {exercise.sets.length === 0 && <p className="text-sm text-muted-foreground">Skipped — add a set to include this exercise.</p>}
        {exercise.sets.map((set, setIndex) => <div className="rounded-md border p-3 space-y-3" key={setIndex}>
            <NumberStepper label={`Set ${setIndex + 1} reps`} accessibleLabel={`${exercise.name} set ${setIndex + 1} reps`} value={set.reps}
                onChange={value => updateSet(setIndex, "reps", value)} />
            <WeightControl equipment={equipment} weight={set.weight} label={`${exercise.name} set ${setIndex + 1}`}
                onChange={value => updateSet(setIndex, "weight", value)} />
            <Button size="sm" variant="outline" aria-label={`Remove ${exercise.name} set ${setIndex + 1}`}
                onClick={() => onChange(exercise.sets.filter((_, position) => position !== setIndex))}>Remove set</Button>
        </div>)}
        <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={exercise.sets.length >= 100} onClick={() => onChange([...exercise.sets, { ...(exercise.sets.at(-1) ?? { reps: 0, weight: initialWeight(equipment) }) }])}>Add set</Button>
            {exercise.sets.length > 0 && <Button size="sm" variant="ghost" onClick={() => onChange([])}>Skip exercise</Button>}
        </div>
    </fieldset>;
}
