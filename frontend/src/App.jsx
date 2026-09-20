import { useState } from "react";

import HandTracker from "./components/HandTracker/HandTracker";
import Sphere from "./components/Sphere/Sphere";

import "./App.css";

function App() {
  const [openness, setOpenness] = useState(0);
  const [rotation, setRotation] = useState(0);

  return (
    <main className="app">
      <HandTracker
        onOpennessChange={setOpenness}
        onRotationChange={setRotation}
      />

      <Sphere
        openness={openness}
        rotation={rotation}
      />
    </main>
  );
}

export default App;