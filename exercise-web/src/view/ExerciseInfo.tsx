import type {Exercise} from "@/lib/exercise.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";

interface Props{
    fetchedExercise: Exercise
}

export function ExerciseInfo(props:Props) {
    return (
        <Card className="flex justify-center">
            <CardHeader>
                <CardTitle>{props.fetchedExercise.name}</CardTitle>
                <CardDescription>{props.fetchedExercise.muscle + "\n" + props.fetchedExercise.equipments + "\n" + props.fetchedExercise.difficulty}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{props.fetchedExercise.instructions}</p>
            </CardContent>
        </Card>
    )
}