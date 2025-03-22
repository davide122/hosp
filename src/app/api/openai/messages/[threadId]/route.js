// import { NextResponse } from 'next/server';
// import axios from 'axios';

// const openAIKey = process.env.OPENAI_KEY;
// const MAX_RETRIES = 3;
// const TIMEOUT = 5000; // Timeout di 5 secondi

// // Funzione per inviare un messaggio con retry
// async function sendMessageWithRetry(threadId, content, retries = MAX_RETRIES) {
//   try {
//     const response = await axios.post(
//       `https://api.openai.com/v1/threads/${threadId}/messages`,
//       { role: 'user', content },
//       {
//         headers: {
//           Authorization: `Bearer ${openAIKey}`,
//           'Content-Type': 'application/json',
//           'OpenAI-Beta': 'assistants=v2',
//         },
//         timeout: TIMEOUT,
//       }
//     );
//     return { success: true, data: response.data };
//   } catch (error) {
//     if (retries > 0) {
//       console.warn(`Tentativo fallito per invio messaggio, riprovo... (${MAX_RETRIES - retries + 1})`);
//       return sendMessageWithRetry(threadId, content, retries - 1);
//     }
//     console.error("Errore nell'invio del messaggio:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// }

// // Funzione per recuperare i messaggi con retry
// async function fetchMessagesWithRetry(threadId, retries = MAX_RETRIES) {
//   try {
//     const response = await axios.get(
//       `https://api.openai.com/v1/threads/${threadId}/messages`,
//       {
//         headers: {
//           Authorization: `Bearer ${openAIKey}`,
//           'Content-Type': 'application/json',
//           'OpenAI-Beta': 'assistants=v2',
//         },
//         timeout: TIMEOUT,
//       }
//     );
//     return { success: true, data: response.data };
//   } catch (error) {
//     if (retries > 0) {
//       console.warn(`Tentativo fallito per recupero messaggi, riprovo... (${MAX_RETRIES - retries + 1})`);
//       return fetchMessagesWithRetry(threadId, retries - 1);
//     }
//     console.error("Errore nel recupero dei messaggi:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// }

// // Handler per inviare un messaggio a un thread esistente
// export async function POST(req, { params }) {
//   const { threadId } = params;
//   const { content } = await req.json();

//   const result = await sendMessageWithRetry(threadId, content);
  
//   if (result.success) {
//     return NextResponse.json(result.data, { status: 200 });
//   } else {
//     return NextResponse.json({ error: result.error }, { status: 500 });
//   }
// }

// // Handler per recuperare i messaggi di un thread esistente
// export async function GET(req, { params }) {
//   const { threadId } = params;

//   const result = await fetchMessagesWithRetry(threadId);
  
//   if (result.success) {
//     return NextResponse.json(result.data, { status: 200 });
//   } else {
//     return NextResponse.json({ error: result.error }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import axios from 'axios';

const openAIKey = process.env.OPENAI_KEY;
const MAX_RETRIES = 5;
const INITIAL_TIMEOUT = 800;
const MAX_TIMEOUT = 10000;

// Funzione per calcolare il delay con exponential backoff
const getBackoffDelay = (retryCount) => {
  return Math.min(INITIAL_TIMEOUT * Math.pow(2, MAX_RETRIES - retryCount), MAX_TIMEOUT);
};

// Funzione per inviare un messaggio con retry e exponential backoff
async function sendMessageWithRetry(threadId, content, retries = MAX_RETRIES) {
  const startTime = Date.now();
  try {
    const response = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { role: 'user', content },
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
      return sendMessageWithRetry(threadId, content, retries);
    }

    if (retries > 0) {
      const delay = getBackoffDelay(retries);
      console.warn(`Tentativo fallito per invio messaggio, riprovo tra ${delay}ms... (${MAX_RETRIES - retries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendMessageWithRetry(threadId, content, retries - 1);
    }

    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error("Errore nell'invio del messaggio:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Funzione per recuperare i messaggi con streaming
async function fetchMessagesWithStreaming(threadId) {
  try {
    const response = await axios({
      method: 'get',
      url: `https://api.openai.com/v1/threads/${threadId}/messages`,
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      responseType: 'stream' // Abilita lo streaming
    });

    return response.data;
  } catch (error) {
    console.error("Errore nel recupero dei messaggi in streaming:", error.response?.data || error.message);
    throw error;
  }
}

// Handler per inviare un messaggio a un thread esistente
export async function POST(req, { params }) {
  const { threadId } = params;
  const { content } = await req.json();

  const result = await sendMessageWithRetry(threadId, content);
  
  if (result.success) {
    return NextResponse.json(result.data, { status: 200 });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}

// Handler per recuperare i messaggi di un thread esistente con streaming
export async function GET(req, { params }) {
  const { threadId } = params;

  try {
    const stream = await fetchMessagesWithStreaming(threadId);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
