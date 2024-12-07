// TimerDisplay.jsx
import React from 'react';
import { FaStopwatch } from "react-icons/fa";

const TimerDisplay = ({ timer }) => (
  <div className="absolute top-4 right-4 text-white bg-gray-700 p-2 rounded-full flex items-center z-50">
    <FaStopwatch size={20} className="mr-2" />
    {timer}s
  </div>
);

export default TimerDisplay;