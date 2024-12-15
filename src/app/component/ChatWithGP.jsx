// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import MicrophoneControl from "./MicrophoneControl";

// const ChatWithGP = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [threadId, setThreadId] = useState(null);
//   const [isWait, setIsWait] = useState(false);
//   const [runId, setRunId] = useState(null);
//   const recognitionRef = useRef(null);
//   const [actionInProgress, setActionInProgress] = useState(false); // Flag per bloccare definitivamente il polling
//   const [showModal, setShowModal] = useState(false);
//   const [pdfLink, setPdfLink] = useState(null);
  
//   useEffect(() => {
//     const storedThreadId = sessionStorage.getItem("threadId");
//     if (storedThreadId) {
//       setThreadId(storedThreadId);
//     } else {
//       createNewThread();
//     }
//   }, []);

//   const createNewThread = async () => {
//     try {
//       const res = await axios.post("/api/openai/start-thread");
//       const newThread = res.data;
//       if (newThread && newThread.id) {
//         setThreadId(newThread.id);
//         sessionStorage.setItem("threadId", newThread.id);
//       } else {
//         console.error("Errore nella creazione del thread: Nessun ID ricevuto");
//       }
//     } catch (error) {
//       console.error("Errore nella creazione del thread:", error);
//     }
//   };

//   const toggleListening = () => {
//     isListening ? stopListening() : startListening();
//   };

//   const startListening = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.lang = "it-IT";
//       recognitionRef.current.start();

//       recognitionRef.current.onresult = (event) => {
//         const speechToText = event.results[0][0].transcript;
//         handleSpeechToTextResult(speechToText);
//       };

//       recognitionRef.current.onend = () => setIsListening(false);
//       recognitionRef.current.onerror = (event) => {
//         console.error("Errore nel riconoscimento vocale:", event.error);
//         setIsListening(false);
//       };

//       setIsListening(true);
//     } else {
//       console.error("Il riconoscimento vocale non è supportato.");
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) recognitionRef.current.stop();
//     setIsListening(false);
//   };

//   const handleSpeechToTextResult = async (speechToText) => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile");
//       return;
//     }

//     setIsWait(true);
//     try {
//       await axios.post(`/api/openai/messages/${threadId}`, { content: speechToText });

//       const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
//         assistantId: "asst_s1KQTKTvDmhHlxQ4q3MTeuAs",
//       });
//       setRunId(runRes.data.id);
//       await handleConversationLoop(runRes.data.id);
//     } catch (error) {
//       console.error("Errore nell'elaborare il risultato:", error);
//       setIsWait(false);
//     }
//   };

//   const handleConversationLoop = async (currentRunId) => {
//     const executedFunctions = new Set();
//     let pollingAttempts = 0;
//     const maxPollingAttempts = 10;  // Numero massimo di tentativi di polling
//     let delay = 500;  // Intervallo iniziale di polling in ms

//     try {
//         while (!actionInProgress && pollingAttempts < maxPollingAttempts) {
//             const statusRes = await axios.get(`/api/openai/completion/${threadId}/${currentRunId}`);
//             const statusData = statusRes.data;

//             if (statusData.status === "completed") {
//                 fetchMessages();
//                 break;
//             } else if (statusData.status === "requires_action" && statusData.required_action) {
//                 setActionInProgress(true);
//                 const toolCalls = statusData.required_action.submit_tool_outputs.tool_calls;

//                 const toolOutputs = await Promise.all(toolCalls.map(async (toolCall) => {
//                     const { id: toolCallId, function: { name, arguments: funcArgs } } = toolCall;
//                     if (!executedFunctions.has(toolCallId)) {
//                         executedFunctions.add(toolCallId);
//                         const functionResponse = await executeFunction(name, funcArgs);
//                         return { tool_call_id: toolCallId, output: functionResponse };
//                     }
//                 }));

//                 await sendToolOutputs(toolOutputs, currentRunId);
//             } else if (statusData.status === "in_progress") {
//                 await new Promise((resolve) => setTimeout(resolve, delay));
//                 delay *= 1.5;  // Incrementa il ritardo esponenzialmente per ridurre la frequenza del polling
//                 pollingAttempts += 1;
//             } else if (statusData.status === "failed") {
//                 alert("L'assistente ha riscontrato un errore.");
//                 setIsWait(false);
//                 break;
//             }
//         }

//         if (pollingAttempts >= maxPollingAttempts) {
//             console.warn("Numero massimo di tentativi di polling raggiunto.");
//         }
//     } catch (error) {
//         console.error("Errore nel ciclo della conversazione:", error);
//         setIsWait(false);
//     }
// };

//   const executeFunction = async (name, funcArgs) => {
//     try {
//       const response = await axios.post('/api/openai/backend-simulate', {
//         functionName: name,
//         arguments: funcArgs,
//       });
  
//       const { success, data } = response.data;
//       if (success) {
//         setPdfLink(data.pdfLink);
//         setShowModal(true);
//         return JSON.stringify({ message: "Prenotazione effettuata con successo", ...data });
//       } else {
//         return JSON.stringify({ message: "Prenotazione non riuscita" });
//       }
//     } catch (error) {
//       console.error("Errore durante la chiamata al backend:", error);
//       return JSON.stringify({ message: "Errore nel backend" });
//     }
//   };
//   const sendToolOutputs = async (toolOutputs, runId) => {
//     try {
//       await axios.post('/api/openai/submit-tool-outputs', {
//         threadId,
//         runId,
//         toolOutputs,
//       });
//     } catch (error) {
//       console.error("Errore nell'invio dei risultati degli tool outputs:", error);
//     }
//   };
  
//   const fetchMessages = async () => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile per recuperare i messaggi");
//       return;
//     }
//     try {
//       const messagesRes = await axios.get(`/api/openai/messages/${threadId}`);
//       const data = messagesRes.data;
//       const assistantMessages = data.data.filter((msg) => msg.role === "assistant");

//       const newMessages = assistantMessages.filter((msg) => !messages.some((m) => m.id === msg.id));
//       if (newMessages.length > 0) {
//         setMessages((prevMessages) => [...prevMessages, ...newMessages]);
//         const lastMessageText = newMessages[newMessages.length - 1].content[0].text.value;
//         await sendToEvenlabs(lastMessageText);
//         setIsWait(false);
//       }
//     } catch (error) {
//       console.error("Errore nel recupero dei messaggi:", error);
//     }
//   };

//   const sendToEvenlabs = async (text) => {
//     try {
//       const response = await axios.post("/api/openai/sendtoevenlab", { text });

