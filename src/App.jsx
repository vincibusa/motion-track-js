// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'; // O il percorso corretto del tuo file CSS
import HomePage from "./Pages/HomePage";
import MobilitaTest from "./Pages/MobilitaTest";
import ExerciseTest from "./Pages/ExerciseTest";
import Report from "./Components/Report";
import StrengthEvaluation from "./Pages/StrengthEvaluation";
import ReportExercise from "./Components/ReportExercise";
import KneeFlexion from "./Pages/KneeFlexion/KneeFlexion";
import ShoulderFlexion from "./Pages/ShoulderFlexion/ShoulderFlexion"
import Squat from "./Pages/Squat/Squat";
import BicepCurl from "./Pages/BicepCurl/BicepCurl";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/mobility-test" element={<MobilitaTest/>} />
        <Route path="/exercise-test" element={<ExerciseTest/>} />
        <Route path="/strength-evaluation" element={<StrengthEvaluation/>} />
        <Route path="/shoulder-right" element={<ShoulderFlexion side="right" />} />
        <Route path="/shoulder-left" element={<ShoulderFlexion side="left" />} />
        <Route path="/knee-left" element={<KneeFlexion side="left"/>}/>
        <Route path="/knee-right" element={<KneeFlexion side="right"/>}/>
        <Route path="/report" element={<Report/>}/>
        <Route path="/report-exercise" element={<ReportExercise/>}/>
        <Route path="/squat" element={<Squat/>}/>
        <Route path ="/bicep-curl-right" element={<BicepCurl side="right"/>}/>
        <Route path ="/bicep-curl-left" element={<BicepCurl side="left"/>}/>
      </Routes>
    </Router>
  );
}

export default App;