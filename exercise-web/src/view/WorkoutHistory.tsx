import type { WorkoutHistory as History } from "@/lib/workoutLog";
import { pounds } from "@/lib/weight";
import { Card, CardContent } from "@/components/ui/card";

export function WorkoutHistory({ history }: { history: History | null }) {
    if (!history) return null;
    return <Card><CardContent className="pt-6">
        <div className="space-y-2">
            <h3 className="font-semibold">Workout history</h3>
            <p className="text-sm">Calendar totals use UTC. Weeks begin Monday.</p>
            {!history.totals.length && <p>No saved workouts yet.</p>}
            {history.totals.map(total => <p key={`${total.period}-${total.periodStart}`}>{total.period === "week" ? "Week" : "Month"} of {total.periodStart}: {total.count} workouts</p>)}
            {history.workouts.map(saved => <details key={saved.id}>
                <summary>{new Date(saved.finishedAt).toLocaleString()} — {Math.floor(saved.durationSeconds / 60)}m {saved.durationSeconds % 60}s</summary>
                {saved.exercises.map((exercise, position) => <p key={position}>{exercise.name}: {exercise.sets.map(set => `${set.reps} reps × ${pounds(set.weight, saved.weightUnit)} lbs`).join(", ")}</p>)}
            </details>)}
        </div>
    </CardContent></Card>;
}