//       if (response.status === 200 && response.data.audio) {
//         const audioBlob = new Blob([Uint8Array.from(atob(response.data.audio), (c) => c.charCodeAt(0))], {
//           type: "audio/mpeg",
//         });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         playAudio(audioUrl);
//       } else {
//         console.error("Errore nel recupero dell'audio da EvenLabs:", response.data);
//       }
//     } catch (error) {
//       console.error("Errore nella comunicazione con EvenLabs:", error);
//     }
//   };

//   const playAudio = (audioUrl) => {
//     const audio = new Audio(audioUrl);
//     audio.play().catch((error) => {
//       console.error("Errore durante la riproduzione dell'audio:", error);
//     });
//   };

//   return (
//     <div>
//     <MicrophoneControl
//       onNewThread={createNewThread}
//       onToggleListening={toggleListening}
//       onStopRun={() => setIsWait(false)}
//     />
//     <div>
//       {messages.map((message) => (
//         <p key={message.id}>{message.content[0]?.text?.value}</p>
//       ))}
//     </div>
//     {showModal && (
//       <div className="modal">
//         <p>Prenotazione effettuata con successo!</p>
//         <a href={pdfLink} target="_blank" rel="noopener noreferrer">Scarica il PDF della prenotazione</a>
//         <button onClick={() => setShowModal(false)}>Chiudi</button>
//       </div>
//     )}
//   </div>
//   );
// };

// export default ChatWithGP;

"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MicrophoneControl from "./MicrophoneControl";

