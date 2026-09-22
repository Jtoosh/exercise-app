import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EXERCISE_CATEGORIES, normalizeCategoryFocus, type CategoryFocus } from "@/lib/exercise";

export function CategorySelector({ value, onChange }: {
    value: CategoryFocus;
    onChange: (value: CategoryFocus) => void;
}) {
    const id = useId();
    const selected = value === "any" ? [] : value;
    return <fieldset className="space-y-3">
        <legend className="font-semibold text-sm">Category focus</legend>
        <p className="text-xs text-muted-foreground">Choose one or mix several. Exercises are drawn from the selected categories; proportions may vary.</p>
        <div className="flex items-center gap-2">
            <Checkbox id={`${id}-any`} checked={selected.length === 0} onCheckedChange={() => onChange("any")} />
            <Label htmlFor={`${id}-any`}>Any category</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EXERCISE_CATEGORIES.map(category => <div key={category} className="flex items-center gap-2">
                <Checkbox id={`${id}-${category}`} checked={selected.includes(category)} onCheckedChange={checked =>
                    onChange(normalizeCategoryFocus(checked === true ? [...selected, category] : selected.filter(current => current !== category)))} />
                <Label htmlFor={`${id}-${category}`} className="capitalize font-normal text-sm">{category}</Label>
            </div>)}
        </div>
    </fieldset>;
}
