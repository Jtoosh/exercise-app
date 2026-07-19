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

export function WorkoutBuilder() {
    const [muscleGroup, setMuscleGroup] = useState<string>("")
    const [duration, setDuration] = useState<number>(35)
    const presenter = new WorkoutBuilderPresenter()

    return (
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

                <Button
                    className="m-4 text-heading bg-linear-to-r from-teal-200 to-lime-200 hover:bg-linear-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-full text-sm px-4 py-2.5 text-center leading-5"
                    onClick={() => presenter.buildWorkout(muscleGroup as MuscleGroup, duration)}>Get Workout</Button>
            </CardContent>
        </Card>
    );


}