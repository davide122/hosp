"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

const sections = [
  {
    title: "Disponibilità 24/7",
    description: "Il nostro bot è sempre attivo per rispondere ai tuoi clienti in tempo reale.",
    image: "/uno.webp",
  },
  {
    title: "Personalizzazione Avanzata",
    description: "Adatta il bot per riflettere lo stile unico della tua attività.",
    image: "/due.webp",
  },
  {
    title: "Analisi e Dati",
    description: "Monitora e ottimizza i tuoi servizi grazie ai report avanzati.",
    image: "/tre.webp",
  },
];

export default function WelcomePage() {
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (currentIndex === -1) {
      // Show welcome message for 3 seconds
      const timeout = setTimeout(() => setCurrentIndex(0), 3000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sections.length);
    }, 4000); // Cambia sezione ogni 4 secondi

    return () => clearInterval(interval);
  }, [currentIndex]);

  if (currentIndex === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0d13] to-[#07080d] text-white flex items-center justify-center">
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 leading-tight"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Benvenuto, stiamo programmando il tutto...
        </motion.h1>
      </div>
    );
  }

  const currentSection = sections[currentIndex];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-[#0b0d13] to-[#07080d] text-white flex items-center justify-center overflow-hidden">
      {/* Sfondo dinamico */}
      <BackgroundAnimation />

      {/* Contenuto */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 1, x: currentIndex % 2 === 0 ? -50 : 50 }}
        animate={{ opacity: 1, x: 1 }}
        exit={{ opacity: 1, x: currentIndex % 2 === 0 ? 50 : -50 }}
        transition={{ duration: 1 }}
        className="flex flex-col md:flex-row items-center justify-center max-w-6xl px-6 gap-12"
      >
        {currentIndex % 2 === 0 ? (
          <>
            <TextContent section={currentSection} />
            <ImageContent section={currentSection} />
          </>
        ) : (
          <>
            <ImageContent section={currentSection} />
            <TextContent section={currentSection} />
          </>
        )}
      </motion.div>
    </div>
  );
}

function BackgroundAnimation() {
  return (
    <motion.div
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1b1f_0%,_transparent_70%),radial-gradient(ellipse_at_bottom,#101115_0%,transparent_70%)]"
      animate={{ opacity: [1, 1, 1], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-30"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              y: [`${Math.random() * 10 - 5}px`, `${Math.random() * 20 - 10}px`],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          ></motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TextContent({ section }) {
  return (
    <div className="text-center md:text-left flex-1">
      <TypewriterText title={section.title} />
      <motion.p
        className="text-lg text-gray-300"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {section.description}
      </motion.p>
    </div>
  );
}

function ImageContent({ section }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.img
        src={section.image}
        alt={section.title}
        className="w-120 h-120 object-cover rounded-lg shadow-lg"
        initial={{ scale: 0.8, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      />
    </div>
  );
}

function TypewriterText({ title }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(title.slice(0, index + 1));
      index++;
      if (index === title.length) {
        clearInterval(interval);
      }
    }, 100); // Velocità effetto typewriter

    return () => clearInterval(interval);
  }, [title]);

  return (
    <h1
      className="text-6xl md:text-8xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 leading-tight"
    >
      {displayText}
    </h1>
  );
}