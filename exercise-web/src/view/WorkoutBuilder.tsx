import { CategorySelector } from "./CategorySelector";
import type { CategoryFocus } from "@/lib/exercise";
import { useWorkoutLog } from "@/hooks/useWorkoutLog";
import { WorkoutOverview } from "./WorkoutOverview";
import { WorkoutExercise } from "./WorkoutExercise";
import { useSearchParams } from "react-router";
import { WorkoutHistory } from "@/view/WorkoutHistory";
import { WorkoutLogger } from "@/view/WorkoutLogger";
import type { MuscleGroup } from "@/lib/workout.ts";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { WorkoutBuilderPresenter } from "@/presenter/WorkoutBuilderPresenter.ts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { Workout } from "@/lib/workout.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { type AvailableEquipment, EQUIPMENT_OPTIONS } from "@/lib/equipment.ts";
import { Dumbbell, Sliders, ArrowLeft } from "lucide-react";

const presenter = new WorkoutBuilderPresenter();

interface WorkoutState {
    workout: Workout | null;
    loading: boolean;
    error: string | null;
}

export function WorkoutBuilder() {
    const logger = useWorkoutLog();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedScreen = searchParams.get("screen");
    const requestedIndex = Number(searchParams.get("exercise") ?? -1);
    const [swapping, setSwapping] = useState(false);
    const [muscleGroup, setMuscleGroup] = useState<string>("");
    const [categories, setCategories] = useState<CategoryFocus>("any");
    const [duration, setDuration] = useState<number>(35);
    const [selectedEquipment, setSelectedEquipment] = useState<AvailableEquipment[]>([]);
    const [resistancePreference, setResistancePreference] = useState<"balanced" | "freeweight" | "cable_machine" | "all">("balanced");
    const [state, setState] = useState<WorkoutState>({ workout: null, loading: false, error: null });

    const screen = state.workout && requestedScreen !== "setup"
        ? requestedScreen === "exercise" && Number.isInteger(requestedIndex) && state.workout.exercises[requestedIndex]
            ? "exercise" : "workout"
        : "setup";

    function openExercise(index: number, replace = false) {
        setSearchParams({ screen: "exercise", exercise: String(index) }, { replace });
    }

    useEffect(() => {
        document.querySelector<HTMLElement>("[data-screen-heading]")?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [screen, requestedIndex]);

    function toggleEquipment(option: AvailableEquipment, checked: boolean) {
        setSelectedEquipment((current) => {
            if (checked) {
                return current.includes(option) ? current : [...current, option];
            }
            return current.filter((equipment) => equipment !== option);
        });
    }

    function selectAllEquipment() {
        setSelectedEquipment(EQUIPMENT_OPTIONS.map((o) => o.value));
    }

    function clearAllEquipment() {
        setSelectedEquipment([]);
    }

    function selectGymPreset() {
        setSelectedEquipment(["dumbbell", "barbell", "cable", "machine", "body only"]);
    }

    async function handleBuildWorkout() {
        if (logger.log || swapping) return;
        setState({ workout: null, loading: true, error: null });
        try {
            const result = await presenter.buildWorkout(muscleGroup as MuscleGroup, duration, {
                categories,
                equipment: selectedEquipment,
                resistancePreference,
            });
            setState({ workout: result, loading: false, error: null });
            setSearchParams({ screen: "workout" });
        } catch (e: any) {
            setState({ workout: null, loading: false, error: e?.message || "Failed to generate workout. Please try again." });
        }
    }

    async function handleSwapExercise(index: number) {
        if (!state.workout || logger.log || swapping) return;
        setSwapping(true);
        try {
            const updatedWorkout = await presenter.swapExercise(state.workout, index, {
                equipment: selectedEquipment,
                resistancePreference,
            });
            setState((prev) => ({ ...prev, workout: updatedWorkout }));
        } catch (err) {
            setState(current => ({ ...current, error: err instanceof Error ? err.message : "Could not swap exercise. Please try again." }));
        } finally { setSwapping(false); }
    }

    function completeCircuit() {
        if (!state.workout || swapping || logger.busy) return;
        const updated = state.workout.completeExercise(requestedIndex);
        setState(current => ({ ...current, workout: updated }));
        const nextIndex = updated.nextIncompleteIndex(requestedIndex);
        if (nextIndex === null) {
            if (logger.log && !logger.finished) logger.finish();
            setSearchParams({ screen: "workout" }, { replace: true });
        } else {
            openExercise(nextIndex, true);
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full px-2 py-4">
            {screen === "setup" && <>
            {state.workout && <Button variant="ghost" className="self-start" onClick={() => setSearchParams({ screen: "workout" })}><ArrowLeft className="size-4" />Back to workout</Button>}
            {/* Workout Generator Options Form */}
            <Card className="shadow-md border-border/60">
                <CardHeader>
                    <CardTitle><h1 data-screen-heading tabIndex={-1} className="text-2xl font-bold flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" /> Build your workout
                    </h1></CardTitle>
                    <CardDescription>
                        Customize category and muscle focus, time, equipment availability, and resistance type.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {/* Muscle Group & Duration Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="muscle_group_select" className="font-semibold text-sm">
                                Muscle Group Focus
                            </Label>
                            <Select value={muscleGroup} onValueChange={(v) => setMuscleGroup(v as MuscleGroup)}>
                                <SelectTrigger id="muscle_group_select" className="w-full">
                                    <SelectValue placeholder="Select Muscle Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="push">Push (Chest, Triceps, Forearms)</SelectItem>
                                        <SelectItem value="pull">Pull (Biceps, Lats, Back, Traps)</SelectItem>
                                        <SelectItem value="legs">Legs (Quads, Hamstrings, Glutes, Calves)</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="duration_select" className="font-semibold text-sm">
                                    Workout Duration
                                </Label>
                                <span className="text-sm font-semibold text-primary">{duration} min</span>
                            </div>
                            <Slider
                                id="duration_select"
                                value={[duration]}
                                max={70}
                                min={20}
                                step={5}
                                onValueChange={(value) => setDuration(value[0] ?? 20)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Generates ~{Math.round(duration / 7.5)} exercises (7.5 min / exercise)
                            </p>
                        </div>
                    </div>

                    <CategorySelector value={categories} onChange={setCategories} />

                    {/* Resistance Distribution Preference */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                        <Label htmlFor="resistance_select" className="font-semibold text-sm flex items-center gap-1.5">
                            <Sliders className="h-4 w-4 text-primary" /> Resistance Balance
                        </Label>
                        <Select
                            value={resistancePreference}
                            onValueChange={(v) => setResistancePreference(v as any)}
                        >
                            <SelectTrigger id="resistance_select" className="w-full">
                                <SelectValue placeholder="Select Resistance Distribution" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="balanced">
                                        Balanced (50% Free Weights / 50% Cables & Machines)
                                    </SelectItem>
                                    <SelectItem value="freeweight">Free Weights & Bodyweight Only</SelectItem>
                                    <SelectItem value="cable_machine">Cables & Machines Only</SelectItem>
                                    <SelectItem value="all">Any Available Equipment</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Equipment Filter & Presets */}
                    <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Label className="font-semibold text-sm">Available Gym Equipment</Label>
                            <div className="flex flex-wrap gap-1.5 text-xs">
                                <button
                                    type="button"
                                    onClick={selectGymPreset}
                                    className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                                >
                                    Standard Gym
                                </button>
                                <button
                                    type="button"
                                    onClick={selectAllEquipment}
                                    className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllEquipment}
                                    className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <fieldset className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-muted/30 p-3.5 rounded-lg border border-border/40">
                            {EQUIPMENT_OPTIONS.map((option) => (
                                <div key={option.value ?? "none"} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`equipment-${option.value ?? "none"}`}
                                        checked={selectedEquipment.includes(option.value)}
                                        onCheckedChange={(checked) => toggleEquipment(option.value, checked === true)}
                                    />
                                    <Label htmlFor={`equipment-${option.value ?? "none"}`} className="font-normal text-xs cursor-pointer select-none">
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </fieldset>
                    </div>

                    <Button
                        disabled={state.loading || swapping || !!logger.log || !muscleGroup}
                        className="w-full h-12 font-semibold"
                        onClick={handleBuildWorkout}
                    >
                        {state.loading ? "Generating Workout..." : "Generate Workout"}
                    </Button>
                </CardContent>
            </Card>

            </>}

            {state.error && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="p-4">
                        <p role="alert" className="text-destructive font-medium text-center">{state.error}</p>
                    </CardContent>
                </Card>
            )}

            {screen === "workout" && state.workout && <>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Your plan, one circuit at a time.</p>
                    <Button variant="outline" disabled={!!logger.log || logger.busy} onClick={() => setSearchParams({ screen: "setup" })}>Edit setup</Button>
                </div>
                <WorkoutOverview workout={state.workout} onOpenExercise={openExercise} />
                <WorkoutLogger workout={state.workout} controller={logger} workoutChanging={swapping || state.loading} />
                <details className="rounded-xl border bg-card p-4"><summary className="cursor-pointer font-medium">Workout history</summary>
                    <div className="pt-4"><WorkoutHistory history={logger.history} /></div>
                </details>
            </>}
            {screen === "exercise" && state.workout && <WorkoutExercise workout={state.workout} index={requestedIndex}
                logger={logger} swapping={swapping} onBack={() => setSearchParams({ screen: "workout" })}
                onComplete={completeCircuit} onSwap={() => handleSwapExercise(requestedIndex)} />}
        </div>
    );
}
