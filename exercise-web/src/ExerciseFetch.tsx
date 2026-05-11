import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
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
import { Button } from "./components/ui/button";

export function ExerciseFetch() {
  const [muscleGroup, setMuscleGroup] = useState("");

  const getExerciseByMuscle = async (muscle: String): Promise<String> => {
    const results = await fetch('https://api.api-ninjas.com/v1/exercises?muscle=biceps', {
        headers: {
            'X-Api-Key': 'g4o0QGdpeUHCVf3nipKZFN0jOd8E18Nyc3ddi4ZY'
        }
    });
    return results.json()
  }

  return (
    <Card className="flex justify-center">
      <CardHeader>
        <CardTitle>Fetch an Exercise</CardTitle>
        <CardDescription>Specify a Muscle group and hit the button to </CardDescription>
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

        <Button className="m-4" onClick={() => getExerciseByMuscle(muscleGroup)}>Get Workout</Button>
      </CardContent>
    </Card>
  );
}
