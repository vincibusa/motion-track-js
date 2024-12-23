/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { FaHome, FaRedoAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetKneeReps } from '../redux/slices/kneeRepsSlice';
import { resetReps } from "../redux/slices/repsSlice";
import { resetSquatReps } from "../redux/slices/squatRepsSlice";

const ReportExercise = ({ flexionValue }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState(null); 
  const [textFeedback, setTextFeedback] = useState('');

  const [repsList, setRepsList] = useState([]); // <--- Stato per l’array di ripetizioni

  const startDate = localStorage.getItem("startDate");
  const totalReps = localStorage.getItem("totalReps");
  const validReps = localStorage.getItem("validReps");
  const invalidReps = localStorage.getItem("invalidReps");
  const name = localStorage.getItem("name");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Carichiamo il maxFlexion salvato
  useEffect(() => {
    const savedMaxFlexion = localStorage.getItem("maxFlexion");
    if (savedMaxFlexion) {
      setMaxFlexion(parseFloat(savedMaxFlexion));
    }
  }, []);

  // Carichiamo l’array di ripetizioni da localStorage
  useEffect(() => {
    const repsJSON = localStorage.getItem('reps');
    if (repsJSON) {
      try {
        const parsedReps = JSON.parse(repsJSON);
        setRepsList(parsedReps);
      } catch (error) {
        console.error('Errore nel parsing di reps da localStorage:', error);
      }
    }
  }, []);

  // Effetto di animazione per la card
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [flexionValue]);

  // Invia il feedback e torna alla home
  const submitFeedback = async () => {
    if (!selectedFeedback) {
      return alert("Per favore, seleziona un feedback.");
    }
    console.log("Feedback inviato:", {
      painLevel: selectedFeedback,
      comments: textFeedback
    });
    navigate("/");
  };

  const handleRestart = () => {
    navigate(-1);
    dispatch(resetKneeReps());
    dispatch(resetReps());
    dispatch(resetSquatReps());
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-300 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md transition-all duration-300 transform hover:shadow-xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {name}
          </h2>

          <div
            className={`relative bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl p-6 transition-all duration-300 ${
              isAnimating ? "scale-105" : "scale-100"
            }`}
            role="region"
            aria-label="Maximum flexion measurement"
          >
            <div className="flex items-center justify-center">
              <span className="text-5xl font-bold text-blue-800">
                {totalReps}
              </span>
            </div>
            <p className="text-gray-600 mt-2">Numero totali di ripetizioni</p>
          </div>

          {/* Box dettagli sessione */}
          <div className="bg-gray-200 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Dettagli della Sessione
            </h3>
            <div className="space-y-2 text-left">
              <p className="text-gray-600 flex justify-between">
                <span>Data</span>
                <span className="font-medium">
                  {startDate
                    ? new Date(startDate).toLocaleDateString("it-IT")
                    : "N/A"}
                </span>
              </p>
              <p className="text-gray-600 flex justify-between">
                <span>Ripetizioni valide</span>
                <span className="font-medium text-green-700">{validReps}</span>
              </p>
              <p className="text-gray-600 flex justify-between">
                <span>Ripetizioni non valide</span>
                <span className="font-medium text-red-700">{invalidReps}</span>
              </p>
            </div>

            {/* Elenco delle singole reps */}
            <h4 className="text-md font-semibold text-gray-800 mt-5">
              Dettaglio Ripetizioni
            </h4>
            <ul className="mt-2 space-y-3">
              {repsList.map((rep, index) => {
                const isValid = rep.isValid;
                const reasons = rep.reasons || [];
                const timestamp = rep.timestamp;

                return (
                  <li
                    key={index}
                    className={`p-3 border rounded-md shadow-sm ${
                      isValid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="font-semibold">
                      Rep #{index + 1}:{" "}
                      {isValid ? (
                        <span className="text-green-800">Valida</span>
                      ) : (
                        <span className="text-red-800">Non valida</span>
                      )}
                    </div>

                    {/* Mostra i motivi di fault, se presenti */}
                    {reasons.length > 0 && (
                      <ul className="ml-4 list-disc mt-2 text-gray-700">
                        {reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    )}

                    {/* Timestamp o altro info */}
                    <div className="text-xs text-gray-500 mt-2">
                      Timestamp:{" "}
                      {timestamp
                        ? new Date(timestamp).toLocaleString()
                        : "N/A"}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sezione Feedback aggiuntivo */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Quanto dolore hai percepito durante l'esercizio?
            </h3>
            <div className="flex justify-around space-x-4">
              {[
                { emoji: "😄", label: "Nessun dolore", value: "Nessun dolore" },
                { emoji: "😐", label: "Dolore moderato", value: "Dolore moderato" },
                { emoji: "😢", label: "Molto dolore", value: "Molto dolore" },
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

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2 text-left">
                Vuoi aggiungere altri commenti?
              </h3>
              <textarea
                value={textFeedback}
                onChange={(e) => setTextFeedback(e.target.value)}
                placeholder="Scrivi qui i tuoi commenti..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none h-32 text-gray-700"
                maxLength={500}
              />
              <p className="text-right text-sm text-gray-500 mt-1">
                {textFeedback.length}/500 caratteri
              </p>
            </div>
          </div>

          {/* Pulsanti di azione */}
          <div className="flex justify-between mt-8 space-x-4">
            <button
              className="w-1/2 flex items-center justify-center bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 focus:outline-none"
              onClick={handleRestart}
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

export default ReportExercise;
