"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiMic, FiXCircle, FiPlayCircle, FiStopCircle, FiPlusCircle } from "react-icons/fi";

const MicrophoneControl = ({ onNewThread, onToggleListening, onStopRun, onBlockAssistant }) => {
  const [isListening, setIsListening] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [threadId, setThreadId] = useState(null);

  const createNewThread = async () => {
    try {
      const res = await axios.post("/api/openai/start-thread");
      const newThread = res.data;
      setThreadId(newThread.id);
      sessionStorage.setItem("threadId", newThread.id);
      if (onNewThread) onNewThread(newThread.id);
    } catch (error) {
      console.error("Errore nella creazione del thread:", error);
    }
  };

  const toggleListening = () => {
    if (isBlocked) {
      console.log("Bloccato: Il microfono non può essere attivato");
      return;
    }
    isListening ? stopListening() : startListening();
  };

  const startListening = () => {
    setIsListening(true);
    if (onToggleListening) onToggleListening(true);
  };

  const stopListening = () => {
    setIsListening(false);
    if (onToggleListening) onToggleListening(false);
  };

  const toggleBlockAssistant = () => {
    setIsBlocked(!isBlocked);
    if (onBlockAssistant) onBlockAssistant(!isBlocked);
  };

  const stopRun = () => {
    if (onStopRun) onStopRun();
    console.log("Run interrotta.");
  };

  return (
    <div className="flex flex-col items-center space-y-6 py-6 px-4 bg-gray-900 rounded-xl shadow-xl border border-gray-700">
    {/* Pulsante Microfono */}
    <div
      className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all ${
        isBlocked
          ? "bg-red-600 hover:scale-110"
          : isListening
          ? "bg-blue-600 hover:scale-110"
          : "bg-gradient-to-r from-green-400 to-blue-500 hover:scale-110"
      }`}
      onClick={toggleListening}
      title={isListening ? "Ascoltando..." : "Premi per ascoltare"}
    >
      {isBlocked ? (
        <FiXCircle size={28} className="text-white" />
      ) : isListening ? (
        <FiStopCircle size={28} className="text-white" />
      ) : (
        <FiMic size={28} className="text-white" />
      )}
    </div>

    {/* Pulsante Blocca/Sblocca */}
    <button
      onClick={toggleBlockAssistant}
      className="flex items-center justify-center w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg hover:scale-105 transition-transform"
      title="Blocca/Sblocca assistente"
    >
      {isBlocked ? <FiXCircle size={24} className="text-white" /> : <FiPlayCircle size={24} className="text-white" />}
    </button>

    {/* Pulsante Nuovo Thread */}
    <button
      onClick={createNewThread}
      className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:scale-105 transition-transform"
      title="Nuovo thread"
    >
      <FiPlusCircle size={24} className="text-white" />
    </button>

    {/* Pulsante Ferma Run */}
    <button
      onClick={stopRun}
      className="flex items-center justify-center w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full shadow-lg hover:scale-105 transition-transform"
      title="Ferma run"
    >
      <FiStopCircle size={24} className="text-white" />
    </button>
  </div>
  );
};

export default MicrophoneControl