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
    <div className="flex flex-col items-center space-y-4 py-4 px-2 bg-gray-800 rounded-lg shadow-lg withpulsa">
    {/* Pulsante Microfono */}
    <div
      className={`relative w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-transform ${
        isBlocked
          ? "bg-red-500 shadow-md"
          : isListening
          ? "bg-blue-500 shadow-md"
          : "bg-gradient-to-r from-green-400 to-blue-500 shadow-md"
      }`}
      onClick={toggleListening}
      title={isListening ? "Ascoltando..." : "Premi per ascoltare"}
    >
      {isBlocked ? (
        <FiXCircle size={20} className="text-white" />
      ) : isListening ? (
        <FiStopCircle size={20} className="text-white" />
      ) : (
        <FiMic size={20} className="text-white" />
      )}
    </div>

    {/* Altri controlli */}
    <button
      onClick={toggleBlockAssistant}
      className="w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg"
      title="Blocca/Sblocca assistente"
    >
      {isBlocked ? <FiXCircle size={18} className="text-white" /> : <FiPlayCircle size={18} className="text-white" />}
    </button>

    <button
      onClick={onNewThread}
      className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
      title="Nuovo thread"
    >
      <FiPlusCircle size={18} className="text-white" />
    </button>

    <button
      onClick={onStopRun}
      className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg"
      title="Ferma run"
    >
      <FiStopCircle size={18} className="text-white" />
    </button>
  </div>
  );
};

export default MicrophoneControl