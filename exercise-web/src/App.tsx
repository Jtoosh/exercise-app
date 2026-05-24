import "./index.css";

import { ExerciseFetch } from "./view/ExerciseFetch";
import { Homepage } from "./view/HomePage";
import Layout from "./view/Layout";

export function App() {
  return (
    <div>
     <Layout children={Homepage()}></Layout> 
    </div>
  );
}

export default App;
