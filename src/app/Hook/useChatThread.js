"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * Gestisce la logica di conversazione con l'AI:
 *  - Creazione di un thread
 *  - Invio/Ricezione di messaggi
 *  - Polling dello stato della conversazione
 *  - Esecuzione eventuale di tool calls
 */
export default function useChatThread() {
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Al mount, recuperiamo (o creiamo) un thread
  useEffect(() => {
    const storedThreadId = sessionStorage.getItem("threadId");
    if (storedThreadId) {
      setThreadId(storedThreadId);
      fetchMessages(storedThreadId);
    } else {
      createNewThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------
  // FUNZIONI PRINCIPALI
  // ---------------------

  const createNewThread = useCallback(async () => {
    try {
      setMessages([]);
      const res = await axios.post("/api/openai/start-thread");
      if (res.data?.id) {
        setThreadId(res.data.id);
        sessionStorage.setItem("threadId", res.data.id);
      }
    } catch (error) {
      console.error("Errore nella creazione del thread:", error);
      setErrorMessage("Errore nella creazione di una nuova chat");
    }
  }, []);

  const handleUserMessage = useCallback(
    async (message) => {
      if (!threadId) {
        console.error("Thread ID non disponibile.");
        return;
      }
      if (!message || message.trim() === "") return;

      // Aggiunge subito il messaggio in locale (optimistic UI)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "user",
          content: [{ text: { value: message } }],
        },
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
    },
    [threadId]
  );

  const fetchMessages = useCallback(
    async (idToFetch = threadId) => {
      if (!idToFetch) return;
      try {
        const { data } = await axios.get(`/api/openai/messages/${idToFetch}`);
        // Aggiunge solo i nuovi messaggi dell'assistente
        // (o se preferisci, rimpiazza l'intero array)
        const newAssistantMessages = data.data.filter(
          (msg) => msg.role === "assistant" && !messages.find((m) => m.id === msg.id)
        );
        if (newAssistantMessages.length > 0) {
          setMessages((prev) => [...prev, ...newAssistantMessages]);
        }
      } catch (error) {
        console.error("Errore nel recupero dei messaggi:", error);
      }
    },
    [messages, threadId]
  );

  const pollConversation = useCallback(
    async (runId) => {
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
      if (attempts >= maxAttempts) {
        console.warn("Numero massimo di tentativi di polling raggiunto.");
      }
      setLoading(false);
    },
    [threadId, fetchMessages]
  );

  // -------------
  // TOOL CALLS
  // -------------
  const executeToolCalls = useCallback(
    async (toolCalls, runId, executedFunctions) => {
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
    },
    [threadId]
  );

  // -------------
  // FUNZIONE GENERICA
  // -------------
  const executeFunction = async (functionName, funcArgs) => {
    try {
      const res = await axios.post("/api/openai/backend-simulate", {
        functionName,
        ...funcArgs,
      });
      const { success, data } = res.data;
      if (success) {
        if (data.pdfLink) {
          // esempio: potresti gestirlo qui oppure
          // lasciare che un callback esterno lo gestisca
        }
        return JSON.stringify({ message: "Operazione eseguita", ...data });
      }
      return JSON.stringify({ message: "Operazione non riuscita" });
    } catch (error) {
      console.error("Errore durante l'esecuzione della funzione:", error);
      return JSON.stringify({ message: "Errore nel backend" });
    }
  };

  return {
    // stato
    threadId,
    messages,
    loading,
    errorMessage,
    isTyping,
    // azioni
    createNewThread,
    handleUserMessage,
    fetchMessages,
  };
}
