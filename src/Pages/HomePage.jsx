import React from "react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.png"
import { Link } from "react-router-dom"; // Importa il Link di React Router

const HomePage = () => {
    const cards = [
        {
          id: 1,
          title: "Test Mobilità",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
          description: "Explore mobility testing solutions and enhance your movement capabilities.",
          route: "/mobility-test" // Definisci il percorso della navigazione
        },
        {
          id: 2,
          title: "Test Esercizi",
          image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
          description: "Discover comprehensive exercise tests tailored to your fitness goals.",
          route: "/exercise-test" // Definisci il percorso della navigazione
        }
      ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <img
            src={Logo}
            alt="Company Logo"
            className="h-20 mx-auto mb-8 rounded-lg shadow-md"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80x80?text=Logo";
            }}
          />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-white mb-4"
          >
            Benvenuto
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => (
              <Link
              key={card.id}
              to={card.route} // Usa il Link per la navigazione
            
            >
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700 rounded-xl shadow-lg overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500 focus-within:outline-none"
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  console.log(`${card.title} card clicked`);
                }
              }}
              onClick={() => console.log(`${card.title} card clicked`)}
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={card.image}
                  alt={`${card.title} illustration`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x450?text=Image+Not+Found";
                  }}
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{card.title}</h2>
                <p className="text-gray-300">{card.description}</p>
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