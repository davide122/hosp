import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.ELEVENLABS_KEY;
  const { text, voiceStyle, behaviorMode, selectedVoice } = await request.json();
  const voices = [
    { id: "Kq9pDHHIMmJsG9PEqOtv", name: "Voce 1" },
    { id: "PSp7S6ST9fDNXDwEzX0m", name: "Voce 2" },
    { id: "13Cuh3NuYvWOVQtLbRN8", name: "Voce 3" },
  ];


  if (!selectedVoice || !voices.find(voice => voice.id === selectedVoice)) {
    return NextResponse.json(
      { error: "ID della voce selezionata non valido." },
      { status: 400 }
    );
  }

  const voiceSettings = {
    stability: voiceStyle === "Professionale" ? 0.7 : voiceStyle === "Amichevole" ? 0.5 : 0.3,
    similarity_boost: behaviorMode === "Interattivo" ? 0.4 : 0.2,
    latency_optimization: 4,
  };

  try {
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}/stream`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        accept: "*/*",
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Errore dalla API di ElevenLabs:", response.status, response.statusText, errorBody);
      throw new Error(`Errore nella richiesta: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const audioChunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      audioChunks.push(value);
    }

    const audioBuffer = Buffer.concat(audioChunks);
    const audioBase64 = audioBuffer.toString("base64");

    return NextResponse.json({ audio: audioBase64 });
  } catch (error) {
    console.error("Errore durante la chiamata API:", error.message);
    return NextResponse.json(
      { error: "Errore durante la generazione dell'audio." },
      { status: 500 }
    );
  }
}
