"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import MicrophoneControl from "./MicrophoneControl";
// import SettingsMenu from "./SettingMenu";

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
  // Stato per il menù mobile (per avatar e voce)
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Stati per selezione immagine e voce
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
      label: "Uomo",
    },
    {
      id: "img2",
      url: "https://thumbs.dreamstime.com/b/receptionist-hotel-front-desk-picture-smiling-166305860.jpg",
      label: "Donna",
    },
    {
      id: "img3",
      url: "https://via.placeholder.com/800x600.png?text=Immagine+3",
      label: "Uomo",
    },
  ];

  const voiceOptions = [
    { id: "voice1", value: "nPczCjzI2devNBz1zQrb", label: "Uomo 1" },
    { id: "voice2", value: "PSp7S6ST9fDNXDwEzX0m", label: "Uomo 2" },
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



  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  // Auto-scroll della chat al variare dei messaggi
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Creazione di un nuovo thread
  const createNewThread = async () => {
    try {
      const res = await axios.post("/api/openai/start-thread");
      if (res.data && res.data.id) {
        setThreadId(res.data.id);
        sessionStorage.setItem("threadId", res.data.id);
      } else {
        console.error("Errore: Nessun ID thread ricevuto");
      }
    } catch (error) {
      console.error("Errore nella creazione del thread:", error);
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
    let delay = 100;
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

  // Funzione helper per dividere il testo in due tranche.
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

  // Generazione del video con eventuale divisione in due tranche
  const generateAvatarVideo = async (inputText) => {
    setLoading(true);
    setErrorMessage(null);
    setVideoUrl(null);
    setSecondVideoUrl(null);
    setFirstVideoEnded(false);

    const tranches = splitTextIntoTranches(inputText, 80);

    if (tranches.length === 1) {
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
        // const videoId = res.data.videoId;
        const videoId = "tlk_I26uZKlFeRndFsZi0GE71";
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

      firstPromise
        .then((url) => {
          setVideoUrl(url);
        })
        .catch((err) => {
          console.error("Errore nella prima tranche:", err);
          setErrorMessage("Errore nella generazione del video (prima tranche).");
        });

      secondPromise
        .then((url) => {
          setSecondVideoUrl(url);
        })
        .catch((err) => {
          console.error("Errore nella seconda tranche:", err);
          setErrorMessage("Errore nella generazione del video (seconda tranche).");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Funzione per il polling del video
  const pollForVideoUrl = async (videoId) => {
    for (let i = 0; i < 100; i++) {
      try {
        await new Promise((res) => setTimeout(res, 100));
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

  // Handler per l'evento "onEnded" del video
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
    <div className="flex flex-col  bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 flex items-center justify-between shadow-lg  border-gray-700">
        <div className="flex items-center w-full">
          {/* Bottone per aprire il menu mobile (visibile solo su mobile) */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setShowMobileMenu(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
          </button>
          <h1 className="text-1xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Virtual Assistant
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Pulsante microfono per mobile (visibile solo su mobile) */}
          <button
            onClick={toggleListening}
            className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all microfono ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {isListening ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>
          <button
            onClick={createNewThread}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-full transition-all transform hover:scale-105 text-white font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Chat
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar per desktop (visibile solo da md in su) */}
        <aside className="hidden md:flex w-80 bg-gray-800 border-r border-gray-700 flex-col">
          <div className="p-6 space-y-6">
            {/* Controllo microfono (per desktop, in quanto su mobile è disponibile nell'header) */}
            <div className="flex flex-col items-center gap-4 p-4 bg-gray-700 rounded-lg">
              <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {isListening ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-300">
                {isListening ? "Recording..." : "Click to speak"}
              </span>
            </div>

            {/* Selezione immagine */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Select Avatar</h3>
              <div className="grid gap-3">
                {imageOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedImage === option.url
                        ? "bg-blue-500/20 border border-blue-500"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="image"
                      value={option.url}
                      checked={selectedImage === option.url}
                      disabled={loading}
                      onChange={() => setSelectedImage(option.url)}
                      className="hidden"
                    />
                    <img
                      src={option.url}
                      alt={option.label}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selezione voce */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Select Voice</h3>
              <div className="grid gap-3">
                {voiceOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedVoice === option.value
                        ? "bg-blue-500/20 border border-blue-500"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="voice"
                      value={option.value}
                      checked={selectedVoice === option.value}
                      onChange={() => setSelectedVoice(option.value)}
                      className="hidden"
                    />
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Area principale */}
        <main className="flex-1 flex flex-col">
          {/* Sezione video */}
          <div className="relative bg-black aspect-video">
            <video
              className="w-full h-full object-cover"
              src={videoUrl || "/mantalk.mp4"}
              autoPlay
              controls={false}
              onEnded={handleVideoEnded}
              loop={!videoUrl}
              muted={!videoUrl}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Chat */}
          <div
  ref={chatContainerRef}
  className="overflow-y-auto px-6 py-4 space-y-4 max-h-[calc(60vh-300px)]"
>
  {messages.map((msg) => (
    <div
      key={msg.id}
      className={`flex ${
        msg.role === "assistant" ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`max-w-[70%] p-4 rounded-2xl shadow-lg ${
          msg.role === "assistant"
            ? "bg-gray-700 rounded-tl-none"
            : "bg-blue-600 rounded-tr-none"
        }`}
      >
        <p className="text-white">{msg.content[0]?.text?.value}</p>
      </div>
    </div>
  ))}
</div>


          {/* Input area */}
          <form
            onSubmit={handleInputSubmit}
            className="p-4 bg-gray-800 border-t border-gray-700"
          >
            <div className="gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full my-2"
              />
              <button
                type="submit"
                disabled={loading || !userInput.trim()} // Anche il pulsante è disabilitato se loading è true

                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full "
              >
                Send
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Menu Mobile per le impostazioni (avatar e voce) */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50 menu">
          <div className="w-72 bg-gray-800 h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button onClick={() => setShowMobileMenu(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Selezione immagine */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-300">Select Avatar</h3>
              <div className="grid gap-3 mt-2">
                {imageOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedImage === option.url
                        ? "bg-blue-500/20 border border-blue-500"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="image"
                      value={option.url}
                      checked={selectedImage === option.url}
                      onChange={() => setSelectedImage(option.url)}
                      className="hidden"
                    />
                    <img
                      src={option.url}
                      alt={option.label}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selezione voce */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300">Select Voice</h3>
              <div className="grid gap-3 mt-2">
                {voiceOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedVoice === option.value
                        ? "bg-blue-500/20 border border-blue-500"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="voice"
                      value={option.value}
                      checked={selectedVoice === option.value}
                      onChange={() => setSelectedVoice(option.value)}
                      className="hidden"
                    />
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal PDF */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-gray-300 mb-6">
                Your booking has been successfully processed.
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href={pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all"
                >
                  Download PDF
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast error */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <p className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatWithGP;
