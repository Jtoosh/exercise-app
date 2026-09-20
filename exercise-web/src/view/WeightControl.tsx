import { Button } from "@/components/ui/button";
import { BARBELL_WEIGHT, MAX_LOG_VALUE, platesPerSide, weightEquipment } from "@/lib/weight";
import { NumberStepper } from "./NumberStepper";

export function WeightControl({ equipment, weight, label, onChange }: {
    equipment: string[]; weight: number; label: string; onChange: (weight: number) => void;
}) {
    const kind = weightEquipment(equipment);
    const plates = kind === "barbell" ? platesPerSide(weight) : null;
    return <div className="space-y-2">
        <NumberStepper label="Weight (lbs)" accessibleLabel={`${label} weight (lbs)`} value={weight} step={5}
            minimum={kind === "barbell" ? BARBELL_WEIGHT : 0} onChange={onChange} />
        {kind === "dumbbell" && <p className="text-xs text-muted-foreground">Per dumbbell · 5 lb steps</p>}
        {kind === "other" && <p className="text-xs text-muted-foreground">Added weight · 5 lb steps · use 0 for bodyweight</p>}
        {kind === "barbell" && <>
            <p className="text-xs text-muted-foreground">Total includes a 45 lb bar. Plate buttons adjust both sides.</p>
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 sm:grid-cols-4">
                {[10, 25, 35, 45].map(plate => <div key={plate} className="rounded-md border p-2 text-center space-y-1">
                    <p className="text-sm font-medium">{plate} lb plates</p>
                    <div className="flex justify-center gap-1">
                        <Button type="button" variant="outline" className="size-11" disabled={weight - plate * 2 < BARBELL_WEIGHT}
                            aria-label={`${label}: subtract ${plate * 2} lbs (two ${plate} lb plates)`}
                            onClick={() => onChange(weight - plate * 2)}>−</Button>
                        <Button type="button" variant="outline" className="size-11" disabled={weight + plate * 2 > MAX_LOG_VALUE}
                            aria-label={`${label}: add ${plate * 2} lbs (two ${plate} lb plates)`}
                            onClick={() => onChange(weight + plate * 2)}>+</Button>
                    </div>
                </div>)}
            </div>
            <p className="text-sm" aria-live="polite">{plates?.length
                ? `Load each side: ${plates.join(" + ")} lbs`
                : plates ? "Empty bar · no plates" : "This weight cannot be loaded with standard plates."}</p>
            <Button type="button" variant="ghost" size="sm" disabled={weight === BARBELL_WEIGHT}
                onClick={() => onChange(BARBELL_WEIGHT)}>Reset to empty bar</Button>
        </>}
    </div>;
}
