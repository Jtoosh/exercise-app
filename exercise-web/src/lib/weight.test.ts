import { expect, test } from "bun:test";
import { initialWeight, platesPerSide, pounds, weightEquipment } from "./weight";

test("equipment controls use metadata and start barbells at 45 lbs", () => {
    expect(weightEquipment([" Dumbbell "])).toBe("dumbbell");
    expect(initialWeight(["barbell"])).toBe(45);
    expect(initialWeight(["dumbbell"])).toBe(0);
    expect(initialWeight([])).toBe(0);
});

test("plate calculator includes the bar and matches standard loads with minimal plates", () => {
    expect(platesPerSide(45)).toEqual([]);
    expect(platesPerSide(65)).toEqual([10]);
    expect(platesPerSide(95)).toEqual([25]);
    expect(platesPerSide(115)).toEqual([35]);
    expect(platesPerSide(135)).toEqual([45]);
    expect(platesPerSide(185)).toEqual([45, 25]);
    expect(platesPerSide(225)).toEqual([45, 45]);
    expect(platesPerSide(50)).toEqual([2.5]);
    expect(platesPerSide(55)).toEqual([5]);
    expect(platesPerSide(165)).toEqual([35, 25]);
});

test("every reachable barbell load reconstructs the recorded total", () => {
    for (let total = 45; total <= 995; total += 5) {
        const plates = platesPerSide(total)!;
        expect(45 + 2 * plates.reduce((sum, plate) => sum + plate, 0)).toBe(total);
    }
    for (const total of [0, 44, 46, NaN, Infinity, 10005]) expect(platesPerSide(total)).toBeNull();
});

test("historic kilograms are converted without changing pound values", () => {
    expect(pounds(100, "kg")).toBe(220.46);
    expect(pounds(42.5, "kg")).toBe(93.7);
    expect(pounds(135, "lb")).toBe(135);
    expect(pounds(0, "kg")).toBe(0);
});
