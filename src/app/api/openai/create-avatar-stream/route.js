// /pages/api/openai/create-avatar-stream.js

import { NextResponse } from 'next/server';
import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY; 
const BASE_URL = 'https://api.d-id.com/talks/streams';

const getAuthorizationHeader = () => `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`;

export async function POST(req) {
  try {
    const { sourceUrl, inputText, voiceId, language } = await req.json();

    const response = await axios.post(BASE_URL, {
      source_url: sourceUrl,
      script: {
        type: "text",
        input: inputText,
        provider: {
          type: "elevenlabs",
          voice_id: voiceId,
          lang: language,
        }
      }
    }, {
      headers: {
        Authorization: getAuthorizationHeader(),
        'Content-Type': 'application/json',
      },
    });

    const { id: streamId, session_id: sessionId, offer, ice_servers: iceServers } = response.data;
    return NextResponse.json({ streamId, sessionId, offer, iceServers });

  } catch (error) {
    console.error("Errore durante la creazione dello streaming:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
