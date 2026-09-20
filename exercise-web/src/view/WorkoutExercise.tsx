import type { Workout } from "@/lib/workout";
import type { WorkoutLogController } from "@/hooks/useWorkoutLog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ExerciseInfo } from "./ExerciseInfo";
import { ExerciseSetLogger } from "./ExerciseSetLogger";
import { WorkoutLogger } from "./WorkoutLogger";

export function WorkoutExercise({ workout, index, logger, swapping, onBack, onComplete, onSwap }: {
    workout: Workout; index: number; logger: WorkoutLogController; swapping: boolean;
    onBack: () => void; onComplete: () => void; onSwap: () => Promise<void>;
}) {
    const exercise = workout.exercises[index];
    if (!exercise) return null;
    const loggedExercise = logger.log?.exercises[index];
    return <section className="space-y-4" aria-label="Exercise detail">
        <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={onBack}><ArrowLeft className="size-4" />Workout list</Button>
            <span className="text-sm text-muted-foreground">Circuit {index + 1} of {workout.exercises.length}</span>
        </div>
        <h1 data-screen-heading tabIndex={-1} className="text-2xl font-semibold tracking-tight">{exercise.name}</h1>
        {!logger.log && <WorkoutLogger workout={workout} controller={logger} workoutChanging={swapping} />}
        <ExerciseInfo key={`${exercise.id}-${index}`} fetchedExercise={exercise} exerciseIndex={index}
            isCompleted={workout.isCompleted(index)} onSwap={!logger.log && !swapping ? onSwap : undefined}
            logging={loggedExercise && <ExerciseSetLogger exercise={loggedExercise} equipment={exercise.equipment}
                disabled={logger.busy} onChange={sets => logger.updateSets(index, sets)} />} />
        <div className="sticky bottom-0 z-10 rounded-xl border bg-card/95 p-3 backdrop-blur space-y-2 shadow-sm">
            <Button className="w-full h-12" disabled={logger.busy || swapping} onClick={onComplete}>
                {workout.isCompleted(index) ? <>Continue to next circuit <ArrowRight className="size-4" /></>
                    : <><Check className="size-4" />Complete circuit</>}
            </Button>
            <p className="text-center text-xs text-muted-foreground">{workout.isCompleted(index) ? "This circuit is complete. You can still review your sets." : "Marks this exercise complete and opens the next unfinished circuit."}</p>
        </div>
    </section>;
}
