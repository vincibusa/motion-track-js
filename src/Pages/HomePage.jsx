import React from "react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.png";
import { Link } from "react-router-dom";

const HomePage = () => {
  const cards = [
    {
      id: 1,
      title: "Test Mobilità",
      image: "https://i.ibb.co/ZSz7pGN/IMG-6131.png",
      description: "Explore mobility testing solutions and enhance your movement capabilities.",
      route: "/mobility-test"
    },
    {
      id: 2,
      title: "Test Esercizi",
      image: "https://i.ibb.co/VN2trNq/IMG-6130.png",
      description: "Discover comprehensive exercise tests tailored to your fitness goals.",
      route: "/exercise-test"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Aggiunta di un leggero sfondo animato */}
      <div className="absolute inset-0 bg-gradient-to-tl from-white via-sky-300 to-blue-500 animate-gradient bg-[length:400%_400%] opacity-10"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <img
            src={Logo}
            alt="Company Logo"
            className="h-24 mx-auto mb-8 rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80x80?text=Logo";
            }}
          />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-gray-800 mb-4"
          >
            Benvenuto
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => (
            <Link key={card.id} to={card.route}>
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none"
                tabIndex={0}
                role="button"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    console.log(`${card.title} card clicked`);
                  }
                }}
                onClick={() => console.log(`${card.title} card clicked`)}
              >
                {/* Contenitore immagine 16:9 */}
                <div className="w-full aspect-w-16 aspect-h-9">
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
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h2>
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
