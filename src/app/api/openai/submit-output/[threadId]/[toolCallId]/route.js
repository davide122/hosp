// src/app/api/openai/messages/[threadId]/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const { threadId } = params;
  const openAIKey = process.env.OPENAI_KEY;
  const { content } = await req.json();

  try {
    const response = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        role: "user",
        content: content,
      },
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
    console.error("Errore nell'invio del messaggio:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data || error.message }, { status: 500 });
  }
}
