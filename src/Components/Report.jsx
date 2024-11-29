import React, { useEffect, useState } from "react";
import { FaAngleUp } from "react-icons/fa";

const Report = ({
  flexionValue,
  date,
  duration,
  classification,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [maxFlexion, setMaxFlexion] = useState(0); // Valore iniziale
  const startDate = localStorage.getItem('startDate');
  useEffect(() => {
    const savedMaxFlexion = localStorage.getItem('maxFlexion');
    if (savedMaxFlexion) {
      const parsedMaxFlexion = parseFloat(savedMaxFlexion); // Converti in numero
      setMaxFlexion(parsedMaxFlexion); // Aggiorna lo stato locale
 
    }
  }, []);
  const convertToItalianDate = (isoDate) => {
    const date = new Date(isoDate); // Converte la stringa ISO in un oggetto Date
    const day = date.getDate().toString().padStart(2, '0'); // Giorno con zero iniziale
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mese con zero iniziale
    const year = date.getFullYear(); // Anno
    return `${day}/${month}/${year}`; // Formato italiano
  };
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [flexionValue]);
  const classifyFlexion = (angle) => {
    if (angle >= 0 && angle <= 100) return "Scarsa mobilità";
    if (angle >= 101 && angle <= 130) return "Discreta";
    if (angle >= 150 && angle <= 170) return "Buona";
    if (angle > 170 && angle <= 180) return "Ottima";
    return "Invalido";
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-800 p-6 flex items-center justify-center">
      <div className="bg-gray-600 rounded-2xl shadow-lg p-8 w-full max-w-md transition-all duration-300 transform hover:shadow-xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Shoulder Flexion Report
          </h2>

          <div 
            className={`relative bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl p-6 transition-all duration-300 ${isAnimating ? "scale-105" : "scale-100"}`}
            role="region"
            aria-label="Maximum flexion measurement"
          >
            <div className="flex items-center justify-center ">
           
              <span className="text-4xl font-bold text-blue-700">
              {Math.round(maxFlexion)}°
              </span>
            </div>
            <p className="text-gray-700 mt-2">Maximum Flexion Achieved</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-medium text-white mb-2">Session Details</h3>
            <div className="space-y-2 text-left">
              <p className="text-gray-300 flex justify-between">
                <span>Date</span>
                <span className="font-medium">{convertToItalianDate(startDate) }</span>
              </p>
              <p className="text-gray-300 flex justify-between">
                <span>Duration</span>
                <span className="font-medium">10 seconds</span>
              </p>
              <p className="text-gray-300 flex justify-between">
                <span>Classification</span>
                <span className="font-medium text-green-400">{classifyFlexion(maxFlexion)}</span>
              </p>
            </div>
          </div>

          <div 
            className="mt-6 text-sm text-gray-300"
            role="status"
            aria-live="polite"
          >

          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
