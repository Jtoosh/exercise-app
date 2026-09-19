import type { Workout } from "@/lib/workout";
import type { WorkoutLogController } from "@/hooks/useWorkoutLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function WorkoutLogger({ workout, controller, workoutChanging = false }: {
    workout: Workout | null; controller: WorkoutLogController; workoutChanging?: boolean;
}) {
    const { users, userId, setUserId, name, setName, log, finished, busy, message, elapsed,
        createUser, start, finish, save, discard, setWeightUnit } = controller;
    return <Card>
        <CardHeader><CardTitle>Workout log</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <label className="block">Profile
                <select className="block border rounded p-2 w-full" value={userId} disabled={!!log || busy} onChange={event => setUserId(event.target.value)}>
                    <option value="">Choose a profile</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
            </label>
            <div className="flex gap-2">
                <Input aria-label="New profile name" placeholder="New profile name" value={name} disabled={!!log || busy} onChange={event => setName(event.target.value)} />
                <Button disabled={!!log || busy || !name.trim()} onClick={createUser}>Add profile</Button>
            </div>
            {!log && <Button disabled={!workout || !userId || busy || workoutChanging} onClick={() => {
                if (workout) start(workout);
            }}>Start workout timer</Button>}
            {log && <>
                <p>Elapsed: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</p>
                <p className="text-sm">Enter reps and weight directly in each exercise card below.</p>
                <label>Weight unit <select value={log.weightUnit} disabled={busy} onChange={event => setWeightUnit(event.target.value as "kg" | "lb")}>
                    <option value="kg">kg</option><option value="lb">lb</option>
                </select></label>
                <div className="flex gap-2">
                    {!finished ? <Button onClick={finish}>Finish workout</Button>
                        : <Button disabled={busy} onClick={save}>{busy ? "Saving…" : "Save workout"}</Button>}
                    <Button variant="outline" disabled={busy} onClick={discard}>Discard log</Button>
                </div>
            </>}
            {message && <p role="status">{message}</p>}
        </CardContent>
    </Card>;
}
