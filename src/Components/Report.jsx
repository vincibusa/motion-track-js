import React, { useEffect, useState } from "react";
import { FaHome, FaRedoAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Report = ({ flexionValue }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [maxFlexion, setMaxFlexion] = useState(0); // Valore iniziale
  const startDate = localStorage.getItem("startDate");
  const navigate = useNavigate();

  useEffect(() => {
    const savedMaxFlexion = localStorage.getItem("maxFlexion");
    if (savedMaxFlexion) {
      const parsedMaxFlexion = parseFloat(savedMaxFlexion); // Converti in numero
      setMaxFlexion(parsedMaxFlexion); // Aggiorna lo stato locale
    }
  }, []);

  const convertToItalianDate = (isoDate) => {
    const date = new Date(isoDate); // Converte la stringa ISO in un oggetto Date
    const day = date.getDate().toString().padStart(2, "0"); // Giorno con zero iniziale
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mese con zero iniziale
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-300 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md transition-all duration-300 transform hover:shadow-xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Report di Flessione della Spalla
          </h2>

          <div
            className={`relative bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl p-6 transition-all duration-300 ${isAnimating ? "scale-105" : "scale-100"}`}
            role="region"
            aria-label="Maximum flexion measurement"
          >
            <div className="flex items-center justify-center">
              <span className="text-5xl font-bold text-blue-800">
                {Math.round(maxFlexion)}°
              </span>
            </div>
            <p className="text-gray-600 mt-2">Massima flessione raggiunta</p>
          </div>

          <div className="bg-gray-200 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Dettagli della Sessione
            </h3>
            <div className="space-y-2 text-left">
              <p className="text-gray-600 flex justify-between">
                <span>Data</span>
                <span className="font-medium">
                  {startDate ? convertToItalianDate(startDate) : "N/A"}
                </span>
              </p>
              <p className="text-gray-600 flex justify-between">
                <span>Durata</span>
                <span className="font-medium">10 secondi</span>
              </p>
              <p className="text-gray-600 flex justify-between">
                <span>Classificazione</span>
                <span className="font-medium text-blue-700">
                  {classifyFlexion(maxFlexion)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            {/* Pulsante per tornare alla homepage */}
            <button
              className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => navigate("/")}
            >
              <FaHome className="mr-2" />
              Torna alla Home
            </button>

            {/* Pulsante per riprovare l'esercizio (torna alla pagina precedente) */}
            <button
              className="flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => navigate(-1)}
            >
              <FaRedoAlt className="mr-2" />
              Riprova
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
