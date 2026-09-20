export const BARBELL_WEIGHT = 45;
export const MAX_LOG_VALUE = 10000;
const PLATE_WEIGHTS = [45, 35, 25, 10, 5, 2.5];

export function weightEquipment(equipment: string[]): "barbell" | "dumbbell" | "other" {
    const normalized = equipment.map(item => item.trim().toLowerCase());
    if (normalized.includes("dumbbell")) return "dumbbell";
    if (normalized.includes("barbell")) return "barbell";
    return "other";
}

export function initialWeight(equipment: string[]): number {
    return weightEquipment(equipment) === "barbell" ? BARBELL_WEIGHT : 0;
}

// Find the fewest plates per side; greedy selection fails for loads like 115 lbs (35 per side).
export function platesPerSide(totalWeight: number): number[] | null {
    const target = (totalWeight - BARBELL_WEIGHT) / 5;
    if (!Number.isInteger(target) || target < 0 || totalWeight > MAX_LOG_VALUE) return null;
    const combinations: (number[] | undefined)[] = [[]];
    for (let amount = 1; amount <= target; amount++) {
        for (const plate of PLATE_WEIGHTS) {
            const previous = combinations[amount - plate / 2.5];
            const current = combinations[amount];
            if (previous && (!current || previous.length + 1 < current.length)) {
                combinations[amount] = [...previous, plate];
            }
        }
    }
    return combinations[target]?.sort((left, right) => right - left) ?? null;
}

export function pounds(weight: number, unit: "kg" | "lb"): number {
    return unit === "kg" ? Math.round(weight * 2.2046226218 * 100) / 100 : weight;
}
