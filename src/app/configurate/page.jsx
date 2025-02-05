"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const BotConfigurator = () => {
  const [botName, setBotName] = useState("");
  const [botVoice, setBotVoice] = useState("Femminile");
  const [botPersonality, setBotPersonality] = useState("Professionale");
  const [botPreview, setBotPreview] = useState(null);

  const handleConfigureBot = () => {
    const botConfig = { botName, botVoice, botPersonality };
    console.log("Bot Configurato:", botConfig);
    setBotPreview(botConfig);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500 to-pink-500 opacity-20 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-3xl"
      >
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-8">
          Configura il Tuo Bot IA
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Nome del Bot</label>
            <input
              type="text"
              className="w-full p-4 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Inserisci il nome del bot"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Voce del Bot</label>
            <select
              className="w-full p-4 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={botVoice}
              onChange={(e) => setBotVoice(e.target.value)}
            >
              <option value="Femminile">Femminile</option>
              <option value="Maschile">Maschile</option>
              <option value="Neutra">Neutra</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Personalità del Bot</label>
            <select
              className="w-full p-4 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={botPersonality}
              onChange={(e) => setBotPersonality(e.target.value)}
            >
              <option value="Professionale">Professionale</option>
              <option value="Amichevole">Amichevole</option>
              <option value="Creativa">Creativa</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfigureBot}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition duration-300"
          >
            Configura Bot
          </motion.button>
        </div>

        {botPreview && (
          <div className="mt-8 p-4 bg-gray-800 rounded-xl shadow-md text-white">
            <h3 className="text-2xl font-semibold mb-2">Anteprima del Bot</h3>
            <p><strong>Nome:</strong> {botPreview.botName}</p>
            <p><strong>Voce:</strong> {botPreview.botVoice}</p>
            <p><strong>Personalità:</strong> {botPreview.botPersonality}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BotConfigurator;