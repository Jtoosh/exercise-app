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

export function ExerciseFetch() {
  const [muscleGroup, setMuscleGroup] = useState("");
  const [fetchedExercise, setFetchedExercise] = useState<Exercise>(new Exercise("", "","", "", "", [], ""))

  const getExerciseByMuscle = async (muscle: String): Promise<Exercise> => {
    const results = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`, {
        headers: {
            'X-Api-Key': 'g4o0QGdpeUHCVf3nipKZFN0jOd8E18Nyc3ddi4ZY'
      }
    });
    const data = await results.json() as Exercise[];
    setFetchedExercise(data[0]!)
    return data[0]!
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

        <Button className="m-4 text-heading bg-linear-to-r from-teal-200 to-lime-200 hover:bg-linear-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-full text-sm px-4 py-2.5 text-center leading-5" onClick={() => getExerciseByMuscle(muscleGroup)}>Get Workout</Button>
        <ExerciseInfo fetchedExercise={fetchedExercise}></ExerciseInfo>
      </CardContent>
    </Card>
  );
}
