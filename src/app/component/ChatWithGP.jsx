"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FiSend, FiMic, FiStopCircle, FiPlay, FiPlusCircle, FiRefreshCw } from "react-icons/fi";
import dynamic from "next/dynamic";

// Import condizionale del componente di compatibilità per evitare errori SSR
const BrowserCompatibilityHelper = dynamic(() => import("./BrowserCompatibilityHelper"), {
  ssr: false
});

const languageOptions = [
  { code: "ita", label: "Italiano", flag: "🇮🇹" },
  { code: "eng", label: "English", flag: "🇬🇧" },
  { code: "fra", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "esp", label: "Español", flag: "🇪🇸" },
];

function ItineraryModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Scegli un Itinerario</h2>
        {/* Placeholder filtri */}
        <div className="mb-4 flex gap-2">
          <input className="bg-gray-800 text-white rounded px-3 py-1" placeholder="Cerca..." disabled />
          <select className="bg-gray-800 text-white rounded px-3 py-1" disabled>
            <option>Filtra per categoria</option>
          </select>
        </div>
        {/* Placeholder lista pacchetti */}
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 flex flex-col gap-1 border border-gray-700/40">
              <div className="font-semibold text-lg text-blue-400">Itinerario Placeholder {i}</div>
              <div className="text-gray-300 text-sm">Descrizione breve del pacchetto {i}...</div>
              <button className="mt-2 px-4 py-1 rounded bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium w-max opacity-80 hover:opacity-100" disabled>Seleziona</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ChatWithGP = ({ onTokenUsageUpdate }) => {
  // Stati principali
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activityData, setActivityData] = useState(null);

  // Stato per l'audio generato da ElevenLabs
  const [audioUrl, setAudioUrl] = useState(null);
  // Stato per la lingua
  const [language, setLanguage] = useState("ita");
  
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Stati per il player audio
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Riferimenti per riconoscimento vocale, chat e media
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);

  // Stato per il modale itinerary
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  // Inizializzazione: carica la lingua preferita e gestisce la creazione del thread
  useEffect(() => {
    const initializeChat = async () => {
      if (typeof window !== "undefined") {
        // 1. Carica la lingua preferita
        const savedLang = localStorage.getItem("preferredLanguage");
        if (savedLang) setLanguage(savedLang);
        
        // 2. Gestisci il thread
        const storedThreadId = sessionStorage.getItem("threadId");
        if (storedThreadId) {
          setThreadId(storedThreadId);
          // Carica i messaggi esistenti
          try {
            const { data } = await axios.get(`/api/openai/messages/${storedThreadId}`);
            if (data && data.data) {
              setMessages(data.data);
            }
          } catch (error) {
            console.error("Errore nel recupero dei messaggi:", error);
            // Se c'è un errore nel recupero dei messaggi, creiamo un nuovo thread
            createNewThread();
          }
        } else {
          // Se non c'è un thread esistente, ne creiamo uno nuovo
          createNewThread();
        }
      }
    };
    
    initializeChat();
  }, []);
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const createNewThread = async () => {
    try {
      setMessages([]);
      setRunId(null);
      const res = await axios.post("/api/openai/start-thread");
      if (res.data && res.data.id) {
        setThreadId(res.data.id);
        sessionStorage.setItem("threadId", res.data.id);
        
        // Attendiamo un momento per assicurarci che il thread sia stato creato correttamente
        setTimeout(() => {
          // Messaggio di benvenuto che evidenzia la lingua preferita
          handleUserMessage(`Ciao, mostra messaggio benvenuto! La lingua preferita dell'utente è: ${language}`);
        }, 500);
      }
    } catch (error) {
      console.error("Errore nella creazione del thread:", error);
      setErrorMessage("Errore nella creazione di una nuova chat");
    }
  };

  const handleNewConversation = async () => {
    if (runId && threadId) {
      try {
        await axios.post(`/api/openai/threads/${threadId}/runs/${runId}/cancel`);
      } catch (error) {
        console.error("Errore nella cancellazione del run:", error);
      }
    }
    if (threadId) {
      try {
        await axios.delete(`/api/openai/threads/${threadId}`);
      } catch (error) {
        console.error("Errore nell'eliminazione del thread:", error);
      }
      sessionStorage.removeItem("threadId");
    }
    createNewThread();
  };

  // Riconoscimento vocale
  const startListening = async () => {
    // Prima verifica le autorizzazioni del microfono
    const { requestMicrophonePermission } = await import('../utils/microphonePermissions');
    const { stream, error } = await requestMicrophonePermission();
    
    if (error) {
      console.error(error);
      alert(error); // Mostra un messaggio all'utente
      return;
    }
    
    // Rilascia lo stream del microfono poiché SpeechRecognition lo gestirà internamente
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Riconoscimento vocale non supportato.");
      alert("Il tuo browser non supporta il riconoscimento vocale. Prova con Chrome o Edge.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "it-IT";
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    
    try {
      recognitionRef.current.start();
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (e) => {
        console.error("Errore nel riconoscimento vocale:", e.error);
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          alert("Permesso per il microfono negato. Controlla le impostazioni del browser.");
        }
        setIsListening(false);
      };
      setIsListening(true);
    } catch (e) {
      console.error("Errore nell'avvio del riconoscimento vocale:", e);
      alert("Si è verificato un errore nell'avvio del riconoscimento vocale. Ricarica la pagina e riprova.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  const handleUserMessage = async (message) => {
    if (!threadId) {
      console.error("Thread ID non disponibile.");
      return;
    }
    if (!message || message.trim() === "") return;
    if (message !== "Ciao, mostra messaggio benvenuto! La lingua preferita dell'utente è: " + language) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", content: [{ text: { value: message } }] },
      ]);
    }
    setLoading(true);
    try {
      await axios.post(`/api/openai/messages/${threadId}`, { content: message });
      const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
        assistantId: "asst_vtilXHOL59QkANctpsUjpO7b",
      });
      if (runRes.data && runRes.data.id) {
        setRunId(runRes.data.id);
      }
      await pollConversation(runRes.data.id);
      if (runRes.data.usage) {
        const { calculateTokenCost } = await import("../utils/tokenCost");
        const costInfo = calculateTokenCost(runRes.data.usage);
        const tokenData = {
          promptTokens: runRes.data.usage.prompt_tokens,
          completionTokens: runRes.data.usage.completion_tokens,
          totalTokens: runRes.data.usage.total_tokens,
          totalCost: costInfo.total,
        };
        onTokenUsageUpdate(tokenData);
      }
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error);
      setErrorMessage("Errore nell'invio del messaggio.");
      setLoading(false);
    }
  };

  const pollConversation = async (runId) => {
    let attempts = 0;
    let delay = 10;
    const maxAttempts = 30;
    const executedFunctions = new Set();
    while (attempts < maxAttempts) {
      try {
        const { data: statusData } = await axios.get(`/api/openai/completion/${threadId}/${runId}`);
        if (statusData.status === "completed") {
          if (statusData.token_usage) {
            const { calculateTokenCost } = await import("../utils/tokenCost");
            const costInfo = calculateTokenCost(statusData.token_usage);
            const tokenData = {
              promptTokens: statusData.token_usage.prompt_tokens,
              completionTokens: statusData.token_usage.completion_tokens,
              totalTokens: statusData.token_usage.total_tokens,
              totalCost: costInfo.total,
            };
            onTokenUsageUpdate(tokenData);
          }
          await fetchMessages();
          break;
        } else if (statusData.status === "requires_action" && statusData.required_action) {
          const toolCalls = statusData.required_action.submit_tool_outputs.tool_calls;
          await executeToolCalls(toolCalls, runId, executedFunctions);
        } else if (statusData.status === "failed") {
          console.error("L'assistente ha riscontrato un errore.");
          setErrorMessage("L'assistente ha riscontrato un errore.");
          break;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        attempts++;
      } catch (error) {
        console.error("Errore nel polling:", error);
        break;
      }
    }
    if (attempts >= maxAttempts)
      console.warn("Numero massimo di tentativi di polling raggiunto.");
    setLoading(false);
  };

  const executeToolCalls = async (toolCalls, runId, executedFunctions) => {
    if (!toolCalls?.length) return;
    const outputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const { id: toolCallId, function: { name, arguments: funcArgs } } = toolCall;
        if (!executedFunctions.has(toolCallId)) {
          executedFunctions.add(toolCallId);
          const response = await executeFunction(name, funcArgs);
          return { tool_call_id: toolCallId, output: response };
        }
      })
    );
    await axios.post("/api/openai/submit-tool-outputs", {
      threadId,
      runId,
      toolOutputs: outputs,
    });
  };

  const executeFunction = async (functionName, funcArgs) => {
    try {
      const res = await axios.post("/api/openai/backend-simulate", {
        functionName,
        ...funcArgs,
      });
      const { success, data } = res.data;
      if (success) {
        if (data) {
          setActivityData(data);
          setShowModal(true);
          return JSON.stringify({ message: "Operazione eseguita", data });
        } else {
          return JSON.stringify({ message: "Operazione eseguita, ma nessun dato ricevuto" });
        }
      } else {
        return JSON.stringify({ message: "Operazione non riuscita" });
      }
    } catch (error) {
      console.error("Errore durante l'esecuzione della funzione:", error);
      return JSON.stringify({ message: "Errore nel backend" });
    }
  };

  // Imposta il video placeholder per la donna (con loop)
  const getVideoSource = () => {
    return audioUrl ? "/parla.mp4" : "/placeholder/donnaplaceholder.mp4";
  };

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/openai/messages/${threadId}`);
      const newMessages = data.data.filter((msg) => {
        return (
          msg.role === "assistant" &&
          !messages.some(
            (m) =>
              m.id === msg.id ||
              (m.role === "assistant" &&
                m.content[0]?.text?.value === msg.content[0]?.text?.value)
          )
        );
      });
      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
        const latestAssistantMessage = newMessages.filter((msg) => msg.role === "assistant").pop();
        if (latestAssistantMessage) {
          const msgText = latestAssistantMessage.content[0].text.value;
          generateAvatarSpeech(msgText);
        }
      }
    } catch (error) {
      console.error("Errore nel recupero dei messaggi:", error);
    }
  };

  const generateAvatarSpeech = async (inputText) => {
    setLoading(true);
    const textWithoutUrls = inputText.replace(/(https?:\/\/[^\s]+)/g, "");
    try {
      const res = await axios.post(
        "/api/openai/sendtoevenlab",
        {
          text: textWithoutUrls,
          voiceStyle: "Professionale",
          behaviorMode: "Interattivo",
          selectedVoice: "2zRM7PkgwBPiau2jvVXc", // voce di default
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.audio) {
        const audioBase64 = res.data.audio;
        const byteCharacters = atob(audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        console.error("Audio non ricevuto dalla risposta di ElevenLabs.");
        setErrorMessage("Errore nella generazione dell'audio.");
      }
    } catch (error) {
      console.error("Errore durante la chiamata a sendtoevenlab:", error);
      setErrorMessage("Errore nella generazione dell'audio.");
    }
    setLoading(false);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleUserMessage(userInput);
      setUserInput("");
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current && videoRef.current) {
      audioRef.current.play();
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsAudioPlaying(true);
    }
  }, [audioUrl]);

  // Gestione degli eventi audio per aggiornare il player
  useEffect(() => {
    if (audioRef.current) {
      const handleTimeUpdate = () => {
        setAudioCurrentTime(audioRef.current.currentTime);
      };

      const handleLoadedMetadata = () => {
        setAudioDuration(audioRef.current.duration);
      };

      const handlePlay = () => {
        setIsAudioPlaying(true);
      };

      const handlePause = () => {
        setIsAudioPlaying(false);
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current.removeEventListener('pause', handlePause);
        }
      };
    }
  }, [audioRef.current]);

  // Funzione per formattare il tempo in mm:ss
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Funzione per gestire il cambio della posizione nella barra di avanzamento
  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = (e.target.value / 100) * audioDuration;
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  // Funzione per mettere in pausa/riprodurre l'audio
  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Inizializza l'AudioContext una sola volta
  useEffect(() => {
    // Crea l'AudioContext solo se non esiste già
    if (!audioContextRef.current && audioRef.current) {
      audioContextRef.current = new AudioContext();
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      analyserRef.current.fftSize = 128;
      analyserRef.current.smoothingTimeConstant = 0.9;
    }
    
    // Cleanup quando il componente viene smontato
    return () => {
      if (audioContextRef.current) {
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        audioContextRef.current.close();
        audioContextRef.current = null;
        sourceRef.current = null;
        analyserRef.current = null;
      }
    };
  }, []);
  
  // Gestisci l'analisi audio quando l'URL audio cambia
  useEffect(() => {
    if (audioUrl && audioRef.current && videoRef.current && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const thresholdPause = 5;
      const thresholdResume = 8;
      let silenceStart = null;
      const checkInterval = 10;
      
      const intervalId = setInterval(() => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const diff = dataArray[i] - 128;
          sumSquares += diff * diff;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        
        if (!videoRef.current.paused) {
          if (rms < thresholdPause) {
            if (!silenceStart) {
              silenceStart = Date.now();
            } else if (Date.now() - silenceStart > 500) {
              videoRef.current.pause();
            }
          } else {
            silenceStart = null;
          }
        } else {
          if (rms > thresholdResume) {
            silenceStart = null;
            videoRef.current.play();
          }
        }
      }, checkInterval);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [audioUrl]);

  
  const highlightKeywords = (text, onClickHandler) => {
    if (!text) return null;
    const keywords = [
      "Itinerari", "Taste", "Top choises", "Nightlife", "Beaches",
      "Shopping", "Inspiration", "Curiosity", "Best offers",
      "Itinerario", "Percorso", "Tour", "Esperienze", "Avventura", "Passeggiata",
      "Cibo", "Cucina", "Street food", "Granita", "Gelato", "Rosticceria",
      "Panorama", "Vista", "Romantico", "Tramonto", "Relax", "Arte", "Storia",
      "Cultura", "Eventi", "Festival", "Concerto", "Teatro", "Museo",
      "Spiaggia", "Mare", "Bagno", "Tuffo", "Snorkeling", "Escursione",
      "Shopping", "Souvenir", "Moda", "Artigianato",
      "Locali", "Cocktail", "Musica", "Divertimento", "Serata",
      "Offerta", "Sconto", "Promozione", "Pacchetto", "Promo",
      "Suggerimento", "Consiglio", "Consigliato", "Preferiti", "Scelti per te",
      "Da non perdere", "Imperdibile", "Esclusivo", "Unico",
      "Tat's Taormina", "Apri la scheda", "Mostrami di più", "spiaggia", "spiaggie",
      "itinerari", "itinerario"
    ];
    const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) => {
      const isKeyword = keywords.some((k) =>
        k.toLowerCase() === part.toLowerCase() ||
        k.toLowerCase() === part.toLowerCase().replace(/,$/, "")
      );
      if (isKeyword) {
        return (
          <button
            key={index}
            className="mx-1 px-3 py-1 text-white text-sm rounded-full transition"
            style={{ background: "#79424f" }}
            onClick={() => {
              if (part.toLowerCase().includes("itinerari") || part.toLowerCase().includes("itinerario")) {
                setShowItineraryModal(true);
              } else {
                onClickHandler(part);
              }
            }}
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part} </span>;
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#082c33] p-3  ">
    {/* Header */}
    <header className="flex justify-between items-center mb-6">
      <button
        onClick={handleNewConversation}
        className="px-5 py-2 ring-2 ring-white rounded-full text-white text-base hover:bg-white/20 transition"
      >
        New Conversation
      </button>
      <div className="relative z-30">
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg text-xl"
        >
          {languageOptions.find((l) => l.code === language)?.flag}
        </button>
        {showLanguageDropdown && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-100">
            {languageOptions.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  localStorage.setItem("preferredLanguage", l.code);
                  setShowLanguageDropdown(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-gray-100 flex items-center text-base"
              >
                <span className="mr-3">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>

    {/* Video + Player Overlay (limit height) */}
    <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-6 bg-black">
      <video
        ref={videoRef}
        src={getVideoSource()}
        loop
        muted
        autoPlay
        className="w-full h-full object-cover  "
      />

      {audioUrl && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-full px-4 py-2 flex items-center space-x-4 shadow-lg max-w-[90%]">
          <button onClick={toggleAudioPlayback} className="flex-shrink-0 text-[#79424f] text-2xl">
            {isAudioPlaying ? <FiStopCircle /> : <FiPlay />}
          </button>
          <span className="text-gray-800 font-medium">{formatTime(audioCurrentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={(audioCurrentTime / audioDuration) * 100 || 0}
            onChange={handleSeek}
            className="flex-1 h-1 rounded-full accent-[#79424f]"
          />
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>

   
    <div
      ref={chatContainerRef}
      className="flex-1 rounded-3xl p-6 overflow-y-auto mb-6 scrollbar-thin scrollbar-thumb-[#1E4E68]/60 "
    >
      {messages.length === 0 ? (
      <div></div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-5 ${
              msg.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[85%] px-6 py-4 rounded-2xl break-words text-base leading-relaxed shadow-md ${
                msg.role === "assistant"
                  ? "bg-[#FEF5E7] text-[#1E4E68] rounded-tr-none"
                  : "bg-[#79424f] text-white rounded-tl-none"
              }`}
            >
              {msg.role === "assistant"
                ? highlightKeywords(msg.content[0]?.text?.value, (keyword) => {/* azione su click */})
                : msg.content[0]?.text?.value}
            </div>
          </div>
        ))
      )}
      {isTyping && (
        <div className="flex justify-start mb-5">
          <div className="bg-[#FEF5E7] text-[#1E4E68] rounded-2xl px-6 py-3 animate-pulse text-lg shadow-md">
            ...
          </div>
        </div>
      )}
    </div>

    {/* Input Bar (“pill” con colori aggiornati e icone non overflow) */}
    <form
      onSubmit={handleInputSubmit}
      className="relative z-20 flex items-center bg-[#FEF5E7] rounded-full px-6 py-3 shadow-xl mb-6"
    >
      <input
        type="text"
        className="
          flex-1
          bg-[#FEF5E7]
          text-[#1E4E68]
          placeholder-[#6A8A99]
          text-base
          px-4 py-2
          rounded-full
          focus:outline-none
          focus:ring-2 focus:ring-[#F15525]
        "
        placeholder={loading ? "Assistant is thinking..." : "Scrivi il tuo messaggio..."}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        disabled={loading}
      />
      <button
        type="button"
        onClick={toggleListening}
        disabled={loading}
        className="flex-shrink-0 ml-4 text-2xl text-[#1E4E68]"
      >
        <FiMic className={isListening ? "text-red-500 animate-pulse" : "text-[#79424f]"} />
      </button>
      <button
        type="submit"
        disabled={!userInput.trim() || loading}
        className="flex-shrink-0 ml-4 text-2xl text-[#1E4E68]"
      >
        <FiSend className="text-[#79424f] " />
      </button>
    </form>

    {/* Invisible Audio Element */}
    {audioUrl && (
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay
        onEnded={() => {
          setAudioUrl(null);
          videoRef.current?.pause();
          setAudioCurrentTime(0);
          setIsAudioPlaying(false);
        }}
        onPause={() => {
          videoRef.current?.pause();
          setIsAudioPlaying(false);
        }}
        onPlay={() => {
          videoRef.current?.play();
          setIsAudioPlaying(true);
        }}
        className="hidden"
      />
    )}

    {/* Modal Dettagli Attività */}
    {showModal && activityData && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transform scale-95 animate-[scale-in_200ms_ease-out]">
          <div className="p-6 border-b relative">
            <h2 className="text-2xl font-bold text-[#1E4E68]">{activityData.name}</h2>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-[#1E4E68] hover:text-gray-800 text-xl"
            >
              ✕
            </button>
          </div>
          <div className="p-6 space-y-6">
            {activityData.images?.length > 0 && (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {activityData.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-40 h-32 object-cover rounded-lg flex-shrink-0 shadow"
                  />
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-base">
                <p className="text-[#1E4E68]">{activityData.address}</p>
                <p className="text-[#1E4E68]">{activityData.phone_number}</p>
                <p className="text-[#1E4E68]">{activityData.email}</p>
                <span className="inline-block bg-[#E0F3FF] text-[#1E4E68] px-4 py-2 rounded-full text-sm">
                  {activityData.category}
                </span>
              </div>
              <div className="space-y-3 text-base">
                <p className="text-gray-700">{activityData.description}</p>
                {activityData.menu && (
                  <p className="text-[#1E4E68]">
                    <strong>Menu:</strong> {activityData.menu}
                  </p>
                )}
                {activityData.prices && (
                  <p className="text-[#1E4E68]">
                    <strong>Prices:</strong> {activityData.prices}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 border-t">
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#F15525] text-white py-3 rounded-full text-lg font-semibold hover:bg-[#d0461f] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Itinerary Modal */}
    <ItineraryModal open={showItineraryModal} onClose={() => setShowItineraryModal(false)} />

    {/* Error Toast */}
    {errorMessage && (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#F15525] text-white px-6 py-3 rounded-full shadow-lg text-base">
        {errorMessage}
      </div>
    )}
  </div>
  );
  
  
  
  
  
  
};

export default ChatWithGP;
