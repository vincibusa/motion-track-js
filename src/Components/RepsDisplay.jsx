// components/RepsDisplay.jsx
import React from 'react';

const RepsDisplay = ({ totalReps, targetReps }) => (
  <div className="absolute top-4 right-4 text-white bg-gray-700 p-2 w-16 h-16 rounded-full flex items-center justify-center z-50">
    {totalReps}/{targetReps}
  </div>
);

export default RepsDisplay;