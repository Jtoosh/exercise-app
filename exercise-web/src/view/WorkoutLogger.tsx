import { useEffect, useState } from "react";
import type { Workout } from "@/lib/workout";
import type { UserProfile, WorkoutLog, WorkoutHistory } from "@/lib/workoutLog";
import { WorkoutLogPresenter } from "@/presenter/WorkoutLogPresenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
const defaultPresenter = new WorkoutLogPresenter();
export function WorkoutLogger({ workout, presenter = defaultPresenter }: { workout: Workout | null; presenter?: WorkoutLogPresenter }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [userId, setUserId] = useState("");
    const [name, setName] = useState("");
    const [history, setHistory] = useState<WorkoutHistory | null>(null);
    const [log, setLog] = useState<WorkoutLog | null>(null);
    const [finished, setFinished] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [now, setNow] = useState(Date.now());
    useEffect(() => { presenter.users().then(setUsers).catch(error => setMessage(error.message)); }, [presenter]);
    useEffect(() => {
        let active = true;
        setHistory(null);
        if (userId) presenter.history(userId).then(result => { if (active) setHistory(result); })
            .catch(error => { if (active) setMessage(error.message); });
        return () => { active = false; };
    }, [userId, presenter]);
    useEffect(() => {
        if (!log || finished) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [log?.id, finished]);
    async function createUser() {
        setBusy(true); setMessage("");
        try {
            const user = await presenter.createUser(name);
            setUsers(current => [...current, user]); setUserId(user.id); setName("");
        } catch (error) { setMessage((error as Error).message); }
        finally { setBusy(false); }
    }
    function updateSet(exerciseIndex: number, setIndex: number, field: "reps" | "weight", value: number) {
        setLog(current => current && ({ ...current, exercises: current.exercises.map((exercise, position) =>
            position === exerciseIndex ? { ...exercise, sets: exercise.sets.map((set, position) =>
                position === setIndex ? { ...set, [field]: value } : set) } : exercise) }));
    }
    async function save() {
        if (!log) return;
        setBusy(true); setMessage("");
        try {
            await presenter.save(userId, log);
            setLog(null); setFinished(false); setMessage("Workout saved.");
            setHistory(await presenter.history(userId));
        } catch (error) { setMessage((error as Error).message); }
        finally { setBusy(false); }
    }
    const elapsed = log ? Math.max(0, Math.floor(((finished ? Date.parse(log.finishedAt) : now) - Date.parse(log.startedAt)) / 1000)) : 0;
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
            {!log && <Button disabled={!workout || !userId || busy} onClick={() => {
                if (workout) { setLog(presenter.start(workout)); setFinished(false); setNow(Date.now()); setMessage(""); }
            }}>Start workout timer</Button>}
            {log && <>
                <p>Elapsed: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</p>
                <p className="text-sm">Recording the exercises selected when you started. Enter each completed set; remove exercises you skipped.</p>
                <label>Weight unit <select value={log.weightUnit} disabled={busy} onChange={event => setLog({ ...log, weightUnit: event.target.value as "kg" | "lb" })}>
                    <option value="kg">kg</option><option value="lb">lb</option>
                </select></label>
                {log.exercises.map((exercise, exerciseIndex) => <fieldset key={exerciseIndex} disabled={busy} className="border rounded p-3 space-y-2">
                    <legend>{exercise.name}</legend>
                    {exercise.sets.map((set, setIndex) => <div className="flex gap-2 items-end" key={setIndex}>
                        <label>Set {setIndex + 1} reps<Input type="number" min="0" max="10000" step="1" value={Number.isNaN(set.reps) ? "" : set.reps} onChange={event => updateSet(exerciseIndex, setIndex, "reps", event.target.valueAsNumber)} /></label>
                        <label>Weight ({log.weightUnit})<Input type="number" min="0" max="10000" step="any" value={Number.isNaN(set.weight) ? "" : set.weight} onChange={event => updateSet(exerciseIndex, setIndex, "weight", event.target.valueAsNumber)} /></label>
                        <Button variant="outline" onClick={() => setLog({ ...log, exercises: log.exercises.map((item, position) => position === exerciseIndex ? { ...item, sets: item.sets.filter((_, position) => position !== setIndex) } : item) })}>Remove set</Button>
                    </div>)}
                    <Button variant="outline" onClick={() => setLog({ ...log, exercises: log.exercises.map((item, position) => position === exerciseIndex ? { ...item, sets: [...item.sets, { reps: 0, weight: 0 }] } : item) })}>Add set</Button>{" "}
                    <Button variant="outline" onClick={() => setLog({ ...log, exercises: log.exercises.filter((_, position) => position !== exerciseIndex) })}>Remove exercise</Button>
                </fieldset>)}
                <div className="flex gap-2">
                    {!finished ? <Button onClick={() => { setLog(presenter.finish(log)); setFinished(true); }}>Finish workout</Button>
                        : <Button disabled={busy} onClick={save}>{busy ? "Saving…" : "Save workout"}</Button>}
                    <Button variant="outline" disabled={busy} onClick={() => { setLog(null); setFinished(false); }}>Discard log</Button>
                </div>
            </>}
            {message && <p role="status">{message}</p>}
            {history && <div className="space-y-2">
                <h3 className="font-semibold">Workout history</h3>
                <p className="text-sm">Calendar totals use UTC. Weeks begin Monday.</p>
                {!history.totals.length && <p>No saved workouts yet.</p>}
                {history.totals.map(total => <p key={`${total.period}-${total.periodStart}`}>{total.period === "week" ? "Week" : "Month"} of {total.periodStart}: {total.count} workouts</p>)}
                {history.workouts.map(saved => <details key={saved.id}>
                    <summary>{new Date(saved.finishedAt).toLocaleString()} — {Math.floor(saved.durationSeconds / 60)}m {saved.durationSeconds % 60}s</summary>
                    {saved.exercises.map((exercise, position) => <p key={position}>{exercise.name}: {exercise.sets.map(set => `${set.reps} reps × ${set.weight} ${saved.weightUnit}`).join(", ")}</p>)}
                </details>)}
            </div>}
        </CardContent>
    </Card>;
}
