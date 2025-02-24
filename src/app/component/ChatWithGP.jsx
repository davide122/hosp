"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MicrophoneControl from "./MicrophoneControl";

const ChatWithGP = () => {
  // Stati principali
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfLink, setPdfLink] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg"
  );
  const [selectedVoice, setSelectedVoice] = useState("nPczCjzI2devNBz1zQrb");

  // Stato per memorizzare l'URL della seconda tranche
  const [secondVideoUrl, setSecondVideoUrl] = useState(null);
  // Stato per tracciare se il video della prima tranche è terminato
  const [firstVideoEnded, setFirstVideoEnded] = useState(false);

  // Array di opzioni per immagini e voci
  const imageOptions = [
    {
      id: "img1",
      url: "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg",
      label: "Uomo ",
    },
    {
      id: "img2",
      url: "https://thumbs.dreamstime.com/b/receptionist-hotel-front-desk-picture-smiling-166305860.jpg",
      label: "Donna ",
    },
    
  ];

  const voiceOptions = [
    { id: "voice1", value: "nPczCjzI2devNBz1zQrb", label: "Uomo" },
    { id: "voice3", value: "Kq9pDHHIMmJsG9PEqOtv", label: "Donna" },
  ];

  // Riferimenti
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);

  // All'avvio recuperiamo (o creiamo) il thread
  useEffect(() => {
    const storedThreadId = sessionStorage.getItem("threadId");
    if (storedThreadId) setThreadId(storedThreadId);
    else createNewThread();
  }, []);

  // Auto-scroll della chat al variare dei messaggi
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
  
  // Creazione di un nuovo thread
  const createNewThread = async () => {
    try {
      setMessages([]); // Pulizia della chat quando si crea un nuovo thread
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

  // Gestione dell'invio di un messaggio (sia testuale che vocale)
  const handleUserMessage = async (message) => {
    if (!threadId) return console.error("Thread ID non disponibile.");
    if (!message || message.trim() === "") return;

    // Aggiunge immediatamente il messaggio utente nella chat
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: [{ text: { value: message } }] },
    ]);

    setLoading(true);
    try {
      // Invia il messaggio al backend
      await axios.post(`/api/openai/messages/${threadId}`, { content: message });
      // Avvia un nuovo run di conversazione
      const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
        assistantId: "asst_s1KQTKTvDmhHlxQ4q3MTeuAs",
      });
      await pollConversation(runRes.data.id);
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error);
      setErrorMessage("Errore nell'invio del messaggio.");
      setLoading(false);
    }
  };

  // Polling per verificare lo stato della conversazione
  const pollConversation = async (runId) => {
    let attempts = 0;
    let delay = 500;
    const maxAttempts = 30;
    const executedFunctions = new Set();

    while (attempts < maxAttempts) {
      try {
        const { data: statusData } = await axios.get(
          `/api/openai/completion/${threadId}/${runId}`
        );
        if (statusData.status === "completed") {
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
        delay *= 1;
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

  // Esecuzione delle chiamate a funzioni (tool calls)
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

  // Chiamata generica al backend per eseguire una funzione specifica
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

  const getPlaceholderVideo = () => {
    if (selectedImage === imageOptions[1].url) {
      // donna
      return "/placeholder/donnaplaceholder.mp4";
    }
    // uomo
    return "/placeholder/uomoplaceholder.mp4";
  };
  
  
  // Recupero dei messaggi della conversazione
  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/openai/messages/${threadId}`);
      // Aggiunge solo i nuovi messaggi dell'assistente
      const newMessages = data.data.filter(
        (msg) => msg.role === "assistant" && !messages.find((m) => m.id === msg.id)
      );
      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
        // Usa l'ultimo messaggio per generare il video
        const lastMsg =
          newMessages[newMessages.length - 1].content[0].text.value;
        generateAvatarVideo(lastMsg);
      }
    } catch (error) {
      console.error("Errore nel recupero dei messaggi:", error);
    }
  };

  /*  
    Funzione helper per dividere il testo in due tranche.
    Se il testo supera una certa lunghezza, lo dividiamo in modo che la prima parte sia più consistente
    (circa il 70% del testo) e la seconda il resto.
  */
  const splitTextIntoTranches = (text, minLength = 80) => {
    if (text.length <= minLength) return [text];
    const target = Math.floor(text.length * 0.3);
    let splitIndex = text.lastIndexOf(".", target);
    if (splitIndex === -1) splitIndex = text.lastIndexOf(";", target);
    if (splitIndex === -1) splitIndex = text.lastIndexOf(",", target);
    if (splitIndex === -1) splitIndex = text.lastIndexOf(" ", target);
    if (splitIndex === -1) splitIndex = target;
    const firstTranche = text.substring(0, splitIndex + 1).trim();
    const secondTranche = text.substring(splitIndex + 1).trim();
    return [firstTranche, secondTranche];
  };

  /*  
    generateAvatarVideo:
      - Separa il testo in due tranche se necessario.
      - Invia entrambe le richieste in parallelo.
      - Appena la richiesta della prima tranche (la parte più consistente) è pronta, aggiorna l'interfaccia.
      - L'evento "onEnded" del video controllerà il passaggio al video della seconda tranche, se disponibile.
  */
  const generateAvatarVideo = async (inputText) => {
    setIsVideoGenerating(true);

    setLoading(true);
    setErrorMessage(null);
    setVideoUrl(null);
    setSecondVideoUrl(null);
    setFirstVideoEnded(false);

    const tranches = splitTextIntoTranches(inputText, 80);

    if (tranches.length === 1) {
      // Caso testo breve: richiesta singola
      try {
        const res = await axios.post(
          "/api/openai/create-avatar-video",
          {
            sourceUrl: selectedImage,
            inputText: tranches[0],
            voiceId: selectedVoice,
            language: "it",
            webhookUrl: null,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        const videoId = res.data.videoId;
        if (!videoId) throw new Error("ID del video non ricevuto.");
        const url = await pollForVideoUrl(videoId);
        setVideoUrl(url);
        setLoading(false);
      } catch (error) {
        console.error(
          "Errore nella generazione del video:",
          error.response?.data || error.message
        );
        setErrorMessage("Errore nella generazione del video.");
        setLoading(false);
      }
    } else {
      // Caso testo lungo: inviamo entrambe le richieste in parallelo.
      const firstPromise = axios
        .post(
          "/api/openai/create-avatar-video",
          {
            sourceUrl: selectedImage,
            inputText: tranches[0],
            voiceId: selectedVoice,
            language: "it",
            webhookUrl: null,
          },
          { headers: { "Content-Type": "application/json" } }
        )
        .then(async (res) => {
          const videoId = res.data.videoId;
          if (!videoId)
            throw new Error("ID del video non ricevuto (prima tranche).");
          return await pollForVideoUrl(videoId);
        });

      const secondPromise = axios
        .post(
          "/api/openai/create-avatar-video",
          {
            sourceUrl: selectedImage,
            inputText: tranches[1],
            voiceId: selectedVoice,
            language: "it",
            webhookUrl: null,
          },
          { headers: { "Content-Type": "application/json" } }
        )
        .then(async (res) => {
          const videoId = res.data.videoId;
          if (!videoId)
            throw new Error("ID del video non ricevuto (seconda tranche).");
          return await pollForVideoUrl(videoId);
        });

      // Avviaamo entrambe le richieste in parallelo.
      firstPromise
        .then((url) => {
          // Appena il video della prima tranche è pronto, lo mostriamo.
          setVideoUrl(url);
        })
        .catch((err) => {
          console.error("Errore nella prima tranche:", err);
          setErrorMessage("Errore nella generazione del video (prima tranche).");
        });

      secondPromise
        .then((url) => {
          // Salviamo l'URL della seconda tranche.
          setSecondVideoUrl(url);
        })
        .catch((err) => {
          console.error("Errore nella seconda tranche:", err);
          setErrorMessage("Errore nella generazione del video (seconda tranche).");
        })
        .finally(() => {
          // Quando entrambe le richieste sono concluse, disattiviamo il loading.
          setLoading(false);
        });
    }
  };

  // Funzione per il polling: attende e restituisce l'URL del video una volta disponibile
  const pollForVideoUrl = async (videoId) => {
    for (let i = 0; i < 120; i++) {
      try {
        await new Promise((res) => setTimeout(res, 500));
        const res = await axios.get(`/api/openai/create-avatar-video/${videoId}`);
        if (res.data.videoUrl) {
          return res.data.videoUrl;
        }
      } catch (error) {
        console.error("Errore nel polling del video:", error);
      }
    }
    throw new Error("Il video non è pronto dopo diversi tentativi.");
  };

  // Handler per l'evento "onEnded" del video:
  // Quando il primo video finisce, se il video della seconda tranche è disponibile, lo visualizziamo.
  const handleVideoEnded = () => {
    setFirstVideoEnded(true);
    if (secondVideoUrl) {
      setVideoUrl(secondVideoUrl);
      setSecondVideoUrl(null);
    }
  };

  // Gestione dell'invio tramite input testuale
  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleUserMessage(userInput);
      setUserInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800">
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

    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative lg:flex
        inset-y-0 left-0 z-50
        w-72 bg-gray-800/95 backdrop-blur-lg
        transform lg:transform-none transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Settings
            </h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden rounded-full p-2 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Avatar Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Choose Avatar</h3>
            <div className="grid grid-cols-2 gap-4">
              {imageOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedImage(option.url)}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-300
                    ${selectedImage === option.url 
                      ? 'ring-2 ring-blue-500 scale-105' 
                      : 'hover:scale-105'}
                  `}
                >
                  <img
                    src={option.url}
                    alt={option.label}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="absolute bottom-2 left-2 text-sm text-white font-medium">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Choose Voice</h3>
            <div className="space-y-3">
              {voiceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedVoice(option.value)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-300
                    ${selectedVoice === option.value 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createNewThread}
            className="mt-auto w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            New Conversation
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Video Container */}
        <div className="relative w-full h-[45vh] lg:h-[65vh] bg-black/90 rounded-b-3xl overflow-hidden">
        {videoUrl ? (
  <video
    className="w-full h-full object-cover"
    src={videoUrl}
    autoPlay
    controls={false}
    onEnded={handleVideoEnded}
  />
) : (
  <video
  className="w-full h-full object-cover"
  src={getPlaceholderVideo()}
  autoPlay
  muted
  loop
  
  controls={false}
/>
)}

  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Loading spinner o quello che preferisci */}
      <div className="relative">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )}
