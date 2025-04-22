"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FiSend, FiMic, FiStopCircle, FiPlusCircle, FiRefreshCw } from "react-icons/fi";
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

  useEffect(() => {
    if (audioUrl && audioRef.current && videoRef.current) {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.9;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const thresholdPause = 5;
      const thresholdResume = 8;
      let silenceStart = null;
      const checkInterval = 10;
      const intervalId = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);
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
        source.disconnect();
        analyser.disconnect();
        audioContext.close();
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
      "Tat’s Taormina", "Apri la scheda", "Mostrami di più", "spiaggia", "spiaggie"
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
            className="mx-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition"
            onClick={() => onClickHandler(part)}
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-screen md:h-full bg-gradient-to-b from-gray-900 to-gray-800 relative">
      {/* Header con dropdown per la lingua */}
       
   
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 ">
      <button
            onClick={handleNewConversation}
            className=" py-1 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            New Conversation
          </button>
        <div className="relative z-1000">
          <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} className="text-2xl z-1000">
            {languageOptions.find((lang) => lang.code === language)?.flag || "🌐"}
          </button>
          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded shadow-lg z-1000">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    localStorage.setItem("preferredLanguage", lang.code);
                    setShowLanguageDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-600 z-1000 ${language === lang.code ? "bg-gray-600" : ""}`}
                >
                  <span className="mr-2 text-xl">{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Sidebar semplificata */}
  

      {/* Contenuto principale */}
      <main className="flex-1 flex flex-col max-h-50 overflow-hidden">
        <div className="relative bg-black/90 overflow-hidden posizionad md:h-[30%]">
          <video
            ref={videoRef}
            className="w-full object-cover posiziona "
            src={getVideoSource()}
            loop
            autoPlay
            muted
            controls={false}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        {audioUrl && (
          <>
            <audio
              ref={audioRef}
              src={audioUrl}
              autoPlay
              onEnded={() => {
                setAudioUrl(null);
                videoRef.current && videoRef.current.pause();
                setAudioCurrentTime(0);
                setIsAudioPlaying(false);
              }}
              onPause={() => {
                videoRef.current && videoRef.current.pause();
              }}
              onPlay={() => {
                videoRef.current && videoRef.current.play();
              }}
            >
              Il tuo browser non supporta l'elemento audio.
            </audio>
            
            {/* Player audio */}
            <div className="bg-gray-900 p-3 flex items-center space-x-3">
              <button 
                onClick={toggleAudioPlayback}
                className="text-white bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-colors"
              >
                {isAudioPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="text-xs text-gray-400 w-16">{formatTime(audioCurrentTime)}</div>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(audioCurrentTime / audioDuration) * 100 || 0}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="text-xs text-gray-400 w-16">{formatTime(audioDuration)}</div>
            </div>
          </>
        )}
        <div className="flex-1 flex flex-col bg-gray-800/50 backdrop-blur-md">
          <div
            ref={chatContainerRef}
            className="flex-1 px-4 lg:px-6 py-4 space-y-4 overflow-y-auto max-h-[330px] md:max-h-[calc(50vh-200px)] scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-500 pb"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.role === "assistant"
                      ? "bg-gray-700/70 text-white rounded-tr-2xl rounded-tl-none"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tl-2xl rounded-tr-none"
                  }`}
                >
                  {msg.role === "assistant"
                    ? highlightKeywords(msg.content[0]?.text?.value, (keyword) => {
                        if (
                          keyword.toLowerCase().includes("itinerari") ||
                          keyword.toLowerCase() === "itinerario"
                        ) {
                          const mockData = {
                            name: "Tour del Centro Storico",
                            images: ["/placeholder/img1.jpg", "/placeholder/img2.jpg"],
                            category: "Itinerario Turistico",
                            description: "Un meraviglioso tour del centro storico...",
                            phone_number: "+39 123 456 7890",
                            email: "info@tour.it",
                            website: "www.tour-esempio.it",
                            address: "Via Roma 123, Roma",
                          };
                          setActivityData(mockData);
                          setShowModal(true);
                        }
                      })
                    : msg.content[0]?.text?.value}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700/70 text-white rounded-2xl px-4 py-2">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>
          <div className=" lg:p-6 border-t border-gray-700/50">
           
            <form onSubmit={handleInputSubmit} className="flex items-center barnav bg-gray-800 w-100">
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isListening ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={loading}
                placeholder={loading ? "Assistant is thinking..." : "Type your message..."}
                className="flex-1 px-2 py-3 bg-gray-700/50 text-white rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="submit"
                disabled={loading || !userInput.trim()}
                className={`px-3 py-3 rounded-xl font-small transition-all duration-300 ${
                  loading || !userInput.trim()
                    ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
                }`}
              >
                Send
              </button>
              {loading && runId && (
              <div className="">
                <button
                  onClick={async () => {
                    try {
                      await axios.post(`/api/openai/threads/${threadId}/runs/${runId}/cancel`);
                      setLoading(false);
                      setErrorMessage("Response cancelled");
                    } catch (error) {
                      console.error("Error cancelling response:", error);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Cancel Response
                </button>
              </div>
            )}
            </form>
          </div>
        </div>
      </main>

      {/* Modal per i dettagli dell'attività */}
      {showModal && activityData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 bg-gray-800 rounded-xl shadow-xl">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-white">{activityData.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {activityData.images && activityData.images.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-lg">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {activityData.images.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`${activityData.name} - image ${index + 1}`}
                        className="w-64 h-48 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-blue-400">Contact Information</h3>
                    <p className="mt-1 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {activityData.phone_number}
                    </p>
                    <p className="mt-1 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {activityData.email}
                    </p>
                    <p className="mt-1 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {activityData.address}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-400">Category</h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      {activityData.category}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-blue-400">Description</h3>
                    <p className="mt-1 text-gray-300">{activityData.description}</p>
                  </div>
                  {activityData.menu && (
                    <div>
                      <h3 className="text-lg font-medium text-blue-400">Menu</h3>
                      <p className="mt-1 text-gray-300">{activityData.menu}</p>
                    </div>
                  )}
                  {activityData.prices && (
                    <div>
                      <h3 className="text-lg font-medium text-blue-400">Prices</h3>
                      <p className="mt-1 text-gray-300">{activityData.prices}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ChatWithGP;
