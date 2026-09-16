import type {MuscleGroup} from "@/lib/workout.ts";
import {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {WorkoutBuilderPresenter} from "@/presenter/WorkoutBuilderPresenter.ts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {Slider} from "@/components/ui/slider"
import {Label} from "@/components/ui/label"
import type {Workout} from "@/lib/workout.ts";
import {ExerciseInfo} from "@/view/ExerciseInfo.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {type AvailableEquipment, EQUIPMENT_OPTIONS} from "@/lib/equipment.ts";

const presenter = new WorkoutBuilderPresenter()

interface WorkoutState {
    workout: Workout | null
    loading: boolean
    error: string | null
}

export function WorkoutBuilder() {
    const [muscleGroup, setMuscleGroup] = useState<string>("")
    const [duration, setDuration] = useState<number>(35)
    const [selectedEquipment, setSelectedEquipment] = useState<AvailableEquipment[]>([])
    const [state, setState] = useState<WorkoutState>({workout: null, loading: false, error: null})

    function toggleEquipment(option: AvailableEquipment, checked: boolean) {
        setSelectedEquipment((current) => {
            if (checked) {
                return current.includes(option) ? current : [...current, option]
            }

            return current.filter((equipment) => equipment !== option)
        })
    }

    async function handleBuildWorkout() {
        setState({workout: null, loading: true, error: null})
        try {
            const result = await presenter.buildWorkout(muscleGroup as MuscleGroup, duration)
            setState({workout: result, loading: false, error: null})
        } catch (e) {
            setState({workout: null, loading: false, error: "Failed to generate workout. Please try again."})
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card className="flex justify-center">
                <CardHeader>
                    <CardTitle>Generate a Workout</CardTitle>
                    <CardDescription>Specify a Muscle group and a duration to create a workout.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={muscleGroup} onValueChange={(v) => setMuscleGroup(v as MuscleGroup)}>
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="Muscle Group"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="push">Push</SelectItem>
                                <SelectItem value="pull">Pull</SelectItem>
                                <SelectItem value="legs">Legs</SelectItem>

                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <div className="grid w-full max-w-50 gap-3">
                        <div className="flex items-center justify-between gap-2">
                            <Label htmlFor={"duration_select"}>Duration</Label>
                            <span className="text-sm text-muted-foreground">{duration} min</span>
                        </div>

                        <Slider id={"duration_select"} value={[duration]} max={70} min={20} step={5} onValueChange={(value) => setDuration(value[0] ?? 20)}/>

                    </div>

                    <fieldset className="grid w-full max-w-80 gap-2 mt-4">
                        <legend className="text-sm font-medium mb-1">Available equipment</legend>
                        {EQUIPMENT_OPTIONS.map((option) => (
                            <div key={option.value ?? "none"} className="flex items-center gap-2">
                                <Checkbox
                                    id={`equipment-${option.value ?? "none"}`}
                                    checked={selectedEquipment.includes(option.value)}
                                    onCheckedChange={(checked) => toggleEquipment(option.value, checked === true)}
                                />
                                <Label htmlFor={`equipment-${option.value ?? "none"}`} className="font-normal">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </fieldset>

                    <Button
                        disabled={state.loading || !muscleGroup}
                        className="m-4 text-heading bg-linear-to-r from-teal-200 to-lime-200 hover:bg-linear-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-full text-sm px-4 py-2.5 text-center leading-5"
                        onClick={handleBuildWorkout}>
                        {state.loading ? "Generating..." : "Get Workout"}
                    </Button>
                </CardContent>
            </Card>

            {state.error && (
                <Card className="flex justify-center border-destructive">
                    <CardContent>
                        <p className="text-destructive">{state.error}</p>
                    </CardContent>
                </Card>
            )}

            {state.workout && (
                <Card className="flex justify-center">
                    <CardHeader>
                        <CardTitle>Generated Workout</CardTitle>
                        <CardDescription>
                            {"Type: " + state.workout.type + "\nFocus: " + (typeof state.workout.focus === "string" ? state.workout.focus : state.workout.focus.join(", ")) + "\nDuration: " + state.workout.duration + " min"}
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {state.workout && state.workout.exercises.map((exercise, index) => (
                <ExerciseInfo key={index} fetchedExercise={exercise}/>
            ))}
        </div>
    );


}