const ChatWithGP = () => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [isWait, setIsWait] = useState(false);
  const [runId, setRunId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const recognitionRef = useRef(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfLink, setPdfLink] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const storedThreadId = sessionStorage.getItem("threadId");
    if (storedThreadId) {
      setThreadId(storedThreadId);
    } else {
      createNewThread();
    }
  }, []);

  const createNewThread = async () => {
    try {
      const res = await axios.post("/api/openai/start-thread");
      const newThread = res.data;
      if (newThread && newThread.id) {
        setThreadId(newThread.id);
        sessionStorage.setItem("threadId", newThread.id);
      } else {
        console.error("Errore nella creazione del thread: Nessun ID ricevuto");
      }
    } catch (error) {
      console.error("Errore nella creazione del thread:", error);
    }
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "it-IT";
      recognitionRef.current.start();

      recognitionRef.current.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        handleSpeechToTextResult(speechToText);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event) => {
        console.error("Errore nel riconoscimento vocale:", event.error);
        setIsListening(false);
      };

      setIsListening(true);
    } else {
      console.error("Il riconoscimento vocale non è supportato.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const handleSpeechToTextResult = async (speechToText) => {
    if (!threadId) {
      console.error("Thread ID non disponibile");
      return;
    }

    setIsWait(true);
    try {
      await axios.post(`/api/openai/messages/${threadId}`, { content: speechToText });

      const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
        assistantId: "asst_s1KQTKTvDmhHlxQ4q3MTeuAs",
      });
      setRunId(runRes.data.id);
      await handleConversationLoop(runRes.data.id);
    } catch (error) {
      console.error("Errore nell'elaborare il risultato:", error);
      setIsWait(false);
    }
  };

  const handleConversationLoop = async (currentRunId) => {
    const executedFunctions = new Set();
    let pollingAttempts = 0;
    const maxPollingAttempts = 30;
    let delay = 500;

    try {
      while (!actionInProgress && pollingAttempts < maxPollingAttempts) {
        const statusRes = await axios.get(`/api/openai/completion/${threadId}/${currentRunId}`);
        const statusData = statusRes.data;

        if (statusData.status === "completed") {
          fetchMessages();
          break;
        } else if (statusData.status === "requires_action" && statusData.required_action) {
          setActionInProgress(true);
          const toolCalls = statusData.required_action.submit_tool_outputs.tool_calls;

          const toolOutputs = await Promise.all(
            toolCalls.map(async (toolCall) => {
              const { id: toolCallId, function: { name, arguments: funcArgs } } = toolCall;
              if (!executedFunctions.has(toolCallId)) {
                executedFunctions.add(toolCallId);
                const functionResponse = await executeFunction(name, funcArgs);
                return { tool_call_id: toolCallId, output: functionResponse };
              }
            })
          );

          await sendToolOutputs(toolOutputs, currentRunId);
        } else if (statusData.status === "in_progress") {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5;
          pollingAttempts += 1;
        } else if (statusData.status === "failed") {
          alert("L'assistente ha riscontrato un errore.");
          setIsWait(false);
          break;
        }
      }

      if (pollingAttempts >= maxPollingAttempts) {
        console.warn("Numero massimo di tentativi di polling raggiunto.");
      }
    } catch (error) {
      console.error("Errore nel ciclo della conversazione:", error);
      setIsWait(false);
    }
  };

  const executeFunction = async (name, funcArgs) => {
    try {
      const response = await axios.post("/api/openai/backend-simulate", {
        functionName: name,
        arguments: funcArgs,
      });

      const { success, data } = response.data;
      if (success) {
        setPdfLink(data.pdfLink);
        setShowModal(true);
        return JSON.stringify({ message: "Prenotazione effettuata con successo", ...data });
      } else {
        return JSON.stringify({ message: "Prenotazione non riuscita" });
      }
    } catch (error) {
      console.error("Errore durante la chiamata al backend:", error);
      return JSON.stringify({ message: "Errore nel backend" });
    }
  };

  const sendToolOutputs = async (toolOutputs, runId) => {
    try {
      await axios.post("/api/openai/submit-tool-outputs", {
        threadId,
        runId,
        toolOutputs,
      });
    } catch (error) {
      console.error("Errore nell'invio dei risultati degli tool outputs:", error);
    }
  };

  const fetchMessages = async () => {
    if (!threadId) {
      console.error("Thread ID non disponibile per recuperare i messaggi");
      return;
    }
    try {
      const messagesRes = await axios.get(`/api/openai/messages/${threadId}`);
      const data = messagesRes.data;
      const assistantMessages = data.data.filter((msg) => msg.role === "assistant");

      const newMessages = assistantMessages.filter((msg) => !messages.some((m) => m.id === msg.id));
      if (newMessages.length > 0) {
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        const lastMessageText = newMessages[newMessages.length - 1].content[0].text.value;
        // await sendToEvenlabs(lastMessageText);
        generateAvatarVideo(lastMessageText); // Generazione del video subito dopo aver ottenuto il nuovo messaggio
        setIsWait(false);
      }
    } catch (error) {
      console.error("Errore nel recupero dei messaggi:", error);
    }
  };

  // const sendToEvenlabs = async (text) => {
  //   try {
  //     const response = await axios.post("/api/openai/sendtoevenlab", { text });

  //     if (response.status === 200 && response.data.audio) {
  //       const audioBlob = new Blob([Uint8Array.from(atob(response.data.audio), (c) => c.charCodeAt(0))], {
  //         type: "audio/mpeg",
  //       });
  //       const audioUrl = URL.createObjectURL(audioBlob);
  //       playAudio(audioUrl);
  //     } else {
  //       console.error("Errore nel recupero dell'audio da EvenLabs:", response.data);
  //     }
  //   } catch (error) {
  //     console.error("Errore nella comunicazione con EvenLabs:", error);
  //   }
  // };
  
  const generateAvatarVideo = async (inputText) => {
    setLoading(true);
    setErrorMessage(null);
    setVideoUrl(null);

    try {
      const sourceUrl = "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg";
      const voiceId = "nPczCjzI2devNBz1zQrb"; // ID voce di ElevenLabs
      const language = "it"; // Lingua italiana
      const webhookUrl = null; // Se desiderato, specifica un webhook

      const res = await axios.post("/api/openai/create-avatar-video", {
        sourceUrl,
        inputText,
        voiceId,
        language,
        webhookUrl,
        // Aggiungi 'face' se necessario, ad esempio:
        // face: {
        //   size: { width: 100, height: 100 },
        //   top_left: { x: 50, y: 50 }
        // }
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const videoId = res.data.videoId;
      if (videoId) {
        pollForVideoUrl(videoId);
      } else {
        throw new Error("ID del video non ricevuto.");
      }
    } catch (error) {
      console.error("Errore nella generazione del video dell'avatar:", error.response?.data || error.message);
      setErrorMessage("Errore nella generazione del video.");
      setLoading(false);
    }
  };

  const pollForVideoUrl = async (videoId) => {
    for (let i = 0; i < 30; i++) { // Massimo 10 tentativi
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Attesa di 3 secondi tra i tentativi
        const statusResponse = await axios.get(`/api/openai/create-avatar-video/${videoId}`);

        if (statusResponse.data.videoUrl) {
          setVideoUrl(statusResponse.data.videoUrl);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Errore nel controllo dello stato del video:", error);
      }
    }
    setErrorMessage("Il video non è pronto dopo diversi tentativi.");
    setLoading(false);
  };

  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Errore durante la riproduzione dell'audio:", error);
    });
  };

  

  return (
    <div className="flex flex-col  bg-gray-900 text-white  ">
    {/* Contenitore principale */}
    <div className="flex flex-grow chat">
      {/* Colonna sinistra: Controlli */}
      <div className="w-1/4 bg-gray-800 p-6 border-r border-gray-700  ">
        <MicrophoneControl
          onNewThread={createNewThread}
          onToggleListening={toggleListening}
          onStopRun={() => setIsWait(false)}
          onBlockAssistant={() => console.log("Assistente bloccato/sbloccato")}
        />
      </div>

      {/* Colonna destra: Video Player e Chat */}
      <div className="w-3/4 flex flex-col">
        {/* Video Player */}
        <div className="flex-grow flex justify-center items-center bg-black relative">
          {videoUrl ? (
            <video
              className="w-full h-full object-cover rounded-lg"
              src={videoUrl}
              autoPlay
              controls={false}
            />
          ) : (
           <video src="/mantalk.mp4" className="w-100 h-100 object-cover" loop muted autoPlay></video>
          )}
          {loading && (
            <div className="absolute flex items-center justify-center w-full h-full bg-black bg-opacity-70">
              <svg
                className="animate-spin h-12 w-12 text-purple-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="bg-gray-800 p-4 overflow-y-auto max-h-60">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 p-3 rounded-lg ${
                message.role === "assistant"
                  ? "bg-gray-700 text-left"
                  : "bg-blue-500 text-white text-right ml-auto"
              } max-w-[70%]`}
            >
              {message.content[0]?.text?.value}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Modal per PDF */}
    {showModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-green-600 mb-4">Prenotazione effettuata con successo!</p>
          <a
            href={pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Scarica il PDF della prenotazione
          </a>
          <button
            onClick={() => setShowModal(false)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Chiudi
          </button>
        </div>
      </div>
    )}

    {/* Messaggio di Errore */}
    {errorMessage && <p className="text-red-500 mt-2 text-center">{errorMessage}</p>}
  </div>
  );
};

export default ChatWithGP;














// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import MicrophoneControl from "./MicrophoneControl";

// const ChatWithGP = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [threadId, setThreadId] = useState(null);
//   const [isWait, setIsWait] = useState(false);
//   const [runId, setRunId] = useState(null);
//   const [videoUrl, setVideoUrl] = useState(true);
//   const recognitionRef = useRef(null);
//   const [actionInProgress, setActionInProgress] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [pdfLink, setPdfLink] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const videoRef = useRef(null);

//   // Stream variables
//   const [streamId, setStreamId] = useState(null);
//   const [sessionId, setSessionId] = useState(null);
//   const [iceServers, setIceServers] = useState([]);
//   const [videoId, setVideoId] = useState(null); // Nuovo stato per video_id
//   const peerConnectionRef = useRef(null);

//   useEffect(() => {
//     const storedThreadId = sessionStorage.getItem("threadId");
//     if (storedThreadId) {
//       setThreadId(storedThreadId);
//     } else {
//       createNewThread();
//     }
//   }, []);

//   const createNewThread = async () => {
//     try {
//       const res = await axios.post("/api/openai/start-thread");
//       const newThread = res.data;
//       if (newThread && newThread.id) {
//         setThreadId(newThread.id);
//         sessionStorage.setItem("threadId", newThread.id);
//         await createStream(); // Crea lo stream all'inizio della conversazione
//       } else {
//         console.error("Errore nella creazione del thread: Nessun ID ricevuto");
//       }
//     } catch (error) {
//       console.error("Errore nella creazione del thread:", error);
//     }
//   };

//   const toggleListening = () => {
//     isListening ? stopListening() : startListening();
//   };

//   const startListening = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.lang = "it-IT";
//       recognitionRef.current.start();

//       recognitionRef.current.onresult = (event) => {
//         const speechToText = event.results[0][0].transcript;
//         handleSpeechToTextResult(speechToText);
//       };

//       recognitionRef.current.onend = () => setIsListening(false);
//       recognitionRef.current.onerror = (event) => {
//         console.error("Errore nel riconoscimento vocale:", event.error);
//         setIsListening(false);
//       };

//       setIsListening(true);
//     } else {
//       console.error("Il riconoscimento vocale non è supportato.");
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) recognitionRef.current.stop();
//     setIsListening(false);
//   };

//   const handleSpeechToTextResult = async (speechToText) => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile");
//       return;
//     }

//     setIsWait(true);
//     try {
//       await axios.post(`/api/openai/messages/${threadId}`, { content: speechToText });
//       const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
//         assistantId: "asst_s1KQTKTvDmhHlxQ4q3MTeuAs",
//       });
//       setRunId(runRes.data.id);
//       await handleConversationLoop(runRes.data.id);
//     } catch (error) {
//       console.error("Errore nell'elaborare il risultato:", error);
//       setIsWait(false);
//     }
//   };

//   const handleConversationLoop = async (currentRunId) => {
//     const executedFunctions = new Set();
//     let pollingAttempts = 0;
//     const maxPollingAttempts = 10;
//     let delay = 500;

//     try {
//       while (!actionInProgress && pollingAttempts < maxPollingAttempts) {
//         const statusRes = await axios.get(`/api/openai/completion/${threadId}/${currentRunId}`);
//         const statusData = statusRes.data;

//         if (statusData.status === "completed") {
//           fetchMessages();
//           break;
//         } else if (statusData.status === "requires_action" && statusData.required_action) {
//           setActionInProgress(true);
//           const toolCalls = statusData.required_action.submit_tool_outputs.tool_calls;

//           const toolOutputs = await Promise.all(
//             toolCalls.map(async (toolCall) => {
//               const { id: toolCallId, function: { name, arguments: funcArgs } } = toolCall;
//               if (!executedFunctions.has(toolCallId)) {
//                 executedFunctions.add(toolCallId);
//                 const functionResponse = await executeFunction(name, funcArgs);
//                 return { tool_call_id: toolCallId, output: functionResponse };
//               }
//             })
//           );

//           await sendToolOutputs(toolOutputs, currentRunId);
//         } else if (statusData.status === "in_progress") {
//           await new Promise((resolve) => setTimeout(resolve, delay));
//           delay *= 1.5;
//           pollingAttempts += 1;
//         } else if (statusData.status === "failed") {
//           alert("L'assistente ha riscontrato un errore.");
//           setIsWait(false);
//           break;
//         }
//       }

//       if (pollingAttempts >= maxPollingAttempts) {
//         console.warn("Numero massimo di tentativi di polling raggiunto.");
//       }
//     } catch (error) {
//       console.error("Errore nel ciclo della conversazione:", error);
//       setIsWait(false);
//     }
//   };

//   const executeFunction = async (name, funcArgs) => {
//     try {
//       const response = await axios.post("/api/openai/backend-simulate", {
//         functionName: name,
//         arguments: funcArgs,
//       });

//       const { success, data } = response.data;
//       if (success) {
//         setPdfLink(data.pdfLink);
//         setShowModal(true);
//         return JSON.stringify({ message: "Prenotazione effettuata con successo", ...data });
//       } else {
//         return JSON.stringify({ message: "Prenotazione non riuscita" });
//       }
//     } catch (error) {
//       console.error("Errore durante la chiamata al backend:", error);
//       return JSON.stringify({ message: "Errore nel backend" });
//     }
//   };

//   const sendToolOutputs = async (toolOutputs, runId) => {
//     try {
//       await axios.post("/api/openai/submit-tool-outputs", {
//         threadId,
//         runId,
//         toolOutputs,
//       });
//     } catch (error) {
//       console.error("Errore nell'invio dei risultati degli tool outputs:", error);
//     }
//   };

//   const fetchMessages = async () => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile per recuperare i messaggi");
//       return;
//     }
//     try {
//       const messagesRes = await axios.get(`/api/openai/messages/${threadId}`);
//       const data = messagesRes.data;
//       const assistantMessages = data.data.filter((msg) => msg.role === "assistant");

//       const newMessages = assistantMessages.filter((msg) => !messages.some((m) => m.id === msg.id));
//       if (newMessages.length > 0) {
//         setMessages((prevMessages) => [...prevMessages, ...newMessages]);
//         const lastMessageText = newMessages[newMessages.length - 1].content[0].text.value;
//         generateAvatarStream(lastMessageText); // Generazione del video subito dopo aver ottenuto il nuovo messaggio
//         setIsWait(false);
//       }
//     } catch (error) {
//       console.error("Errore nel recupero dei messaggi:", error);
//     }
//   };

//   const createStream = async () => {
//     try {
//       const response = await axios.post("/api/d-id", {
//         sourceUrl: "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg",
//       });
//       console.log("Stream creation response:", response.data);
//       const { id, session_id, ice_servers } = response.data;
//       setStreamId(id);
//       setSessionId(session_id);
//       setIceServers(ice_servers);
//       console.log("Stream creato:", id, "Session ID:", session_id);
//     } catch (error) {
//       console.error("Errore nella creazione dello stream:", error.message);
//     }
//   };

//   const generateAvatarStream = async (inputText) => {
//     setLoading(true);
//     setErrorMessage(null);
//     setVideoUrl(null);

//     try {
//         console.log("Invio richiesta per generare video con input:", inputText); // Log dell'input
//         const response = await axios.post(`/api/d-id/stream/${streamId}`, {
//             inputText,
//             session_id: sessionId,
//         });

//         // Conferma che il video ID è disponibile
//         const videoIdFromResponse = response.data?.video_id;
//         if (!videoIdFromResponse) {
//             throw new Error("video_id non ricevuto dalla risposta");
//         }

//         console.log("Video ID generato:", videoIdFromResponse);
//         setVideoId(videoIdFromResponse); // Imposta video_id correttamente
        
//         setupWebRTCConnection(); // Ora che il video_id è disponibile, procedi con WebRTC
//         setLoading(false);
//     } catch (error) {
//         console.error("Errore nella generazione del video dell'avatar:", error.response?.data || error.message); // Log dell'errore
//         setErrorMessage("Errore nella generazione del video.");
//         setLoading(false);
//     }
// };


//   const setupWebRTCConnection = () => {
//     peerConnectionRef.current = new RTCPeerConnection({
//       iceServers: [{
//         urls: iceServers[0].urls,
//         username: iceServers[0].username,
//         credential: iceServers[0].credential,
//       }]
//     });

//     peerConnectionRef.current.onicecandidate = ({ candidate }) => {
//       console.log("ICE Candidate received:", candidate);
//       if (candidate) {
//         sendIceCandidateToServer(candidate);
//       }
//     };

//     peerConnectionRef.current.ontrack = (event) => {
//       const stream = event.streams[0];
//       console.log("Received track event, stream:", stream);
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       } else {
//         console.warn("videoRef non è impostato correttamente al momento dell'assegnazione.");
//       }
//     };

//     sendOffer(peerConnectionRef.current);
//   };

//   const sendOffer = async (peerConnection) => {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     console.log("Generated SDP Offer:", offer);
//     sendOfferToServer(offer);
//   };

//   const sendOfferToServer = async (offer) => {
//     try {
//         const cleanSessionId = sessionId ? sessionId.split(';')[0] : null; // Pulizia del session_id
//         console.log("Invio dell'offerta al server:", {
//             offerSdp: offer?.sdp, // conferma che sia presente
//             sessionId: cleanSessionId, // pulito se presente
//             videoId: videoId // conferma video_id
//         });
  
//         if (!offer.sdp || !cleanSessionId || !videoId) {
//             console.error("Uno o più parametri mancanti:", {
//                 offer: offer?.sdp,
//                 session_id: cleanSessionId,
//                 video_id: videoId
//             });
//             return; // esci se manca un parametro obbligatorio
//         }
  
//         const response = await axios.post(`/api/d-id/offer/${streamId}`, {
//             offer: { type: 'offer', sdp: offer.sdp },
//             session_id: cleanSessionId,
//             video_id: videoId
//         });
//         console.log("Risposta dal server dopo invio offerta:", response.data);
//     } catch (error) {
//         console.error("Errore nell'invio dell'offerta:", error.message);
//     }
//   };
  

//   const sendIceCandidateToServer = async (candidate) => {
//     try {
//       console.log("Invio candidato ICE al server:", { candidate: candidate.candidate, session_id: sessionId.split(';')[0] });
//       await axios.post(`/api/d-id/ice/${streamId}`, {
//         candidate: candidate.candidate,
//         sdpMid: candidate.sdpMid,
//         sdpMLineIndex: candidate.sdpMLineIndex,
//         session_id: sessionId.split(';')[0]
//       });
//     } catch (error) {
//       console.error("Errore nell'invio del candidato ICE:", error.message);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <div className="flex-grow flex justify-center items-center bg-black relative">
//         {loading ? (
//           <div className="absolute flex items-center justify-center w-full h-full bg-black bg-opacity-50">
//             <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
//             </svg>
//           </div>
//         ) : videoUrl ? (
//           <video
//             ref={videoRef}
//             className="w-full h-full object-cover"
//             autoPlay
//             controls={false}
//             onLoadedData={() => console.log("Video caricato correttamente")}
//             onError={(e) => console.error("Errore nel caricamento del video:", e)}
//           />
//         ) : (
//           <p className="text-white">Nessun video disponibile</p>
//         )}
//       </div>

//       <div className="bg-white p-4 shadow-md flex flex-col">
//         <MicrophoneControl
//           onNewThread={createNewThread}
//           onToggleListening={toggleListening}
//           onStopRun={() => setIsWait(false)}
//         />
//         <div className="mt-4 flex-1 overflow-y-auto max-h-48">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`mb-2 p-3 rounded-lg ${
//                 message.role === "assistant" ? "bg-gray-200 text-left" : "bg-blue-500 text-white text-right ml-auto"
//               } max-w-xs`}
//             >
//               {message.content[0]?.text?.value}
//             </div>
//           ))}
//         </div>
//         {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
//       </div>
//     </div>
//   );
// };

// export default ChatWithGP;




// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import MicrophoneControl from "./MicrophoneControl";

// const ChatWithGP = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [threadId, setThreadId] = useState(null);
//   const [isWait, setIsWait] = useState(false);
//   const [runId, setRunId] = useState(null);
//   const recognitionRef = useRef(null);
//   const [actionInProgress, setActionInProgress] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [pdfLink, setPdfLink] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const videoRef = useRef(null);

//   // Stream variables
//   const [streamId, setStreamId] = useState(null);
//   const [sessionId, setSessionId] = useState(null);
//   const [iceServers, setIceServers] = useState([]);
//   const peerConnectionRef = useRef(null);

//   useEffect(() => {
//     const storedThreadId = sessionStorage.getItem("threadId");
//     if (storedThreadId) {
//       setThreadId(storedThreadId);
//     } else {
//       createNewThread();
//     }
//   }, []);

//   const createNewThread = async () => {
//     try {
//       const res = await axios.post("/api/openai/start-thread");
//       const newThread = res.data;
//       if (newThread && newThread.id) {
//         setThreadId(newThread.id);
//         sessionStorage.setItem("threadId", newThread.id);
//         await createStream(); // Crea lo stream all'inizio della conversazione
//       } else {
//         console.error("Errore nella creazione del thread: Nessun ID ricevuto");
//       }
//     } catch (error) {
//       console.error("Errore nella creazione del thread:", error);
//     }
//   };

//   const toggleListening = () => {
//     isListening ? stopListening() : startListening();
//   };

//   const startListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.lang = "it-IT";
//       recognitionRef.current.start();

//       recognitionRef.current.onresult = (event) => {
//         const speechToText = event.results[0][0].transcript;
//         handleSpeechToTextResult(speechToText);
//       };

//       recognitionRef.current.onend = () => setIsListening(false);
//       recognitionRef.current.onerror = (event) => {
//         console.error("Errore nel riconoscimento vocale:", event.error);
//         setIsListening(false);
//       };

//       setIsListening(true);
//     } else {
//       console.error("Il riconoscimento vocale non è supportato.");
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) recognitionRef.current.stop();
//     setIsListening(false);
//   };

//   const handleSpeechToTextResult = async (speechToText) => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile");
//       return;
//     }

//     setIsWait(true);
//     try {
//       await axios.post(`/api/openai/messages/${threadId}`, {
//         content: speechToText,
//       });
//       const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
//         assistantId: "asst_s1KQTKTvDmhHlxQ4q3MTeuAs",
//       });
//       setRunId(runRes.data.id);
//       await handleConversationLoop(runRes.data.id);
//     } catch (error) {
//       console.error("Errore nell'elaborare il risultato:", error);
//       setIsWait(false);
//     }
//   };

//   const handleConversationLoop = async (currentRunId) => {
//     const executedFunctions = new Set();
//     let pollingAttempts = 0;
//     const maxPollingAttempts = 10;
//     let delay = 500;

//     try {
//       while (!actionInProgress && pollingAttempts < maxPollingAttempts) {
//         const statusRes = await axios.get(
//           `/api/openai/completion/${threadId}/${currentRunId}`
//         );
//         const statusData = statusRes.data;

//         if (statusData.status === "completed") {
//           fetchMessages();
//           break;
//         } else if (
//           statusData.status === "requires_action" &&
//           statusData.required_action
//         ) {
//           setActionInProgress(true);
//           const toolCalls =
//             statusData.required_action.submit_tool_outputs.tool_calls;

//           const toolOutputs = await Promise.all(
//             toolCalls.map(async (toolCall) => {
//               const {
//                 id: toolCallId,
//                 function: { name, arguments: funcArgs },
//               } = toolCall;
//               if (!executedFunctions.has(toolCallId)) {
//                 executedFunctions.add(toolCallId);
//                 const functionResponse = await executeFunction(name, funcArgs);
//                 return { tool_call_id: toolCallId, output: functionResponse };
//               }
//             })
//           );

//           await sendToolOutputs(toolOutputs, currentRunId);
//         } else if (statusData.status === "in_progress") {
//           await new Promise((resolve) => setTimeout(resolve, delay));
//           delay *= 1.5;
//           pollingAttempts += 1;
//         } else if (statusData.status === "failed") {
//           alert("L'assistente ha riscontrato un errore.");
//           setIsWait(false);
//           break;
//         }
//       }

//       if (pollingAttempts >= maxPollingAttempts) {
//         console.warn("Numero massimo di tentativi di polling raggiunto.");
//       }
//     } catch (error) {
//       console.error("Errore nel ciclo della conversazione:", error);
//       setIsWait(false);
//     }
//   };

//   const executeFunction = async (name, funcArgs) => {
//     try {
//       const response = await axios.post("/api/openai/backend-simulate", {
//         functionName: name,
//         arguments: funcArgs,
//       });

//       const { success, data } = response.data;
//       if (success) {
//         setPdfLink(data.pdfLink);
//         setShowModal(true);
//         return JSON.stringify({
//           message: "Prenotazione effettuata con successo",
//           ...data,
//         });
//       } else {
//         return JSON.stringify({ message: "Prenotazione non riuscita" });
//       }
//     } catch (error) {
//       console.error("Errore durante la chiamata al backend:", error);
//       return JSON.stringify({ message: "Errore nel backend" });
//     }
//   };

//   const sendToolOutputs = async (toolOutputs, runId) => {
//     try {
//       await axios.post("/api/openai/submit-tool-outputs", {
//         threadId,
//         runId,
//         toolOutputs,
//       });
//     } catch (error) {
//       console.error("Errore nell'invio dei risultati degli tool outputs:", error);
//     }
//   };

//   const fetchMessages = async () => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile per recuperare i messaggi");
//       return;
//     }
//     try {
//       const messagesRes = await axios.get(`/api/openai/messages/${threadId}`);
//       const data = messagesRes.data;
//       const assistantMessages = data.data.filter(
//         (msg) => msg.role === "assistant"
//       );

//       const newMessages = assistantMessages.filter(
//         (msg) => !messages.some((m) => m.id === msg.id)
//       );
//       if (newMessages.length > 0) {
//         setMessages((prevMessages) => [...prevMessages, ...newMessages]);
//         const lastMessageText =
//           newMessages[newMessages.length - 1].content[0].text.value;
//         await generateAvatarStream(
//           lastMessageText
//         ); // Generazione del video subito dopo aver ottenuto il nuovo messaggio
//         setIsWait(false);
//       }
//     } catch (error) {
//       console.error("Errore nel recupero dei messaggi:", error);
//     }
//   };

  
//   const createStream = async () => {
//     try {
//       const response = await axios.post("/api/d-id", {
//         sourceUrl:
//           "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg",
//       });
//       console.log("Stream creation response:", response.data);
//       const { id, session_id, ice_servers, jsep } = response.data;
//       const offer = jsep; // L'offer è in realtà nella chiave 'jsep'      
//       setStreamId(id);
//       setSessionId(session_id);
//       setIceServers(ice_servers);
//       console.log("Stream creato:", id, "Session ID:", session_id);

//       // Configura la connessione WebRTC subito dopo la creazione dello stream
//       await setupWebRTCConnection(offer);
//     } catch (error) {
//       console.error("Errore nella creazione dello stream:", error.message);
//     }
//   };

//   const setupWebRTCConnection = async (offer) => {
//     try {
//       console.log("Configurazione della connessione WebRTC...");
//       if (!offer || !sessionId) {
//         console.error("Parametri mancanti per la connessione WebRTC.");
//         return;
//       }

//       console.log("Creazione del RTCPeerConnection con iceServers:", iceServers);
//       peerConnectionRef.current = new RTCPeerConnection({ iceServers });

//       peerConnectionRef.current.onicecandidate = ({ candidate }) => {
//         console.log("Evento onicecandidate:", candidate);
//         if (candidate) {
//           sendIceCandidateToServer(candidate);
//         } else {
//           console.log("Tutti i candidati locali sono stati inviati");
//         }
//       };

//       peerConnectionRef.current.ontrack = (event) => {
//         console.log("Evento ontrack chiamato");
//         const stream = event.streams[0];
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           console.log("Stream assegnato al videoRef");
//         } else {
//           console.warn("videoRef non è disponibile");
//         }
//       };

//       await peerConnectionRef.current.setRemoteDescription(
//         new RTCSessionDescription(offer)
//       );
//       console.log("RemoteDescription impostata con l'offerta del server");

//       const answer = await peerConnectionRef.current.createAnswer();
//       await peerConnectionRef.current.setLocalDescription(answer);
//       console.log("LocalDescription impostata con l'answer creata");

//       await sendAnswerToServer(answer);
//     } catch (error) {
//       console.error(
//         "Errore nella configurazione della connessione WebRTC:",
//         error
//       );
//     }
//   };

//   const sendAnswerToServer = async (answer) => {
//     try {
//       if (!answer.sdp || !sessionId) {
//         console.error("Parametri mancanti per inviare la risposta al server.");
//         return;
//       }

//       console.log("Invio dell'answer al server con session_id:", sessionId);
//       const response = await axios.post(`/api/d-id/answer/${streamId}`, {
//         answer: { type: "answer", sdp: answer.sdp },
//         session_id: sessionId,
//       });

//       console.log("Risposta dal server dopo invio dell'answer:", response.data);
//     } catch (error) {
//       console.error(
//         "Errore nell'invio della risposta al server:",
//         error.response?.data || error.message
//       );
//     }
//   };

//   const sendIceCandidateToServer = async (candidate) => {
//     try {
//       if (!candidate || !sessionId) {
//         console.error(
//           "Parametri mancanti per inviare il candidato ICE al server."
//         );
//         return;
//       }

//       console.log("Invio candidato ICE al server:", {
//         candidate: candidate.candidate,
//         session_id: sessionId,
//       });
//       await axios.post(`/api/d-id/ice/${streamId}`, {
//         candidate: candidate.candidate,
//         sdpMid: candidate.sdpMid,
//         sdpMLineIndex: candidate.sdpMLineIndex,
//         session_id: sessionId,
//       });
//       console.log("Candidato ICE inviato con successo al server");
//     } catch (error) {
//       console.error("Errore nell'invio del candidato ICE:", error.message);
//     }
//   };

//   const generateAvatarStream = async (inputText) => {
//     setLoading(true);
//     setErrorMessage(null);

//     try {
//       console.log("Invio richiesta per generare video con input:", inputText);
//       const response = await axios.post(`/api/d-id/stream/${streamId}`, {
//         inputText,
//         session_id: sessionId,
//       });

//       console.log("Risposta dal server:", response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error(
//         "Errore nella generazione del video dell'avatar:",
//         error.response?.data || error.message
//       );
//       setErrorMessage("Errore nella generazione del video.");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <div className="flex-grow flex justify-center items-center bg-black relative">
//         {loading ? (
//           <div className="absolute flex items-center justify-center w-full h-full bg-black bg-opacity-50">
//             <svg
//               className="animate-spin h-10 w-10 text-white"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               ></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8v8H4z"
//               ></path>
//             </svg>
//           </div>
//         ) : (
//           <video
//             ref={videoRef}
//             className="w-full h-full object-cover"
//             autoPlay
//             controls={false}
//             onLoadedData={() => console.log("Video caricato correttamente")}
//             onError={(e) => console.error("Errore nel caricamento del video:", e)}
//           />
//         )}
//       </div>

//       <div className="bg-white p-4 shadow-md flex flex-col">
//         <MicrophoneControl
//           onNewThread={createNewThread}
//           onToggleListening={toggleListening}
//           onStopRun={() => setIsWait(false)}
//         />
//         <div className="mt-4 flex-1 overflow-y-auto max-h-48">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`mb-2 p-3 rounded-lg ${
//                 message.role === "assistant"
//                   ? "bg-gray-200 text-left"
//                   : "bg-blue-500 text-white text-right ml-auto"
//               } max-w-xs`}
//             >
//               {message.content[0]?.text?.value}
//             </div>
//           ))}
//         </div>
//         {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
//       </div>
//     </div>
//   );
// };

// export default ChatWithGP;


// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import MicrophoneControl from "./MicrophoneControl";
// import Peer from "simple-peer";

// const ChatWithGP = () => {
//   // Stato per gestire vari aspetti dell'applicazione
//   const [isListening, setIsListening] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [threadId, setThreadId] = useState(null);
//   const [isWait, setIsWait] = useState(false);
//   const [runId, setRunId] = useState(null);
//   const [actionInProgress, setActionInProgress] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [pdfLink, setPdfLink] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [streamId, setStreamId] = useState(null); // Stato per l'ID dello stream

//   const recognitionRef = useRef(null);
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);

//   useEffect(() => {
//     const storedThreadId = sessionStorage.getItem("threadId");
//     if (storedThreadId) {
//       setThreadId(storedThreadId);
//     } else {
//       createNewThread();
//     }
//   }, []);

//   const createNewThread = async () => {
//     try {
//       const res = await axios.post("/api/openai/start-thread");
//       const newThread = res.data;
//       if (newThread && newThread.id) {
//         setThreadId(newThread.id);
//         sessionStorage.setItem("threadId", newThread.id);
//         await createStream(); // Crea lo stream all'inizio della conversazione
//       } else {
//         console.error("Errore nella creazione del thread: Nessun ID ricevuto");
//       }
//     } catch (error) {
//       console.error("Errore nella creazione del thread:", error);
//     }
//   };

//   const createStream = async () => {
//     try {
//       const response = await axios.post("/api/d-id", {
//         sourceUrl:
//           "https://www.abeaform.it/wp-content/uploads/2018/11/Abea-Form-Corso-Hotel-Receptionist.jpg",
//       });
//       console.log("Stream creation response:", response.data);
//       const { id, offer } = response.data;

//       if (!id || !offer) {
//         console.error("Parametri mancanti nella risposta dell'API D-ID.");
//         return;
//       }

//       setStreamId(id);
//       console.log("Stream creato:", id);

//       // Configura la connessione WebRTC con simple-peer
//       await setupWebRTCConnection(offer);
//     } catch (error) {
//       console.error("Errore nella creazione dello stream:", error.message);
//     }
//   };

//   const setupWebRTCConnection = (remoteOffer) => {
//     // Crea un nuovo peer
//     peerRef.current = new Peer({
//       initiator: false, // Poiché riceviamo l'offerta dall'API D-ID
//       trickle: true,
//     });

//     // Gestisci il segnale locale generato da simple-peer
//     peerRef.current.on("signal", async (data) => {
//       console.log("Segnale locale generato:", data);
//       if (data.type === "answer" || data.type === "offer") {
//         // Invia l'answer al server D-ID
//         await sendAnswerToServer(data);
//       } else if (data.candidate) {
//         // Invia il candidato ICE al server D-ID
//         await sendIceCandidateToServer(data);
//       }
//     });

//     // Gestisci lo stream remoto
//     peerRef.current.on("stream", (stream) => {
//       console.log("Stream remoto ricevuto");
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     });

