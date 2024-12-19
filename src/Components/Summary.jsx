// Summary.jsx
import React from 'react';
import { FaChartLine } from "react-icons/fa";

const Summary = ({ maxFlexion, classifyFlexion, name }) => (
  <div className="bg-gray-700 rounded-lg p-4">
    <h3 className="text-white text-lg font-bold mb-3 flex items-center">
      <FaChartLine className="mr-2 text-yellow-400" />
      Summary
    </h3>
    <div className="text-white space-y-2">
      <p className="flex justify-between">
        <span>{name}</span>
        <span className="font-bold">{Math.round(maxFlexion)}°</span>
      </p>
      <p className="flex justify-between">
        <span>Classification:</span>
        <span className="font-bold">{classifyFlexion(maxFlexion)}</span>
      </p>
    </div>
  </div>
);

export default Summary;