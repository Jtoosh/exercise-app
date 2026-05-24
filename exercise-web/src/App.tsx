import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { ExerciseFetch } from "./ExerciseFetch";

export function App() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <ExerciseFetch></ExerciseFetch>
    </div>
  );
}

export default App;
