// /pages/api/openai/create-avatar-video.js

import { NextResponse } from 'next/server';
import axios from 'axios';

const DID_API_KEY = process.env.DID_API_KEY; // Chiave API nel formato "username:password"
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_KEY; // Chiave API per ElevenLabs

const BASE_URL = 'https://api.d-id.com/talks';

export async function POST(req) {
  try {
    const { sourceUrl, inputText, voiceId, driverUrl, language, webhookUrl, face } = await req.json();

    if (!inputText) {
      return NextResponse.json({ error: "Il campo 'inputText' è obbligatorio." }, { status: 400 });
    }

    const encodedCredentials = `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`;

    // Costruisci il corpo della richiesta
    const requestBody = {
      source_url: sourceUrl || "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg",
      script: {
        type: "text",
        input: inputText,
        provider: { 
          type: "elevenlabs", 
          voice_id: voiceId || "Sara", // Voce di default di ElevenLabs
          lang: language || "it" // Lingua di default
        }
      },
      config: { stitch: true, pad_audio: 0.0 },
    };

    // Aggiungi `driver_url` se fornito
    if (driverUrl) {
      requestBody.driver_url = driverUrl;
    }

    // Aggiungi `webhook` se fornito
    if (webhookUrl) {
      requestBody.webhook = webhookUrl;
    }

    // Aggiungi `face` se fornito e completo
    if (face && face.size && face.top_left) {
      requestBody.face = face;
    }

    // Invia la richiesta per creare il video
    const createResponse = await axios.post(
      BASE_URL,
      requestBody,
      {
        headers: {
          Authorization: encodedCredentials,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key-external': JSON.stringify({ elevenlabs: ELEVENLABS_API_KEY }), // Chiave API di ElevenLabs per TTS
        },
      }
    );

    // Restituisce l'ID del video per il polling
    const videoId = createResponse.data.id;
    return NextResponse.json({ videoId }, { status: 200 });
  } catch (error) {
    console.error("Errore durante la generazione del video dell'avatar:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data || error.message }, { status: 500 });
  }
}
