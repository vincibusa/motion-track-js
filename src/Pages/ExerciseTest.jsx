import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Usa useNavigate invece di useHistory

const ExerciseTest = () => {
  const navigate = useNavigate(); // Usa useNavigate per la navigazione

  const cards = [
    {
      id: 1,
      title: "Esercizi di Riabilitazione Ginocchio Sinistro",
      image: "https://i.postimg.cc/fyRnBNGH/DALL-E-2024-12-08-21-46-45-A-cartoon-style-illustration-of-a-patient-at-home-performing-a-knee-ext.webp",
      description: "Esercizi di riabilitazione per rafforzare il ginocchio sinistro e migliorare la mobilità.",
      route: "/knee-left",
    },
    {
      id: 2,
      title: "Esercizi di Riabilitazione Ginocchio Destro",
      image: "https://i.postimg.cc/fyRnBNGH/DALL-E-2024-12-08-21-46-45-A-cartoon-style-illustration-of-a-patient-at-home-performing-a-knee-ext.webp",
      description: "Esercizi di riabilitazione per il ginocchio destro, focalizzati su forza e recupero della mobilità.",
      route: "/knee-right",
    },
    {
      id: 3,
      title: "Esercizi di Riabilitazione Squat Sinistro",
      image: "https://i.ibb.co/LQ9x8xM/DALL-E-2024-12-08-21-41-07-A-cartoon-style-illustration-of-a-patient-at-home-performing-a-squat-exer.webp",
      description: "Esercizi di riabilitazione per il ginocchio destro, focalizzati su forza e recupero della mobilità.",
      route: "/squat-left",
    },
    {
      id: 4,
      title: "Esercizi di Riabilitazione Squat Destro",
      image: "https://i.ibb.co/LQ9x8xM/DALL-E-2024-12-08-21-41-07-A-cartoon-style-illustration-of-a-patient-at-home-performing-a-squat-exer.webp",
      description: "Esercizi di riabilitazione per il ginocchio destro, focalizzati su forza e recupero della mobilità.",
      route: "/squat-right",
    },
    {
      id: 5,
      title: "Esercizi di Riabilitazione Bicep Curl sinistro",
      image: "https://i.ibb.co/GH8PS2P/DALL-E-2024-12-12-10-22-10-A-cartoon-style-illustration-of-a-patient-at-home-performing-a-single-bic.webp",
      description: "Esercizi di riabilitazione per il ginocchio destro, focalizzati su forza e recupero della mobilità.",
      route: "/bicep-curl-left",
    },
    {
      id: 6,
      title: "Esercizi di Riabilitazione Bicep Curl destro",
      image: "https://i.ibb.co/GH8PS2P/DALL-E-2024-12-12-10-22-10-A-cartoon-style-illustration-of-a-patient-at-home-performing-a-single-bic.webp",
      description: "Esercizi di riabilitazione per il ginocchio destro, focalizzati su forza e recupero della mobilità.",
      route: "/bicep-curl-right",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Bottone per tornare indietro */}
        <motion.button
          onClick={() => navigate(-1)} // Usa navigate(-1) per tornare indietro
          className="bg-transparent text-blue-600 hover:text-blue-800 text-lg font-semibold mb-6 focus:outline-none"
        >
          &#8592; Torna indietro
        </motion.button>

        {/* Titolo e sottotitolo migliorati */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-gray-800 mb-3"
          >
            Esercizi di Riabilitazione
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 mb-8"
          >
            Gli esercizi di riabilitazione sono fondamentali per il recupero da infortuni o interventi chirurgici. 
            Questi esercizi mirano a ripristinare la forza, la mobilità e la funzionalità delle articolazioni, 
            riducendo il dolore e migliorando la qualità della vita. Scegli l'esercizio di riabilitazione che ti interessa.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link key={card.id} to={card.route}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none"
                tabIndex={0}
                role="button"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    console.log(`${card.title} exercise selected`);
                  }
                }}
                onClick={() => console.log(`${card.title} exercise selected`)}
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

export default ExerciseTest;
