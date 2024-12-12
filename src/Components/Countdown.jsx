// Countdown.jsx
import React from 'react';

const Countdown = ({ countdown }) => (
  <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">
    Starting in: {countdown} seconds
  </div>
);

export default Countdown;