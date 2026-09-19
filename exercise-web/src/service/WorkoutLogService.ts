import type { UserProfile, WorkoutLog, WorkoutHistory } from "@/lib/workoutLog";
export interface WorkoutLogService {
    users(): Promise<UserProfile[]>;
    createUser(name: string): Promise<UserProfile>;
    save(userId: string, workout: WorkoutLog): Promise<void>;
    history(userId: string): Promise<WorkoutHistory>;
}
type RequestTransport = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class HttpWorkoutLogService implements WorkoutLogService {
    constructor(private readonly request: RequestTransport = (...args) => globalThis.fetch(...args)) {}
    private async json(path: string, body?: unknown) {
        const response = await this.request(path, body === undefined ? undefined : {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Unable to access workout history.");
        return result;
    }
    users(): Promise<UserProfile[]> { return this.json("/api/users"); }
    createUser(name: string): Promise<UserProfile> { return this.json("/api/users", { name }); }
    async save(userId: string, workout: WorkoutLog): Promise<void> {
        await this.json(`/api/workouts?userId=${encodeURIComponent(userId)}`, workout);
    }
    history(userId: string): Promise<WorkoutHistory> { return this.json(`/api/workouts?userId=${encodeURIComponent(userId)}`); }
}
