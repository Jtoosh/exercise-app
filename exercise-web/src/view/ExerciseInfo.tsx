import type {Exercise} from "@/lib/exercise.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";

interface Props{
    fetchedExercise: Exercise
}

export function ExerciseInfo(props:Props) {
    return (
        <Card className="flex justify-center whitespace-pre-wrap">
            <CardHeader>
                <CardTitle>{props.fetchedExercise.name}</CardTitle>
                <CardDescription>{ "Equipment: " + props.fetchedExercise.equipments + "\nType: " + props.fetchedExercise.type + "\nDifficulty: " +  props.fetchedExercise.difficulty}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{"Instructions: " +props.fetchedExercise.instructions + "\n\nOther safety info: " + props.fetchedExercise.safety_info}</p>
            </CardContent>
        </Card>
    )
}