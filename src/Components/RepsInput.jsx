// components/RepsInput.jsx
import React from 'react';

const RepsInput = ({ target, setTarget, onConfirm }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-white text-xl mb-4 text-center">
      Quante ripetizioni vuoi fare?
    </h2>
    <div className="flex flex-col items-center space-y-4">
      <input
        type="number"
        min="1"
        max="50"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="w-20 px-3 py-2 text-center text-lg rounded bg-gray-700 text-white"
      />
      <button
        onClick={onConfirm}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Conferma
      </button>
    </div>
  </div>
);

export default RepsInput;