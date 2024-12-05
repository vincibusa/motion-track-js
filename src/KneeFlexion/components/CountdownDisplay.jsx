// components/CountdownDisplay.jsx
import React from 'react';

const CountdownDisplay = ({ countdown }) => (
  <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">
    Inizio in: {countdown} secondi
  </div>
);

export default CountdownDisplay;