//     // Gestisci gli errori
//     peerRef.current.on("error", (err) => {
//       console.error("Errore Simple-peer:", err);
//     });

//     // Passa l'offerta remota a simple-peer
//     peerRef.current.signal(remoteOffer);
//   };

//   const sendAnswerToServer = async (answer) => {
//     try {
//       if (!answer || !streamId) {
//         console.error("Parametri mancanti per inviare la risposta al server.");
//         return;
//       }

//       console.log("Invio dell'answer al server per lo streamId:", streamId);
//       await axios.post(`/api/d-id/answer/${streamId}`, {
//         answer,
//       });

//       console.log("Answer inviata con successo al server D-ID");
//     } catch (error) {
//       console.error(
//         "Errore nell'invio della risposta al server:",
//         error.response?.data || error.message
//       );
//     }
//   };

//   const sendIceCandidateToServer = async (candidate) => {
//     try {
//       if (!candidate || !streamId) {
//         console.error(
//           "Parametri mancanti per inviare il candidato ICE al server."
//         );
//         return;
//       }

//       console.log("Invio candidato ICE al server per lo streamId:", streamId);
//       await axios.post(`/api/d-id/ice/${streamId}`, {
//         candidate,
//       });

//       console.log("Candidato ICE inviato con successo al server D-ID");
//     } catch (error) {
//       console.error(
//         "Errore nell'invio del candidato ICE:",
//         error.response?.data || error.message
//       );
//     }
//   };

