// pages/api/openai/submit-tool-outputs.js
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { threadId, runId, toolOutputs } = await req.json(); // Riceve i parametri dal body della richiesta

  const openAIKey = process.env.OPENAI_KEY; // Chiave OpenAI dalla configurazione di ambiente

  try {
    const response = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`,
      { tool_outputs: toolOutputs },
      {
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Errore nell'invio dei risultati degli tool outputs:", error.response?.data || error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
