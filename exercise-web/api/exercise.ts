let cachedExercises: any[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

export const config = {
    runtime: 'edge',
};

async function getCatalog(): Promise<any[]> {
    const now = Date.now();
    if (cachedExercises && (now - lastFetchTime < CACHE_TTL_MS)) {
        return cachedExercises;
    }
    const res = await fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json");
    if (!res.ok) {
        throw new Error(`Failed to fetch exercise DB: ${res.status}`);
    }
    cachedExercises = await res.json();
    lastFetchTime = Date.now();
    return cachedExercises!;
}

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const muscle = url.searchParams.get("muscle")?.toLowerCase();

    try {
        const catalog = await getCatalog();
        let filtered = catalog;

        if (muscle) {
            filtered = catalog.filter((ex) => {
                const primary = (ex.primaryMuscles || []).map((m: string) => m.toLowerCase());
                const secondary = (ex.secondaryMuscles || []).map((m: string) => m.toLowerCase());
                return primary.includes(muscle) || secondary.includes(muscle);
            });
        }

        return new Response(JSON.stringify(filtered), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Failed to fetch exercise catalog" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
