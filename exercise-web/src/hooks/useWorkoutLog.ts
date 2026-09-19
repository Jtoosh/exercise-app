import { useEffect, useState } from "react";
import type { Workout } from "@/lib/workout";
import type { UserProfile, WorkoutLog, WorkoutHistory, ExerciseSet } from "@/lib/workoutLog";
import { WorkoutLogPresenter } from "@/presenter/WorkoutLogPresenter";
const defaultPresenter = new WorkoutLogPresenter();

export function useWorkoutLog(presenter = defaultPresenter) {
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
    function updateSets(exerciseIndex: number, sets: ExerciseSet[]) {
        setLog(current => current && ({ ...current, exercises: current.exercises.map((exercise, position) =>
            position === exerciseIndex ? { ...exercise, sets } : exercise) }));
    }
    async function save() {
        if (!log) return;
        setBusy(true); setMessage("");
        try {
            await presenter.save(userId, { ...log, exercises: log.exercises.filter(exercise => exercise.sets.length > 0) });
            setLog(null); setFinished(false); setMessage("Workout saved.");
            setHistory(await presenter.history(userId));
        } catch (error) { setMessage((error as Error).message); }
        finally { setBusy(false); }
    }
    const elapsed = log ? Math.max(0, Math.floor(((finished ? Date.parse(log.finishedAt) : now) - Date.parse(log.startedAt)) / 1000)) : 0;
    function start(workout: Workout) {
        setLog(presenter.start(workout)); setFinished(false); setNow(Date.now()); setMessage("");
    }
    function finish() { if (log) { setLog(presenter.finish(log)); setFinished(true); } }
    function discard() { setLog(null); setFinished(false); }
    function setWeightUnit(weightUnit: WorkoutLog["weightUnit"]) {
        setLog(current => current && ({ ...current, weightUnit }));
    }
    return { users, userId, setUserId, name, setName, history, log, finished, busy, message, elapsed,
        createUser, updateSets, start, finish, save, discard, setWeightUnit };
}

export type WorkoutLogController = ReturnType<typeof useWorkoutLog>;
