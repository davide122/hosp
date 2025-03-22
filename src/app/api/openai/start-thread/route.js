import { NextResponse } from 'next/server';
import axios from 'axios';

const openAIKey = process.env.OPENAI_KEY;
const MAX_RETRIES = 5;
const INITIAL_TIMEOUT = 800;
const MAX_TIMEOUT = 8000;

// Funzione per calcolare il delay con exponential backoff
const getBackoffDelay = (retryCount) => {
  return Math.min(INITIAL_TIMEOUT * Math.pow(2, MAX_RETRIES - retryCount), MAX_TIMEOUT);
};

async function createThreadWithRetry(retries = MAX_RETRIES) {
  const startTime = Date.now();
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
        timeout: getBackoffDelay(retries),
      }
    );
    const responseTime = Date.now() - startTime;
    console.log(`API Response Time: ${responseTime}ms, Status: ${response.status}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 1;
      console.warn(`Rate limit hit. Retry-After: ${retryAfter}s, X-RateLimit-Remaining: ${error.response.headers['x-ratelimit-remaining'] || 'N/A'}`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return createThreadWithRetry(retries);
    }

    if (retries > 0) {
      const delay = getBackoffDelay(retries);
      console.warn(`Tentativo fallito, ritento tra ${delay}ms... (${MAX_RETRIES - retries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return createThreadWithRetry(retries - 1);
    }

    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error("Errore nella creazione del thread:", errorMessage);
    return { success: false, error: errorMessage };
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
