import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const StrengthEvaluation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Bottone per tornare indietro */}
        <motion.button
          onClick={() => navigate(-1)}
          className="bg-transparent text-blue-600 hover:text-blue-800 text-lg font-semibold mb-6 focus:outline-none"
        >
          &#8592; Torna indietro
        </motion.button>

        {/* Titolo e sottotitolo della pagina */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-gray-800 mb-3"
          >
            Valutazione Forza Muscolare
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 mb-8"
          >
            Scopri il livello della tua forza muscolare! Questa valutazione ti aiuterà a capire la tua efficienza fisica,
            utile sia per migliorare le prestazioni sportive che per il recupero dopo un infortunio.
          </motion.p>
        </div>

        {/* Card principale della valutazione */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none mx-auto max-w-xl"
        >
          {/* Immagine proporzionata a 16:9 */}
          <div className="w-full aspect-w-16 aspect-h-9">
            <img
              src="https://i.ibb.co/3mfBqVM/DALL-E-2024-12-03-17-37-39-A-cartoon-style-illustration-of-a-football-player-doing-rehabilitation-ex.jpg"
              alt="Valutazione Forza Muscolare"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x450?text=Image+Not+Found";
              }}
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Valutazione Forza Muscolare
            </h2>
            <p className="text-gray-600 mb-6">
              Questa valutazione ti fornirà una panoramica completa della tua forza muscolare, permettendoti di monitorare 
              i tuoi progressi nel tempo. Adatto sia per chi desidera migliorare la propria performance sportiva che per chi sta 
              affrontando un percorso di riabilitazione.
            </p>
            <Link
              to="/strength-evaluation-test"
              className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Inizia la Valutazione
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StrengthEvaluation;
