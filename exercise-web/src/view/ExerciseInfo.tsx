import type {Exercise} from "@/lib/exercise.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {ChevronDown, ChevronUp} from "lucide-react";
import {useState} from "react";

interface Props {
    fetchedExercise: Exercise | null
}

export function ExerciseInfo(props: Props) {
    const [open, setOpen] = useState(false)

    return (
        <Card className="flex justify-center whitespace-pre-wrap">
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger className="w-full">
                    <CardHeader>
                        <div className="flex items-center justify-between w-full">
                            <div className="text-left flex-1 min-w-0">
                                <CardTitle>{props.fetchedExercise?.name ?? ""}</CardTitle>
                                <CardDescription>{"Equipment: " + (props.fetchedExercise?.equipments ?? "") + "\nType: " + (props.fetchedExercise?.type ?? "") + "\nDifficulty: " + (props.fetchedExercise?.difficulty ?? "")}</CardDescription>
                            </div>
                            {open ? <ChevronUp className="h-5 w-5 shrink-0"/> : <ChevronDown className="h-5 w-5 shrink-0"/>}
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent>
                        <p>{"Instructions: " + props.fetchedExercise?.instructions + "\n\nOther safety info: " + props.fetchedExercise?.safety_info}</p>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>

        </Card>
    )
}
