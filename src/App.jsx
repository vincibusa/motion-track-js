// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ShoulderFlexionLeft from "./Components/ShoulderFlexionLeft";
import ShoulderFlexionRight from "./Components/ShoulderFlexionRight";
import HomePage from "./Pages/HomePage";
import MobilitaTest from "./Pages/MobilitaTest";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/mobility-test" element={<MobilitaTest/>} />
        <Route path="/shoulder-right" element={<ShoulderFlexionRight />} />
        <Route path="/shoulder-left" element={<ShoulderFlexionLeft />} />
      </Routes>
    </Router>
  );
}

export default App;