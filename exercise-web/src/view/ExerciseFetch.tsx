import { CategorySelector } from "./CategorySelector";
import type { CategoryFocus } from "@/lib/exercise";
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
  const [categories, setCategories] = useState<CategoryFocus>("any");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [muscleGroup, setMuscleGroup] = useState("");
  const [fetchedExercise, setFetchedExercise] = useState<Exercise | null>(null)

  const getExerciseByMuscle = async (muscle: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setFetchedExercise(await presenter.getExerciseByMuscle(muscle, categories));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not fetch an exercise.");
    } finally { setLoading(false); }
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

        <CategorySelector value={categories} onChange={setCategories} />
        {error && <p role="alert">{error}</p>}
        <Button disabled={loading || !muscleGroup} className="my-4 sm:mx-4" onClick={() => getExerciseByMuscle(muscleGroup)}>{loading ? "Loading..." : "Get Exercise"}</Button>
        <ExerciseInfo fetchedExercise={fetchedExercise}></ExerciseInfo>
      </CardContent>
    </Card>
  );
}
