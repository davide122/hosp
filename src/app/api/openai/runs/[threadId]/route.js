// app/api/openai/runs/[threadId]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const openAIKey = process.env.OPENAI_KEY;
const TIMEOUT = 2000; // Timeout ridotto per velocizzare (3 secondi)

async function startRun(threadId, assistantId) {
  const startTime = Date.now();

  // Esempio di verifica: avvia la run solo se l'orario corrente è tra le 9:00 e le 18:00
  const currentHour = new Date().getHours();
  if (currentHour < 9 || currentHour > 18) {
    console.warn(`Run non avviata: orario non consentito (${currentHour}h)`);
    return { success: false, error: 'Run non avviata: orario non consentito' };
  }

  try {
    const response = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      { assistant_id: assistantId },
      {
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        timeout: TIMEOUT,
      }
    );
    const responseTime = Date.now() - startTime;
    console.log(`API Response Time: ${responseTime}ms, Status: ${response.status}`);
    return { success: true, data: response.data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Errore nell'avvio della run (dopo ${responseTime}ms):`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function POST(req, { params }) {
  const { threadId } = params;
  const body = await req.json();
  const assistantId = body.assistantId;

  const result = await startRun(threadId, assistantId);
  
  if (result.success) {
    return NextResponse.json(result.data, { status: 200 });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
