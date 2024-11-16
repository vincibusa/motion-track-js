import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Back from "./assets/testfisio.png"
import Logo from "./assets/Logo.png"
import { Link } from "react-router-dom";
const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrimaryClick = () => {
    console.log("Primary button clicked");
  };

  const handleSecondaryClick = () => {
    console.log("Secondary button clicked");
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute top-0 left-0 z-20 p-6">
        <img
          src={Logo}
          alt="Company Logo"
          className="h-16 w-auto rounded-full shadow-lg"
        />
      </div>

         <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${Back})`,
        transform: `translateY(${scrollY * 0.5}px)`,
      }}
      role="img"
      aria-label="People exercising in a modern fitness facility"
    >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

  

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
        >
          Benvenuto nel prototipo di Selfmotion
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 max-w-2xl text-lg text-gray-200 sm:text-xl"
        >
          Prova i nostri test di mobilità e scopri come migliorare la tua postura
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
        >
            <Link to="/left">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrimaryClick}
            className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Get Started with Pakestra"
          >
            Test spalla sinistra
          </motion.button>
           </Link>
           <Link to="/right">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSecondaryClick}
            className="rounded-full border-2 border-white bg-transparent px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            aria-label="Learn More about Pakestra"
          >
            Test spalla destra
          </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
