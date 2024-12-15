import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import ScrollArrow from "./ScrollArrow";

const Roadmap = () => {
  const [activeStep, setActiveStep] = useState(null);

  const roadmapSteps = [
    {
      title: "Fase 1",
      desc: "Implementazione assistente base",
      details: "Creazione di un assistente digitale con risposte rapide e interfaccia intuitiva.",
      icon: <CheckCircle className="text-purple-400 w-6 h-6" />,
    },
    {
      title: "Fase 2",
      desc: "Voce e personalità personalizzabili",
      details: "Personalizzazione dell'assistente per adattarsi al tono e allo stile del brand.",
      icon: <CheckCircle className="text-purple-400 w-6 h-6" />,
    },
    {
      title: "Fase 3",
      desc: "Integrazione analytics e dashboard",
      details: "Dashboard interattiva per monitorare dati e analisi di utilizzo in tempo reale.",
      icon: <CheckCircle className="text-purple-400 w-6 h-6" />,
    },
    {
      title: "Fase 4",
      desc: "Funzioni AI avanzate (multi-lingua, suggerimenti)",
      details: "Integrazione di suggerimenti intelligenti e supporto multilingue per migliorare l'esperienza.",
      icon: <CheckCircle className="text-purple-400 w-6 h-6" />,
    },
    {
      title: "Fase 5",
      desc: "Partnership con catene internazionali",
      details: "Collaborazione con grandi catene per espandere la rete e migliorare il servizio.",
      icon: <CheckCircle className="text-purple-400 w-6 h-6" />,
    },
  ];

  const typewriterAnimation = (text) => {
    const letters = text.split("");
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          delayChildren: 0.3,
          staggerChildren: 0.05,
        },
      },
    };
  };

  const letterAnimation = {
    hidden: { opacity: 0, y: "100%" },
    visible: { opacity: 1, y: "0%", transition: { duration: 0.2 } },
  };

  return (
    <section id="roadmap" className="relative overflow-hidden bg-black py-20">
      
      {/* Gradiente al centro */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <div className="mx-auto mb-16 text-center relative">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
          Tabella di Marcia
        </h2>
        <p className="text-gray-400 text-xl text-center">
          Un’evoluzione costante verso nuove frontiere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto relative">
        {/* Colonna sinistra: Passaggi */}
        <div className="space-y-8 mx-3">
          {roadmapSteps.map((step, i) => (
            <motion.div
              key={i}
              className={`flex gap-4 items-center p-6 rounded-3xl bg-gray-800/40 backdrop-blur-xl border ${
                activeStep === step.title
                  ? "border-purple-500 shadow-lg"
                  : "border-gray-700"
              } cursor-pointer hover:border-purple-500 transition-colors`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setActiveStep(step.title)}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-400/20 rounded-full text-purple-500">
                {step.icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-200">{step.title}</h4>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Colonna destra: Dettagli */}
        <div className="flex items-center justify-center py-16 px-4">
          <motion.div
            className="relative w-full max-w-xl rounded-[30px] bg-gray-900/50 backdrop-blur-xl border border-purple-500 shadow-lg p-8 overflow-hidden text-gray-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {activeStep ? (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
              >
                <h4 className="text-3xl font-extrabold text-purple-400 mb-4">
                  {activeStep}
                </h4>
                <motion.p
                  variants={typewriterAnimation(
                    roadmapSteps.find((step) => step.title === activeStep)?.desc
                  )}
                  initial="hidden"
                  animate="visible"
                  className="text-gray-200 text-lg leading-relaxed mb-6 flex flex-wrap gap-1 justify-center"
                >
                  {roadmapSteps
                    .find((step) => step.title === activeStep)
                    ?.desc.split("")
                    .map((char, idx) => (
                      <motion.span
                        key={idx}
                        variants={letterAnimation}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                </motion.p>
                <p className="text-gray-400 text-sm leading-relaxed mt-4">
                  {
                    roadmapSteps.find((step) => step.title === activeStep)
                      ?.details
                  }
                </p>
              </motion.div>
            ) : (
              <p className="text-gray-400 text-center">
                Passa il cursore su un passaggio per vedere i dettagli.
              </p>
            )}

            {/* Effetti decorativi */}
            <div className="absolute -top-10 -left-10 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-30 blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-30 blur-3xl"></div>
          </motion.div>
        </div>
      </div>
      <ScrollArrow target="#caratteristiche" />
    </section>
  );
};

export default Roadmap;