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
      label: "Uomo ",
    },
    {
      id: "img2",
      url: "https://thumbs.dreamstime.com/b/receptionist-hotel-front-desk-picture-smiling-166305860.jpg",
      label: "Donna ",
    },
    {
      id: "img3",
      url: "https://via.placeholder.com/800x600.png?text=Immagine+3",
      label: "Uomo ",
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
    const target = Math.floor(text.length * 0.7);
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
    for (let i = 0; i < 30; i++) {
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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-3xl font-extrabold">Assistente Virtuale</h1>
        <button
          onClick={createNewThread}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          aria-label="Crea nuovo thread"
        >
          Nuova Conversazione
        </button>
      </header>
  
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 bg-gray-800 p-6 border-b md:border-b-0 md:border-r border-gray-700 overflow-y-auto">
          <MicrophoneControl
            onToggleListening={toggleListening}
            onNewThread={createNewThread}
          />
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Seleziona Immagine</h3>
            {imageOptions.map((option) => (
              <label key={option.id} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="image"
                  value={option.url}
                  checked={selectedImage === option.url}
                  onChange={() => setSelectedImage(option.url)}
                  className="mr-2"
                />
                <img
                  src={option.url}
                  alt={option.label}
                  className="w-10 h-10 rounded-full mr-2 object-cover"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Seleziona Voce</h3>
            {voiceOptions.map((option) => (
              <label key={option.id} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="voice"
                  value={option.value}
                  checked={selectedVoice === option.value}
                  onChange={() => setSelectedVoice(option.value)}
                  className="mr-2"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </aside>
  
        {/* Area principale: Video e Chat */}
        <main className="w-full md:w-3/4 flex flex-col">
          {/* Video Section */}
          <div className="relative flex-grow bg-black flex justify-center items-center">
            {videoUrl ? (
              <video
                className="w-full h-full object-cover rounded-lg transition-all duration-500"
                src={videoUrl}
                autoPlay
                controls={false}
                onEnded={handleVideoEnded}
              />
            ) : (
              <video
                src="/mantalk.mp4"
                className="w-full h-full object-cover rounded-lg"
                loop
                muted
                autoPlay
              />
            )}
            {loading && (
              <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 transition-opacity duration-300">
                <svg
                  className="animate-spin h-12 w-12 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}
          </div>
  
          {/* Chat Section */}
          <div
            ref={chatContainerRef}
            className="bg-gray-800 p-4 overflow-y-auto flex flex-col gap-2 max-h-60 scrollbar-thin scrollbar-thumb-gray-600"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg max-w-[70%] transition-all duration-300 ${
                  msg.role === "assistant" ? "bg-gray-700 text-left self-start" : "bg-blue-500 text-white text-right self-end"
                }`}
              >
                {msg.content[0]?.text?.value}
              </div>
            ))}
          </div>
  
          {/* Input Area */}
          <form onSubmit={handleInputSubmit} className="flex p-4 bg-gray-700">
            <input
              type="text"
              className="flex-grow p-2 rounded-l-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
              aria-label="Inserisci messaggio"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-r-lg transition-colors"
              aria-label="Invia messaggio"
            >
              Invia
            </button>
          </form>
        </main>
      </div>
  
      {/* Modal per il PDF */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300">
            <p className="text-green-600 mb-4 font-semibold">
              Prenotazione effettuata con successo!
            </p>
            <a
              href={pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline font-medium"
            >
              Scarica il PDF
            </a>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
  
      {errorMessage && (
        <div className="bg-red-600 text-white py-2 text-center">
          {errorMessage}
        </div>
      )}
  
      {/* Footer */}
      <footer className="bg-gray-800 px-6 py-3 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Il Tuo Progetto
      </footer>
    </div>
  );
  
};

export default ChatWithGP;