//   const toggleListening = () => {
//     isListening ? stopListening() : startListening();
//   };

//   const startListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.lang = "it-IT";
//       recognitionRef.current.start();

//       recognitionRef.current.onresult = (event) => {
//         const speechToText = event.results[0][0].transcript;
//         handleSpeechToTextResult(speechToText);
//       };

//       recognitionRef.current.onend = () => setIsListening(false);
//       recognitionRef.current.onerror = (event) => {
//         console.error("Errore nel riconoscimento vocale:", event.error);
//         setIsListening(false);
//       };

//       setIsListening(true);
//     } else {
//       console.error("Il riconoscimento vocale non è supportato.");
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) recognitionRef.current.stop();
//     setIsListening(false);
//   };

//   const handleSpeechToTextResult = async (speechToText) => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile");
//       return;
//     }

//     setIsWait(true);
//     try {
//       await axios.post(`/api/openai/messages/${threadId}`, {
//         content: speechToText,
//       });
//       const runRes = await axios.post(`/api/openai/runs/${threadId}`, {
//         assistantId: "asst_s1KQTKTvDmhHlxQ4q3MTeuAs",
//       });
//       setRunId(runRes.data.id);
//       await handleConversationLoop(runRes.data.id);
//     } catch (error) {
//       console.error("Errore nell'elaborare il risultato:", error);
//       setIsWait(false);
//     }
//   };