</div>


        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-gray-800/50 backdrop-blur-md">
        <div 
  ref={chatContainerRef}
  className="
    flex-1
    px-4 lg:px-6 py-4
    space-y-4
    overflow-y-auto
    max-h-[400px]           /* Limita l'altezza massima */
    scrollbar-thin          /* Se hai il plugin scrollbar di Tailwind */
    scrollbar-track-gray-800
    scrollbar-thumb-gray-500
  "
>
  {messages.map((msg) => (
    <div
      key={msg.id}
      className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
    >
      <div 
        className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-5 py-3 
          ${msg.role === 'assistant' 
            ? 'bg-gray-700/70 text-white rounded-tr-2xl rounded-tl-none' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tl-2xl rounded-tr-none'
          }
        `}
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


          {/* Input Area */}
          <div className="p-4 lg:p-6 border-t border-gray-700/50">
            <form 
              onSubmit={handleInputSubmit}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`p-3 rounded-xl transition-all duration-300
                  ${isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
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
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300
                  ${loading || !userInput.trim()
                    ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'}
                `}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>

    {/* Modal */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
          <h3 className="text-xl font-semibold text-gray-900">
            Booking Confirmed
          </h3>
          <p className="mt-2 text-gray-600">
            Your booking has been successfully confirmed!
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <a
              href={pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    )}

    {/* Error Toast */}
    {errorMessage && (
  <div className="fixed bottom-4 right-4 px-6 py-3 rounded-xl bg-red-500 text-white shadow-lg animate-fade-in flex items-center gap-4">
    <span>{errorMessage}</span>
    <button
      onClick={() => setErrorMessage(null)}
      className="focus:outline-none hover:text-gray-200 transition-colors"
    >
      ✕
    </button>
  </div>
)}

  </div>
  );
  
};

export default ChatWithGP;
