import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const MobilitaTest = () => {
  const cards = [
    {
      id: 1,
      title: "Flessione Spalla Sinistra",
      image: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?fit=crop&h=300",
      description: "Test per valutare la mobilità della spalla sinistra attraverso esercizi di flessione.",
      route: "/shoulder-left" // Definisci il percorso della navigazione
    },
    {
      id: 2,
      title: "Flessione Spalla Destra",
      image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?fit=crop&h=300",
      description: "Test per valutare la mobilità della spalla destra attraverso esercizi di flessione.",
      route: "/shoulder-right" // Definisci il percorso della navigazione
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-extrabold text-white mb-3"
          >
            Test Mobilità
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-300"
          >
            Seleziona il test di mobilità che desideri eseguire
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
                 <Link
                 key={card.id}
                 to={card.route} // Usa il Link per la navigazione
               
               >
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:outline-none"
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  console.log(`${card.title} test selected`);
                }
              }}
              onClick={() => console.log(`${card.title} test selected`)}
            >
              <div className="h-48">
                <img
                  src={card.image}
                  alt={`${card.title} illustration`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x300?text=Image+Not+Found";
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold text-white mb-2">{card.title}</h2>
                <p className="text-sm text-gray-300">{card.description}</p>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobilitaTest;