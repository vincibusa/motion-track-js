import React from "react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.png"; // Assicurati che il logo sia nel posto giusto
import { Link } from "react-router-dom";
import YouTube from "react-youtube"; // YouTube player component

const HomePage = () => {
  const videoOpts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      loop: 1,
      mute: 1, // video muto
      playlist: "iObdegFqTYU" // Imposta il video in loop
    }
  };

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
      description: "Valuta la tua forza fisica per capire il grado d'efficienza della tua muscolatura, adatto sia per incremento performance che recupero da infortuni.",
      route: "/strength-evaluation"
    }
  ];

  // Nuove immagini da aggiungere al carosello
  const carouselImages = [
    {
      src: "https://i.postimg.cc/8PyYmm7K/df47f448-6d6d-47b3-b8e4-9afa45820708.jpg",
      title: "Teleriabilitazione Avanzata",
      description: "La nostra piattaforma consente sessioni di fisioterapia a distanza con monitoraggio in tempo reale."
    },
    {
      src: "https://i.postimg.cc/wTxPNGjR/b81d1a5a-ff85-43ec-847c-dbbe17f7c95b.jpg",
      title: "Personalizzazione Completa",
      description: "Il fisioterapista può adattare ogni programma di riabilitazione alle esigenze specifiche del paziente."
    },
    {
      src: "https://i.postimg.cc/T3p475mR/efc8b1f5-6a48-4111-a894-bad6d82b3994.jpg",
      title: "Analisi di Simmetria e Postura",
      description: "La piattaforma fornisce feedback in tempo reale per correggere la postura e migliorare la simmetria."
    },
    {
      src: "https://ptproductsonline.com/wp-content/uploads/2022/04/Kemtai-RecoveryOne.jpg",
      title: "Valutazione della Forza Muscolare",
      description: "Monitora la forza muscolare per ottimizzare il recupero e prevenire gli infortuni."
    },
    {
      src: "https://www.tecnomedicina.it/wp-content/uploads/2024/06/Foto-1_No-logo-1024x1024.png",
      title: "Motivazione Personalizzata",
      description: "Incoraggia i pazienti con messaggi motivazionali basati sui progressi raggiunti."
    },
    {
      src: "https://www.impresasanita.it/ir/41839/t/f/0/770/433//impresasanita/image/rehub_1.jpeg",
      title: "Monitoraggio in Tempo Reale",
      description: "Intervieni immediatamente grazie al monitoraggio continuo delle performance motorie."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Video in Background solo per la parte di Hero */}
      <div className="relative w-full h-[75vh]">
        <YouTube
          videoId="iObdegFqTYU"
          opts={videoOpts}
          className="w-full h-full object-cover absolute top-0 left-0"
        />
        {/* Contenuto sopra il video */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-white bg-black bg-opacity-50 z-10">
          {/* Logo e introduzione */}
          <div className="text-center mb-18 ">
            <div className="absolute top-0 left-0 p-4">
              <img
                src={Logo}
                alt="Logo della Startup"
                className="h-40"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80x80?text=Logo"; // Logo di fallback
                }}
              />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl font-extrabold text-white mb-4"
            >
              Demo Gratuita di Selfmotion
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-white mb-14 px-3 sm:px-0"
            >
              Benvenuto nella demo gratuita di Selfmotion, una piattaforma innovativa che sfrutta la computer vision per la fisioterapia,  <br />
             la riabilitazione e il miglioramento delle performance sportive. Scopri come migliorare il tuo benessere con il nostro strumento  <br />intuitivo e basato su tecnologia all'avanguardia.
            </motion.p>
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

     {/* Contenuto sotto il video */}
<div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-32 text-center min-h-screen flex flex-col justify-center items-center">
  {/* Sezione "Prova la nostra tecnologia" */}
  <div
    id="demo-section"
    className="bg-white text-black py-32 px-4 sm:px-6 lg:px-8 text-center w-full"
  >
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-6xl font-extrabold text-center mb-16"
    >
      Prova anche tu gratuitamente la nostra tecnologia!
    </motion.h2>
    
    {/* Griglia delle cards centrata */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mx-auto max-w-6xl">
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


  {/* Sezione delle immagini con alternanza sinistra-destra */}
  <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16">
    {carouselImages.map((image, index) => (
      <section
        key={index}
        className={`flex flex-col md:flex-row items-center justify-between py-16 bg-white`}
      >
        {/* Alternanza immagine sinistra-destra */}
        <motion.img
          src={image.src}
          alt={image.title}
          className={`w-full md:w-1/2 object-cover rounded-lg shadow-xl mb-8 md:mb-0 ${
            index % 2 === 0 ? "order-1" : "order-2"
          }`}
          initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        />
        <div
          className={`w-full md:w-1/2 px-6 text-center md:text-left ${
            index % 2 === 0 ? "order-2" : "order-1"
          }`}
        >
          <motion.h2
            className="text-3xl font-extrabold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {image.title}
          </motion.h2>
          <motion.p
            className="text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {image.description}
          </motion.p>
        </div>
      </section>
    ))}
  </div>

  {/* Sezione video di presentazione sotto le cards */}
  <div className="text-center mb-16">
    <motion.h2
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="text-3xl font-extrabold text-teal-600 mb-6 text-white"
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
</div>

    </div>
  );
};

export default HomePage;
