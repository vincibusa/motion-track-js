// components/StartButton.jsx
import React from 'react';
import { BsPlayCircleFill } from 'react-icons/bs';

const StartButton = ({ onStart }) => (
  <button
    onClick={onStart}
    className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600"
  >
    <BsPlayCircleFill className="text-white text-4xl" />
  </button>
);

export default StartButton;