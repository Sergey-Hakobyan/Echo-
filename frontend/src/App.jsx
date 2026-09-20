import { useState } from "react";
import HandTracker from "./components/HandTracker/HandTracker";
import Sphere from "./components/Sphere/Sphere";
import "./App.css";

function App() {
  const [openness, setOpenness] = useState(0);

  return (
    <main className="app">
      <HandTracker
        onOpennessChange={setOpenness}
      />

      <Sphere openness={openness} />
    </main>
  );
}

export default App;