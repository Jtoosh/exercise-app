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

const FREE_WEIGHT_EQUIPMENT = new Set([
    "dumbbell", "barbell", "kettlebells", "e-z curl bar", "body only", "medicine ball", "exercise ball", "other"
]);

const CABLE_MACHINE_EQUIPMENT = new Set([
    "cable", "machine", "bands", "foam roll"
]);

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const muscle = url.searchParams.get("muscle")?.toLowerCase();

    // Equipment filtering (supports comma-separated or multiple equipment params)
    const equipmentParams = url.searchParams.getAll("equipment");
    const allowedEquipment = new Set<string>();
    for (const ep of equipmentParams) {
        ep.split(",").forEach((item) => {
            const trimmed = item.trim().toLowerCase();
            if (trimmed) allowedEquipment.add(trimmed);
        });
    }

    const resistance = url.searchParams.get("resistance")?.toLowerCase();

    // Excluded exercise IDs or names
    const excludeParams = url.searchParams.getAll("exclude");
    const excludedIds = new Set<string>();
    for (const ex of excludeParams) {
        ex.split(",").forEach((item) => {
            const trimmed = item.trim().toLowerCase();
            if (trimmed) excludedIds.add(trimmed);
        });
    }

    try {
        const catalog = await getCatalog();
        let filtered = catalog;

        if (muscle) {
            filtered = filtered.filter((ex) => {
                const primary = (ex.primaryMuscles || []).map((m: string) => m.toLowerCase());
                const secondary = (ex.secondaryMuscles || []).map((m: string) => m.toLowerCase());
                return primary.includes(muscle) || secondary.includes(muscle);
            });
        }

        if (allowedEquipment.size > 0) {
            filtered = filtered.filter((ex) => {
                const eq = (ex.equipment || "body only").toLowerCase();
                // Also match "body only" if "null" or "none" requested
                return allowedEquipment.has(eq) || (ex.equipment === null && (allowedEquipment.has("null") || allowedEquipment.has("none")));
            });
        }

        if (resistance === "freeweight") {
            filtered = filtered.filter((ex) => {
                const eq = (ex.equipment || "body only").toLowerCase();
                return FREE_WEIGHT_EQUIPMENT.has(eq);
            });
        } else if (resistance === "cable_machine" || resistance === "cable") {
            filtered = filtered.filter((ex) => {
                const eq = (ex.equipment || "body only").toLowerCase();
                return CABLE_MACHINE_EQUIPMENT.has(eq);
            });
        }

        if (excludedIds.size > 0) {
            filtered = filtered.filter((ex) => {
                const exId = (ex.id || ex.name || "").toLowerCase();
                return !excludedIds.has(exId);
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