//   const handleConversationLoop = async (currentRunId) => {
//     const executedFunctions = new Set();
//     let pollingAttempts = 0;
//     const maxPollingAttempts = 10;
//     let delay = 500;

//     try {
//       while (!actionInProgress && pollingAttempts < maxPollingAttempts) {
//         const statusRes = await axios.get(
//           `/api/openai/completion/${threadId}/${currentRunId}`
//         );
//         const statusData = statusRes.data;

//         if (statusData.status === "completed") {
//           fetchMessages();
//           break;
//         } else if (
//           statusData.status === "requires_action" &&
//           statusData.required_action
//         ) {
//           setActionInProgress(true);
//           const toolCalls =
//             statusData.required_action.submit_tool_outputs.tool_calls;

//           const toolOutputs = await Promise.all(
//             toolCalls.map(async (toolCall) => {
//               const {
//                 id: toolCallId,
//                 function: { name, arguments: funcArgs },
//               } = toolCall;
//               if (!executedFunctions.has(toolCallId)) {
//                 executedFunctions.add(toolCallId);
//                 const functionResponse = await executeFunction(name, funcArgs);
//                 return { tool_call_id: toolCallId, output: functionResponse };
//               }
//             })
//           );

//           await sendToolOutputs(toolOutputs, currentRunId);
//         } else if (statusData.status === "in_progress") {
//           await new Promise((resolve) => setTimeout(resolve, delay));
//           delay *= 1.5;
//           pollingAttempts += 1;
//         } else if (statusData.status === "failed") {
//           alert("L'assistente ha riscontrato un errore.");
//           setIsWait(false);
//           break;
//         }
//       }

