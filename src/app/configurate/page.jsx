"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BotConfigurator = () => {
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [partnerships, setPartnerships] = useState("");
  const [description, setDescription] = useState("");
  const [voiceOption, setVoiceOption] = useState("Femminile");
  const [botImage, setBotImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assistantId, setAssistantId] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setBotImage(file);
  };

  const handleConfigureBot = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("hotelName", hotelName);
    formData.append("hotelAddress", hotelAddress);
    formData.append("partnerships", partnerships);
    formData.append("description", description);
    formData.append("voiceOption", voiceOption);
    if (botImage) {
      formData.append("botImage", botImage);
    }

    try {
      const response = await fetch("/api/openai/assistant", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAssistantId(data.id);
        alert(`Assistente creato con successo! ID: ${data.id}`);
      } else {
        console.error("Errore:", data.error);
      }
    } catch (error) {
      console.error("Errore durante la configurazione:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
      {/* Animazione di sfondo */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-800 opacity-60 blur-3xl animate-pulse-slow top-1/4 left-1/5"></div>
        <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-indigo-900 via-gray-700 to-purple-900 opacity-50 blur-3xl animate-pulse-slow bottom-1/4 right-1/5"></div>
      </div>

      {/* Contenitore principale */}
      <div className="relative z-10 w-full max-w-6xl bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-gray-800 backdrop-blur-lg grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colonna sinistra: Configurazione */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Configura il Tuo Bot</h2>

          <form>
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Nome dell'Hotel</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Indirizzo</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Convenzioni</label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    value={partnerships}
                    onChange={(e) => setPartnerships(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Descrizione</label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Opzioni Voce</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    value={voiceOption}
                    onChange={(e) => setVoiceOption(e.target.value)}
                  >
                    <option value="Femminile">Femminile</option>
                    <option value="Maschile">Maschile</option>
                    <option value="Neutro">Neutro</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Immagine del Bot</label>
                  <div className="relative group w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus-within:ring-2 focus-within:ring-purple-600 cursor-pointer hover:scale-105 transform transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                    <span className="text-center w-full block group-hover:text-purple-400">Clicca per caricare un'immagine</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-lg text-white font-semibold hover:scale-105 transform transition-all"
                  onClick={handleConfigureBot}
                  disabled={isLoading}
                >
                  {isLoading ? "Configurazione in corso..." : "Configura Bot"}
                </button>

                {assistantId && (
                  <p className="text-green-500 text-center mt-4">Bot configurato: ID {assistantId}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        {/* Colonna destra: Anteprima */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold text-white mb-4">Anteprima del Bot</h3>
          <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden">
            {botImage ? (
              <img
                src={URL.createObjectURL(botImage)}
                alt="Anteprima Bot"
                className="object-contain h-full"
              />
            ) : (
              <p>Carica un'immagine per vedere l'anteprima</p>
            )}
          </div>

          <div className="mt-4">
            <p className="text-gray-400 text-sm">Voce selezionata: <span className="text-white">{voiceOption}</span></p>
          </div>
        </div>
      </div>

      {/* Stile dell'animazione */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s infinite;
        }
      `}</style>
    </div>
  );
};

export default BotConfigurator;
