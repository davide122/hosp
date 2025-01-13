"use client";

import { useState } from "react";

const BotConfigurator = () => {
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [partnerships, setPartnerships] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assistantId, setAssistantId] = useState(null);

  const handleConfigureBot = async () => {
    setIsLoading(true);


    try {
      const response = await fetch("/api/openai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelName, hotelAddress, partnerships, description }),
      });

      const data = await response.json();

      if (response.ok) {
        setAssistantId(data.id); // Salva l'ID dell'assistente
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
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Configura il Tuo Bot</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Nome dell'Hotel</label>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Indirizzo</label>
          <input
            type="text"
            className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={hotelAddress}
            onChange={(e) => setHotelAddress(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Convenzioni</label>
          <textarea
            className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={partnerships}
            onChange={(e) => setPartnerships(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Descrizione</label>
          <textarea
            className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 py-3 rounded-full text-white font-semibold hover:scale-105 transition-transform"
          onClick={handleConfigureBot}
          disabled={isLoading}
        >
          {isLoading ? "Configurazione in corso..." : "Configura Bot"}
        </button>
      </form>
      {assistantId && <p className="text-green-500 mt-4">Bot configurato: ID {assistantId}</p>}
    </div>
  );
};

export default BotConfigurator;
