import { NextResponse } from 'next/server';
import axios from 'axios';

const openAIKey = process.env.OPENAI_KEY;
const MAX_RETRIES = 3;
const TIMEOUT = 5000; // Timeout di 5 secondi

async function createThreadWithRetry(retries = MAX_RETRIES) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/threads',
      {},
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
      console.warn(`Tentativo fallito, ritento... (${MAX_RETRIES - retries + 1})`);
      return createThreadWithRetry(retries - 1);
    }
    // Log dettagliato per debugging
    console.error("Errore nella creazione del thread:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function POST() {
  const result = await createThreadWithRetry();
  if (result.success) {
    return NextResponse.json(result.data, { status: 200 });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
