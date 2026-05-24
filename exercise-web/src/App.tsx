import "./index.css";

import { ExerciseFetch } from "./view/ExerciseFetch";
import { Homepage } from "./view/HomePage";

export function App() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      {/*<ExerciseFetch></ExerciseFetch>*/}
      <Homepage></Homepage>
    </div>
  );
}

export default App;
