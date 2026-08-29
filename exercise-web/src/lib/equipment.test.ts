import {expect, test} from "bun:test";
import {EQUIPMENT_OPTIONS, EQUIPMENT_VALUES} from "./equipment.ts";

test("equipment values match the expected source schema set", () => {
    expect(EQUIPMENT_VALUES).toEqual([
        "medicine ball",
        "dumbbell",
        "body only",
        "bands",
        "kettlebells",
        "foam roll",
        "cable",
        "machine",
        "barbell",
        "exercise ball",
        "e-z curl bar",
        "other",
    ]);
});

test("equipment options include all schema values plus optional no-equipment option", () => {
    const optionValues = EQUIPMENT_OPTIONS.map((option) => option.value);
    expect(optionValues).toEqual([...EQUIPMENT_VALUES, null]);
});
