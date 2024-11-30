import React from "react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.png"; // Correct import path
import { Link } from "react-router-dom";

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
      image: "https://i.ibb.co/VN2trNq/IMG-6130.png",
      description: "Scopri test completi per esercizi di riabilitazione, ottimizzati per i tuoi obiettivi di fitness.",
      route: "/exercise-test"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Intestazione con immagine banner */}
      <div className="relative">
        <img
          src="https://media.licdn.com/dms/image/v2/D4D3DAQGvJ8OZZm8WKw/image-scale_127_750/image-scale_127_750/0/1729714794903/selfmotion_cover?e=1733536800&v=beta&t=tLtbAR7DIwXleMEg0h5A_oLMg4rdHEO2Utb1K8nSWBo"
          alt="Banner di Selfmotion"
          className="w-full h-auto object-cover"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            paddingBottom: "30px"
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Logo e introduzione con separazione */}
        <div className="text-center mb-16 relative z-10">
          <img
            src={Logo}
            alt="Logo della Startup"
            className="h-24 mx-auto mb-6 rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80x80?text=Logo";
            }}
          />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-teal-600 mb-4"
          >
            Demo Gratuita di Selfmotion
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-black mb-8 px-4 sm:px-0"
          >
            Benvenuto nella demo gratuita di Selfmotion, una piattaforma innovativa che sfrutta la computer vision per la fisioterapia, la riabilitazione e il miglioramento delle performance sportive. Scopri come migliorare il tuo benessere con il nostro strumento intuitivo e basato su tecnologia all'avanguardia.
          </motion.p>
        </div>

        {/* Cards per navigare verso le sezioni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {cards.map((card) => (
            <Link key={card.id} to={card.route}>
              <motion.div
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

        {/* Sezione video di presentazione dopo le cards */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl font-extrabold text-teal-600 mb-6"
          >
            Guarda il nostro Video di Presentazione
          </motion.h2>
          <div className="w-full max-w-4xl mx-auto mb-8">
            <iframe
              title="vimeo-player"
              src="https://player.vimeo.com/video/1031201005?h=8d2a265a5a"
              width="100%"
              height="500"
              frameBorder="0"
              allowFullScreen
              className="rounded-lg shadow-xl"
            ></iframe>
          </div>
        </div>

        {/* Aggiungi una sezione con scorrimento dinamico delle immagini */}
        <div className="mb-16">
          <motion.div
            className="overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-extrabold text-teal-600 text-center mb-8">
              Guarda come funziona
            </h2>
            <div className="flex space-x-4 overflow-x-auto">
              <img
                src="https://i.ibb.co/ZSz7pGN/IMG-6131.png"
                alt="Esercizio 1"
                className="w-80 h-auto rounded-lg shadow-lg"
              />
              <img
                src="https://i.ibb.co/VN2trNq/IMG-6130.png"
                alt="Esercizio 2"
                className="w-80 h-auto rounded-lg shadow-lg"
              />
              <img
                src="https://i.ibb.co/ZSz7pGN/IMG-6131.png"
                alt="Esercizio 3"
                className="w-80 h-auto rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Sezione aggiuntiva di informazioni */}
        <div className="text-center mt-12 relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-600 mb-6 px-4 sm:px-0"
          >
            Selfmotion è la soluzione ideale per monitorare il tuo progresso e ottimizzare i tuoi allenamenti. Con i nostri test e esercizi personalizzati, potrai ottenere una valutazione accurata del tuo stato fisico e migliorare le tue performance.
          </motion.p>
          
          {/* Aggiungi il Link al bottone per la navigazione */}
          <Link to="/mobility-test">
            <motion.button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Prova la Demo Gratuita
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