//       if (pollingAttempts >= maxPollingAttempts) {
//         console.warn("Numero massimo di tentativi di polling raggiunto.");
//       }
//     } catch (error) {
//       console.error("Errore nel ciclo della conversazione:", error);
//       setIsWait(false);
//     }
//   };

//   const executeFunction = async (name, funcArgs) => {
//     try {
//       const response = await axios.post("/api/openai/backend-simulate", {
//         functionName: name,
//         arguments: funcArgs,
//       });

//       const { success, data } = response.data;
//       if (success) {
//         setPdfLink(data.pdfLink);
//         setShowModal(true);
//         return JSON.stringify({
//           message: "Prenotazione effettuata con successo",
//           ...data,
//         });
//       } else {
//         return JSON.stringify({ message: "Prenotazione non riuscita" });
//       }
//     } catch (error) {
//       console.error("Errore durante la chiamata al backend:", error);
//       return JSON.stringify({ message: "Errore nel backend" });
//     }
//   };

//   const sendToolOutputs = async (toolOutputs, runId) => {
//     try {
//       await axios.post("/api/openai/submit-tool-outputs", {
//         threadId,
//         runId,
//         toolOutputs,
//       });
//     } catch (error) {
//       console.error(
//         "Errore nell'invio dei risultati degli tool outputs:",
//         error
//       );
//     }
//   };

