import React, { useEffect, useState } from "react";
import { FaHome, FaRedoAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Report = ({ flexionValue }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState(null); // Stato per il feedback selezionato
  const startDate = localStorage.getItem("startDate");
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  useEffect(() => {
    const savedMaxFlexion = localStorage.getItem("maxFlexion");
    if (savedMaxFlexion) {
      setMaxFlexion(parseFloat(savedMaxFlexion));
    }
  }, []);

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

  const submitFeedback = async () => {
    if (!selectedFeedback) return alert("Per favore, seleziona un feedback.");

    // Simulazione dell'invio del dato al database
    console.log("Feedback inviato:", selectedFeedback);

    // Reindirizzamento alla homepage dopo l'invio del feedback
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-300 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md transition-all duration-300 transform hover:shadow-xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
           {name}
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
                  {startDate ? new Date(startDate).toLocaleDateString("it-IT") : "N/A"}
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

          {/* Sezione Feedback */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Quanto dolore hai percepito durante l'esercizio?
            </h3>
            <div className="flex justify-around space-x-4">
              {[
                { emoji: "😄", label: "Nessun dolore", value: "Nessun dolore" },
                { emoji: "😐", label: "Dolore moderato", value: "Dolore moderato" },
                { emoji: "😢", label: "Molto dolore", value: "Molto dolore" }
              ].map((feedback) => (
                <div key={feedback.value} className="text-center">
                  <button
                    onClick={() => setSelectedFeedback(feedback.value)}
                    className={`text-5xl p-4 rounded-lg transition-all duration-300 ${
                      selectedFeedback === feedback.value
                        ? "scale-110 bg-blue-100 text-blue-600 shadow-lg"
                        : "hover:scale-105 hover:bg-blue-50 hover:text-blue-500"
                    }`}
                  >
                    {feedback.emoji}
                  </button>
                  <p className="text-sm mt-2 text-gray-700">{feedback.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pulsanti Azione */}
          <div className="flex justify-between mt-8 space-x-4">
            <button
              className="w-1/2 flex items-center justify-center bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 focus:outline-none"
              onClick={() => navigate(-1)}
            >
              <FaRedoAlt className="mr-2 w-4 h-4" />
              Riprova
            </button>

            <button
              className="w-1/2 flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 focus:outline-none"
              onClick={submitFeedback}
            >
              <FaHome className="mr-2 w-4 h-4" />
              Invia Feedback e Torna alla Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
