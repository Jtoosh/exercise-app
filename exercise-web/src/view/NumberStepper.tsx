import { Button } from "@/components/ui/button";
import { MAX_LOG_VALUE } from "@/lib/weight";

export function NumberStepper({ label, accessibleLabel = label, value, step = 1, minimum = 0, onChange }: {
    label: string; accessibleLabel?: string; value: number; step?: number; minimum?: number; onChange: (value: number) => void;
}) {
    return <div className="space-y-1">
        <p className="text-sm">{label}</p>
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="size-11" disabled={value <= minimum}
                aria-label={`Decrease ${accessibleLabel} by ${step}`} onClick={() => onChange(Math.max(minimum, value - step))}>−</Button>
            <output className="min-w-12 text-center text-lg font-semibold tabular-nums" aria-label={accessibleLabel} aria-live="polite">{value}</output>
            <Button type="button" variant="outline" className="size-11" disabled={value + step > MAX_LOG_VALUE}
                aria-label={`Increase ${accessibleLabel} by ${step}`} onClick={() => onChange(value + step)}>+</Button>
        </div>
    </div>;
}
