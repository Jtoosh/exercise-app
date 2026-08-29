import type { MuscleGroup } from "@/lib/workout.ts";
import { useState } from "react";
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
import { ExerciseInfo } from "@/view/ExerciseInfo.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { type AvailableEquipment, EQUIPMENT_OPTIONS } from "@/lib/equipment.ts";
import { Dumbbell, Sliders, CheckCircle2, RotateCcw } from "lucide-react";

const presenter = new WorkoutBuilderPresenter();

interface WorkoutState {
    workout: Workout | null;
    loading: boolean;
    error: string | null;
}

export function WorkoutBuilder() {
    const [muscleGroup, setMuscleGroup] = useState<string>("");
    const [duration, setDuration] = useState<number>(35);
    const [selectedEquipment, setSelectedEquipment] = useState<AvailableEquipment[]>([]);
    const [resistancePreference, setResistancePreference] = useState<"balanced" | "freeweight" | "cable_machine" | "all">("balanced");
    const [state, setState] = useState<WorkoutState>({ workout: null, loading: false, error: null });

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
        setState({ workout: null, loading: true, error: null });
        try {
            const result = await presenter.buildWorkout(muscleGroup as MuscleGroup, duration, {
                equipment: selectedEquipment,
                resistancePreference,
            });
            setState({ workout: result, loading: false, error: null });
        } catch (e: any) {
            setState({ workout: null, loading: false, error: e?.message || "Failed to generate workout. Please try again." });
        }
    }

    async function handleSwapExercise(index: number) {
        if (!state.workout) return;
        try {
            const updatedWorkout = await presenter.swapExercise(state.workout, index, {
                equipment: selectedEquipment,
                resistancePreference,
            });
            setState((prev) => ({ ...prev, workout: updatedWorkout }));
        } catch (err) {
            console.error("Failed to swap exercise:", err);
        }
    }

    function handleToggleCompleted(index: number) {
        if (!state.workout) return;
        const updated = state.workout.toggleCompleted(index);
        setState((prev) => ({ ...prev, workout: updated }));
    }

    const completedCount = state.workout ? state.workout.completedIndexes.size : 0;
    const totalCount = state.workout ? state.workout.exercises.length : 0;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full px-2 py-4">
            {/* Workout Generator Options Form */}
            <Card className="shadow-md border-border/60">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" /> Workout Generator
                    </CardTitle>
                    <CardDescription>
                        Customize muscle focus, time, equipment availability, and resistance type.
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

                    {/* Resistance Distribution Preference */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                        <Label htmlFor="resistance_select" className="font-semibold text-sm flex items-center gap-1.5">
                            <Sliders className="h-4 w-4 text-emerald-500" /> Resistance Balance
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
                        disabled={state.loading || !muscleGroup}
                        className="w-full text-heading bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                        onClick={handleBuildWorkout}
                    >
                        {state.loading ? "Generating Workout..." : "Generate Workout"}
                    </Button>
                </CardContent>
            </Card>

            {state.error && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="p-4">
                        <p className="text-destructive font-medium text-center">{state.error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Generated Workout Summary & Active Progress Tracker */}
            {state.workout && (
                <Card className="border-emerald-500/30 bg-emerald-950/10 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Active Workout
                                </CardTitle>
                                <CardDescription className="capitalize mt-1">
                                    Focus: <span className="font-semibold text-foreground">{typeof state.workout.focus === "string" ? state.workout.focus : state.workout.focus.join(", ")}</span> | Duration: <span className="font-semibold text-foreground">{state.workout.duration} min</span>
                                </CardDescription>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-emerald-500">
                                        {completedCount} / {totalCount} Done
                                    </span>
                                    <span className="text-xs text-muted-foreground">{progressPercent}% Completed</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBuildWorkout}
                                    className="gap-1 text-xs"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                                </Button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-emerald-500 h-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </CardHeader>
                </Card>
            )}

            {/* Exercise Cards */}
            {state.workout &&
                state.workout.exercises.map((exercise, index) => (
                    <ExerciseInfo
                        key={`${exercise.id || exercise.name}-${index}`}
                        exerciseIndex={index}
                        fetchedExercise={exercise}
                        isCompleted={state.workout?.isCompleted(index)}
                        onToggleCompleted={() => handleToggleCompleted(index)}
                        onSwap={() => handleSwapExercise(index)}
                    />
                ))}
        </div>
    );
}