//   const fetchMessages = async () => {
//     if (!threadId) {
//       console.error("Thread ID non disponibile per recuperare i messaggi");
//       return;
//     }
//     try {
//       const messagesRes = await axios.get(`/api/openai/messages/${threadId}`);
//       const data = messagesRes.data;
//       const assistantMessages = data.data.filter(
//         (msg) => msg.role === "assistant"
//       );

//       const newMessages = assistantMessages.filter(
//         (msg) => !messages.some((m) => m.id === msg.id)
//       );
//       if (newMessages.length > 0) {
//         setMessages((prevMessages) => [...prevMessages, ...newMessages]);
//         const lastMessageText =
//           newMessages[newMessages.length - 1].content[0].text.value;
//         await generateAvatarStream(
//           lastMessageText
//         ); // Genera lo stream video dopo aver ottenuto il nuovo messaggio
//         setIsWait(false);
//       }
//     } catch (error) {
//       console.error("Errore nel recupero dei messaggi:", error);
//     }
//   };

//   const generateAvatarStream = async (inputText) => {
//     try {
//       if (!streamId) {
//         console.error("streamId non disponibile.");
//         return;
//       }

//       await axios.post(`/api/d-id/talk/${streamId}`, {
//         script: {
//           type: "text",
//           input: inputText,
//         },
//       });
//       console.log("Testo inviato all'avatar:", inputText);
//     } catch (error) {
//       console.error("Errore nell'invio del testo all'avatar:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <div className="flex-grow flex justify-center items-center bg-black relative">
//         {loading ? (
//           <div className="absolute flex items-center justify-center w-full h-full bg-black bg-opacity-50">
//             {/* Spinner di caricamento */}
//             <svg
//               className="animate-spin h-10 w-10 text-white"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               ></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8v8H4z"
//               ></path>
//             </svg>
//           </div>
//         ) : (
//           <video
//             ref={videoRef}
//             className="w-full h-full object-cover"
//             autoPlay
//             controls={false}
//             onLoadedData={() => console.log("Video caricato correttamente")}
//             onError={(e) =>
//               console.error("Errore nel caricamento del video:", e)
//             }
//           />
//         )}
//       </div>

//       <div className="bg-white p-4 shadow-md flex flex-col">
//         <MicrophoneControl
//           onNewThread={createNewThread}
//           onToggleListening={toggleListening}
//           onStopRun={() => setIsWait(false)}
//         />
//         <div className="mt-4 flex-1 overflow-y-auto max-h-48">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`mb-2 p-3 rounded-lg ${
//                 message.role === "assistant"
//                   ? "bg-gray-200 text-left"
//                   : "bg-blue-500 text-white text-right ml-auto"
//               } max-w-xs`}
//             >
//               {message.content[0]?.text?.value}
//             </div>
//           ))}
//         </div>
//         {showModal && (
//           <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <p className="text-green-600 mb-4">
//                 Prenotazione effettuata con successo!
//               </p>
//               <a
//                 href={pdfLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 underline"
//               >
//                 Scarica il PDF della prenotazione
//               </a>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
//               >
//                 Chiudi
//               </button>
//             </div>
//           </div>
//         )}
//         {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
//       </div>
//     </div>
//   );
// };

// export default ChatWithGP;
