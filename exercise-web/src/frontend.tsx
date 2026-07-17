/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { BrowserRouter, Routes, Route } from "react-router";
import { ExerciseFetch } from "./view/ExerciseFetch";
import {WorkoutBuilder} from "@/view/WorkoutBuilder.tsx";
// import {WorkoutBuilder} from "@/view/WorkoutBuilder.tsx";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter basename="/exercise-app">
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/buildWorkout" element={<WorkoutBuilder/>} />
          <Route path="/fetchExercise" element= {<ExerciseFetch></ExerciseFetch>} />
          {/*<Route path="/buildWorkout" element={<WorkoutBuilder></WorkoutBuilder>}></Route>*/}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
