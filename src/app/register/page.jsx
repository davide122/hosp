"use client";
import { useEffect, useRef, useState } from "react";
import Mynav from "../component/Mynav";

const BotConfigurator = () => {
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [partnerships, setPartnerships] = useState("");
  const [description, setDescription] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("Professionale");
  const [behaviorMode, setBehaviorMode] = useState("Interattivo");
  const [isLoading, setIsLoading] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const voices = [
    { id: "Kq9pDHHIMmJsG9PEqOtv", name: "Sandra" },
    { id: "PSp7S6ST9fDNXDwEzX0m", name: "Marco" },
    { id: "13Cuh3NuYvWOVQtLbRN8", name: "Giovanni" },
  ];

  const handleConfigureBot = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/openai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelName,
          hotelAddress,
          partnerships,
          description,
          voiceStyle,
          behaviorMode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAssistantId(data.id); // Salva l'ID dell'assistente
        alert(`Assistente creato con successo! ID: ${data.id}`);
      } else {
        setErrorMessage(data.error || "Errore durante la configurazione.");
        console.error("Errore:", data.error);
      }
    } catch (error) {
      setErrorMessage("Errore di rete. Controlla la connessione.");
      console.error("Errore di rete:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Mynav />
      <section
        className="py-16 px-4 relative overflow-hidden min-h-[800px]"
        style={{
          background: "radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(0,0,0,1) 70%)",
        }}
      >
        <div className="max-w-6xl mx-auto mb-20 relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Configura il Tuo Assistente
          </h2>
          <p className="text-gray-400 text-xl text-center">
            Inserisci i dettagli per personalizzare il bot al meglio.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start relative z-10">
          {/* Colonna Sinistra */}
          <div className="space-y-8">
            <div>
              <label className="block mb-2 text-gray-300 text-lg">Nome dell'Hotel</label>
              <input
                type="text"
                className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Inserisci il nome dell'hotel"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-300 text-lg">Indirizzo</label>
              <input
                type="text"
                className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={hotelAddress}
                onChange={(e) => setHotelAddress(e.target.value)}
                placeholder="Inserisci l'indirizzo dell'hotel"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-300 text-lg">Convenzioni</label>
              <textarea
                className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={partnerships}
                onChange={(e) => setPartnerships(e.target.value)}
                placeholder="Es. Ristoranti, attrazioni turistiche..."
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-300 text-lg">Descrizione dell'Hotel</label>
              <textarea
                className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aggiungi una descrizione unica per il tuo hotel..."
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-300 text-lg">Stile della Voce</label>
              <select
                className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={voiceStyle}
                onChange={(e) => setVoiceStyle(e.target.value)}
              >
                <option>Professionale</option>
                <option>Amichevole</option>
                <option>Casuale</option>
              </select>
            </div>
          </div>

          {/* Colonna Destra */}
          <div className="space-y-8">
            <div>
              <label className="block mb-2 text-gray-300 text-lg">Modalità di Comportamento</label>
              <select
                className="w-full p-4 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={behaviorMode}
                onChange={(e) => setBehaviorMode(e.target.value)}
              >
                <option>Interattivo</option>
                <option>Semplice</option>
              </select>
            </div>
            <button
              className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition-transform rounded-full font-semibold text-lg w-full"
              onClick={handleConfigureBot}
              disabled={isLoading || !hotelName || !hotelAddress}
            >
              {isLoading ? "Configurazione in corso..." : "Configura Bot"}
            </button>
            {assistantId && (
              <div className="text-green-500 mt-4">
                Assistente creato con successo! ID: {assistantId}
              </div>
            )}
            {errorMessage && (
              <div className="text-red-500 mt-4">{errorMessage}</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default BotConfigurator;