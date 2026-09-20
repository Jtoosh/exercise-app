import type { Workout } from "@/lib/workout";
import { ArrowRight, Check, ChevronRight, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkoutOverview({ workout, onOpenExercise }: {
    workout: Workout; onOpenExercise: (index: number) => void;
}) {
    const completed = workout.completedIndexes.size;
    const total = workout.exercises.length;
    const nextIndex = workout.nextIncompleteIndex(-1);
    return <section className="space-y-6" aria-label="Workout overview">
        <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest font-semibold text-primary">Your session</p>
                    <h1 tabIndex={-1} data-screen-heading className="text-3xl font-semibold tracking-tight capitalize">{Array.isArray(workout.focus) ? workout.focus.join(", ") : workout.focus} workout</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="size-4" />{workout.duration} min</span>
                        <span className="flex items-center gap-1.5"><ListChecks className="size-4" />{total} circuits</span>
                    </div>
                </div>
                <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">{completed} / {total} complete</span>
            </div>
            <progress className="block h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
                aria-label="Workout completion" value={completed} max={total || 1} />
            {nextIndex === null ? <p role="status" className="font-medium text-primary">All circuits complete. Nice work!</p>
                : <Button onClick={() => onOpenExercise(nextIndex)}>{completed ? "Continue workout" : "Open first circuit"}<ArrowRight className="size-4" /></Button>}
        </div>
        <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2"><h2 className="text-lg font-semibold">Your circuits</h2><p className="text-xs text-muted-foreground">Tap an exercise to open</p></div>
            <ol className="overflow-hidden rounded-xl border bg-card divide-y">
                {workout.exercises.map((exercise, index) => <li key={`${exercise.id}-${index}`}>
                    <button type="button" onClick={() => onOpenExercise(index)}
                        className="flex w-full items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-muted/70 focus-visible:bg-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 transition-colors">
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${workout.isCompleted(index) ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                            {workout.isCompleted(index) ? <Check className="size-5" /> : String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 space-y-1">
                            <span className="block font-semibold">{exercise.name}</span>
                            <span className="block text-xs text-muted-foreground capitalize">{[exercise.muscle, ...exercise.equipment].filter(Boolean).join(" · ")}</span>
                            {workout.isCompleted(index) && <span className="block text-xs font-medium text-primary">Completed</span>}
                        </span>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </button>
                </li>)}
            </ol>
        </div>
    </section>;
}
