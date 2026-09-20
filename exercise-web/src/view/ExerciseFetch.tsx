import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../components/ui/button";
import  { Exercise } from "../lib/exercise";
import {ExerciseInfo} from "@/view/ExerciseInfo";
import {ExerciseFetchPresenter} from "@/presenter/ExerciseFetchPresenter.ts";

export function ExerciseFetch() {
  const presenter = new ExerciseFetchPresenter()
  const [muscleGroup, setMuscleGroup] = useState("");
  const [fetchedExercise, setFetchedExercise] = useState<Exercise | null>(null)

  const getExerciseByMuscle = async (muscle: String): Promise<void> => {
    const exercise = await presenter.getExerciseByMuscle(muscle);
    setFetchedExercise(exercise!)
  }

  return (
    <Card className="flex justify-center">
      <CardHeader>
        <CardTitle>Fetch an Exercise</CardTitle>
        <CardDescription>Specify a Muscle group and hit the button to retrieve an exercise.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={muscleGroup} onValueChange={setMuscleGroup}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Muscle Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="SelectLabel">Upper Body</SelectLabel>
              <SelectItem value="biceps">Biceps</SelectItem>
              <SelectItem value="triceps">Triceps</SelectItem>
              <SelectItem value="chest">Chest</SelectItem>
              <SelectItem value="lats">Lats</SelectItem>
              <SelectItem value="traps">Traps</SelectItem>
            </SelectGroup>

            <SelectSeparator></SelectSeparator>

            <SelectGroup>
              <SelectLabel className="SelectLabel">Lower Body</SelectLabel>
              <SelectItem value="quadriceps">Quads</SelectItem>
              <SelectItem value="hamstrings">Hamstrings</SelectItem>
              <SelectItem value="glutes">Glutes</SelectItem>
              <SelectItem value="calves">Calves</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button className="my-4 sm:mx-4" onClick={() => getExerciseByMuscle(muscleGroup)}>Get Workout</Button>
        <ExerciseInfo fetchedExercise={fetchedExercise}></ExerciseInfo>
      </CardContent>
    </Card>
  );
}
