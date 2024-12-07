// components/NavigationButton.jsx
import React from 'react';
import { FaAngleLeft } from "react-icons/fa";

const NavigationButton = ({ onClick }) => (
  <button
    className="absolute top-4 left-4 text-white bg-gray-700 p-2 w-16 h-16 rounded-full z-50 flex items-center justify-center"
    onClick={onClick}
  >
    <FaAngleLeft size={24} />
  </button>
);

export default NavigationButton;