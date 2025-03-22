import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MicrophoneControl from "./MicrophoneControl";
import { TokenUsageDisplay } from "../components/TokenUsageDisplay";

const ChatWithGP = ({ onTokenUsageUpdate }) => {
  // Stati principali
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [runId, setRunId] = useState(null); // Stato per il run corrente
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfLink, setPdfLink] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Stato per l'audio generato da ElevenLabs
  const [audioUrl, setAudioUrl] = useState(null);
  // Stato per l'immagine/avatar e la voce selezionata
  const [selectedImage, setSelectedImage] = useState(
    "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg"
  );
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM");

  // Array di opzioni per immagini e voci
  const imageOptions = [
    {
      id: "img1",
      url: "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg",
      label: "Uomo",
    },
    {
      id: "img2",
      url: "https://thumbs.dreamstime.com/b/receptionist-hotel-front-desk-picture-smiling-166305860.jpg",
      label: "Donna",
    },
  ];

  const voiceOptions = [
    { id: "voice1", value: "2zRM7PkgwBPiau2jvVXc", label: "Voce 1" },
    { id: "voice2", value: "2zRM7PkgwBPiau2jvVXc", label: "Voce 2" },
    { id: "voice3", value: "2zRM7PkgwBPiau2jvVXc", label: "Voce 3" },
  ];

  // Riferimenti per riconoscimento vocale, chat e media
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // All'avvio recuperiamo (o creiamo) il thread
  useEffect(() => {
    const storedThreadId = sessionStorage.getItem("threadId");
    if (storedThreadId) setThreadId(storedThreadId);
    else createNewThread();
  }, []);

  // Auto-scroll della chat
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
      // Resetta il run corrente quando crei un nuovo thread
      setRunId(null);
      const res = await axios.post("/api/openai/start-thread");
      if (res.data && res.data.id) {
        setThreadId(res.data.id);
        sessionStorage.setItem("threadId", res.data.id);
      }
    } catch (error) {
      console.error("Errore nella creazione del thread:", error);
      setErrorMessage("Errore nella creazione di una nuova chat");
    }
  };

  // Gestore per "New Conversation"
  const handleNewConversation = async () => {
    // Se esiste un run attivo, lo canceliamo
    if (runId && threadId) {
      try {
        await axios.post(`/api/openai/threads/${threadId}/runs/${runId}/cancel`);
        console.log(`Run ${runId} cancellato con successo`);
      } catch (error) {
        console.error("Errore nella cancellazione del run:", error);
      }
    }
    // Eliminiamo il thread corrente (anche se potrebbe non essere cancellato dal backend se già terminato)
    if (threadId) {
      try {
        await axios.delete(`/api/openai/threads/${threadId}`);
      } catch (error) {
        console.error("Errore nell'eliminazione del thread:", error);
      }
      sessionStorage.removeItem("threadId");
    }
    // Creiamo un nuovo thread
    createNewThread();
  };

  // Funzioni di riconoscimento vocale
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Riconoscimento vocale non supportato.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "it-IT";
    recognitionRef.current.start();
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserMessage(transcript);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (e) => {
      console.error("Errore nel riconoscimento vocale:", e.error);
      setIsListening(false);
    };
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  const handleUserMessage = async (message) => {
    if (!threadId) return console.error("Thread ID non disponibile.");
    if (!message || message.trim() === "") return;
    // Prevent sending messages during audio playback or loading
    if (audioUrl || loading) {
      setErrorMessage("Please wait for the assistant to finish speaking.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: [{ text: { value: message } }] },
    ]);

    setLoading(true);
    try {
      await axios.post(`/api/openai/messages/${threadId}`, { content: message });
      // Quando crei un run, salva anche il runId per poterlo cancellare se necessario
      const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
        assistantId: "asst_vtilXHOL59QkANctpsUjpO7b",
      });
      if (runRes.data && runRes.data.id) {
        setRunId(runRes.data.id);
      }
      await pollConversation(runRes.data.id);
      // Update token usage
      if (runRes.data.usage) {
        console.log('Token usage data received:', runRes.data.usage);
        // Import the utility function
        const { calculateTokenCost } = await import('../utils/tokenCost');
        const costInfo = calculateTokenCost(runRes.data.usage);
        console.log('Cost info calculated:', costInfo);
        
        const tokenData = {
          promptTokens: runRes.data.usage.prompt_tokens,
          completionTokens: runRes.data.usage.completion_tokens,
          totalTokens: runRes.data.usage.total_tokens,
          totalCost: costInfo.total
        };
        console.log('Updating token usage with:', tokenData);
        onTokenUsageUpdate(tokenData);
      } else {
        console.log('No usage data available in the response');
      }
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error);
      setErrorMessage("Errore nell'invio del messaggio.");
      setLoading(false);
    }
  };

  const pollConversation = async (runId) => {
    let attempts = 0;
    let delay = 100;
    const maxAttempts = 30;
    const executedFunctions = new Set();

    while (attempts < maxAttempts) {
      try {
        const { data: statusData } = await axios.get(
          `/api/openai/completion/${threadId}/${runId}`
        );
        if (statusData.status === "completed") {
          if (statusData.token_usage) {
            console.log('Token usage data received:', statusData.token_usage);
            const { calculateTokenCost } = await import('../utils/tokenCost');
            const costInfo = calculateTokenCost(statusData.token_usage);
            console.log('Cost info calculated:', costInfo);
            
            const tokenData = {
              promptTokens: statusData.token_usage.prompt_tokens,
              completionTokens: statusData.token_usage.completion_tokens,
              totalTokens: statusData.token_usage.total_tokens,
              totalCost: costInfo.total
            };
            console.log('Updating token usage with:', tokenData);
            onTokenUsageUpdate(tokenData);
          }
          await fetchMessages();
          break;
        } else if (
          statusData.status === "requires_action" &&
          statusData.required_action
        ) {
          const toolCalls =
            statusData.required_action.submit_tool_outputs.tool_calls;
          await executeToolCalls(toolCalls, runId, executedFunctions);
        } else if (statusData.status === "failed") {
          console.error("L'assistente ha riscontrato un errore.");
          setErrorMessage("L'assistente ha riscontrato un errore.");
          break;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Implement exponential backoff
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
        const {
          id: toolCallId,
          function: { name, arguments: funcArgs },
        } = toolCall;
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
        if (data.pdfLink) {
          setPdfLink(data.pdfLink);
          setShowModal(true);
        }
        return JSON.stringify({ message: "Operazione eseguita", ...data });
      }
      return JSON.stringify({ message: "Operazione non riuscita" });
    } catch (error) {
      console.error("Errore durante l'esecuzione della funzione:", error);
      return JSON.stringify({ message: "Errore nel backend" });
    }
  };

  // Funzione helper per determinare la sorgente del video:
  // se c'è audio usiamo "parla.mp4", altrimenti il placeholder in base all'immagine
  const getVideoSource = () => {
    return audioUrl
      ? "/parla.mp4"
      : selectedImage === "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg"
      ? "/placeholder/uomoplaceholder.mp4"
      : "/placeholder/donnaplaceholder.mp4";
  };

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/openai/messages/${threadId}`);
      // Get all messages and update state only if there are new messages
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
        setMessages(prev => [...prev, ...newMessages]);
        // Only generate speech for the latest assistant message
        const latestAssistantMessage = newMessages
          .filter(msg => msg.role === "assistant")
          .pop();
        
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
    try {
      const res = await axios.post(
        "/api/openai/sendtoevenlab",
        {
          text: inputText,
          voiceStyle: "Professionale",
          behaviorMode: "Interattivo",
          selectedVoice,
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

  // Effetto per sincronizzare l'avvio di audio e video quando audioUrl cambia
  useEffect(() => {
    if (audioUrl && audioRef.current && videoRef.current) {
      audioRef.current.play();
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative lg:flex
          inset-y-0 left-0 z-50
          w-72 bg-gray-800/95 backdrop-blur-lg
          transform lg:transform-none transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Settings
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden rounded-full p-2 hover:bg-gray-700/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Avatar e Voice Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Choose Avatar</h3>
            <div className="grid grid-cols-2 gap-4">
              {imageOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedImage(option.url)}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedImage === option.url ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"
                  }`}
                >
                  <TokenUsageDisplay></TokenUsageDisplay>
                  <img src={option.url} alt={option.label} className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="absolute bottom-2 left-2 text-sm text-white font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Choose Voice</h3>
            <div className="space-y-3">
              {voiceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedVoice(option.value)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    selectedVoice === option.value
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              
            </div>
          </div>
          <button
            onClick={handleNewConversation}
            className="mt-auto w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            New Conversation
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-gray-800/80 backdrop-blur-sm">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full p-2 hover:bg-gray-700/50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-100">Virtual Assistant</h1>
        <div className="w-6" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Video Container */}
        <div className="relative w-full h-[45vh] lg:h-[65vh] bg-black/90 rounded-b-3xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={getVideoSource()}
            loop={!audioUrl}
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

        {/* Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            autoPlay
            onEnded={() => {
              setAudioUrl(null);
              videoRef.current && videoRef.current.pause();
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
        )}

        {/* Chat Container e Input */}
        <div className="flex-1 flex flex-col bg-gray-800/50 backdrop-blur-md">
          <div
            ref={chatContainerRef}
            className="flex-1 px-4 lg:px-6 py-4 space-y-4 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-500"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.role === "assistant"
                      ? "bg-gray-700/70 text-white rounded-tr-2xl rounded-tl-none"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tl-2xl rounded-tr-none"
                  }`}
                >
                  {msg.content[0]?.text?.value}
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

          <div className="p-2 lg:p-6 border-t border-gray-700/50">
            {/* Cancel Button */}
            {loading && runId && (
              <div className="mb-4 flex justify-center">
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
            <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
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
                className="flex-1 px-5 py-3 bg-gray-700/50 text-white rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
            </form>
          </div>
        </div>
      </main>
      {/* Modal ed Error Toast (eventuale) */}
    </div>
  );
};

export default ChatWithGP;
