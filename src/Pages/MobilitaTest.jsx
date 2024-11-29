import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MobilitaTest = () => {
  const cards = [
    {
      id: 1,
      title: "Flessione Spalla Sinistra",
      image: "https://i.ibb.co/kDN2fqR/ecfba699-dde5-4e64-8275-56633873be66.jpg",
      description: "Test per valutare la mobilità della spalla sinistra attraverso esercizi di flessione.",
      route: "/shoulder-left",
    },
    {
      id: 2,
      title: "Flessione Spalla Destra",
      image: "https://i.ibb.co/kDN2fqR/ecfba699-dde5-4e64-8275-56633873be66.jpg",
      description: "Test per valutare la mobilità della spalla destra attraverso esercizi di flessione.",
      route: "/shoulder-right",
    },
    {
      id: 3,
      title: "Flessione Ginocchio Sinistro",
      image: "https://img.freepik.com/free-vector/physical-therapy-exercise-concept-illustration_114360-8921.jpg?t=st=1732898372~exp=1732901972~hmac=509603820b72ece0954c017b0c4aea04a40260e548c77cbfbc3318bba176602f&w=740",
      description: "Test per valutare la mobilità del ginocchio sinistro attraverso esercizi di flessione.",
      route: "/knee-left",
    },
    {
      id: 4,
      title: "Flessione Ginocchio Destro",
      image: "https://img.freepik.com/free-vector/physical-therapy-exercise-concept-illustration_114360-8921.jpg?t=st=1732898372~exp=1732901972~hmac=509603820b72ece0954c017b0c4aea04a40260e548c77cbfbc3318bba176602f&w=740",
      description: "Test per valutare la mobilità del ginocchio destro attraverso esercizi di flessione.",
      route: "/knee-right",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-extrabold text-gray-800 mb-3"
          >
            Test Mobilità
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Seleziona il test di mobilità che desideri eseguire
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link key={card.id} to={card.route}>
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none"
                tabIndex={0}
                role="button"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    console.log(`${card.title} test selected`);
                  }
                }}
                onClick={() => console.log(`${card.title} test selected`)}
              >
                {/* Contenitore immagine proporzionato a 16:9 */}
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
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h2>
                  <p className="text-sm text-gray-600">{card.description}</p>
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
