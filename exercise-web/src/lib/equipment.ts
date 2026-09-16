export const EQUIPMENT_VALUES = [
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
] as const;

export type EquipmentType = typeof EQUIPMENT_VALUES[number];
export type AvailableEquipment = EquipmentType | null;

export interface EquipmentOption {
    label: string;
    value: AvailableEquipment;
}

export const EQUIPMENT_OPTIONS: ReadonlyArray<EquipmentOption> = [
    {label: "Medicine ball", value: "medicine ball"},
    {label: "Dumbbell", value: "dumbbell"},
    {label: "Body only", value: "body only"},
    {label: "Bands", value: "bands"},
    {label: "Kettlebells", value: "kettlebells"},
    {label: "Foam roll", value: "foam roll"},
    {label: "Cable", value: "cable"},
    {label: "Machine", value: "machine"},
    {label: "Barbell", value: "barbell"},
    {label: "Exercise ball", value: "exercise ball"},
    {label: "E-Z curl bar", value: "e-z curl bar"},
    {label: "Other", value: "other"},
    {label: "No equipment", value: null},
];
