import { NextResponse } from 'next/server';
import axios from 'axios';

const openAIKey = process.env.OPENAI_KEY;
const MAX_RETRIES = 3;
const TIMEOUT = 5000; // Timeout di 5 secondi

// Funzione per controllare lo stato della run con retry
async function checkRunStatusWithRetry(threadId, runId, retries = MAX_RETRIES) {
  try {
    const response = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        timeout: TIMEOUT,
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (retries > 0) {
      console.warn(`Tentativo fallito per controllo stato run, riprovo... (${MAX_RETRIES - retries + 1})`);
      return checkRunStatusWithRetry(threadId, runId, retries - 1);
    }
    console.error("Errore nel controllo dello stato della run:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Handler per controllare lo stato di completamento della run
export async function GET(req, { params }) {
  const { threadId, runId } = params;

  const result = await checkRunStatusWithRetry(threadId, runId);

  if (result.success) {
    return NextResponse.json(result.data, { status: 200 });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
