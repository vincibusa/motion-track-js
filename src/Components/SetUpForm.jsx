import { useState } from "react";

const SetupForm = ({ onSubmit }) => {
  const [reps, setReps] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reps > 0) {
      onSubmit(parseInt(reps));
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-white text-xl mb-4">Configurazione Esercizio</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-white block mb-2">
            Numero di ripetizioni:
          </label>
          <input
            type="number"
            min="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Inizia
        </button>
      </form>
    </div>
  );
};

export default SetupForm;