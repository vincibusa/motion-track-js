import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo.png"; // Assicurati che il logo sia nella directory corretta

const HomePage = () => {
  const cards = [
    {
      id: 1,
      title: "Test Mobilità Articolare",
      image: "https://i.ibb.co/ZSz7pGN/IMG-6131.png",
      description: "Esplora soluzioni di test per la mobilità articolare e migliora le tue capacità motorie.",
      route: "/mobility-test"
    },
    {
      id: 2,
      title: "Test Esercizi di Riabilitazione",
      image: "https://i.ibb.co/8Djz50J/DALL-E-2024-12-03-17-36-13-A-cartoon-style-illustration-of-an-elderly-woman-exercising-in-her-garden.webp",
      description: "Scopri test completi per esercizi di riabilitazione, ottimizzati per i tuoi obiettivi di benessere fisico.",
      route: "/exercise-test"
    },
    {
      id: 3,
      title: "Valutazione Forza Muscolare",
      image: "https://i.ibb.co/3mfBqVM/DALL-E-2024-12-03-17-37-39-A-cartoon-style-illustration-of-a-football-player-doing-rehabilitation-ex.jpg",
      description: "Valuta la tua forza fisica per capire il grado d'efficienza della tua muscolatura.",
      route: "/strength-evaluation"
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Sfondo dinamico con gradiente animato */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-turquoise to-green animate-gradient"></div>

      {/* Contenuto sopra lo sfondo */}
      <div className="relative z-10 min-h-screen flex flex-col items-center">
        {/* Logo */}
        <div className="absolute top-4 left-4">
          <img
            src={Logo}
            alt="Logo della Startup"
            className="h-16"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80x80?text=Logo"; // Logo di fallback
            }}
          />
        </div>

        {/* Messaggio di benvenuto */}
        <div className="text-center mt-16 mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-extrabold text-white"
          >
            Benvenuto su Selfmotion
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-white mt-4"
          >
            Prova i nostri test interattivi e scopri come migliorare il tuo benessere fisico!
          </motion.p>
        </div>

        {/* Griglia delle cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
          {cards.map((card) => (
            <Link key={card.id} to={card.route}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {card.title}
                  </h2>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
