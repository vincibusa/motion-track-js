// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroSection from "./HeroSection";
import MotionTrackerRight from "./MotionTrackerRight";
import MotionTrackerLeft from "./MotionTrackerLeft";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/right" element={<MotionTrackerRight />} />
        <Route path="/left" element={<MotionTrackerLeft />} />
      </Routes>
    </Router>
  );
}

export default App;