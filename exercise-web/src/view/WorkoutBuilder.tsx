import type {MuscleGroup} from "@/lib/workout.ts";
import {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

export function WorkoutBuilder(){
    const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("")

    return (
        <Card className="flex justify-center">
            <CardHeader>
                <CardTitle>Generate a Workout</CardTitle>
                <CardDescription>Specify a Muscle group and a duration to create a workout.</CardDescription>
            </CardHeader>
            <CardContent>


                <Button className="m-4 text-heading bg-linear-to-r from-teal-200 to-lime-200 hover:bg-linear-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-full text-sm px-4 py-2.5 text-center leading-5" onClick={() => getExerciseByMuscle(muscleGroup)}>Get Workout</Button>
            </CardContent>
        </Card>
    );


}